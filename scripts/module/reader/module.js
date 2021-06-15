/**
 * Reader Module
 */

App.module.extend('reader', function() {

    let self = this,
        toc = null,
		store = null,
		photoSrc = [],
		pendingToShare;

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
				},
				align: {
					val: store.align || 'normal',
					cont: $('.fika-article')
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
			$(`[data-sel='${data}']`).addClass('active');
        }
		// set theme from storage
		setAppearance('size-' + settings['size'].val);
        setAppearance('theme-' + settings['theme'].val);
        setAppearance('font-' + settings['font'].val);
        setAppearance('align-' + settings['align'].val);
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
			let dataSel = $(this).attr('data-sel')
			setAppearance(dataSel );
			// ga events
			chrome.extension.sendMessage({
				'method': 'sendGA',
				'data': {
					type: 'event',
					p: [dataSel .split('-')[0], dataSel .split('-')[1], null]
				}
			});
		})
    };

    // background
	this.background = function() {
		// variables
		let photoObj = new Image(),
			inputCheck = $('#fika-photo-bg'),
			fikaApp = $('.fika-app'),
			bgCont = $('.fika-bg'),
			credit = $('.fika-bg-credit'),
			loading = $('#fika-loading-bg');
		// init background from settings
		if (!store.bg || !store.bg['id']) {
			store.bgType = 'default'
			switchBg('default')
		} else {
			switchBg(store.bgType, store.bg, store.bg['id']);
		}
		// toggle photo rotation
		inputCheck.prop('checked', store.photoRotation);
		inputCheck.change(function(){
			chrome.storage.sync.set({photoRotation:$(this).is(":checked")})
		});
		// switch background type tab
		$('.fika-photo-grid-tab').click(function () {
			$('.fika-photo-grid-tab.active').removeClass('active');
			$(this).addClass('active');
			let tab = $(this).attr('data-tab');
			$('.fika-photo-grid').hide();
			$(`.fika-photo-grid[data-tab="${tab}"]`).show();
		});
		// select background
		$('.fika-photo-grid-item').click(function () {
			let type = $(this).attr('data-type'),
				data, id = parseInt($(this).attr('data-id'));
			if (type === 'photo') {
				let index = photoSrc.map((x)=>x.id).indexOf(id);
				data = photoSrc[index];
				chrome.extension.sendMessage({
					'method': 'sendGA',
					'data': {
						type: 'event',
						p: ['bg-photo', data.link ]
					}
				});
			} else if (type === 'color') {
				let index = store['monoColors'].map((x)=>x.id).indexOf(id);
				data = store['monoColors'][index];
				chrome.extension.sendMessage({
					'method': 'sendGA',
					'data': {
						type: 'event',
						p: ['bg-color', data.color ]
					}
				});
			}
			switchBg(type, data, id);
		});
		function switchBg(type, data, id){
			credit.hide();
			loading.hide();
			photoObj.src = '';
			photoObj.onload = function(){};
			if ( type === 'default'){
				$('.fika-photo-grid-item.active').removeClass('active');
				$('.fika-photo-grid-default').addClass('active');
				fikaApp.removeClass('fika-bg-on fika-bg-dark fika-bg-light');
				chrome.storage.sync.set({bg: null, bgType: 'default'})
			} else {
				fikaApp.addClass('fika-bg-on');
				fikaApp.removeClass('fika-bg-dark fika-bg-light');
				if (type === 'photo'){
					switchPhoto(data, id);
				} else if (type === 'color'){
					switchColor(data, id);
				}
				chrome.storage.sync.set({bg: data, bgType: type})
			}
		}
		// load image
		function switchPhoto(data, id){
			$('.fika-photo-grid-item.active').removeClass('active');
			$(`.fika-photo-grid-item[data-type="photo"][data-id="${id}"]`).addClass('active');
			bgCont.css('background-image', 'url('+data.small+')');
			bgCont.addClass('fika-bg-blur');
			fikaApp.addClass('fika-bg-'+data.text_color);
			loading.show();

			photoObj.src = data.full;
			photoObj.onload = function () {
				bgCont.css('background-image', 'url('+this.src+')');
				bgCont.removeClass('fika-bg-blur');
				loading.hide();
			};
			credit.attr('href', data['link']);
			credit.html(`photo by ${data['credit']} / ${data['source']}`);
			credit.show();
		}
		// load mono-color
		function switchColor(data, id){
			$('.fika-photo-grid-item.active').removeClass('active');
			$(`.fika-photo-grid-item[data-type="color"][data-id="${id}"]`).addClass('active');
			fikaApp.addClass('fika-bg-'+data.text_color);
			bgCont.css('background-image', '');
			bgCont.css('background-color', data.color);
		}
		// load more photos
		$('.fika-menu-view-cont').scroll(function () {
			let el = $(this)
			if ($('.fika-menu-view[data-tab="theme"]').css('display')==='block'){
				if (el.scrollTop() + el.innerHeight() >= el[0].scrollHeight - 100 ){
					chrome.extension.sendMessage({
						'method': 'loadMorePhotoSrc',
						'data': {}
					}, function () {});
				}
			}
		})
	};
	this.updatePhotoSrc = function (data) {
		photoSrc = data
		self.view.display('reader', 'photos', {
			value: photoSrc,
			type:'photo'
		}, $('.fika-photo-grid[data-tab="photo"]'));
		self.background()
	};

	// autopilot
	this.autopilot = function () {
		let whitelist = store.autopilotWhitelist || [],
			localCheck = $('#fika-autopilot-local'),
			whitelistEl = $('.fika-autopilot-whitelist'),
			currentDomain = window.location.hostname.split('.').splice(-2).join('.');
		// mount whitelists UI
		self.view.display('reader', 'autopilot', store['autopilotWhitelist'], whitelistEl);
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
				self.toast(`<u>${domain}</u> is added to whitelist`);
				bindRemove();
				updateLocalCheck();
				postUpdate('add');
				// ga event
				chrome.extension.sendMessage({
					'method': 'sendGA',
					'data': {
						type: 'event',
						p: ['ap-whitelist', domain]
					}
				});
			}
		}
		function remove(domain){
			$('.fika-autopilot-whitelist-item[data-domain="'+domain+'"]').remove();
			whitelist.splice(whitelist.indexOf(domain), 1);
			chrome.storage.sync.set({autopilotWhitelist: whitelist});
			self.toast(`<u>${domain}</u> is removed from whitelist`)
			updateLocalCheck();
			postUpdate('remove');
		}
		function postUpdate(method){
			chrome.extension.sendMessage({
				'method': 'updateWhitelist',
				'data':{method, host: currentDomain}
			}, function () {});
		}
		// bind input or button
		$('#fika-autopilot-input').keydown(function(e) {
			if (e.which === 13){
				try {
					let url = $(this).val(),
						regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
					if (regex.test(url)){
						url = url.startsWith('http') ? url : 'http://' + url;
						let domain = new URL(url).hostname.split('.').splice(-2).join('.');
						add(domain);
						$(this).val('');
					}
				} catch (err) {}
			}
		});
		bindRemove();
		function bindRemove(){
			$('.fika-autopilot-delete').click(function () {
				remove($(this).parent().attr('data-domain'));
			})
		}
		// local toggle
		function updateLocalCheck(){
			if (whitelist.indexOf(currentDomain) === -1) {
				localCheck.addClass('on');
			} else {
				localCheck.removeClass('on');
			}
		}
		updateLocalCheck();
		localCheck.click(function () {
			if (whitelist.indexOf(currentDomain) === -1){
				add(currentDomain);
			} else {
				remove(currentDomain);
			}
		});
	};

	// Toast
	this.toast = function (msg, closeBtn, duration = 3000) {
		let el = $('.fika-toast'),
			btn = $('#fika-toast-close')
		$('#fika-toast-msg').html(msg);
		el.addClass('active')
		window.clearTimeout(window.toastTimeout)
		btn.click(function () {
			el.removeClass('active')
		})
		if (closeBtn){
			btn.show()
		} else {
			btn.hide()
			window.toastTimeout = setTimeout(()=>{
				el.removeClass('active')
			}, duration)
		}
	}

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
                    toc.overlay.addClass('fika-overlay-active');
                } else {
                    toc.static.addClass('fika-toc-static-active');
                }
            } else {
                toc.static.removeClass('fika-toc-static-active');
                toc.drawer.removeClass('fika-drawer-on');
                toc.overlay.removeClass('fika-overlay-active');
            }
            toc.open = open;
        }
        // click events
        toc.btn.click(()=> toggleToc(!toc.open));
        toc.close.click(()=> toggleToc(false));
        toc.overlay.click(()=>{
			toggleToc(false);
			toc.overlay.removeClass('fika-overlay-active');
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
                toggleToc(false);
                toggleToc(true);
            } else if (toc.available){
                toggleToc(false);
            }
            toc.w = w;
        });
    };

    this._initTools = function() {
        this.ripple(document.querySelectorAll('.fika-btn'));
        this.initToc();
        this.initMenu();

        $('#fika-settings').click(function (){
        	self.toggleMenu();
			chrome.extension.sendMessage({
				'method': 'getUserStore'
			}, function () {});
		});
        $(document).mouseup(function(e) {
            let container = $(".fika-menu");
            if (!container.is(e.target) && container.has(e.target).length === 0){
				self.toggleMenu(false)
            }
        });
        $('#fika-fullscreen').click(function() {
            $(this).toggleClass('fs-on');
            const el = document.documentElement;
            if ( !document.fullscreenElement || !document.webkitIsFullScreen) {
                if (el.requestFullscreen) {
                    el.requestFullscreen();
                } else if (el.webkitRequestFullScreen) {
                    el.webkitRequestFullScreen();
                }
				// ga event
				chrome.extension.sendMessage({
					'method': 'sendGA',
					'data': {
						type: 'event',
						p: ['fullscreen', 'on']
					}
				});
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        });

        let toolbar = $('.fika-tool');
        $('#fika-tool-btn').click(function () {
            toolbar.toggleClass('fika-tool-on');
			self.toggleMenu(false)
        });
        // hover
        let hoverTimer;
        toolbar.mouseleave(function () {
            hoverTimer = setTimeout(()=>{
                $(this).removeClass('fika-tool-on')
                self.toggleMenu(false);
            }, 1200)
        });
        toolbar.mouseenter(function () {
            clearTimeout(hoverTimer)
        });

        //close
        // $('#fika-exit').click(function () {
        //     self.module.content.closeReaderMode()
        // })

        // share
        $('#fika-twitter-share').click(function () {
            const url = encodeURI(`https://twitter.com/intent/tweet?text=${document.title} | #SharedFromFika &url=${window.location.href}`).replace(/#/g,'%23');
            window.open(url, '_blank', 'width=720, height=600');
			chrome.extension.sendMessage({
				'method': 'sendGA',
				'data': {
					type: 'social',
					p: ['twitter', 'share', window.location.href]
				}
			});
        });
        $('#fika-facebook-share').click(function(){
            const url = encodeURI(`https://www.facebook.com/sharer/sharer.php?title=${document.title} ${window.location.href} | shared from Fika&u=${window.location.href}`).replace(/#/g,'%23');
            window.open(url, '_blank', 'width=720, height=600');
			chrome.extension.sendMessage({
				'method': 'sendGA',
				'data': {
					type: 'social',
					p: ['facebook', 'share', window.location.href]
				}
			});
        });
		// $('.fika-share-to-unlock-btn').click(function () {
		// 	let type = $(this).attr('data-type');
		// 	if (store.user) {
		// 		self.shareToUnlock(type);
		// 	} else {
		// 		$('#fika-loading-login').show();
		// 		pendingToShare = type;
		// 		chrome.extension.sendMessage({
		// 			'method': 'oauth',
		// 			'data':{}
		// 		}, function () {});
		// 	}
		// })
		//whats new dot
		if (store.whatsnew.length > 0){
			$('[data-whats-new]').each(function () {
				let dataSet = $(this).attr('data-whats-new');
				if (store.whatsnew.includes(dataSet)){
					$(this).addClass('fika-whats-new');
				}
				$(this).click(function () {
					$(this).removeClass('fika-whats-new');
					let index = store.whatsnew.indexOf($(this).attr('data-whats-new'));
					if (index !== -1){
						store.whatsnew.splice(index, 1);
						chrome.storage.sync.set({whatsnew: store.whatsnew});
					}
				})
			})
		}
    };

    // this.shareToUnlock = function (type) {
	// 	if (type === 'fb'){
	// 		window.open('http://fika.io/sharetounlock?t=' + store.user.token);
	// 		self.toggleMenu(false);
	// 	} else if (type === 'tw') {
	// 		let win = window.open('https://twitter.com/intent/retweet?tweet_id=1117715831540965376', 'twitter_share', 'width=600, height=480');
	// 		let interval = setInterval(function(){
	// 			if (win.closed){
	// 				chrome.extension.sendMessage({
	// 					'method': 'changeUserType'
	// 				}, function () {});
	// 				clearInterval(interval)
	// 			}
	// 		}, 500)
	// 		self.toggleMenu(false);
	// 	}
	// 	chrome.extension.sendMessage({
	// 		'method': 'sendGA',
	// 		'data': {
	// 			type: 'event',
	// 			p: ['beta-access', type]
	// 		}
	// 	});
	// }

    this.feedback = function () {
	    let feedbackBtns = $('.fika-feedback-button'),
		    feedbackOldVal ,
		    clickCount = 0
	    feedbackBtns.click(function () {
		    let thisBtn = $(this),
			    attr = thisBtn.attr('data-match'),
			    msg = $('#fika-feedback-msg');
		    if (feedbackOldVal !== attr && clickCount <= 1){
			    feedbackBtns.removeClass('fika-feedback-button-active');
			    thisBtn.addClass('fika-feedback-button-active');
			    // self.module.content.sendFeedback(attr);
				chrome.extension.sendMessage({
					'method': 'sendGA',
					'data': {
						type: 'event',
						p: ['feedback', attr === '1'?'good':'bad', window.location.href]
					}
				});
			    if (attr === '1'){
				    msg.html('Thanks for the upvote! <a href="https://chrome.google.com/webstore/detail/fika-reader-mode/fbcdnjeoghampomjjaahjgjghdjdbbcj" target="_blank">Rate Fika</a>');
			    } else {
				    msg.html('Sorry to hear that! <a href="mailto:hi@fika.io?subject=Fika User Feedback" target="_blank">Help us improve</a>');
			    }
		    }
		    clickCount++;
		    feedbackOldVal = attr;
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
			  i.class = i.class.slice(0, -1) + (parseInt(i.class.slice(-1)) - d)
			}
		}
		// 如果没有抓到TOC 就不显示
		if (tocs.length > 1){
		    self.view.display('reader', 'toc', tocs, $('.fika-toc'));
	    }
    };


	this._init = async function(content, _store, _photoSrc) {
		//
		store = _store;
		photoSrc = _photoSrc
		self.view.display('reader', 'photos', {
			value: photoSrc,
			type:'photo'
		}, $('.fika-photo-grid[data-tab="photo"]'));
		self.view.display('reader', 'photos', {
			value: store['monoColors'],
			type:'color'
		}, $('.fika-photo-grid[data-tab="color"]'));
		// self.view.display('reader', 'loginToUnlock', {}, $('.fika-share-to-unlock'))
		self.retrieveToc();
		self._initTools();
		self.feedback();
		self.background();
		// self.login(store);
		// v0.8.0 不显示what's new
		// if (store.version !== Version.currentVersion) {
		// 	self.toast(`Check out <a href="http://fika.io/updatelog" target="_blank">what's new?</a>`, true)
		// }
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
			// console.log(mainLang)
            // 加入切换字体的按钮
            self.view.display('reader', 'fonts', mainLang['typeface']['fonts'], $('.fika-select-fonts'))

	          $(".fika-content").find('svg').each(function() {
                $(this).remove();
            });

			self.appearance(mainLang['typeface']);
        });
    };

    // auth
	this.login = function (_store) {
		store = _store;
		// self.view.display('reader', 'userProfile', store.user , $('.fika-menu-login'));
		this.loginClick();
		$('#fika-loading-login').hide();
		if (store.user ){
			$('#fika-user-expand').click(function () {
				$(this).toggleClass('fika-user-expand-on')
				$('#fika-logout').toggle();
			});
			$('#fika-logout').click(function () {
				self.logout()
			});
			$('#fika-beta-info').hide();
		} else {
			$('.fika-app').removeClass('fika-bg-on');
			$('.fika-share-fika').hide();
			$('.fika-pro-item').addClass('fika-disabled');
		}
		// if (store.user) {
			// 机制更新： 登录后就可以解锁更多功能
			$('.fika-disabled').removeClass('fika-disabled');
			$('input').prop('disabled', false);
			$('.fika-share-fika').css('display', 'flex');
			self.background();
			self.autopilot();
		// }
		// } else if (pendingToShare){
		// 	self.shareToUnlock(pendingToShare);
		// 	pendingToShare = null
		// }
	};

	this.loginFailed = function (errorType) {
		if (errorType === 1){
			self.toast(`⚠️ Google OAuth has been disabled for this account!`, null, 6000);
		} else {
			self.toast(`⚠️ Network error!`);
		}
		$('#fika-loading-login').hide();
	};

	this.logout = function () {
		// self.view.display('reader', 'userProfile', null , $('.fika-menu-login'));
		$('.fika-pro-item').addClass('fika-disabled');
		$('.fika-pro-item input').prop('disabled', true);
		$('#fika-autopilot-local').unbind('click');
		$('.fika-photo-grid-item').unbind('click');
		$('.fika-photo-grid-tab').unbind('click');
		$('.fika-app').removeClass('fika-bg-on');
		$('.fika-share-fika').hide();
		$('#fika-beta-info').show()
		this.loginClick();
		$('#fika-loading-login').hide();
		store.user = null;
		chrome.storage.sync.set({user: null})
	};
	this.loginClick = function () {
		$('.fika-login').click(function () {
			$('#fika-loading-login').show();
			chrome.extension.sendMessage({
				'method': 'oauth',
				'data':{}
			}, function () {});
		});
	};
});

