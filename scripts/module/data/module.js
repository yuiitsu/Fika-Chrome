/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('data', function() {

    let self = this;

    this.switch_key = 'switch';

    this.highlight_swtich = function(url) {
        let data = this.get_data(this.switch_key),
            url_hash = this.module.common.md5(url), flag = 0;

        if (!data.hasOwnProperty(url_hash)) {
            flag = 1;
        } else {
            flag = data[url_hash] ? 0 : 1;
        }
        data[url_hash] = flag;
        //
        localStorage.setItem(this.switch_key, JSON.stringify(data));
        return flag;
    };

    this.is_open = function(url) {
        let data = this.get_data(this.switch_key),
            url_hash = this.module.common.md5(url);

        if (!data.hasOwnProperty(url_hash)) {
            return false;
        }

        return data[url_hash];
    };


    this.get_data = function(key, is_list) {
        let result = is_list ? [] : {},
            data =  localStorage.getItem(key);

        if (!data) {
            return result;
        }

        try {
            result = JSON.parse(data);
        } catch (e) {
            self.log(e);
        }

        return result;
    }
});
