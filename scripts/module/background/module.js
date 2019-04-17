/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('background', function() {
    //
    let self = this,
        store = null;

    this.init = function() {
        // open main screen in new tab.
        chrome.browserAction.onClicked.addListener(function(tab) {
            self.openReaderMode(null, tab);
            // chrome.tabs.sendMessage(tab.id, {
            //     'method': 'openReaderMode'
            // }, function (response) {});
        });

        // listen content script message.
        chrome.extension.onMessage.addListener(function(request, _, send_response) {
            let method = request.method;
            if ($.isFunction(self[method])) {
                self[method](request.data, send_response);
            } else {
                self.log('Background [' + method + '] not exist.')
            }
        });

        // 右键菜单
        chrome.contextMenus.removeAll(function() {
            chrome.contextMenus.create({
                type: 'normal',
                title: 'Toggle Fika',
                id: 'fikaReaderMode',
                onclick: self.openReaderMode
            }, function () {
                self.log('created context menus.');
            });
        });

        // 激活tab事件，激活则表示处于可见状态，通过
        chrome.tabs.onActivated.addListener(function(active_info) {
            //
            let activate_tab_id = active_info['tabId'];
            //
            chrome.tabs.sendMessage(activate_tab_id, {
                'method': 'checkAvailable'
            }, function (response) {});
        });

        self.fetchData()
        // 安装完成后，打开网站
        // chrome.runtime.onInstalled.addListener(function() {
        //     chrome.tabs.create({
        //         url: 'http://www.fika.io',
        //         active: true
        //     });

        //     return false;
        // });
    };

    this.reader_ready = function(data, send_response) {
        let is_available = data['is_available'];
        //
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // readerReadyTabId = tabs[0].id;
            if (is_available) {
                //
                chrome.browserAction.setIcon({
                    path: {'64': 'images/logo64.png'},
                    tabId: tabs[0].id
                }, function () {});
            } else {
                chrome.browserAction.setIcon({
                    path: {'64': 'images/logo64-grey.png'},
                    tabId: tabs[0].id
                }, function () {});
            }
            //
        });

        // 更新版本后 推送版本更新消息 （暂时先关闭！！！）
        // Version.notice();
        send_response('');
    };

    this.is_open = function(data, send_response) {
        if (!data) {
            self.badge_text.off();
            send_response(false);
            return false;
        }

        self.badge_text.on();
        send_response(true);
    };

    this.badge_text = {
        on: function() {
            this.run('on');
        },
        off: function() {
            this.run('');
        },
        run: function(text) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.browserAction.setBadgeText({'text': text, 'tabId': tabs[0].id}, function () {});
            });
        }
    };

    this.setCache = function(data, sendResponse) {
        let key = data.key,
            value = data.value;
        localStorage.setItem(key, value);
        sendResponse('');
    };

    this.getCache = function(data, sendResponse) {
        let result = [];
        if (Object.prototype.toString.call(data.key) === '[object Array]') {
            data.key.forEach(function(key) {
                result.push(localStorage.getItem(key));
            });
        } else {
            result.push(localStorage.getItem(data.key));
        }
        sendResponse(result);
    };

    this.feedback = function(data, send_response) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            $.post('http://www.yuiapi.com/api/v1/fika/feedback', {
                url: tabs[0]['url'],
                is_match: data['is_match']
            }, function (res) {
                let feedbackSuccess = false;
                if (res && res.code === 0) {
                    feedbackSuccess = true;
                }
                chrome.tabs.sendMessage(tabs[0].id, {
                    'method': 'feedbackResponse',
                    'data': {
                        is_match: data['is_match'],
                        success: feedbackSuccess
                    }
                }, function (response) {});
            });
        });
        send_response('');
    };

    this.openReaderMode = function(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
            'method': 'openReaderMode'
        }, function (response) {});
    };

    this.oauth = function(data, send_response){
        // check identity permission
        chrome.permissions.contains({
            permissions: ["identity"]
        }, function(result){
            if (result){
                self.getUser()
            } else {
                // request identity permission
                chrome.permissions.request({
                    permissions:[ "identity"],
                    origins:["http://*/*", "https://*/*"]
                }, function(granted){
                    if (granted) {
                        self.getUser()
                    }
                })
            }
        });
        send_response('')
    };

    this.getUser = async function(){
        let userInfo = await new Promise((resolve)=>{
            chrome.identity.getAuthToken({interactive: true}, function(token) {
                $.ajax({
                    url: "https://www.googleapis.com/oauth2/v1/userinfo?fields=email,family_name,gender,given_name,id,locale,name,picture",
                    headers: { Authorization: 'Bearer '+ token},
                    type: "GET",
                    success: (data)=> resolve(data)
                });
            });
        });
        let res = await $.ajax({
            url: "http://www.yuiapi.com/api/v1/third_part/google/app",
            data: Object.assign({avatar: userInfo['picture']}, userInfo),
            type: "POST"
        });
        if (res.code === 0){
            const data = res.data;
            let user = {
                googleId: data['account'],
                avatar: userInfo['picture'],
                fullName: userInfo['name'],
                name: userInfo['given_name'],
                token: data['token'],
                userId: data['user_id'],
                type: data['user_type']
            };
            store = await self.getStore();
            store['user'] = user;
            store['autopilotWhitelist'] = await this.fetchAutopilotWhitelist();
            chrome.storage.sync.set({user}, function(){});
            chrome.tabs.query({active: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    'method': 'loginUser',
                    'data': store
                }, function (response) {});
            })
        }
    };

    this.updateWhitelist = function (data, send_response) {
        $.ajax({
            url: "http://www.yuiapi.com/api/v1/fika/autopilot",
            data: {
                is_auto: data.method === 'add' ? 1: 0,
                host: data.host,
                token: store.user.token
            },
            type: "POST"
        });
        send_response('')
    };

    this.fetchAutopilotWhitelist = function () {
        return new Promise((resolve, reject) => {
            let whiteList = [];
            if (store.user && store.user.token){
                $.ajax({
                    url: "http://www.yuiapi.com/api/v1/fika/autopilot",
                    data:{token: store.user.token},
                    type: "GET",
                    success: (res) => {
                        if (res.code === 0){
                            for (let i of res.data){
                                if (i.is_auto === 1) whiteList.push(i.host)
                            }
                            resolve(whiteList)
                        } else {
                            resolve([])
                        }
                    }
                });
            } else {
                resolve([])
            }
        })
    };

    this.changeUserType = function (data, send_repsonse) {
        $.ajax({
            url: "http://www.yuiapi.com/api/v1/user/info",
            data: {
                user_type: 'beta',
                token: store.user.token
            },
            type: "POST",
            success: (res) =>{
                if (res.code === 0){
                    store.user = Object.assign({type: 'beta'}, store.user);
                    chrome.storage.sync.set({user: store.user});
                    self.getUser()
                }
            }
        });
        send_repsonse('')
    };

    this.getStore = function () {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, function(res){
                resolve(res)
            })
        });
    };

    this.fetchData = async function (data, send_response) {
        // photos
        let photos = [{
            id: 1,
            small: "https://images.unsplash.com/photo-1529164114-6b1bd6f5cc91?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ",
            full: "https://images.unsplash.com/photo-1529164114-6b1bd6f5cc91?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjYzODA2fQ",
            credit: "Jason Leung",
            source: 'Unsplash',
            link: "https://unsplash.com/photos/KmKAk86LLgc",
            textColor: "light"
        },{
            id: 2,
            small: "https://images.unsplash.com/photo-1545105511-839f4a45a030?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ",
            full: "https://images.unsplash.com/photo-1545105511-839f4a45a030?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjYzODA2fQ",
            credit: "Jarrett Kow",
            source: 'Unsplash',
            link: "https://unsplash.com/photos/1ZOyYPOBn7I",
            textColor: "light"
        },{
            id: 3,
            small: "https://images.unsplash.com/photo-1554176259-aa961fc32671?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ",
            full: "https://images.unsplash.com/photo-1554176259-aa961fc32671?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjYzODA2fQ",
            credit: "Tyler Lastovich",
            source: 'Unsplash',
            link: "https://unsplash.com/photos/ddLiNMqWAOM",
            textColor: "light"
        },{
            id: 4,
            small: "https://images.unsplash.com/photo-1554068085-2b084ac42ddd?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ",
            full: "https://images.unsplash.com/photo-1554068085-2b084ac42ddd?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjYzODA2fQ",
            credit: "Ansgar Scheffold",
            source: 'Unsplash',
            link: "https://unsplash.com/photos/3ZZdwACexMM",
            textColor: "light"
        }],
        monoColors = [
            {color: "#C3ACEA", textColor: "light"},
            {color: "#FFC5CC", textColor: "light"},
            {color: "#F6D863", textColor: "light"},
            {color: "#FCF3CA", textColor: "dark"},
            {color: "#B9E4C9", textColor: "light"},
            {color: "#90F3E8", textColor: "light"},
            {color: "#8FCAF2", textColor: "light"},
            {color: "#293990", textColor: "light"},
            {color: "#191D2D", textColor: "light"},
            {color: "#111111", textColor: "light"},
            {color: "#F5F5F5", textColor: "dark"},
        ];
        store = await self.getStore();
        let now = new Date().getTime(),
            lastFetched = store['photoLastFetchedDate'] || 0,
            photoRotation = store['photoRotation'] || 'false',
            bgType = store['bgType'] || 'default',
            bg = store['bg'] || 0;
        if ( lastFetched < now - (7*24*60*60*1000) ){
            // request photos
            let photos = await $.ajax({
                methods:'GET',
                url: 'http://www.yuiapi.com/api/v1/fika/background'
            })
        }
        if ( photoRotation === true ){
            let randomIndex = bg;
            while (randomIndex === bg){
                randomIndex = Math.round(Math.random()*(photos.length-1));
                console.log(randomIndex)
            }
            bg = randomIndex;
            bgType = 'photo'
        }
        // autopilot whitelist
        let whiteList = await this.fetchAutopilotWhitelist();
        chrome.storage.sync.set({
            autopilotWhitelist: whiteList,
            photoLastFetchedDate: now,
            photos: photos,
            monoColors: monoColors,
            bgType: bgType,
            bg: bg
        })
    };
});
