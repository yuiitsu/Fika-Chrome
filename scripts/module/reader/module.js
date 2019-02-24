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
            // 处理语言
            chrome.i18n.detectLanguage(res.content, function(result) {
                // demo
                // result.languages[i].language 是语言代码
                // result.languages[i].percentage 是所占比例，比例越高，说明文本所使用的语言越高
                var languages =  "Languages: \n";
                for (var i = 0; i < result.languages.length; i++) {
                    languages += result.languages[i].language + " ";
                    languages += result.languages[i].percentage + "\n";
                }

                var is_reliable = "\nReliable? \n" + result.isReliable + "\n";
                console.log(languages + is_reliable);

                // 渲染页面
                let _paper = $('.f-paper');
                self.view.display('reader', 'container', {
                    title: res.title,
                    content: res.content,
                    language: '' // 可以传递需要使用的语言代码, 传到View里可以处理
                }, _paper);

                // 如果不在View里处理，可以在页面渲染完成后，在这里处理.
                // todo

                // toc
                let tocs = [];
                $(":header").each(function() {
                    let text = $(this)[0].innerText;
                    if (text) {
                        let id = Math.random() * 10000;
                        $(this).attr('id', id);
                        tocs.push({
                            tag: $(this)[0].localName,
                            text: text,
                            id: id
                        });
                    }
                });
                // 如果没有抓到TOC 提示用户 - nil
                if (tocs.length > 1){
                    self.view.display('reader', 'toc', tocs, $('.f-toc'));
                } else {
                    self.view.display('reader', 'tocEmpty', null , $('.f-toc'))
                }

                // 处理img，如果没有域名，使用当前域名
                _paper.find('img').each(function() {
                    let src = $(this).attr('src');
                    let host = self.module.common.hasHost(src);
                    if (!host) {
                        let host_data = self.module.common.getHost(res.host);
                        if (src.indexOf('//') === 0){
                            let host_type = host_data[1] ? host_data[1] : 'http';
                            $(this).attr('src', host_type + ':' + src);
                        } else {
                            host = res.host;
                            $(this).attr('src', host + '/' + src);
                        }
                    }
                });
                //
                _paper.find('svg').each(function() {
                    $(this).remove();
                });

                //
                appearance();
            });
        });
    };
});
