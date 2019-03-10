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
                    self.module.content.openReaderMode();
                }
            });
        },
        close_reader_mode: function() {
            $(document).keydown(function(e) {
                if (e.which === 27) {
                    self.module.content.closeReaderMode();
                }
            });
        },
        feedback: function() {
            $('body').on('click', '.fika-feedback-button', function(e) {
                let isMatch = $(this).attr('data-match');
                self.module.content.sendFeedback(isMatch);
                e.stopPropagation();
            });
        }
    }
});
