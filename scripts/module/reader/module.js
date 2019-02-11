/**
 * Reader Module
 */
App.module.extend('reader', function() {

    let self = this;

    this.init = function() {
        chrome.extension.sendMessage({
            'method': 'reader_get_article',
            'data': {}
        }, function (res) {
            self.view.display('reader', 'container', {
                title: res.title,
                content: res.content
            }, $('.f-paper'));

            let tocs = [];
            $(":header").each(function() {
                let id = Math.random() * 10000;
                $(this).attr('id', id);
                tocs.push({
                    tag: $(this)[0].localName,
                    text: $(this)[0].innerText,
                    id: id
                });
            });
            self.view.display('reader', 'toc', tocs, $('.f-toc'));
            //
            appearance();
        });
    };
});
