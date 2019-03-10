/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('background', function() {
    //
    let self = this,
        readerReadyTabId = 0;

    this.init = function() {
        // open main screen in new tab.
        chrome.browserAction.onClicked.addListener(function(tab) {
            if (tab.id === readerReadyTabId) {
                self.click_browser_icon({tab: tab, open: true});
            }
        });

        // // listen content script message.
        chrome.extension.onMessage.addListener(function(request, _, send_response) {
            let method = request.method;
            if ($.isFunction(self[method])) {
                self[method](request.data, send_response);
            } else {
                self.log('Background [' + method + '] not exist.')
            }
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
            readerReadyTabId = tabs[0].id;
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

        send_response('');
    };

    this.click_browser_icon = function(data, send_response) {
        let do_function = function(tab) {
            // let url_hash = self.module.common.md5(tab.url),
            //     method = 'reader_mode',
            //     article_data = Model.get('article_data');
            // if (!article_data || !article_data.hasOwnProperty('url_hash') || article_data['url_hash'] !== url_hash) {
            //     method = 'reader_article_find';
            // }

            chrome.tabs.sendMessage(tab.id, {
                'method': 'readerMode'
            }, function (response) {});
        };
        let tab = data.tab,
            open = data.open;

        if (!tab) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                do_function(tabs[0]);
            });
        } else {
            do_function(tab);
        }

        if (open) {
            self.badge_text.on();
        } else {
            self.badge_text.off();
        }

        if ($.isFunction(send_response)) {
            send_response('');
        }
    };

    this.close_reader_mode = function(data, send_response) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                'method': 'close_reader_mode'
            }, function (response) {
            });
        });
        send_response('');
    };

    this.setBrowserIcon = function(data, send_response) {
        let is_available = data['is_available'];
        if (is_available) {
            chrome.browserAction.setIcon({
                    path: {'64': 'images/logo64.png'}
                }, function () {})
        } else {
            chrome.browserAction.setIcon({
                    path: {'64': 'images/logo64-grey.png'}
                }, function () {})
        }
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
});
