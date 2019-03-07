/**
 * Created by Yuiitsu on 2018/10/23.
 */
App.module.extend('content', function() {
    //
    let self = this,
        tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'code'],
        topArticleElement = [],
        articleElementIndex = [],
        articleElements = {},
        articleElementRate = {};

    this.init = function() {
        //
        this.findArticle();
        console.log(articleElements);
        console.log(articleElementRate);

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

    this.readerMode = function() {
        let html = topArticleElement[0].innerHTML.replace(/class="(.+?)"/g, '');
        this.view.append('content', 'layout', {title: '', content: html}, $('body'));
        //
    };
});

