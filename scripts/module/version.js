/**
 * 版本更新记录
 * Created by Yuiitsu on 2018/05/22.
 */
const Version = {

    current_version: 'v0.2.0',

    /**
     * 更新记录
     */
    update_logs: {
        'v0.2.0': [],
        'v0.1.0': [
        ]
    },

    /**
     * 检查版本，如果缓存中的版本与当前版本不匹配，显示当前版本对应的更新记录
     */
    check: function() {
        let version = localStorage.getItem('version');
        if (version !== this.current_version) {
            // 将新版本号写入缓存
            localStorage.setItem('version', this.current_version);
            // 显示更新记录
            // App.module.common.module('Update logs', App.view.get_view('setting', 'version_update_logs', {
            //     list:this.update_logs[this.current_version],
            //     current_version: this.current_version
            // }), '<button class="btn btn-primary module-close js-handler">Close</button>');
        }
    }
};

$(function() {
    Version.check();
});
