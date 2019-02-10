/**
 * 通用事件监听
 * Created by Yuiitsu on 2018/11/02.
 */
App.event.extend('common', function() {

    let self = this;
    /**
     * 事件
     */
    this.event = {
        /**
         * 侧边栏菜单
         */
        side_menu: function() {
            $('#menus > li').on('click', function() {
                //
                let action = $(this).attr('data-action');
                // set focus
                $('#menus > li').removeClass('focus');
                $(this).addClass('focus');
                // call module
                self.module.call(action, 'main');
            })
        }
    };
});
