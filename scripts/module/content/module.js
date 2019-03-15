/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('content', function() {
    //
    let self = this,
        tags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'PRE', 'CODE', 'FIGURE'],
        excludeTags = ['BUTTON', 'IFRAME', 'CANVAS', '#comment', 'SCRIPT'],
        topArticleElement = [],
        articleElementIndex = [],
        articleElements = {},
        articleElementRate = {},
        articleTitle = '',
        pageUrl = '';

    this.init = function() {
        //
        this.findArticle();
        // console.log(articleElements);
        // console.log(articleElementRate);

        // listen background script send message.
        chrome.extension.onMessage.addListener(function(request, _, response) {
            let method = request.method;
            if (self.hasOwnProperty(method)) {
                self[method](request.data);
            } else {
                self.log('method '+ method +' not exist.');
            }
            response('');
        });
    };

    this.findArticle = function() {
        //
        topArticleElement = [];
        articleElementIndex = [];
        articleElements = {};
        articleElementRate = {};
        articleTitle = '';
        pageUrl = location.href;
        //
        let root = $('body'),
            isAvailable = false;
        if (root.length === 0) {
            return false;
        }
        //
        this.findNextNode(root[0]);
        //
        if (articleElementIndex.length > 0) {
            let topElementRate = {key: '', rate: 0};
            for (let i in articleElementRate) {
                if (articleElementRate.hasOwnProperty(i)) {
                    if (articleElementRate[i] > topElementRate['rate']) {
                        topElementRate = {
                            key: i,
                            rate: articleElementRate[i]
                        }
                    }
                }
            }

            let topElement = articleElements[topElementRate['key']];
            if (topElement.innerText.length > 300) {
                let articleElementIndexLen = articleElementIndex.length;
                //
                for (let i = 0; i < articleElementIndexLen; i++) {
                    if (articleElements.hasOwnProperty(i)) {
                        if (articleElements[i].localName === topElement.localName) {
                            let articleElementClassName = articleElements[i].className;
                            if (articleElementClassName && topElement.className) {
                                if (topElement.className.indexOf(articleElementClassName) === 0 ||
                                    articleElementClassName.indexOf(topElement.className) === 0) {
                                    //
                                    if (topElement.firstElementChild.className !== articleElementClassName &&
                                        articleElements[i].firstElementChild.className !== topElement.className) {

                                        topArticleElement.push(articleElements[i]);
                                    }
                                }
                            } else if (topElement.className === articleElementClassName) {
                                topArticleElement.push(articleElements[i]);
                            }
                        }
                    }
                }
                isAvailable = true;
                console.log(topArticleElement);
            }
        }

        if (isAvailable) {
            this.readerMode();
        }
        //
        chrome.extension.sendMessage({
            'method': 'reader_ready',
            'data': {
                is_available: isAvailable
            }
        }, function () {});
    };

    this.findNextNode = function(element) {
        if (tags.indexOf(element.nodeName) !== -1) {
            //
            this.rateToParent(element.localName, element.parentElement, 2);
        } else {
            let childrenLen = element.children.length;
            if (childrenLen > 0) {
                for (let i = 0; i < childrenLen; i++) {
                    this.findNextNode(element.children[i]);
                }
            }
        }
    };

    this.rateToParent = function(localName, parent, level) {
        let key = this.findElementIndex(parent),
            levelRate = level;

        if (key === false) {
            articleElementIndex.push(parent);
            key = articleElementIndex.length - 1;
        }

        articleElements[key] = parent;
        if (!articleElementRate.hasOwnProperty(key)) {
            articleElementRate[key] = 0;
        }
        articleElementRate[key] += levelRate;

        let attributes = parent.attributes,
            attributesLen = attributes.length;
        for (let i = 0; i < attributesLen; i++) {
            let nodeValue = attributes[i].nodeValue.toLowerCase();
            if (nodeValue.indexOf('content') !== -1 || nodeValue.indexOf('article') !== -1) {
                articleElementRate[key] += 20;
            }
        }

        if (parent.localName === 'article') {
            articleElementRate[key] += 1.2;
        }

        if (level > 1) {
            this.rateToParent(localName, parent.parentElement, --level);
        }
    };

    this.findElementIndex = function(target) {
        let articleElementIndexLen = articleElementIndex.length;
        for (let i = 0; i < articleElementIndexLen; i++) {
            if (articleElementIndex[i].isEqualNode(target)) {
                return i;
            }
        }

        return false;
    };

    this.filterElement = function(element, articleHtml) {
        let nodeName = element.nodeName,
            chileNodesLen = element.childNodes.length;

        // filter
        if (nodeName === 'H1') {
            if ($('head title').text().indexOf(element.innerText) === 0 || element.className.indexOf('title') !== -1) {
                articleTitle = element.innerText;
                return false;
            }
        }

        if (nodeName === '#text') {
            let nodeValue = element.nodeValue.replace(/\n/g, '').replace(/\s/g, '');
            if (!nodeValue) {
                return false;
            }
            articleHtml.push(element.nodeValue);
            return true;
        } else if (nodeName === 'CODE') {
            articleHtml.push('<code>' + element.innerHTML + '</code>');
            return true
        } else if (nodeName === 'PRE') {
            articleHtml.push('<pre>' + element.innerHTML + '</pre>');
            return true
        } else if (excludeTags.indexOf(nodeName) !== -1) {
            return false;
        } else if (nodeName === 'IMG') {
            let attributes = element.attributes,
                attributesLen = attributes.length,
                src = element.src;

            for (let i = 0; i < attributesLen; i++) {
                if (attributes[i] === 'data-src') {
                    src = attributes[i].nodeValue;
                }
            }
            articleHtml.push(element.outerHTML.replace(/class="(.+?)"/g, '').replace(/style="(.+?)"/g, ''));
            return true;
        } else {
            if (nodeName === 'DIV' || nodeName === 'SECTION') {
                // if (element.nextElementSibling) {
                //     console.log(element.nextElementSibling.nodeName);
                // }
                // if (element.previousElementSibling) {
                //     console.log(element.previousElementSibling.nodeName);
                // }
                if (element.nextElementSibling && tags.indexOf(element.nextElementSibling.nodeName) !== -1 &&
                    element.previousElementSibling && tags.indexOf(element.previousElementSibling.nodeName) !== -1) {
                    //
                    let elementAttrs = element.attributes,
                        elementAttrLen = elementAttrs.length,
                        isImg = false;

                    for (let i = 0; i < elementAttrLen; i++) {
                        if (elementAttrs[i].nodeValue.indexOf('img') !== -1 || elementAttrs[i].nodeValue.indexOf('image') !== -1) {
                            isImg = true;
                        }
                    }
                    //
                    if (!isImg) {
                        return false;
                    }
                }
            }
            if (chileNodesLen === 0 && element.innerText === '') {
                return false;
            }
            if (nodeName === 'A') {
                articleHtml.push('<' + nodeName + ' href="'+ element.href +'" target="_blank">')
            } else {
                articleHtml.push('<' + nodeName + '>');
            }
            let articleHtmlLen = articleHtml.length;
            for (let i = 0; i < chileNodesLen; i++) {
                this.filterElement(element.childNodes[i], articleHtml);
            }
            if (articleHtml.length === articleHtmlLen) {
                articleHtml.pop();
            } else {
                articleHtml.push('</' + nodeName + '>');
            }
        }
    };

    this.readerMode = function() {
        //
        let articleHtml = [],
            topArticleElementLen = topArticleElement.length,
            text = [];

        for (let i = 0; i < topArticleElementLen; i++) {
            let articleElementList = topArticleElement[i].childNodes,
                articleElementListLen = articleElementList.length;

            for (let j = 0; j < articleElementListLen; j++) {
                this.filterElement(articleElementList[j], articleHtml);
            }
            text.push(topArticleElement[i].innerText);
        }
        //
        let title = articleTitle ? articleTitle : $('head title').text();

        // console.log(articleElement.html());
        $('#fika-reader').remove();
        this.view.append('content', 'layout', {title: title, content: articleHtml.join('')}, $('html'));
        //
        this.extFilter();
        //
        if (topArticleElementLen > 0) {
            this.module.reader._init(text.join(""));
        }
        //
        // $('html, body').css('overflow-y', 'hidden');
        //
        // chrome.extension.sendMessage({
        //     'method': 'is_open',
        //     'data': true
        // }, function () {});
    };

    this.extFilter = function() {
        //
        let parent = $('#fika-reader');
        // parent.find('noscript').each(function() {
        //     $(this).parent().html($(this).html().replace(/class="(.+?)"/g, '').replace(/style="(.+?)"/g, ''));
        // });
        //
        parent.find('img').each(function() {
            if (!$(this).attr('src')) {
                let attributes = $(this)[0].attributes,
                    attributesLen = attributes.length;

                for (let i = 0; i < attributesLen; i++) {
                    if (attributes[i].nodeName.indexOf('src') !== -1 ||
                        attributes[i].nodeName.indexOf('data-original-src') !== -1 ||
                        attributes[i].nodeName.indexOf('data-actualsrc') !== -1) {
                        $(this).attr('src', attributes[i].nodeValue);
                    }
                }
            }

            if ($(this).attr('crossorigin') && $(this).attr('crossorigin') === 'anonymous') {
                $(this).remove();
            }
        });
        //
        parent.find('figure noscript').each(function() {
            let html = $(this).html();
            if (html.indexOf('<img ') !== -1) {
                $(this).parent().html(html.replace(/class="(.+?)"/g, '').replace(/style="(.+?)"/g, ''));
            }
        });
    };

    // 绑定toc翻页
    this.tocScroll = function(){
        const fikaApp = document.getElementById('fika-reader')
        let tocList = []
        $('.fika-toc a').each(function () {
            let id = $(this).attr('data-id'),
                header = document.getElementById(id.slice(1)),
                offsetTop = header.getBoundingClientRect().y
            tocList.push({
                el: $(`a[data-id="${id}"]`),
                top: offsetTop
            })
            $(this).click(function () {
                fikaApp.scrollTop = offsetTop
            })
        })
        fikaApp.addEventListener('scroll', function (e) {
            let scrollTop = e.target.scrollTop
            tocList[0].el.addClass('fika-toc-active')
            for (let i of tocList){
                if (scrollTop + 48 >= i.top){
                    console.log(i)
                    $('.fika-toc a').removeClass('fika-toc-active')
                    i.el.addClass('fika-toc-active')
                }
            }
        })
    };

    this.openReaderMode = function() {
        if (location.href !== pageUrl) {
            this.findArticle();
        }

        let target = $('#fika-reader'),
            display = target.css('display'),
            overflow = 'hidden',
            isOpen = false;

        if (display === 'none') {
            target.show();
            isOpen = true;
        } else {
            target.hide();
            overflow = 'auto';
        }

        $('html, body').css('overflow-y', overflow);

        self.tocScroll()
        chrome.extension.sendMessage({
            'method': 'is_open',
            'data': isOpen
        }, function () {});
    };

    this.closeReaderMode = function() {
        let target = $('#fika-reader');
        $('html, body').css('overflow-y', 'auto');
        target.hide();
        //
        chrome.extension.sendMessage({
            'method': 'is_open',
            'data': false
        }, function () {});
    };

    this.sendFeedback = function(isMatch) {
        chrome.extension.sendMessage({
            'method': 'feedback',
            'data': {
                is_match: isMatch, // 是否匹配，1是，0否
            }
        }, function () {});
    };

    this.feedbackResponse = function(data) {
        let success = data.success;
    };
});

