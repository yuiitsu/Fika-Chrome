/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('data', function() {

    let self = this;

    this.init = function(url) {
        let updateLogs = Version.updateLogs[Version.currentVersion];
        this.view.display('update', 'layout', updateLogs, $('#update-log'));
    };
});
