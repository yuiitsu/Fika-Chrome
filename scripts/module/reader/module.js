/**
 * Reader Module
 */

App.module.extend('reader', function() {

    let self = this,
        toc = null,
		store = null,
		isAuth = false;

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
        if (toggle === undefined){
			menu.toggleClass('fika-menu-on')
		} else {
			if (!toggle){
				menu.removeClass('fika-menu-on')
			} else {
				menu.toggleClass('fika-menu-on')
			}
		}
    };
    
    this.initMenu = function () {
    	let menuBtns = $('.fika-menu-nav-item:not(.small)'),
			menuViews = $('.fika-menu-view');
		menuBtns.click(function(){
			$('.fika-menu-nav-item.active').removeClass('active');
			$(this).addClass('active');
			let btnIndex = $(this).index();
			menuViews.hide();
			menuViews.eq(btnIndex).show();
		});
	};

    // language 当前语言，用于字体设置
    this.appearance = function(typeface) {
        let btns = $("div[data-sel]"),
			settings = {
            size: {
                val: store.size || 'medium',
                cont: $('.fika-article'),
            },
            theme: {
                val: store.theme || 'vanilla',
                cont: $('.fika-app'),
            },
            font: {
                val: store.font ? store.font[typeface.script] ? store.font[typeface.script] : typeface.fonts[typeface.default]['class'] : typeface.fonts[typeface.default]['class'] ,
                cont: $('.fika-article'),
            }
        };

        function setAppearance(data) {
        	let prop = data.split('-')[0],
				val = data.split('-')[1];
            // change class name (theme) for app & cleans old class
			let oldClass = settings[prop].cont.attr('class').split(' ').filter(c=> c.startsWith(prop)).join(' ');
			settings[prop].cont.removeClass(oldClass)
			settings[prop].cont.addClass(data);
            // change state and storage
			const newVal = {};
			if (prop === 'font'){
				newVal[typeface.script] = val;
				chrome.storage.sync.set({font: Object.assign({}, store.font, newVal)});
			} else {
				newVal[prop] = val
				chrome.storage.sync.set(newVal);
			}
            // change class name for buttons
			$(`[data-sel^='${prop}']`).removeClass('active');
			$(`[data-sel='${data}']`).addClass('active')
        }
		// set theme from storage
		setAppearance('size-' + settings['size'].val);
        setAppearance('theme-' + settings['theme'].val);
        setAppearance('font-' + settings['font'].val);
/*        settings['theme'].selects.click(function(){
            const selectTheme = $(this).attr('class').split(/\s+/)[1].split('-')[1]
            setAppearance('theme', selectTheme)
            let html = document.documentElement
            html.classList.forEach(i=>{
                if (i.startsWith('fika-html-bg-')){
                    html.classList.remove(i)
                }
            })
            $('html').addClass('fika-html-bg-' + selectTheme)
        });*/
		// bind click events
		btns.click(function () {
			setAppearance($(this).attr('data-sel'));
		})
    };

    // photos
	this.photos = function() {
		self.view.display('reader', 'photos', store['photos'], $('.fika-photo-grid'));
		let photoObj = new Image(),
			inputCheck = $('#fika-photo-bg'),
			fikaApp = $('.fika-app');
		// toggle photo background
		function togglePhotoBackground(val){
			if (val) {
				if (!photoObj.src){
					let rand = Math.round(Math.random()*(store.photos.length-1));
					inputCheck.attr('checked', 'checked');
					switchPhoto(rand);
				}
				fikaApp.addClass('fika-photo-bg-on');
			} else {
				fikaApp.removeClass('fika-photo-bg-on');
			}
			chrome.storage.sync.set({photoBg:val})
		}
		// select photos
		// pick a random photo on opening
		togglePhotoBackground(store.photoBg || false)
		inputCheck.change(function(){
			togglePhotoBackground($(this).is(":checked"))
		});
		function switchPhoto(index){
			let photo = store.photos[index],
				imgEl = $('.fika-photo-bg img'),
				imgCont = $('.fika-photo-bg'),
				tocOverlay = $('.fika-toc-static .fika-toc-overlay');
			$('.fika-photo-grid-item.active').removeClass('active');
			$('.fika-photo-grid-item').eq(index).addClass('active');
			imgEl.attr('src', photo.small);
			imgCont.addClass('fika-photo-bg-blur');
			tocOverlay.hide()

			photoObj.onload = function(){}
			photoObj.src = photo.full
			photoObj.onload = function () {
				imgEl.attr('src', this.src)
				imgCont.removeClass('fika-photo-bg-blur')
				tocOverlay.css('background-image', 'url('+this.src+')')
				tocOverlay.show()
			}
		}
		$('.fika-photo-grid-item').click(function () {
			switchPhoto($(this).index())
		})
	};

	// autopilot
	this.autopilot = function () {
		let whitelist = store.autopilotWhitelist || [],
			autopilotOn = store.autopilot || false,
			globalCheck = $('#fika-autopilot-global'),
			localCheck = $('#fika-autopilot-local'),
			whitelistEl = $('.fika-autopilot-whitelist'),
			currentDomain = window.location.hostname.replace(/^www\./, '');
		// mount whitelists UI
		self.view.display('reader', 'autopilot', store['autopilotWhitelist'], whitelistEl);
		// toggle autopilot globally
		if (autopilotOn){
			globalCheck.attr('checked', 'checked');
		}
		globalCheck.change(function(){
			chrome.storage.sync.set({autopilot:$(this).is(":checked")})
		});
		// add & remove domain to whitelist
		function add(domain){
			if (whitelist.indexOf(domain) === -1){
				whitelistEl.prepend(`
					<div class="fika-select-item fika-autopilot-whitelist-item"  data-domain="${domain}">
						<span>${domain}</span>
						<div class="fika-autopilot-delete">
							<svg class="fika-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
						</div>
					</div>
				`);
				whitelist.unshift(domain);
				chrome.storage.sync.set({autopilotWhitelist: whitelist})
				bindRemove();
				updateLocalCheck()
			}
		}
		function remove(domain){
			$('.fika-autopilot-whitelist-item[data-domain="'+domain+'"]').remove();
			whitelist.splice(whitelist.indexOf(domain), 1)
			chrome.storage.sync.set({autopilotWhitelist: whitelist})
			updateLocalCheck()
		}
		// bind input or button
		$('#fika-autopilot-input').keydown(function(e) {
			if (e.which === 13){
				try{
					let url = $(this).val(),
						regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
					if (regex.test(url)){
						url = url.startsWith('http') ? url : 'http://' + url;
						let domain = new URL(url).hostname.replace(/^www\./, '')
						add(domain);
						$(this).val('')
					}
				} catch {}
			}
		});
		bindRemove();
		function bindRemove(){
			$('.fika-autopilot-delete').click(function () {
				remove($(this).parent().attr('data-domain'))
			})
		}
		// local toggle
		function updateLocalCheck(){
			if (whitelist.indexOf(currentDomain) === -1) {
				localCheck.addClass('on')
			} else {
				localCheck.removeClass('on')
			}
		}
		updateLocalCheck();
		localCheck.click(function () {
			if (whitelist.indexOf(currentDomain) === -1){
				add(currentDomain)
			} else {
				remove(currentDomain)
			}
		});
	};


	// Toc Drawer
	this.initToc = function(){
        toc = {
            open: true,
            close: $('.fika-toc-close'),
			btn: $('#fika-toc-btn'),
            toolbar: $('.fika-tool'),
			drawer: $('.fika-drawer'),
            overlay: $('.fika-overlay'),
            static: $('.fika-toc-static'),
            w: null,
            threshold: 1264,
            available:false
        };
		function toggleToc(open){
            if (open) {
                if (toc.available){
                    toc.drawer.addClass('fika-drawer-on');
                    toc.overlay.addClass('fika-overlay-active')
                } else {
                    toc.static.addClass('fika-toc-static-active')
                }
            } else {
                toc.static.removeClass('fika-toc-static-active')
                toc.drawer.removeClass('fika-drawer-on');
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
		this.photos();
		this.autopilot();

        $('#fika-settings').click(self.toggleMenu);
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
        let hoverTimer;
/*        toolbar.mouseleave(function () {
            hoverTimer = setTimeout(()=>{
                $(this).removeClass('fika-tool-on')
                self.toggleMenu(false);
            }, 1200)
        });
        toolbar.mouseenter(function () {
            clearTimeout(hoverTimer)
        })*/

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
    };

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

    this._init = async function(content) {
        //
		store = await new Promise((resolve)=>{
			chrome.storage.sync.get(null, function (res) {
				resolve(res)
			})
		});
		console.log(store)
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
                self.appearance(mainLang['typeface'], {
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

    // auth
	this.login = function (data) {
		isAuth = true;
		console.log(data);
		self.view.display('reader', 'userProfile', Object.assign({isAuth: true}, data) , $('.fika-menu-login'));

	}
});

