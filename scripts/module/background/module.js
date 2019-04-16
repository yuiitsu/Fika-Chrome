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
            store['autopilotWhitelist'] = await this.fetchAutopilotWhitelist()
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
            let whiteList = []
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
                    store.user = Object.assign({type: 'beta'}, store.user)
                    chrome.storage.sync.set({user: store.user})
                    self.getUser()
                }
            }
        })
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
        let photos = [ { small: 'https://images.unsplash.com/photo-1520444464-a81371eac7a7?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                full: 'https://images.unsplash.com/photo-1520444464-a81371eac7a7?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                credit: 'Caleb Stokes',
                source: 'unsplash',
                link: 'https://unsplash.com/photos/aw5e9wmWskc',
                text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1535378900448-9e4a89a30802?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1535378900448-9e4a89a30802?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Jonatan Pie',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/t5cz96FjNC4',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1529801877115-8a69a227fcc0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1529801877115-8a69a227fcc0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Sifan Liu',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/Ry6Imrao4hE',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1554176259-aa961fc32671?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1554176259-aa961fc32671?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Tyler Lastovich',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/ddLiNMqWAOM',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1529164114-6b1bd6f5cc91?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1529164114-6b1bd6f5cc91?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Jason Leung',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/KmKAk86LLgc',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1477468572316-36979010099d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1477468572316-36979010099d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Paul Gilmore',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/r0J9sGBWFOc',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1538947378928-4561e14354fe?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1538947378928-4561e14354fe?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Madara Parma',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/5lgC0sAa6Gg',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1527580795266-e93c8e079c22?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1527580795266-e93c8e079c22?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Roland Lösslein',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/NeCNxRwobes',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'NASA',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/yZygONrUBe8',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1549880181-7827bc088ad9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1549880181-7827bc088ad9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Zhang JR',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/vWIDTvXtGCk',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Manuel Cosentino',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/n--CMLApjfI',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Qingbao Meng',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/01_igFr7hd4',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Mark Basarab',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/1OtUkD_8svc',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1516641263263-c026aecbcb8e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1516641263263-c026aecbcb8e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Garrett Patz',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/49jxqpCMkq8',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/flagged/photo-1554935897-1bb0d260620a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/flagged/photo-1554935897-1bb0d260620a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Garrett Patz',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/Ilu1Vv6EYds',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'John Fowler',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/RsRTIofe0HE',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1554301278-bfb78bbb34f4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1554301278-bfb78bbb34f4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Nathaniel Foong',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/mGdrB6zZXzk',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1496768050990-568b4d02ec18?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1496768050990-568b4d02ec18?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'George Tsapakis',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/gB6c0iVrfAE',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1504860708171-19abd233ec3e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1504860708171-19abd233ec3e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Boris Baldinger',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/6Ogl3xacOlM',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1542652184-04fe4ec9d4d4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1542652184-04fe4ec9d4d4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Joshua Fuller',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/9QF90iLO0q0',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Denys Nevozhai',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/D8iZPlX-2fs',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1542296140-47fd7d838e76?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1542296140-47fd7d838e76?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Bryan Minear',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/7Vvv3llBmCI',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1552152370-fb05b25ff17d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1552152370-fb05b25ff17d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'asoggetti',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/PdGBci-4jR8',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1506269351850-0428eaed2193?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1506269351850-0428eaed2193?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Trevor Cole',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/salaAJW7Xdg',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1544511456-98c027db689a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1544511456-98c027db689a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Casey Horner',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/S3RDjVw1ozY',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1550795658-d7d23cfaf9ee?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1550795658-d7d23cfaf9ee?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Taylor Simpson',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/mCW5DyBrWjg',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Hermansyah',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/7uXn7nudorc',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1537819191377-d3305ffddce4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1537819191377-d3305ffddce4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'John Fowler',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/03Pv2Ikm5Hk',
                    text_color: 'light' },
                { small: 'https://images.unsplash.com/photo-1532013945770-64eabc9a46b9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    full: 'https://images.unsplash.com/photo-1532013945770-64eabc9a46b9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjYzODA2fQ',
                    credit: 'Brad Fickeisen',
                    source: 'unsplash',
                    link: 'https://unsplash.com/photos/sVQ2hLS6I7g',
                    text_color: 'light' } ]
            ,
        monoColors = [
            {color: "#C3ACEA", text_color: "light"},
            {color: "#FFC5CC", text_color: "light"},
            {color: "#F6D863", text_color: "light"},
            {color: "#FCF3CA", text_color: "dark"},
            {color: "#B9E4C9", text_color: "light"},
            {color: "#90F3E8", text_color: "light"},
            {color: "#8FCAF2", text_color: "light"},
            {color: "#293990", text_color: "light"},
            {color: "#191D2D", text_color: "light"},
            {color: "#111111", text_color: "light"},
            {color: "#F5F5F5", text_color: "dark"},
        ];
        store = await self.getStore();
        let now = new Date().getTime(),
            lastFetched = store['photoLastFetchedDate'] || 0,
            photoRotation = store['photoRotation'] || true,
            bgType = store['bgType'] || 'default',
            bg = store['bg'] || 0;
        if ( lastFetched < now - (7*24*60*60*1000) ){
            // request photos
            let photos = await $.ajax({
                methods:'GET',
                url: 'http://www.yuiapi.com/api/v1/fika/background'
            })
        }
        localStorage.setItem('photos', JSON.stringify(photos));
        if ( photoRotation === true ){
            let randomIndex = bg;
            while (randomIndex === bg){
                randomIndex = Math.round(Math.random()*(photos.length-1));
                console.log(randomIndex)
            }
            bg = randomIndex
            bgType = 'photo'
        }
        // autopilot whitelist
        let whiteList = await this.fetchAutopilotWhitelist();
        chrome.storage.sync.set({
            autopilotWhitelist: whiteList,
            photoLastFetchedDate: now,
            monoColors: monoColors,
            bgType: bgType,
            bg: bg
        })
    };
});
