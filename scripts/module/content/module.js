/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('content', function() {
    //
    let self = this,
        tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'code'],
        excludeTags = ['BUTTON', 'IFRAME', 'CANVAS', '#comment', 'SCRIPT'],
        topArticleElement = [],
        articleElementIndex = [],
        articleElements = {},
        articleElementRate = {},
        articleTitle = '';

    this.init = function() {
        //
        this.findArticle();
        console.log(articleElements);
        console.log(articleElementRate);

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
            console.log('character: ', topElement.innerText.length);
            if (topElement.innerText.length > 300) {
                let articleElementIndexLen = articleElementIndex.length;
                //
                for (let i = 0; i < articleElementIndexLen; i++) {
                    if (articleElements.hasOwnProperty(i) &&
                        articleElements[i].localName === topElement.localName &&
                        articleElements[i].className === topElement.className) {
                        topArticleElement.push(articleElements[i]);
                    }
                }
                console.log(topArticleElement);
                isAvailable = true;
            }
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
        if (tags.indexOf(element.localName) !== -1) {
            //
            this.rateToParent(element.localName, element.parentElement, 3);
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
            let nodeValue = attributes[i].nodeValue;
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
        if (nodeName === 'H1' && element.className.indexOf('title') !== -1) {
            articleTitle = element.innerText;
            return false;
        }



        if (nodeName === '#text') {
            articleHtml.push(element.nodeValue);
            return true;
        } else if (nodeName === 'CODE') {
            articleHtml.push('<code>'+ element.innerHTML +'</code>');
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
            if (chileNodesLen === 0 && element.innerText === '') {
                return false;
            }
            articleHtml.push('<' + nodeName + '>');
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
        let target = $('#fika-reader'),
            title = articleTitle ? articleTitle : $('title').text(),
            html = topArticleElement[0].innerHTML.replace(/class="(.+?)"/g, '').replace(/style="(.+?)"/g, '');

        let articleElementList = $(topArticleElement[0].innerHTML),
            articleElementListLen = articleElementList.length,
            articleHtml = [];

        for (let i = 0; i < articleElementListLen; i++) {
            this.filterElement(articleElementList[i], articleHtml);
        }
        console.log(articleElementList);
        console.log(articleHtml);
        // console.log(articleElement.html());
        if (target.length > 0) {
            this.closeReaderMode();
        } else {
            this.view.append('content', 'layout', {title: title, content: articleHtml.join('')}, $('body'));
            //
            this.extFilter();
            //
            this.module.reader._init(topArticleElement[0].innerText);
            //
            $('html, body').css('overflow-y', 'hidden');
            //
            chrome.extension.sendMessage({
                'method': 'is_open',
                'data': true
            }, function () {});
        }
    };

    this.extFilter = function() {
        //
        let parent = $('#fika-reader');
        parent.find('noscript').each(function() {
            $(this).parent().html($(this).html().replace(/class="(.+?)"/g, '').replace(/style="(.+?)"/g, ''));
        });
        //
        parent.find('img').each(function() {
            if (!$(this).attr('src')) {
                let attributes = $(this)[0].attributes,
                    attributesLen = attributes.length;

                console.log(attributes);
                for (let i = 0; i < attributesLen; i++) {
                    if (attributes[i].nodeName.indexOf('src') !== -1) {
                        $(this).attr('src', attributes[i].nodeValue);
                    }
                }
            }
        });
    };

    this.closeReaderMode = function() {
        let target = $('#fika-reader');
        $('html, body').css('overflow-y', 'auto');
        target.remove();
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
        let feedbackBtns = $('.fika-feedback-button'),
          attr = data.is_match,
          thisBtn = $(`.fika-feedback-button[data-match=${attr}]`),
          msg = $('#fika-feedback-msg');

        feedbackBtns.removeClass('fika-feedback-button-active')
        thisBtn.addClass('fika-feedback-button-active')
        if (attr === '1'){
            msg.html('Thanks for the upvote! <a href="https://chrome.google.com/webstore/detail/fika-reader-mode/fbcdnjeoghampomjjaahjgjghdjdbbcj" target="_blank">Rate Fika</a>')
        } else {
            msg.html('Sorry to hear that! <a href="mailto:hi@fika.io?subject=Fika User Feedback" target="_blank">Help use improve</a>')
        }

        console.log('fb', data)
    };
});

