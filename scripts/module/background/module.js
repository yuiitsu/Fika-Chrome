/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('background', function() {
    //
    let self = this;

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
        chrome.contextMenus.create({
            type: 'normal',
            title: 'Toggle Fika',
            id: 'fikaReaderMode',
            onclick: this.openReaderMode
        }, function () {
            self.log('created context menus.');
        });

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
    }

    this.oauth = function(data, send_response){
        // check identity permission
        chrome.permissions.contains({
            permissions: ["identity"],
            origins: ["http://*/*", "https://*/*"]
        }, function(result){
            console.log('identity', result, send_response)
            if (result){
                self.getUser()
            } else {
                // request identity permission
                chrome.permissions.request({
                    permissions:[ "identity"],
                    origins:["http://*/*", "https://*/*"]
                }, function(granted){
                    console.log('granted', granted)
                    if (granted) {
                        self.getUser()
                    }
                })
            }
        })
        send_response('')
    }

    this.getUser = function(){
        chrome.identity.getAuthToken({interactive: false}, function(token) {
            $.ajax({
                url: "https://www.googleapis.com/oauth2/v1/userinfo?fields=email,family_name,gender,given_name,id,locale,name,picture",
                headers: { Authorization: 'Bearer '+ token},
                type: "GET",
                success: function(res) {
                    chrome.tabs.query({active: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            'method': 'loginUser',
                            'data': {
                                userInfo: res,
                                accessToken: token
                            }
                        }, function (response) {});
                    })
                }
            });
        });
    }

});
