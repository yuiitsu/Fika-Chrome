/**
 * 版本更新记录
 * Created by Yuiitsu on 2018/05/22.
 */
const Version = {

    currentVersion: 'v0.5.0',

    /**
     * 更新记录
     */
    updateLogs: {
        'v0.5.0': [
            'Highlight code syntax',
            'More legible text colors in Vanilla & Licorice theme'
        ],
        'v0.4.0': [
            'Fix a bug that the HTML is being rendered in Code elements',
            'Articles opened in Fika can share to twitter and facebook',
            'TOC item will be highlighted while scrolling',
            'Fika toggle is available in Chrome default right click menu',
        ],
        'v0.3.0': [
            'Advanced compatibility',
            'Refined article styling',
            'Trimmed and lighter table of content',
            'New Layout',
            'Feedback collection',
            'Fullscreen mode'
        ],
        'v0.2.0': [
            'More font selections',
            'New badge status',
            'Shortcut: Alt+R (Option+R): to open Fika, Esc: to close'
        ],
        'v0.1.0': [
            'Initial release',
            'Four delightful themes, several font and three text size options',
            'Auto-generated table of content'
        ]
    },

    notify: function(){
        chrome.notifications.create(null, {
            iconUrl: 'images/logo64.png',
            type: 'basic',
            title: 'Fika Updated',
            message: this.updateLogs[this.currentVersion].join('\n'),
            buttons: [
                {
                    title: 'View detail'
                }
            ]
        }, function() {
        });
        //binding notification clicks
        chrome.notifications.onClicked.addListener(function() {
            chrome.tabs.create({url: chrome.extension.getURL("update.html")});
        });
        chrome.notifications.onButtonClicked.addListener(function() {
            chrome.tabs.create({url: chrome.extension.getURL("update.html")});
        });
    },

    notice: function() {
        let version = localStorage.getItem('version');
        let self = this
        if (version !== this.currentVersion) {
            // 将新版本号写入缓存
            localStorage.setItem('version', this.currentVersion);

            chrome.permissions.contains({
                permissions: ["notifications"],
                origins: ["http://*/*", "https://*/*"]
            }, function(result){
                console.log('permission', result)
                if (result){
                    self.notify()
                } else {
                    chrome.permissions.request({
                        permissions:[ "notifications"],
                        origins:["http://*/*", "https://*/*"]
                    }, function(granted){
                        console.log('granted', granted)
                        if (granted) {
                            self.notify()
                        }
                    })
                }
            })
        }
    }
};

// $(function() {
//     Version.check();
// });
