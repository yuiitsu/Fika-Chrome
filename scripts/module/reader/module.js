/**
 * Reader Module
 */

App.module.extend('reader', function() {

    let self = this,
        drawer = null;

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
};

    this.ripple = function(els){
        if (els){
            Array.from(els).forEach(el=>{
                el.addEventListener('click', (e)=>{
                    const rect = el.getBoundingClientRect();
                    el.classList.add('fika-ripple-container');
                    // create ripple element
                    let ripple = document.createElement('span');
                    ripple.className = 'fika-ripple';
                    ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px';
                    el.appendChild(ripple);
                    // set ripple position
                    let top = e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop;
                    let left = e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft
                    ripple.style.top = top+'px';
                    ripple.style.left = left+'px';
                    ripple.classList.add('active');
                    setTimeout(()=>{
                        ripple.remove()
                    },1000)
                }, false)
            })
        }
    };

    this.toggleAppearanceMenu = function(toggle){
        const menu = $('.fika-menu');
        if (toggle !== undefined && !toggle){
            menu.removeClass('fika-menu-on')
            drawer.overlay.removeClass('fika-overlay-standby')
        } else {
            menu.toggleClass('fika-menu-on')
            drawer.overlay.toggleClass('fika-overlay-standby')
        }
    };

    // language 当前语言，用于字体设置
    this.appearance = function(language, cache) {
        let cacheFontSize = cache.fontSize,
            cacheTheme = cache.theme,
            cacheFont = cache.font;

        const settings = {
            fontSize: {
                activeVal: cacheFontSize || 'medium',
                cont: $('.fika-article'),
                selects: $('.fika-select-size'),
                classPrefix: 'size-'
            },
            theme: {
                activeVal: cacheTheme || 'vanilla',
                cont: $('.fika-app'),
                selects: $('.fika-select-theme'),
                classPrefix: 'theme-'
            },
            font: {
                activeVal: (function (){
                    const fontSettings = cacheFont;
                    const defaultFont = language.typeface.fonts[language.typeface.default]['class'];
                    if (fontSettings && fontSettings[0] === '{'){
                        let fontOfLang = JSON.parse(cacheFont)[language.typeface.script];
                        return fontOfLang ? fontOfLang : defaultFont
                    } else {
                        return defaultFont
                    }
                })(),
                cont: $('.fika-article'),
                selects: $('.fika-select-font'),
                classPrefix: 'font-'
            }
        };

        function setAppearance(prop, val) {
            // change class name (theme) for app
            let oldVal='', newVal='', cont = settings[prop].cont;
            cont.attr('class').split(/\s+/).forEach(c => {
                if (c.startsWith(settings[prop].classPrefix)) oldVal = c
            });
            cont.removeClass(oldVal)
            newVal = `${settings[prop].classPrefix}${val}`
            cont.addClass(newVal)
            // change state and storage
            settings[prop].activeVal = val;
            if (prop === 'font'){
                let fontSettings = cacheFont;
                const script = language.typeface.script;
                if (fontSettings && fontSettings[0] === '{'){
                    fontSettings = JSON.parse(fontSettings);
                    fontSettings[script] = val;
                    // localStorage.setItem('font', JSON.stringify(fontSettings))
                    self.module.common.cache.set('font', JSON.stringify(fontSettings));
                } else {
                    let store = {};
                    store[script] = val;
                    // localStorage.setItem('font', JSON.stringify(store))
                    self.module.common.cache.set('font', JSON.stringify(store));
                }
            } else {
                // localStorage.setItem(prop, val)
                self.module.common.cache.set(prop, val);
            }
            // change class name for ctrl btns
            settings[prop].selects.removeClass('active');
            settings[prop].selects.each(function(){
                if ($(this).hasClass(newVal)) $(this).addClass('active')
            })
        }

        // set theme from localStorage
        setAppearance('theme', settings['theme'].activeVal);
        setAppearance('fontSize', settings['fontSize'].activeVal);
        setAppearance('font', settings['font'].activeVal);

        // bind click events
        settings['theme'].selects.click(function(){
            setAppearance('theme',
              $(this).attr('class').split(/\s+/)[1].split('-')[1]
            )
        });
        settings['fontSize'].selects.click(function(){
            setAppearance('fontSize',
              $(this).attr('class').split(/\s+/)[1].split('-')[1]
            )
        });
        settings['font'].selects.click(function(){
            setAppearance('font',
              $(this).attr('class').split(/\s+/)[1].split('-')[1]
            )
        });

    };

    this.initDrawer = function(){
        /* Drawer */
        drawer = {
            open: true,
            modal: false,
            close: $('.fika-drawer-close'),
            toolbar: $('.fika-tool'),
            btn: $('#fika-toc-btn'),
            el: $('.fika-drawer'),
            app: $('.fika-app'),
            overlay: $('.fika-overlay'),
            static: $('.fika-toc-static'),
            w: null,
            threshold: 1264,
            available:false
        };

        function toggleToc(open){
            console.log(open)
            // static
            if (open) {
                if (drawer.available){
                    drawer.el.addClass('fika-drawer-on');
                    drawer.overlay.addClass('fika-overlay-active')
                } else {
                    drawer.static.addClass('fika-toc-static-active')
                }
            } else {
                drawer.static.removeClass('fika-toc-static-active')
                drawer.el.removeClass('fika-drawer-on');
                drawer.overlay.removeClass('fika-overlay-active')
            }
            drawer.open = open;
        }

        // click events
        drawer.btn.click(function(){
            toggleToc(!drawer.open)
        });
        drawer.close.click(function(){
            toggleToc(false)
        });
        drawer.overlay.click(function(){
            toggleToc(false);
            self.toggleAppearanceMenu(false);
            drawer.overlay.removeClass('fika-overlay-active')
        });

        function toggleTocDrawer(){
            drawer.w = window.innerWidth;
            drawer.available = drawer.w < drawer.threshold;
        }

        window.addEventListener('resize', ()=>{
            // current window width
            const w = window.innerWidth;
            const wasAvailabe = drawer.available
            toggleTocDrawer()
            if (wasAvailabe && !drawer.available){
                toggleToc(false)
                toggleToc(true)
            } else if (drawer.available){
                toggleToc(false)
            }
            drawer.w = w;
        });
        // init drawer
        toggleTocDrawer()
    };

    this._initTools = function() {
        this.ripple(document.querySelectorAll('.fika-btn'));
        this.initDrawer()

        $('#fika-appearance').click(self.toggleAppearanceMenu);

        // print 暂时砍去打印功能
        // $('#fika-print').click(function(){
        //     var ifr = document.createElement('iframe');
        //     ifr.style='height: 0px; width: 0px; position: absolute'
        //     document.body.appendChild(ifr);
        //     var cssLink = document.createElement("link");
        //     cssLink.rel = "stylesheet";
        //     cssLink.type = "text/css";
        //     cssLink.href = "chrome-extension://gbgpnkjlajphppfjolpcpffegigiokii/style/content.css";
        //     ifr.contentDocument.head.appendChild(cssLink)
        //     $('#fika-reader').clone().appendTo(ifr.contentDocument.body);
        //     ifr.contentWindow.print();
        //     ifr.parentElement.removeChild(ifr);
        // });

        $('#fika-fullscreen').click(function() {
            $(this).toggleClass('fs-on')
            const el = document.documentElement
            if ( !document.fullscreenElement || !document.webkitIsFullScreen) {
                if (el.requestFullscreen) {
                    el.requestFullscreen()
                } else if (el.webkitRequestFullScreen) {
                    el.webkitRequestFullScreen()
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        });

        let toolbar = $('.fika-tool')
        $('#fika-tool-btn').click(function () {
            toolbar.toggleClass('fika-tool-on')
            $('.fika-menu').removeClass('fika-menu-on')
        });
        let hoverTimer;
        toolbar.mouseleave(function () {
            hoverTimer = setTimeout(()=>{
                $(this).removeClass('fika-tool-on')
                self.toggleAppearanceMenu(false);
            }, 1200)
        });
        toolbar.mouseenter(function () {
            clearTimeout(hoverTimer)
        })

        //close
        $('#fika-exit').click(function () {
            self.module.content.closeReaderMode()
        })

        // share
        $('#fika-twitter-share').attr('href', encodeURI(`https://twitter.com/intent/tweet?text=${document.title} shared from Fika&url=${window.location.href}`))
        $('#fika-facebook-share').attr('href', encodeURI(`https://www.facebook.com/sharer/sharer.php?title=${document.title} ${window.location.href}  shared from Fika&u=${window.location.href}`))

        //feedback
        // function imageIcon(url){
        //     return ` <img class="fika-icon fika-icon-large" src="${url}">`
        // }
        // $('#fika-twitter-share').html(
        //   imageIcon(chrome.extension.getURL("assets/icon/twitter-01.png"))
        // )
        // $('#fika-facebook-share').html(
        //   imageIcon(chrome.extension.getURL("assets/icon/facebook-01.png"))
        // )
        let feedbackBtns = $('.fika-feedback-button'),
            feedbackOldVal ,
            clickCount = 0
        feedbackBtns.click(function () {
            console.log($(this).attr('data-match'))
            let thisBtn = $(this),
                attr = thisBtn.attr('data-match'),
                msg = $('#fika-feedback-msg');
            if (feedbackOldVal !== attr && clickCount <= 1){
                feedbackBtns.removeClass('fika-feedback-button-active')
                thisBtn.addClass('fika-feedback-button-active')
                if (attr === '1'){
                    msg.html('Thanks for the upvote! <a href="https://chrome.google.com/webstore/detail/fika-reader-mode/fbcdnjeoghampomjjaahjgjghdjdbbcj" target="_blank">Rate Fika</a>')
                } else {
                    msg.html('Sorry to hear that! <a href="mailto:hi@fika.io?subject=Fika User Feedback" target="_blank">Help us improve</a>')
                }
            }
            clickCount++
            feedbackOldVal = attr
        })
    };

    this._init = function(content) {
        //
        this._initTools();
        // 处理语言
        chrome.i18n.detectLanguage(content, function(result) {
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
                    mainLang.code = result.languages[i].language;
                    mainLang.percentage = result.languages[i].percentage
                }
            }

            // 多语言字体  - nil
            // 检查是否为从"右往左"书写的文字
            if (fonts.rtl.indexOf(mainLang.code) !== -1){
                $('.fika-article').addClass('rtl')
            }
            // 检索相应语言的字体列表
            for (let j = 0; j < fonts.typeface.length; j++){
                if (fonts.typeface[j]['lang'].indexOf(mainLang.code) !== -1){
                    mainLang['typeface'] = fonts.typeface[j];
                    break
                } else if (j === 3){
                    mainLang['typeface'] = fonts.typeface[3]
                }
            }
            // 加入切换字体的按钮
            self.view.display('reader', 'fonts', mainLang['typeface']['fonts'], $('.fika-select-fonts'))

            // toc
            let targetContent = $(".fika-content"),
                tocs = [];
            // toc 大标题
            let title = $('.fika-title'),
                randomId = Math.random() * 10000
            title.attr('id', randomId)
            tocs.push({
                tag: 'h1',
                text: title[0].innerText,
                id: randomId
            })
            // toc 其他标题
            targetContent.find(':header').each(function() {
                let text = $(this)[0].innerText;
                if (text) {
                    let id = Math.random() * 10000;
                    $(this).attr('id', id);
                    tocs.push({
                        tag: $(this)[0].localName,
                        text: text.trim(),
                        id: id
                    });
                }
            });
            // 如果没有抓到TOC 就不显示 - nil
            if (tocs.length > 1){
                self.view.display('reader', 'toc', tocs, $('.fika-toc'));
            }


            targetContent.find('svg').each(function() {
                $(this).remove();
            });

            self.module.common.cache.get(['fontSize', 'theme', 'font'], function(res) {
                self.appearance(mainLang, {
                    fontSize: res[0],
                    theme: res[1],
                    font: res[2]
                });
            });
        });
    };

    this.init = function() {

    };
});

