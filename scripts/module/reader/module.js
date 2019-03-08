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

    this.toggleDrawer = function(open){
        if (open && drawer.available){
            // drawer.app.classList.add('fika-app-drawer-on')
            drawer.el.classList.add('fika-drawer-on');
            drawer.overlay.classList.add('fika-overlay-active')
        } else {
            // drawer.app.classList.remove('fika-app-drawer-on')
            drawer.el.classList.remove('fika-drawer-on');
            drawer.overlay.classList.remove('fika-overlay-active')
        }
        drawer.open = open;
    };

    this.toggleAppearanceMenu = function(toggle){
        const menu = $('.fika-menu');
        if (toggle !== undefined && !toggle){
            menu.addClass('fika-menu-on')
        }
        menu.toggleClass('fika-menu-on')
    };

    // language 当前语言，用于字体设置
    this.appearance = function(language) {
        const settings = {
            fontSize: {
                activeVal: localStorage.getItem('fontSize') || 'medium',
                cont: document.querySelector('.fika-article'),
                selects: document.querySelectorAll('.fika-select-size'),
                classPrefix: 'size-'
            },
            theme: {
                activeVal: localStorage.getItem('theme') || 'vanilla',
                cont: document.querySelector('.fika-app'),
                selects: document.querySelectorAll('.fika-select-theme'),
                classPrefix: 'theme-'
            },
            font: {
                activeVal: (function (){
                    const fontSettings = localStorage.getItem('font');
                    console.log(fontSettings && fontSettings[0] === '{');
                    const defaultFont = language.typeface.fonts[language.typeface.default]['class'];
                    if (fontSettings && fontSettings[0] === '{'){
                        let fontOfLang = JSON.parse(localStorage.getItem('font'))[language.typeface.script];
                        return fontOfLang ? fontOfLang : defaultFont
                    } else {
                        return defaultFont
                    }
                })(),
                cont: document.querySelector('.fika-article'),
                selects: document.querySelectorAll('.fika-select-font'),
                classPrefix: 'font-'
            }
        };

        function setAppearance(prop, val) {
            // change class name (theme) for app
            let oldVal, cont = settings[prop].cont;
            if (cont) {
                cont.classList.forEach(c => {
                    if (c.startsWith(settings[prop].classPrefix)) {
                        oldVal = c
                    }
                });
                cont.classList.replace(oldVal, `${settings[prop].classPrefix}${val}`);
            }
            // change state and storage
            settings[prop].activeVal = val;
            if (prop === 'font'){
                let fontSettings = localStorage.getItem('font');
                const script = language.typeface.script;
                if (fontSettings && fontSettings[0] === '{'){
                    fontSettings = JSON.parse(fontSettings);
                    fontSettings[script] = val;
                    localStorage.setItem('font', JSON.stringify(fontSettings))
                } else {
                    let store = {};
                    store[script] = val;
                    localStorage.setItem('font', JSON.stringify(store))
                }
            } else {
                localStorage.setItem(prop, val)
            }
            // change class name for ctrl btns
            for (let el of settings[prop].selects) {
                el.classList.remove('active');
                if (el.classList.contains(`${settings[prop].classPrefix}${val}`)) {
                    el.classList.add('active')
                }
            }
        }

        // set theme from localStorage
        setAppearance('theme', settings['theme'].activeVal);
        setAppearance('fontSize', settings['fontSize'].activeVal);
        setAppearance('font', settings['font'].activeVal);

        Array.from(settings['theme'].selects).forEach(el => {
            el.addEventListener('click', () => {
                setAppearance('theme', el.classList.item(1).split('-')[1])
            })
        });
        Array.from(settings['fontSize'].selects).forEach(el => {
            el.addEventListener('click', () => {
                setAppearance('fontSize', el.classList.item(1).split('-')[1])
            })
        });
        Array.from(settings['font'].selects).forEach(el => {
            el.addEventListener('click', () => {
                setAppearance('font', el.classList.item(1).split('-')[1])
            })
        })

    };

    this.initDrawerState = function(){
        drawer.w = window.innerWidth
        drawer.available = drawer.w < 1400
        $('#toc-btn').toggleClass('disabled', !drawer.available);
        console.log(drawer.available )
    };

    this._initSidebar = function() {
        this.ripple(document.querySelectorAll('.fika-btn'));
        this.ripple(document.querySelectorAll('.fika-drawer-tile'));

        /* Drawer */
        drawer = {
            open: false,
            modal: false,
            close: document.querySelector('.fika-drawer-close'),
            btn: document.querySelector('#toc-btn'),
            el: document.querySelector('.fika-drawer'),
            app: document.querySelector('.fika-app'),
            overlay: document.querySelector('.fika-overlay'),
            w: null,
            threshold: 1552,
            available:false
        };

        // click events
        drawer.btn.addEventListener('click', ()=>{
            self.toggleDrawer(!drawer.open)
        }, false);
        drawer.close.addEventListener('click', ()=>{
            self.toggleDrawer(false)
        }, false);
        drawer.overlay.addEventListener('click', ()=>{
            self.toggleDrawer(false)
            self.toggleAppearanceMenu(false)
            drawer.overlay.classList.remove('fika-overlay-active')
        }, false);

        this.initDrawerState();
        //
        window.addEventListener('resize', ()=>{
            // current window width
            const w = window.innerWidth;
            drawer.available = w < 1400;
            $('#toc-btn').toggleClass('disabled', !drawer.available)
            if (drawer.open && !drawer.available){
                self.toggleDrawer(false)
            }
                // if (w < drawer.threshold && w < drawer.w){
                //     drawer.overlay.classList.add('fika-overlay-active')
                // } else if (w >= drawer.threshold){
                //     drawer.overlay.classList.remove('fika-overlay-active')
                // }
            drawer.w = w;
            console.log(drawer.available )
        });

        $('#appearance').click(self.toggleAppearanceMenu);
        //tools
        $('#print').click(function(){
            window.print()
        });

        $('#fullscreen').click(function() {
            chrome.windows.get(-2, function(window){
                let fullScreenState = window.state;
                if(fullScreenState === "fullscreen") {
                    chrome.windows.update(-2, {state: "normal"});
                    $('#fullscreen').removeClass('fs-on')
                } else {
                    chrome.windows.update(-2, {state: "fullscreen"});
                    $('#fullscreen').addClass('fs-on')
                }
            });
        });
        $('#tool-btn').click(function () {
            $('.fika-tool').toggleClass('fika-tool-on')
            $('.fika-menu').removeClass('fika-menu-on')
        });
        let hoverTimer;
        $('.fika-tool').mouseleave(function () {
            hoverTimer = setTimeout(()=>{
                $(this).removeClass('fika-tool-on')
                $('.fika-menu').removeClass('fika-menu-on')
            }, 1200)
        });
        $('.fika-tool').mouseenter(function () {
            clearTimeout(hoverTimer)
        })
    };

    this._init = function(content) {
        //
        this._initSidebar();
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
                    mainLang.code = result.languages[i].language
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
                    mainLang['typeface'] = fonts.typeface[j]
                    break
                } else if (j === 3){
                    mainLang['typeface'] = fonts.typeface[3]
                }
            }
            // 加入切换字体的按钮
            self.view.display('reader', 'fonts', mainLang['typeface']['fonts'], $('.fika-select-fonts'))


            // toc
            let tocs = [];
            $(".fika-content").find(':header').each(function() {
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
            console.log('toc', tocs);
            // 如果没有抓到TOC 就不显示 - nil
            if (tocs.length > 1){
                self.view.display('reader', 'toc', tocs, $('.fika-toc'));
            }
            //
            $('.fika-content').find('svg').each(function() {
                $(this).remove();
            });

            self.appearance(mainLang);
        });
    };

    this.init = function() {

    };

    /**
     * 关闭reader mode
     */
    this.close_reader_mode = function() {
        // // let target = window.parent.$('#fika-reader');
        // let target = window.parent.document.getElementById('fika-reader');
        // console.log(target);
        // $('html, body').css('overflow-y', 'auto');
        // target.remove();
        //
        chrome.extension.sendMessage({
            'method': 'close_reader_mode',
            'data': false
        }, function () {});
    };
});

