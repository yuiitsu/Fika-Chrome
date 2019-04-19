/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('background', function() {
    //
    let self = this,
        store = null;

    this.init = function() {
        chrome.browserAction.onClicked.addListener(function(tab) {

            self.openReaderMode(null, tab);
            // chrome.tabs.sendMessage(tab.id, {
            //     'method': 'openReaderMode'
            // }, function (response) {});
        });
        chrome.extension.onMessage.addListener(function(request, _, send_response) {

        // listen content script message.
            let method = request.method;
            if ($.isFunction(self[method])) {
                self[method](request.data, send_response);
            } else {
                self.log('Background [' + method + '] not exist.')
            }
        });
        chrome.contextMenus.removeAll(function() {

        // 右键菜单
            chrome.contextMenus.create({
                type: 'normal',
                title: 'Toggle Fika',
                id: 'fikaReaderMode',
                onclick: self.openReaderMode
            }, function () {
                self.log('created context menus.');
            });
        });
        chrome.tabs.onActivated.addListener(function(active_info) {

        // 激活tab事件，激活则表示处于可见状态，通过
            //
            let activate_tab_id = active_info['tabId'];
            //
            chrome.tabs.sendMessage(activate_tab_id, {
                'method': 'checkAvailable'
            }, function (response) {});
        });
        // open main screen in new tab.

        self.fetchData();
        // 安装完成后，打开网站
        // chrome.runtime.onInstalled.addListener(function() {
        //     chrome.tabs.create({
        //         url: 'http://www.fika.io',
        //         active: true
        //     });
        //     return false;
        // });
        self.initGA();
        chrome.runtime.setUninstallURL('https://forms.gle/XDMmfdceYsac9p4z8')
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

    this.initGA = function () {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-138661141-1', 'auto')
        ga('set', 'checkProtocolTask', null);
        ga('require', 'displayfeatures');
    }

    this.sendGA = function (data, send_response) {
        if (data.type === 'pageview' || data.type === 'exception'){
            ga('send', data.type, data.p)
        } else {
            ga('send', data.type, data.p[0], data.p[1], data.p[2] || null)
        }
        send_response('')
    }

    this.oauth = function(data, send_response){
        // check identity permission
        chrome.permissions.contains({
            permissions: ["identity"]
        }, function(result){
            if (result){
                self.loginUser()
            } else {
                // request identity permission
                chrome.permissions.request({
                    permissions:[ "identity"],
                    origins:["http://*/*", "https://*/*"]
                }, function(granted){
                    if (granted) {
                        self.loginUser()
                    }
                })
            }
        });
        send_response('')
    };

    this.loginUser = async function(){
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
    
    this.getUserType = function (data, send_response) {
        $.ajax({
            url: "http://www.yuiapi.com/api/v1/user/info",
            data: {token: store.user.token},
            type: "GET",
            success: res => {
                if (res.code === 0){
                    store['user'] = Object.assign(store.user, {type: res.data.user_type});
                    chrome.storage.sync.set({user: store['user']}, function(){});
                    chrome.tabs.query({active: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            'method': 'loginUser',
                            'data': store
                        }, function (response) {});
                    })
                }
            }
        });
        send_response('')
    }

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
                    store.user = Object.assign(store.user, {type: 'beta'})
                    chrome.storage.sync.set({user: store.user})
                    chrome.tabs.query({active: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            'method': 'loginUser',
                            'data': store
                        }, function (response) {});
                    })
                }
            }
        });
        send_repsonse('')
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

    this.getStore = function () {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, function(res){
                resolve(res)
            })
        });
    };

    this.fetchData = async function (data, send_response) {
        // photos
        let photos = [{"small":"https://images.unsplash.com/photo-1554602337-bcb0d619e511?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1554602337-bcb0d619e511?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Nicole Y-C","source":"unsplash","link":"https://unsplash.com/photos/9XixVlnUCbk","text_color":"light"},{"small":"https://images.unsplash.com/photo-1527580795266-e93c8e079c22?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1527580795266-e93c8e079c22?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Roland Lösslein","source":"unsplash","link":"https://unsplash.com/photos/NeCNxRwobes","text_color":"light"},{"small":"https://images.unsplash.com/photo-1496737018672-b1a6be2e949c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1496737018672-b1a6be2e949c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Fezbot2000","source":"unsplash","link":"https://unsplash.com/photos/5brvJbR1Pn8","text_color":"light"},{"small":"https://images.unsplash.com/photo-1444260239795-df1f0772a252?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1444260239795-df1f0772a252?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Mathew Waters","source":"unsplash","link":"https://unsplash.com/photos/cuTk59eNHUE","text_color":"dark"},{"small":"https://images.unsplash.com/photo-1529344173594-5f748ed24b2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1529344173594-5f748ed24b2c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Xavier  Coiffic","source":"unsplash","link":"https://unsplash.com/photos/EYVQ5dM4dKg","text_color":"light"},{"small":"https://images.unsplash.com/photo-1468753613798-cfa7e7f0e5cf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1468753613798-cfa7e7f0e5cf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Branislav Knappek","source":"unsplash","link":"https://unsplash.com/photos/542ILIJoFJ8","text_color":"light"},{"small":"https://images.unsplash.com/photo-1477696957384-3b1d731c4cff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1477696957384-3b1d731c4cff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Noah Silliman","source":"unsplash","link":"https://unsplash.com/photos/01Qqkfz-ck8","text_color":"light"},{"small":"https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Andre Benz","source":"unsplash","link":"https://unsplash.com/photos/e4xOmzd8vzg","text_color":"light"},{"small":"https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Sergey Shmidt","source":"unsplash","link":"https://unsplash.com/photos/koy6FlCCy5s","text_color":"light"},{"small":"https://images.unsplash.com/photo-1459664018906-085c36f472af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1459664018906-085c36f472af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Erol Ahmed","source":"unsplash","link":"https://unsplash.com/photos/aIYFR0vbADk","text_color":"light"},{"small":"https://images.unsplash.com/photo-1526275750900-6961d302a565?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1526275750900-6961d302a565?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Tom Grimbert (@tomgrimbert)","source":"unsplash","link":"https://unsplash.com/photos/GkBqGIySm5Q","text_color":"light"},{"small":"https://images.unsplash.com/photo-1541100242370-4d536228f2a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1541100242370-4d536228f2a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Max Ostrozhinskiy","source":"unsplash","link":"https://unsplash.com/photos/4sZfoo0awos","text_color":"light"},{"small":"https://images.unsplash.com/photo-1529801877115-8a69a227fcc0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1529801877115-8a69a227fcc0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Sifan Liu","source":"unsplash","link":"https://unsplash.com/photos/Ry6Imrao4hE","text_color":"light"},{"small":"https://images.unsplash.com/photo-1554176259-aa961fc32671?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1554176259-aa961fc32671?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Tyler Lastovich","source":"unsplash","link":"https://unsplash.com/photos/ddLiNMqWAOM","text_color":"light"},{"small":"https://images.unsplash.com/photo-1529164114-6b1bd6f5cc91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1529164114-6b1bd6f5cc91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Jason Leung","source":"unsplash","link":"https://unsplash.com/photos/KmKAk86LLgc","text_color":"light"},{"small":"https://images.unsplash.com/photo-1538947378928-4561e14354fe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1538947378928-4561e14354fe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Madara Parma","source":"unsplash","link":"https://unsplash.com/photos/5lgC0sAa6Gg","text_color":"light"},{"small":"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"NASA","source":"unsplash","link":"https://unsplash.com/photos/yZygONrUBe8","text_color":"light"},{"small":"https://images.unsplash.com/photo-1549880181-7827bc088ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1549880181-7827bc088ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Zhang JR","source":"unsplash","link":"https://unsplash.com/photos/vWIDTvXtGCk","text_color":"light"},{"small":"https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Manuel Cosentino","source":"unsplash","link":"https://unsplash.com/photos/n--CMLApjfI","text_color":"light"},{"small":"https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Qingbao Meng","source":"unsplash","link":"https://unsplash.com/photos/01_igFr7hd4","text_color":"light"},{"small":"https://images.unsplash.com/flagged/photo-1554935897-1bb0d260620a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/flagged/photo-1554935897-1bb0d260620a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Garrett Patz","source":"unsplash","link":"https://unsplash.com/photos/Ilu1Vv6EYds","text_color":"light"},{"small":"https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"John Fowler","source":"unsplash","link":"https://unsplash.com/photos/RsRTIofe0HE","text_color":"light"},{"small":"https://images.unsplash.com/photo-1496768050990-568b4d02ec18?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1496768050990-568b4d02ec18?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"George Tsapakis","source":"unsplash","link":"https://unsplash.com/photos/gB6c0iVrfAE","text_color":"light"},{"small":"https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1548919973-5cef591cdbc9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"Denys Nevozhai","source":"unsplash","link":"https://unsplash.com/photos/D8iZPlX-2fs","text_color":"light"},{"small":"https://images.unsplash.com/photo-1552152370-fb05b25ff17d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=50&fm=jpg&crop=entropy&cs=tinysrgb&w=400","full":"https://images.unsplash.com/photo-1552152370-fb05b25ff17d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjYzODA2fQ&q=60&fm=jpg&crop=entropy&cs=tinysrgb&w=2250&fit=max","credit":"asoggetti","source":"unsplash","link":"https://unsplash.com/photos/PdGBci-4jR8","text_color":"light"},{"small":"https://live.staticflickr.com/4240/34943640193_c2a25d399e.jpg","full":"https://live.staticflickr.com/4240/34943640193_fe52e","credit":"hpd-fotografy","source":"flickr","link":"https://www.flickr.com/photos/by_hpd/34943640193/","text_color":"light"}],
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
            // photos = localStorage.getItem('photos') || [],
            bgType = store['bgType'] || 'default',
            bg = store['bg'];
        // request photos and cache
        if ( lastFetched < now - (7*24*60*60*1000) || photos.length < 32 ){
            let res = await $.ajax({
                methods:'GET',
                url: 'http://www.yuiapi.com/api/v1/fika/background'
            });
            photos = res.data;
        }
        let cachedPhotoIndex = 0
        let interval = setInterval(()=>{
            let src = photos[cachedPhotoIndex]
            if (src){
                $('<img/>')[0].src = photos[cachedPhotoIndex].full;
                cachedPhotoIndex ++
            } else {
                clearInterval(interval)
            }
        }, 10000)
        localStorage.setItem('photos', JSON.stringify(photos));
        if ( photoRotation === true ){
            if (!bg){
                bg = 0
            } else {
                let randomIndex = bg;
                while (randomIndex === bg){
                    randomIndex = Math.round(Math.random()*(photos.length-1));
                }
                bg = randomIndex;
                bgType = 'photo'
            }
        }
        // autopilot whitelist
        let whiteList = await this.fetchAutopilotWhitelist();
        chrome.storage.sync.set({
            autopilotWhitelist: whiteList,
            photoLastFetchedDate: now,
            photoRotation: photoRotation,
            monoColors: monoColors,
            bgType: bgType,
            bg: bg
        })
    };
});
