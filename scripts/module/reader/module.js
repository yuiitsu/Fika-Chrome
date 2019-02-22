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

            // toc
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
            console.log(tocs)
            // 如果没有抓到TOC 提示用户 - nil
            if (tocs.length > 1){
                self.view.display('reader', 'toc', tocs, $('.f-toc'));
            } else {
                self.view.display('reader', 'tocEmpty', null , $('.f-toc'))
            }

            // 处理img，如果没有域名，使用当前域名
            $('.f-paper').find('img').each(function() {
                let src = $(this).attr('src');
                let host = self.module.common.getHost(src);
                if (!host) {
                    $(this).attr('src', host + '/' + src);
                }
            });
            $('.f-paper').find('svg').each(function() {
                $(this).remove();
            });
            // 处理noscript
            // $('noscript').each(function() {
            //     console.log($(this).text());
            //     $(this).after($(this).text());
            // });
            //
            appearance();
        });
    };
});
