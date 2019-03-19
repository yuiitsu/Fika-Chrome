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
            let feedbackBtns = $('.fika-feedback-button'),
                feedbackOldVal ,
                clickCount = 0
            feedbackBtns.click(function () {
                let thisBtn = $(this),
                    attr = thisBtn.attr('data-match'),
                    msg = $('#fika-feedback-msg');
                if (feedbackOldVal !== attr && clickCount <= 1){
                    feedbackBtns.removeClass('fika-feedback-button-active')
                    thisBtn.addClass('fika-feedback-button-active')
                    self.module.content.sendFeedback(attr)
                    if (attr === '1'){
                        msg.html('Thanks for the upvote! <a href="https://chrome.google.com/webstore/detail/fika-reader-mode/fbcdnjeoghampomjjaahjgjghdjdbbcj" target="_blank">Rate Fika</a>')
                    } else {
                        msg.html('Sorry to hear that! <a href="mailto:hi@fika.io?subject=Fika User Feedback" target="_blank">Help us improve</a>')
                    }
                }
                clickCount++
                feedbackOldVal = attr
            })
        }
    }
});
