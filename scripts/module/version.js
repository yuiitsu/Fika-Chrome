/**
 * 版本更新记录
 * Created by Yuiitsu on 2018/05/22.
 */
const Version = {

    currentVersion: 'v0.3.0',

    /**
     * 更新记录
     */
    updateLogs: {
        'v0.3.0': [
            '1.升级内容获取方法，提高了识别率',
            '2.更新了UI'
        ],
        'v0.2.0': [],
        'v0.1.0': []
    },

    notice: function() {
        let version = localStorage.getItem('version');
        if (version !== this.currentVersion) {
            // 将新版本号写入缓存
            localStorage.setItem('version', this.currentVersion);
            chrome.notifications.create(null, {
                iconUrl: 'images/logo64.png',
                type: 'basic',
                title: 'Fika更新啦',
                message: this.updateLogs[this.currentVersion].join('\n'),
                buttons: [
                    {
                        title: 'View detail'
                    }
                ]
            }, function() {
            });

            //
            chrome.notifications.onClicked.addListener(function() {
                chrome.tabs.create({url: chrome.extension.getURL("update.html")});
            });
            //
            chrome.notifications.onButtonClicked.addListener(function() {

                chrome.tabs.create({url: chrome.extension.getURL("update.html")});
            });
        }
    }
};

// $(function() {
//     Version.check();
// });
