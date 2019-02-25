/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('content', function() {
    //
    let self = this,
        adoptableArticle = null,
        article_data = {
            'title': '',
            'content': ''
        };
        // reader_page_src = chrome.runtime.getURL('reader.html');

    this.init = function() {
        // this.is_open(function() {
        //     // open, todo.
        //     $('p').each(function() {
        //         let innerHtml = $(this).html();
        //         if (innerHtml.indexOf('An increasing') !== -1) {
        //             $(this).html(innerHtml.replace(new RegExp('increasing', 'g'), '<span class="polio-">increasing</span>'));
        //         }
        //     });
        // });
        var ReaderArticleFinderJS = new ReaderArticleFinder(document);
        let is_available = this.reader_is_available(ReaderArticleFinderJS);
        if (is_available) {
            let article = $(adoptableArticle.outerHTML);
            article_data['title'] = ReaderArticleFinderJS.articleTitle();
            article_data['content'] = article[0].outerHTML;
        }

        // send message to background js.
        chrome.extension.sendMessage({
            'method': 'reader_ready',
            'data': {
                is_available: is_available,
                article_data: article_data
            }
        }, function () {});

        // listen background script send message.
        chrome.extension.onMessage.addListener(function(request, _, response) {
            let method = request.method;
            if (self.hasOwnProperty(method)) {
                self[method]();
            } else {
                self.log('method '+ method +' not exist.');
            }
            response('');
        });
    };

    this.reader_is_available = function(ReaderArticleFinderJS) {
        if(!ReaderArticleFinderJS.adoptableArticle()){
            ReaderArticleFinderJS.isReaderModeAvailable();
        }
        return !!(adoptableArticle = ReaderArticleFinderJS.adoptableArticle());
    };

    this.reader_mode = function() {
        let target = $('#fika-reader');
        if (target.length === 0) {
            this.view.append('content', 'reader_page', {
                src: chrome.runtime.getURL('reader.html'),
                name: window.location.href
            });
            $('html, body').css('overflow-y', 'hidden');
            //
            chrome.extension.sendMessage({
                'method': 'is_open',
                'data': true
            }, function () {});
        } else {
            // $('html, body').css('overflow-y', 'auto');
            // target.remove();
            // //
            // chrome.extension.sendMessage({
            //     'method': 'is_open',
            //     'data': false
            // }, function () {});
            this.close_reader_mode();
        }
    };

    this.close_reader_mode = function() {
        let target = $('#fika-reader');
        $('html, body').css('overflow-y', 'auto');
        target.remove();
        //
        chrome.extension.sendMessage({
            'method': 'is_open',
            'data': false
        }, function () {});
    };

    this.reader_article_find = function() {
        var ReaderArticleFinderJS = new ReaderArticleFinder(document);
        let is_available = this.reader_is_available(ReaderArticleFinderJS);
        if (is_available) {
            let article = $(adoptableArticle.outerHTML);
            article_data['title'] = ReaderArticleFinderJS.articleTitle();
            article_data['content'] = article[0].outerHTML;
        }

        let target = $('#fika-reader');
        if (target.length > 0) {
            $('html, body').css('overflow-y', 'auto');
            target.remove();
        } else {
            // send message to background js.
            chrome.extension.sendMessage({
                'method': 'reader_ready',
                'data': {
                    is_available: is_available,
                    article_data: article_data,
                    show_reader_page: true
                }
            }, function (is_open) {
            });
        }
    };

    this.reader_check_for_icon = function() {
        let ReaderArticleFinderJS = new ReaderArticleFinder(document);
        let is_available = this.reader_is_available(ReaderArticleFinderJS);
        if (is_available) {
            chrome.extension.sendMessage({
                'method': 'set_browser_icon',
                'data': {
                    is_available: is_available
                }
            }, function (is_open) {
            });
        }
    };

    this.is_open = function(callback) {
        // 检查是否开启
        chrome.extension.sendMessage({
            'method': 'is_open',
            'data': {
                url: location.href
            }
        }, function (is_open) {
            if (is_open) {
                callback();
            } else {
                self.log('Highlight off.');
            }
        });
    };
});

