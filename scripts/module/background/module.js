/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('background', function() {
    //
    let self = this,
        article_data = {};

    this.init = function() {
        // chrome.tabs.sendMessage(tab_id, {
        //     'callback_method': callback_method,
        //     'callback_module': callback_module,
        //     'response': res,
        // }, function (response) {
        // });
        chrome.i18n.getAcceptLanguages(function(languageList) {
            var languages = languageList.join(",");
            console.log(languages);
        });
        chrome.fontSettings.getFontList(function(res) {
            console.log(res);
        });
        chrome.i18n.detectLanguage('Detects up to 3 languages and their percentages of the provided string', function(result) {
            var languages =  "Languages: \n";
            for (var i = 0; i < result.languages.length; i++) {
                languages += result.languages[i].language + " ";
                languages += result.languages[i].percentage + "\n";
            }

            var is_reliable = "\nReliable? \n" + result.isReliable + "\n";
            console.log(languages + is_reliable);
        });

        // open main screen in new tab.
        chrome.browserAction.onClicked.addListener(function(tab) {
            // if (self.module.data.highlight_swtich(tab.url)) {
            //     self.badge_text.on();
            // } else {
            //     self.badge_text.off();
            // }
            let url_hash = self.module.common.md5(tab.url),
                method = 'reader_mode',
                article_data = Model.get('article_data');
            if (!article_data || !article_data.hasOwnProperty('url_hash') || article_data['url_hash'] !== url_hash) {
                method = 'reader_article_find';
            }

            chrome.tabs.sendMessage(tab.id, {
                'method': method
            }, function (response) {
            });
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
    };

    this.reader_ready = function(data, send_response) {
        let is_available = data['is_available'],
            article_data = data['article_data'],
            show_reader_page = data['show_reader_page'];

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (is_available) {
                // self.badge_text.on();
                // Model.set('article_data', article_data);
                article_data['url_hash'] = self.module.common.md5(tabs[0].url);
                article_data['host'] = self.module.common.getHost(tabs[0].url);
                Model.set('article_data', article_data);

                //
                // chrome.browserAction.enable(tabs[0].id, function (res) {
                // });
                chrome.browserAction.setIcon({
                    path: {'64': 'images/logo64.png'},
                    tabId: tabs[0].id
                }, function () {
                });

                if (show_reader_page) {
                    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                    //     chrome.tabs.sendMessage(tabs[0].id, {
                    //         'method': 'reader_mode'
                    //     }, function (response) {
                    //     });
                    // });
                    chrome.tabs.sendMessage(tabs[0].id, {
                        'method': 'reader_mode'
                    }, function (response) {
                    });
                }
            } else {
                // self.badge_text.off();
                // chrome.browserAction.disable(tabs[0].id, function (res) {
                // });
                chrome.browserAction.setIcon({
                    path: {'64': 'images/logo64-grey.png'},
                    tabId: tabs[0].id
                }, function () {
                })
            }
        });
    };

    this.reader_get_article = function(data, send_response) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            //
            chrome.browserAction.setBadgeText({'text': 'on', 'tabId': tabs[0].id}, function() {});
        });
        //
        send_response(Model.get('article_data'));
    };

    this.set_browser_icon = function(data, send_response) {
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

        // if (!self.module.data.is_open(data.url)) {
        //     self.badge_text.off();
        //     send_response(false);
        //     return false;
        // }

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
});
