/**
 * Reader Module
 */

App.module.extend('reader', function() {

    let self = this,
        toc = null,
		fikaApp = $('.fika-app');

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

    this.toggleMenu = function(toggle){
        const menu = $('.fika-menu');
        if (toggle !== undefined && !toggle){
            menu.removeClass('fika-menu-on')
        } else {
            menu.toggleClass('fika-menu-on')
        }
    };
    
    this.initMenu = function () {
    	let menuBtns = $('.fika-menu-nav-item'),
			menuViews = $('.fika-menu-view');
		menuBtns.click(function(){
			$('.fika-menu-nav-item.active').removeClass('active');
			$(this).addClass('active');
			let btnIndex = $(this).index();
			menuViews.hide();
			menuViews.eq(btnIndex).show();
		});
		$('#fika-whatsnew').click(function () {
			chrome.tabs.create({url: chrome.extension.getURL("update.html")});
		})
	};

    // language 当前语言，用于字体设置
    this.appearance = function(language, cache) {
        let cacheFontSize = cache.fontSize,
            cacheTheme = cache.theme,
            cacheFont = cache.font,
            cachePhotoBg = cache.photoBg;

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
        // toggle photo background
        function togglePhotoBackground(val){
	          let app = $('.fika-app');
            if (val){
	              app.addClass('fika-photo-bg-on')
            } else {
	              app.removeClass('fika-photo-bg-on')
            }
            self.module.common.cache.set('photoBg', val);
        }

        // set theme from localStorage
        setAppearance('theme', settings['theme'].activeVal);
        setAppearance('fontSize', settings['fontSize'].activeVal);
        setAppearance('font', settings['font'].activeVal);
        togglePhotoBackground(cachePhotoBg)

        // bind click events
        settings['theme'].selects.click(function(){
            const selectTheme = $(this).attr('class').split(/\s+/)[1].split('-')[1]
            setAppearance('theme', selectTheme)
            let html = document.documentElement
            html.classList.forEach(i=>{
                if (i.startsWith('fika-html-bg-')){
                    html.classList.remove(i)
                }
            })
            $('html').addClass('fika-html-bg-' + selectTheme)
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

        // set photo background
        $('input[name="photo-bg"]').change(function(){
            console.log($(this).is(":checked"))
            togglePhotoBackground($(this).is(":checked"))
        })

    };

    // photos
	this.initPhotos = async function() {
		let {photos, photoBg} = await new Promise((resolve)=>{
			chrome.storage.sync.get(['photos'], function (res) {
				self.view.display('reader', 'photos', res['photos'], $('.fika-photo-grid'));
				resolve({photos:res['photos'], photoBg: res['photoBg']})
			})
		})
		console.log(photos, photoBg)
		function switchPhoto(){
			let imgEl = $('.fika-photo-bg img'),
				imgCont = $('.fika-photo-bg'),
				tocOverlay = $('.fika-toc-static .fika-toc-overlay')
			photo = new Image();
			imgCont.hide()
			tocOverlay.hide()
			photo.src = photoUrl
			photo.onload = function () {
				imgEl.attr('src', this.src)
				imgCont.show()
				tocOverlay.css('background-image', 'url('+this.src+')')
				tocOverlay.show()
			}
		}
		$('.fika-photo-grid-item').click(function () {
			
		})
	};

	// Toc Drawer
	this.initToc = function(){
        toc = {
            open: true,
            close: $('.fika-toc-close'),
			btn: $('#fika-toc-btn'),
            toolbar: $('.fika-tool'),
			drawer: $('.fika-toc'),
            overlay: $('.fika-overlay'),
            static: $('.fika-toc-static'),
            w: null,
            threshold: 1264,
            available:false
        };
		function toggleToc(open){
            if (open) {
                if (toc.available){
                    toc.drawer.addClass('fika-toc-on');
                    toc.overlay.addClass('fika-overlay-active')
                } else {
                    toc.static.addClass('fika-toc-static-active')
                }
            } else {
                toc.static.removeClass('fika-toc-static-active')
                toc.drawer.removeClass('fika-toc-on');
                toc.overlay.removeClass('fika-overlay-active')
            }
            toc.open = open;
        }
        // click events
        toc.btn.click(()=> toggleToc(!toc.open));
        toc.close.click(()=> toggleToc(false));
        toc.overlay.click(()=>{
			toggleToc(false);
			toc.overlay.removeClass('fika-overlay-active')
		});
		// check toc availability
        function updateTocDrawerAvailability(){
            toc.w = window.innerWidth;
			toc.available = toc.w < toc.threshold;
        }
		updateTocDrawerAvailability();
		window.addEventListener('resize', ()=>{
            // current window width
            const w = window.innerWidth;
            const wasAvailable = toc.available
            updateTocDrawerAvailability();
            if (wasAvailable && !toc.available){
                toggleToc(false)
                toggleToc(true)
            } else if (toc.available){
                toggleToc(false)
            }
            toc.w = w;
        });
    };

    this._initTools = function() {
        this.ripple(document.querySelectorAll('.fika-btn'));
        this.initToc();
        this.initMenu();
		this.initPhotos();

        $('#fika-appearance').click(self.toggleMenu);
        $(document).mouseup(function(e) {
            let container = $(".fika-menu");
            if (!container.is(e.target) && container.has(e.target).length === 0){
                container.removeClass('fika-menu-on');
            }
        });

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
/*        let hoverTimer;
        toolbar.mouseleave(function () {
            hoverTimer = setTimeout(()=>{
                $(this).removeClass('fika-tool-on')
                self.toggleMenu(false);
            }, 1200)
        });*/
        toolbar.mouseenter(function () {
            clearTimeout(hoverTimer)
        })

        //close
        // $('#fika-exit').click(function () {
        //     self.module.content.closeReaderMode()
        // })

        // share
        $('#fika-twitter-share').click(function () {
            const url = encodeURI(`https://twitter.com/intent/tweet?text=${document.title} | #SharedFromFika &url=${window.location.href}`).replace(/#/g,'%23')
            window.open(url, '_blank', 'width=720, height=600')
        })
        $('#fika-facebook-share').click(function(){
            const url = encodeURI(`https://www.facebook.com/sharer/sharer.php?title=${document.title} ${window.location.href} | shared from Fika&u=${window.location.href}`).replace(/#/g,'%23')
            window.open(url, '_blank', 'width=720, height=600')
        })

        //login
        $('#fika-login').click(function () {
            chrome.extension.sendMessage({
                'method': 'oauth',
                'data':{}
            }, function () {});
        })


    };

    this.feedback = function () {
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

    this.retrieveToc = function(){
	    // toc
	    let targetContent = $(".fika-content"),
		    title = $('.fika-article-title'),
		    tocs = [];
	    // article title headings
	    let id = Math.random() * 10000
	    title.attr('id', id)
	    tocs.push({
		    class: 'fika-toc-h1',
		    text: title[0].innerText,
		    id: id
	    });
	    // other headings
      	// compare relatively higher level headings, and filter them
      	let min = 6, d = 0;
	    targetContent.find(':header').each(function() {
		    let text = $(this)[0].innerText,
			tag = $(this)[0].localName;
			min = Math.min(min, tag.slice(1))
			if (text) {
				let id = Math.random() * 10000;
				$(this).attr('id', id);
				tocs.push({
					class: 'fika-toc-' + tag,
					text: text.trim(),
					id: id
				});
			}
	    });
	    d = min - 2; // at least h2
		if (d > 0){
			for (let i of tocs.slice(1)){
			  i.class = i.class.slice(0, -1) + d
			}
		}
		// 如果没有抓到TOC 就不显示
		if (tocs.length > 1){
		    self.view.display('reader', 'toc', tocs, $('.fika-toc'));
	    }
    };

    this._init = function(content) {
        //
		this._initTools();
		this.feedback();
		this.retrieveToc();
        // 处理语言
        chrome.i18n.detectLanguage(content, function(result) {
            // demo
            // result.languages[i].language 是语言代码
            // result.languages[i].percentage 是所占比例，比例越高，说明文本所使用的语言越高
            var languages =  "Languages: \n";
            var mainLang = {code:'', percentage:0};
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
            // 检索相应语言的字体列表
			for (let j = 0; j < Fonts.typeface.length; j++){
				if (Fonts.typeface[j]['lang'].indexOf(mainLang.code) !== -1){
					mainLang['typeface'] = Fonts.typeface[j];
					break
				} else if (j === 3){
					mainLang['typeface'] = Fonts.typeface[3]
				}
			}
            // 加入切换字体的按钮
            self.view.display('reader', 'fonts', mainLang['typeface']['fonts'], $('.fika-select-fonts'))

	          $(".fika-content").find('svg').each(function() {
                $(this).remove();
            });

            self.module.common.cache.get(['fontSize', 'theme', 'font', 'photoBg'], function(res) {
                self.appearance(mainLang, {
                    fontSize: res[0],
                    theme: res[1],
                    font: res[2],
                    photoBg: res[3]
                });
            });
        });
    };

    this.init = function() {

    };
});

