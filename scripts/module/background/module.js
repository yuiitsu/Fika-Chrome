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

        // open main screen in new tab.
        chrome.browserAction.onClicked.addListener(function(tab) {
            // if (self.module.data.highlight_swtich(tab.url)) {
            //     self.badge_text.on();
            // } else {
            //     self.badge_text.off();
            // }
            let url_hash = self.common.md5(tab.url),
                method = 'reader_mode';
            // if (!article_data.hasOwnProperty(url_hash)) {
            //     method = 'reader_article_find';
            // }

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
            article_data = data['article_data'];

        if (is_available) {
            self.badge_text.on();
            Model.set('article_data', article_data);
        } else {
            self.badge_text.off();
        }
    };

    this.reader_get_article = function(data, send_response) {
        send_response(Model.get('article_data'));
    };

    this.is_open = function(data, send_response) {
        if (!data || !data.url) {
            self.badge_text.off();
            send_response(false);
            return false;
        }

        if (!self.module.data.is_open(data.url)) {
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
            this.run('off');
        },
        run: function(text) {
            chrome.browserAction.setBadgeText({'text': text}, function() {});
        }
    };
});
