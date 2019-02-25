/**
 * SpinXS Content Event
 * Created by Yuiitsu on 2018/10/24.
 */
App.event.extend('content', function() {

    let self = this;

    this.event = {
        open_reader_mode: function() {
            $(document).keydown(function(e) {
                // 打开reader mode
                if (e.which === 82 && e.altKey) {
                    chrome.extension.sendMessage({
                        'method': 'click_browser_icon',
                        'data': false
                    }, function () {});
                }
            });
        },
        close_reader_mode: function() {
            $(document).keydown(function(e) {
                if (e.which === 27) {
                    console.log('esc');
                    self.module.content.close_reader_mode();
                }
            });
        }
    }
});
