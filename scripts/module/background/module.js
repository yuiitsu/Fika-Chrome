App.module.extend('background', function() {
    //
    let self = this,
        store = null,
        photos = [];

    this.init = function() {
        chrome.browserAction.onClicked.addListener(function(tab) {

            self.openReaderMode(null, tab);
            // chrome.tabs.sendMessage(tab.id, {
            //     'method': 'openReaderMode'
            // }, function (response) {});
        });
        chrome.runtime.onMessage.addListener(function(request, _, send_response) {

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

    this.new_badge = function(data, send_response) {
        self.badge_text.run('new');
        send_response(true);
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
            $.post('https://www.yuiapi.com/api/v1/fika/feedback', {
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
        chrome.storage.sync.set({version:Version.currentVersion})
    };

    this.initGA = function () {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        // ga('create', 'UA-138661141-1', 'auto')
        ga('create', 'UA-138661141-2', 'auto')
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
        try {
            let userInfo = await new Promise((resolve, reject)=>{
                chrome.identity.getAuthToken({interactive: true}, function(token) {
                    $.ajax({
                        url: "https://www.googleapis.com/oauth2/v1/userinfo?fields=email,family_name,gender,given_name,id,locale,name,picture",
                        headers: { Authorization: 'Bearer '+ token},
                        type: "GET",
                        success: (data)=> resolve(data),
                        error: (err) => reject(err)
                    });
                });
            });
            let res = await $.ajax({
                url: "https://www.yuiapi.com/api/v1/third_part/google/app",
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
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        'method': 'loginUser',
                        'data': store
                    }, function (response) {});
                })
            } else {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        'method': 'loginFailed',
                        'data': 0
                    }, function (response) {});
                })
            }
        } catch(err){
            console.log(err)
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    'method': 'loginFailed',
                    'data': 1
                }, function (response) {});
            })
        }
    };

    this.getUserStore = function (data, send_response) {
        self.getStore().then(res=>{
            store = res
            console.log(store)
            if (store.user && store.user.type === 'normal'){
                $.ajax({
                    url: "https://www.yuiapi.com/api/v1/user/info",
                    data: {token: store.user.token},
                    type: "GET",
                    success: res => {
                        if (res.code === 0){
                            store['user'] = Object.assign(store.user, {type: res.data.user_type});
                            chrome.storage.sync.set({user: store['user']}, function(){});
                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                chrome.tabs.sendMessage(tabs[0].id, {
                                    'method': 'loginUser',
                                    'data': store
                                }, function (response) {});
                            })
                        }
                    }
                });
            } else {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        'method': 'loginUser',
                        'data': store
                    }, function (response) {});
                })
            }
        })
        send_response('')
    }

    this.changeUserType = function (data, send_response) {
        $.ajax({
            url: "https://www.yuiapi.com/api/v1/user/info",
            data: {
                user_type: 'beta',
                token: store.user.token
            },
            type: "POST",
            success: (res) =>{
                if (res.code === 0){
                    store.user = Object.assign(store.user, {type: 'beta'})
                    chrome.storage.sync.set({user: store.user})
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            'method': 'loginUser',
                            'data': store
                        }, function (response) {});
                    })
                }
            }
        });
        send_response('')
    };

    this.updateWhitelist = function (data, send_response) {
        $.ajax({
            url: "https://www.yuiapi.com/api/v1/fika/autopilot",
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
                    url: "https://www.yuiapi.com/api/v1/fika/autopilot",
                    data:{token: store.user.token},
                    type: "GET",
                    success: (res) => {
                        if (res.code === 0){
                            for (let i of res.data){
                                if (i.is_auto === 1) whiteList.push(i.host)
                            }
                        }
                        resolve(whiteList)
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
                store = res;
                resolve(res);
            })
        });
    };

    this.getPhotoSrc = function (data, send_response) {
        send_response(photos)
    }

    let loadingPhotos = false,
        morePhotosAvailable = true;
    this.loadMorePhotoSrc = function (data, send_response) {
        let pageIndex = Math.floor(photos/32);
        if (pageIndex >= 1 && !loadingPhotos && morePhotosAvailable){
            loadingPhotos = true
            $.ajax({
                methods:'GET',
                url: 'https://www.yuiapi.com/api/v1/fika/background?page_index='+pageIndex+'&page_size=33',
                success: data =>{
                    for (let i of data.list){
                        photos.push(i)
                    }
                    if (photos.length > data.row_count){
                        morePhotosAvailable = false
                    }
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            'method': 'updatePhotoSrc',
                            'data': photos
                        }, function (response) {});
                    });
                },
                complete: ()=>{
                    loadingPhotos = false
                }
            });
        }
        send_response('')
    }

    this.fetchData = async function (data, send_response) {
        // photos
        let monoColors = [
            {id:1, color: "#C3ACEA", text_color: "light"},
            {id:2, color: "#FFC5CC", text_color: "light"},
            {id:3, color: "#F6D863", text_color: "light"},
            {id:4, color: "#FCF3CA", text_color: "dark"},
            {id:5, color: "#B9E4C9", text_color: "light"},
            {id:6, color: "#90F3E8", text_color: "light"},
            {id:7, color: "#8FCAF2", text_color: "light"},
            {id:8, color: "#293990", text_color: "light"},
            {id:9, color: "#191D2D", text_color: "light"},
            {id:10, color: "#111111", text_color: "light"},
            {id:11, color: "#F5F5F5", text_color: "dark"},
        ];
        try {
            store = await self.getStore();
            let now = new Date().getTime(),
                photoRotation = store['photoRotation'],
                // photos = localStorage.getItem('photos') || [],
                bgType = store['bgType'] || 'default',
                bg = store['bg'],
                whatsnew = store['whatsnew'] || ['settings','autopilot-local','menu'];
            // request photos and cache
            let res = await $.ajax({
                methods:'GET',
                url: 'https://www.yuiapi.com/api/v1/fika/background?page_index=1&page_size=32'
            });
            photos = res.data.list;
            if (bg && store['bgType'] === 'photo' && photos.filter(x => x.id === bg['id']).length === 0){
                photos.unshift(bg)
            }
            if (photos.length > res.data.row_count){
                morePhotosAvailable = false
            }
            // $('<img/>')[0].src = photos[cachedPhotoIndex].full;
            if ( bgType === 'photo' && photoRotation === true ){
                let random = bg;
                while (random === bg){
                    let randomIndex = Math.round(Math.random()*(photos.length-1));
                    random = photos[randomIndex]
                }
                bg = random;
            }
            // autopilot whitelist
            let whiteList = await this.fetchAutopilotWhitelist();

            chrome.storage.sync.set({
                autopilotWhitelist: whiteList,
                photoLastFetchedDate: now,
                photoRotation: photoRotation,
                monoColors: monoColors,
                bgType: bgType,
                bg: bg,
                whatsnew: whatsnew
            })
        } catch(err) {
            console.log(err)
        }

    };
});
