/* Ripple */
function ripple(els){
    if (els){
        Array.from(els).forEach(el=>{
            el.addEventListener('click', (e)=>{
                const rect = el.getBoundingClientRect()
                el.classList.add('f-ripple-container')
                // create ripple element
                let ripple = document.createElement('span')
                ripple.className = 'f-ripple'
                ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px';
                el.appendChild(ripple)
                // set ripple position
                let top = e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop;
                let left = e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft
                ripple.style.top = top+'px'
                ripple.style.left = left+'px'
                ripple.classList.add('active')
                setTimeout(()=>{
                    ripple.remove()
                },1000)
            }, false)
        })
    }
}

ripple(document.querySelectorAll('.f-btn'))
ripple(document.querySelectorAll('.f-drawer-tile'))


/* Drawer */
let drawer = {
    open: false,
    modal: false,
    close: document.querySelector('.f-drawer-close'),
    btn: document.querySelector('#toc-btn'),
    el: document.querySelector('.f-drawer'),
    app: document.querySelector('.f-app'),
    overlay: document.querySelector('.f-overlay'),
    w: null,
    threshold: 1552,
    available:false
}

// click events
drawer.btn.addEventListener('click', ()=>{
    toggleDrawer(!drawer.open)
}, false)
drawer.close.addEventListener('click', ()=>{
    toggleDrawer(false)
}, false)
drawer.overlay.addEventListener('click', ()=>{
    toggleDrawer(false)
    toggleAppearanceMenu(false)
    drawer.overlay.classList.remove('f-overlay-active')
}, false)

function toggleDrawer(open){
    if (open && drawer.available){
        // drawer.app.classList.add('f-app-drawer-on')
        drawer.el.classList.add('f-drawer-on')
        drawer.overlay.classList.add('f-overlay-active')
    } else {
        // drawer.app.classList.remove('f-app-drawer-on')
        drawer.el.classList.remove('f-drawer-on')
        drawer.overlay.classList.remove('f-overlay-active')
    }
    drawer.open = open
}

function initDrawerState(){
    drawer.w = window.innerWidth
    drawer.available = drawer.w < 1400
    $('#toc-btn').toggleClass('disabled', !drawer.available)
    console.log(drawer.available )
}

initDrawerState()
window.addEventListener('resize', ()=>{
    // current window width
    const w = window.innerWidth
    drawer.available = w < 1400
    $('#toc-btn').toggleClass('disabled', !drawer.available)
    if (drawer.open && !drawer.available){
        toggleDrawer(false)
    }
        // if (w < drawer.threshold && w < drawer.w){
        //     drawer.overlay.classList.add('f-overlay-active')
        // } else if (w >= drawer.threshold){
        //     drawer.overlay.classList.remove('f-overlay-active')
        // }
    drawer.w = w
    console.log(drawer.available )
})



/* Appearance */
function toggleAppearanceMenu(toggle){
    const menu = $('.f-menu')
    if (toggle !== undefined && !toggle){
        menu.addClass('f-menu-on')
    }
    menu.toggleClass('f-menu-on')
}
$('#appearance').click(toggleAppearanceMenu)

function appearance(language) { // language 当前语言，用于字体设置
    const settings = {
        fontSize: {
            activeVal: localStorage.getItem('fontSize') || 'medium',
            cont: document.querySelector('.f-article'),
            selects: document.querySelectorAll('.f-select-size'),
            classPrefix: 'size-'
        },
        theme: {
            activeVal: localStorage.getItem('theme') || 'vanilla',
            cont: document.querySelector('.f-app'),
            selects: document.querySelectorAll('.f-select-theme'),
            classPrefix: 'theme-'
        },
        font: {
            activeVal: (function (){
                const fontSettings = localStorage.getItem('font')
                console.log(fontSettings && fontSettings[0] === '{')
                const defaultFont = language.typeface.fonts[language.typeface.default]['class']
                if (fontSettings && fontSettings[0] === '{'){
                    let fontOfLang = JSON.parse(localStorage.getItem('font'))[language.typeface.script]
                    return fontOfLang ? fontOfLang : defaultFont
                } else {
                    return defaultFont
                }
            })(),
            cont: document.querySelector('.f-article'),
            selects: document.querySelectorAll('.f-select-font'),
            classPrefix: 'font-'
        }
    }


    function setAppearance(prop, val) {

        // change class name (theme) for app
        let oldVal, cont = settings[prop].cont
        cont.classList.forEach(c => {
            if (c.startsWith(settings[prop].classPrefix)) {
                oldVal = c
            }
        })
        cont.classList.replace(oldVal, `${settings[prop].classPrefix}${val}`)
        // change state and storage
        settings[prop].activeVal = val
        if (prop === 'font'){
            let fontSettings = localStorage.getItem('font')
            const script = language.typeface.script
            if (fontSettings && fontSettings[0] === '{'){
                fontSettings = JSON.parse(fontSettings)
                fontSettings[script] = val
                localStorage.setItem('font', JSON.stringify(fontSettings))
            } else {
                let store = {}
                store[script] = val
                localStorage.setItem('font', JSON.stringify(store))
            }
        } else {
            localStorage.setItem(prop, val)
        }
        // change class name for ctrl btns
        for (let el of settings[prop].selects) {
            el.classList.remove('active')
            if (el.classList.contains(`${settings[prop].classPrefix}${val}`)) {
                el.classList.add('active')
            }
        }
    }

    // set theme from localStorage
    setAppearance('theme', settings['theme'].activeVal)
    setAppearance('fontSize', settings['fontSize'].activeVal)
    setAppearance('font', settings['font'].activeVal)

    Array.from(settings['theme'].selects).forEach(el => {
        el.addEventListener('click', () => {
            setAppearance('theme', el.classList.item(1).split('-')[1])
        })
    })
    Array.from(settings['fontSize'].selects).forEach(el => {
        el.addEventListener('click', () => {
            setAppearance('fontSize', el.classList.item(1).split('-')[1])
        })
    })
    Array.from(settings['font'].selects).forEach(el => {
        el.addEventListener('click', () => {
            setAppearance('font', el.classList.item(1).split('-')[1])
        })
    })

}
// appearance()

// drawer tabs
// const tabsButtons = document.querySelectorAll('.f-btn.tab')
// const  tabsWrap = document.querySelector('.f-drawer-content-wrap')
// for (let i=0; i <2; i++){
//     tabsButtons[i].addEventListener('click', ()=>{
//         tabsWrap.style.transform = `translateX(${i*-359}px)`
//         for (let el of tabsButtons) {
//             el.classList.remove('active')
//         }
//         tabsButtons[i].classList.add('active')
//     })
// }


//tools
$('#print').click(function(){
    window.print()
})

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
})
$('#tool-btn').click(function () {
    $('.f-tool').toggleClass('f-tool-on')
    $('.f-menu').removeClass('f-menu-on')
})
let hoverTimer;
$('.f-tool').mouseleave(function () {
    hoverTimer = setTimeout(()=>{
        $(this).removeClass('f-tool-on')
        $('.f-menu').removeClass('f-menu-on')
    }, 1200)
})
$('.f-tool').mouseenter(function () {
    clearTimeout(hoverTimer)
})