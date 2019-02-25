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
                var mainLang = {code:'', percentage:0}
                for (var i = 0; i < result.languages.length; i++) {
                    languages += result.languages[i].language + " ";
                    languages += result.languages[i].percentage + "\n";
                    // 找出主要语言
                    if (result.languages[i].percentage > mainLang.percentage){
                        mainLang.code = result.languages[i].language
                        mainLang.percentage = result.languages[i].percentage
                    }
                }
                var is_reliable = "\nReliable? \n" + result.isReliable + "\n";
                // console.log(languages + is_reliable);

                // 渲染页面
                let _paper = $('.f-paper');
                self.view.display('reader', 'container', {
                    title: res.title,
                    content: res.content,
                    language: '' // 可以传递需要使用的语言代码, 传到View里可以处理
                }, _paper);

                // 如果不在View里处理，可以在页面渲染完成后，在这里处理.
                // todo


                // 多语言字体  - nil
                // 检查是否为从"右往左"书写的文字
                if (fonts.rtl.indexOf(mainLang.code) !== -1){
                    $('.f-article').addClass('rtl')
                }
                // 检索相应语言的字体列表
                for (let j = 0; j < fonts.typeface.length; j++){
                    if (fonts.typeface[j]['lang'].indexOf(mainLang.code) !== -1){
                        mainLang['typeface'] = fonts.typeface[j]
                        break
                    } else if (j === 3){
                        mainLang['typeface'] = fonts.typeface[3]
                    }
                }
                // 加入切换字体的按钮
                self.view.display('reader', 'fonts', mainLang['typeface']['fonts'], $('.f-select-fonts'))


                // toc
                let tocs = [];
                $(":header").each(function() {
                    let text = $(this)[0].innerText;
                    if (text) {
                        let id = Math.random() * 10000;
                        $(this).attr('id', id);
                        tocs.push({
                            tag: $(this)[0].localName,
                            text: text.replace(/\&nbsp;/, '').replace(/\s/, ''),
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


                appearance(mainLang);
            });
        });
    };
});

// 字体 metadata
const fonts = {
    rtl:['ar','arc','dv', 'fa', 'ha', 'he','khw','ks','ku','ps','ur','yi'],
    cssPrefix:'font-',
    typeface:[
        {
            lang: ['zh','zh-cn','zh-tw'], // 囊括的语言
            script:'chinese',
            default: 0, // 默认的字体index, 如中文的默认为黑体
            fonts:[ // 字体的名字和相应的css class
                { name:'黑体', class:'heiti' },
                { name:'宋体', class:'songti' },
                { name:'楷体', class:'kaiti'},
                { name:'圆体', class:'yuanti'},
            ]
        },
        {
            lang:['jp'],
            script:'japanese',
            default: 0,
            fonts:[
                { name:'明朝体', class:'mincho'},
                { name:'ゴシック体', class:'gothic'},
                { name:'丸ゴシック体', class:'maru'},
            ]
        },
        {
            lang:[ 'af', 'be', 'bg', 'ca', 'co', 'cs', 'cy', 'da', 'de', 'en', 'eo', 'es', 'et', 'eu', 'fi', 'fr', 'fy', 'ga', 'gl', 'hr', 'hu', 'id', 'ig', 'is', 'it', 'kk', 'ku', 'la', 'lb', 'lt', 'lv', 'mg', 'mk', 'mn', 'ms', 'mt', 'nl', 'no', 'ny', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'sv', 'sw', 'tg', 'tl', 'tr', 'uk', 'uz', 'vi', 'xh', 'yo', 'zu' ] , // 62
            script:'latin',
            default: 2,
            fonts:[
                { name:'Arial', class:'arial'},
                { name:'Courier', class:'courier'},
                { name:'Georgia', class:'georgia'},
                { name:'Merriweather', class:'merriweather'},
                { name:'Open Sans', class:'openSans'},
                { name:'Palatino', class:'palatino'},
            ]
        },
        // other languages
        {
            lang: [],
            script:'others',
            default: 0,
            fonts:[
                { name:'Arial', class:'arial'},
                { name:'Times New Roman', class:'times'},
            ]
        }
    ]
}