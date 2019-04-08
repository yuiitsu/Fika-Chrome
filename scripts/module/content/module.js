/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('content', function() {
    //
    let self = this,
        tags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'PRE', 'CODE', 'FIGURE'],
        excludeTags = ['BUTTON', 'IFRAME', 'CANVAS', '#comment', 'SCRIPT', 'INPUT', 'ASIDE', 'FOOTER', 'PERSONALIZATION-PLACEMENT'],
        excludeAttrName = ['share', 'twitter', 'linkedin', 'pinterest', 'singleadthumbcontainer', 'author', 'reward', 'reviewer'],
        titleTags = ['H1', 'H2', 'H3'],
        topArticleElement = [],
        articleElementIndex = [],
        articleElements = {},
        articleElementRate = {},
        articleTitle = '',
        pageUrl = '',
        dom = '',
        topElement = '',
        topPoint = 0;

    this.init = function() {
        //
        // this.findArticle();
        this.findArticlePro();
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

    this.findArticlePro = function() {
        let root = $('body'),
            isAvailable = false;

        pageUrl = location.href;
        topElement = '';
        topPoint = 0;

        if (root.length === 0) {
            return false;
        }

        this.findNextNodePro(root[0]);
        //
        console.log(topPoint);
        console.log(topElement);
        if (topElement && topElement.innerText.length > 300) {
            isAvailable = true;
        }
        // if (isAvailable) {
        //   this.readerMode();
        // }
        //
        chrome.extension.sendMessage({
            'method': 'reader_ready',
            'data': {
                is_available: isAvailable
            }
        }, function () {});
    };

    this.findNextNodePro = function(element) {
        let nodeName = element.nodeName,
            parent = element.parentElement;
        if (nodeName === '#text') {
            let nodeValue = element.nodeValue.replace(/\n|\s|\r/g, '');
            if (nodeValue) {
                let fp = 1;
                if (tags.indexOf(parent.nodeName) !== -1) {
                    fp = 5;
                } else if (parent.nodeName === 'DIV') {
                    fp = 2;
                }
                if (!element.parentElement.hasOwnProperty('fp')) {
                    element.parentElement['fp'] = fp;
                } else {
                    element.parentElement['fp'] += fp;
                }
                element.parentElement['fl'] = 2;
            }
        }
        //
        if (nodeName === 'ARTICLE') {
            element['fp'] = 1000;
            topPoint = element['fp'];
            topElement = element;
            return true;
        } else {
            //
            if (excludeTags.indexOf(nodeName) !== -1) {
                return false;
            }
            //
            let childNodesLen = element.childNodes.length;
            if (childNodesLen > 0) {
                for (let i = 0; i < childNodesLen; i++) {
                    if (element.childNodes[i]) {
                        if(this.findNextNodePro(element.childNodes[i])) {
                            return true;
                        }
                    }
                }
            }
            //
            let fl = element['fl'];
            if (fl > 0 && fl <= 2) {
                element.parentElement['fl'] = (element.parentElement.childNodes.length === 1 || tags.indexOf(nodeName) !== -1) && element.parentElement['fl'] > 0 ? 1 : fl - 1;
            }
            //
            if (element['fp'] && element['fp'] > 0) {
                let point = element.parentElement.childNodes.length === 1 ? element['fp'] : (fl > 0 ? element['fp'] : 1);
                if (tags.indexOf(element.nodeName) !== -1) {
                    element['fp'] += 10;
                    point += 10;
                } else if (element.nodeName === 'DIV') {
                    element['fp'] += 5;
                } else if (element.nodeName === 'LI') {
                    point -= 10;
                }

                this.pointToParentElement(element.parentElement, point);
                if (element['fp'] > topPoint) {
                    topPoint = element['fp'];
                    topElement = element;
                }
            }
        }
    };

    this.pointToParentElement = function(parent, point) {
        if (!parent.hasOwnProperty('fp')) {
            parent['fp'] = point;
        } else {
            parent['fp'] += point;
        }
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
        if (titleTags.indexOf(nodeName) !== -1 && !articleTitle) {
            if (element.innerText && element.innerText.length > 0) {
                let pageTitleTarget = $('head title');
                if ((pageTitleTarget.length > 0 &&
                    pageTitleTarget.text().toLocaleLowerCase().indexOf(element.innerText.toLocaleLowerCase()) !== -1) ||
                    (element.className && element.className.toLocaleLowerCase().indexOf('title') !== -1)) {
                    articleTitle = element.innerText;
                    return false;
                }
            }
        }

        if (nodeName === '#text') {
            let nodeValue = element.nodeValue.replace(/\n|\s/g, '');
            if (!nodeValue) {
                return false;
            }
            articleHtml.push(element.nodeValue);
            return true;
        } else if (nodeName === 'CODE') {
            articleHtml.push('<code>' + element.innerHTML + '</code>');
            return true;
        } else if (nodeName === 'PRE') {
            function extract(result, el){
                let c = el.childNodes;
                for (let i of c){
                    if (i.nodeType === 3) result += i.nodeValue.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    if (i.nodeType === 1) {
                        if (i.nodeName === 'BR'){
                            result += '\n'
                        } else {
                            result = extract(result, i)
                        }
                    }
                }
                return result
            }
            articleHtml.push('<pre><code>' + extract('', element) + '</code></pre>');
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
            for (var i in excludeAttrName) {
                try {
                    if (element.className && element.className.toLocaleLowerCase().indexOf(excludeAttrName[i]) !== -1) {
                        return false;
                    }
                } catch (e) {
                }
            }
            //
            try {
                if (element.className.toLocaleLowerCase().indexOf('post') !== -1
                    && element.className.toLocaleLowerCase().indexOf('meta') !== -1) {
                    return false;
                }
                if (element.className.toLocaleLowerCase().indexOf('post') !== -1
                    && element.className.toLocaleLowerCase().indexOf('footer') !== -1) {
                    return false;
                }
                if (nodeName === 'BR') {
                    return 'p';
                }
                if (chileNodesLen === 0 && element.innerText === '') {
                    return false;
                }
            } catch (e) {
            }

            if (nodeName === 'A') {
                articleHtml.push('<' + nodeName + ' href="'+ element.href +'" target="_blank">')
            } else {
                articleHtml.push('<' + nodeName + '>');
            }
            let articleHtmlLen = articleHtml.length;
            for (let i = 0; i < chileNodesLen; i++) {
                let r = this.filterElement(element.childNodes[i], articleHtml);
                if (r === 'p') {
                    let preElement = articleHtml.pop();
                    articleHtml.push('<p>' + preElement + '</p>');
                }
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

        //for (let i = 0; i < topArticleElementLen; i++) {
        //    let articleElementList = topArticleElement[i].childNodes,
        //        articleElementListLen = articleElementList.length;

        //    for (let j = 0; j < articleElementListLen; j++) {
        //        this.filterElement(articleElementList[j], articleHtml);
        //    }
        //    text.push(topArticleElement[i].innerText);
        //}

        text = topElement.innerText;
        this.filterElement(topElement, articleHtml);
        //
        let title = articleTitle ? articleTitle : $('head title').text();

        // get favicon
        let favicon = '',
            headLinks = document.getElementsByTagName('link')
        for (let i of headLinks){
            if (i.getAttribute('rel') === 'icon' || i.getAttribute('rel') === 'shortcut icon' ){
                favicon = i.getAttribute('href')
            }
        }

        // console.log(articleElement.html());
        $('#fika-reader').remove();
        this.view.append('content', 'layout', {
            title: title,
            content: articleHtml.join(''),
            domain: window.location.hostname,
            favicon: favicon
        }, $('html'));
        //
        this.extFilter();
        //
        // if (topArticleElementLen > 0) {
            //this.module.reader._init(text.join(""));
        // }
        this.module.reader._init(text);
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
            //
            let img = new Image();
            img.src = $(this).attr('src');
            if (img.width > 200) {
                $(this).attr('style', 'display:block;');
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
        const fikaApp = document.getElementById('fika-reader');
        let tocList = [];
        $('.fika-toc a').each(function () {
            let id = $(this).attr('data-id'),
                header = document.getElementById(id.slice(1)),
                offsetTop = header.getBoundingClientRect().y;
            tocList.push({
                el: $(`a[data-id="${id}"]`),
                top: offsetTop
            });
            $(this).click(function () {
                fikaApp.scrollTop = offsetTop
            })
        });
        fikaApp.addEventListener('scroll', function (e) {
            let scrollTop = e.target.scrollTop;
            if (tocList.length > 0){
                tocList[0].el.addClass('fika-toc-active');
                for (let i of tocList){
                    if (scrollTop + 48 >= i.top){
                        $('.fika-toc a').removeClass('fika-toc-active');
                        i.el.addClass('fika-toc-active')
                    }
                }
            }
        })
    };
    
    this.highlightCode = function () {
        let fikaApp = document.getElementById('fika-reader');
        fikaApp.querySelectorAll('pre code').forEach((block) => {
            try {
                hljs.highlightBlock(block);
            } catch (err) {
                console.log(err)
            }
        })
    };

    this.openReaderMode = function() {
        if (location.href !== pageUrl) {
            this.findArticlePro();
        }

        let target = $('#fika-reader'),
            isOpen = false;
        if (target.length === 0) {
            this.findArticlePro();
            this.readerMode();
            target = $('#fika-reader');
            isOpen = true;
        }
        let display = target.css('display'),
            overflow = 'hidden';

        if (display === 'none') {
            target.show();
            isOpen = true;
            $('html').addClass('fika-html-bg')
            $('body').hide();
        } else {
            target.hide();
            overflow = 'auto';
            $('html').removeClass('fika-html-bg')
            $('body').show();
        }

        $('html, body').css('overflow-y', overflow);

        self.tocScroll();
        self.highlightCode();
        chrome.extension.sendMessage({
            'method': 'is_open',
            'data': isOpen
        }, function () {});
    };

    this.closeReaderMode = function() {
        let target = $('#fika-reader');
        $('html, body').css('overflow-y', 'auto');
        $('body').show();
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

    this.loginUser = function(data){
        console.log(data)
    };
});

