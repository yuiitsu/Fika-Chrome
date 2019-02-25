/**
 * SpinXS Content Event
 * Created by Yuiitsu on 2018/10/24.
 */
App.event.extend('content', function() {

    let self = this;

    this.event = {
        close_reader_mode: function() {
            $(document).keydown(function(e) {
                if (e.which === 27) {
                    self.module.reader.close_reader_mode();
                }
            });
        }
    }
});
