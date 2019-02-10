/**
 * SpinXS Content Event
 * Created by Yuiitsu on 2018/10/24.
 */
App.event.extend('content', function() {

    let self = this;

    this.event = {
        selection: function() {
            // $('body').off('mouseup').on('mouseup', function(e) {
            //     let selector = window.getSelection();
            //     let selectContent = selector.toString();
            //     if (selectContent) {
            //         self.module.content.is_open(function() {
            //             // console.log(selector);
            //             // 检查父对象是否是polio对象
            //             let parent = selector.anchorNode.parentNode;
            //             if (parent.nodeName === 'SPAN' && parent.className === 'polio-') {
            //                 self.log('High lighted.');
            //                 return false;
            //             }
            //             //
            //             let range = selector.getRangeAt(0);
            //             let span = document.createElement("span");
            //             span.className = "polio-";
            //             span.appendChild(document.createTextNode(selectContent));
            //             range.insertNode(span);

            //             range.setStartAfter(span);
            //             range.deleteContents();
            //             // selector.removeAllRanges();
            //             // selector.addRange(range);
            //         });
            //     }
            // });
        }
    }
});
