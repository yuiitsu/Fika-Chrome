"use strict";
App.module.extend("content", function () {
    var r = this, u = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "PRE", "CODE", "FIGURE"],
        m = ["BUTTON", "IFRAME", "CANVAS", "#comment", "SCRIPT"], l = [], d = [], h = {}, c = {}, g = "", f = "";
    this.init = function () {
        this.findArticle(), console.log(h), console.log(c), chrome.extension.onMessage.addListener(function (e, t, n) {
            var i = e.method;
            r.hasOwnProperty(i) ? r[i](e.data) : r.log("method " + i + " not exist."), n("")
        })
    }, this.findArticle = function () {
        l = [], d = [], h = {}, c = {}, g = "", f = location.href;
        var e = $("body"), t = !1;
        if (0 === e.length) return !1;
        if (this.findNextNode(e[0]), 0 < d.length) {
            var n = {key: "", rate: 0};
            for (var i in c) c.hasOwnProperty(i) && c[i] > n.rate && (n = {key: i, rate: c[i]});
            var r = h[n.key];
            if (300 < r.innerText.length) {
                for (var a = d.length, o = 0; o < a; o++) if (h.hasOwnProperty(o) && h[o].localName === r.localName) {
                    var s = h[o].className;
                    s ? 0 !== r.className.indexOf(s) && 0 !== s.indexOf(r.className) || r.firstElementChild.className !== s && h[o].firstElementChild.className !== r.className && l.push(h[o]) : r.className === s && l.push(h[o])
                }
                console.log(l), t = !0
            }
        }
        t && this.readerMode(), chrome.extension.sendMessage({
            method: "reader_ready",
            data: {is_available: t}
        }, function () {
        })
    }, this.findNextNode = function (e) {
        if (-1 !== u.indexOf(e.nodeName)) this.rateToParent(e.localName, e.parentElement, 2); else {
            var t = e.children.length;
            if (0 < t) for (var n = 0; n < t; n++) this.findNextNode(e.children[n])
        }
    }, this.rateToParent = function (e, t, n) {
        var i = this.findElementIndex(t), r = n;
        !1 === i && (d.push(t), i = d.length - 1), h[i] = t, c.hasOwnProperty(i) || (c[i] = 0), c[i] += r;
        for (var a = t.attributes, o = a.length, s = 0; s < o; s++) {
            var l = a[s].nodeValue.toLowerCase();
            -1 === l.indexOf("content") && -1 === l.indexOf("article") || (c[i] += 20)
        }
        "article" === t.localName && (c[i] += 1.2), 1 < n && this.rateToParent(e, t.parentElement, --n)
    }, this.findElementIndex = function (e) {
        for (var t = d.length, n = 0; n < t; n++) if (d[n].isEqualNode(e)) return n;
        return !1
    }, this.filterElement = function (e, t) {
        var n = e.nodeName, i = e.childNodes.length;
        if ("H1" === n && (0 === $("head title").text().indexOf(e.innerText) || -1 !== e.className.indexOf("title"))) return g = e.innerText, !1;
        if ("#text" === n) return !!e.nodeValue.replace(/\n/g, "").replace(/\s/g, "") && (t.push(e.nodeValue), !0);
        if ("CODE" === n) return t.push("<code>" + e.innerHTML + "</code>"), !0;
        if (-1 !== m.indexOf(n)) return !1;
        if ("IMG" === n) {
            for (var r = e.attributes, a = r.length, o = (e.src, 0); o < a; o++) "data-src" === r[o] && r[o].nodeValue;
            return t.push(e.outerHTML.replace(/class="(.+?)"/g, "").replace(/style="(.+?)"/g, "")), !0
        }
        if (("DIV" === n || "SECTION" === n) && e.nextElementSibling && -1 !== u.indexOf(e.nextElementSibling.nodeName) && e.previousElementSibling && -1 !== u.indexOf(e.previousElementSibling.nodeName)) {
            for (var s = e.attributes, l = s.length, d = !1, h = 0; h < l; h++) -1 === s[h].nodeValue.indexOf("img") && -1 === s[h].nodeValue.indexOf("image") || (d = !0);
            if (!d) return !1
        }
        if (0 === i && "" === e.innerText) return !1;
        t.push("<" + n + ">");
        for (var c = t.length, f = 0; f < i; f++) this.filterElement(e.childNodes[f], t);
        t.length === c ? t.pop() : t.push("</" + n + ">")
    }, this.readerMode = function () {
        for (var e = [], t = l.length, n = [], i = 0; i < t; i++) {
            for (var r = l[i].childNodes, a = r.length, o = 0; o < a; o++) this.filterElement(r[o], e);
            n.push(l[i].innerText)
        }
        var s = g || $("head title").text();
        $("#fika-reader").remove(), this.view.append("content", "layout", {
            title: s,
            content: e.join("")
        }, $("html")), this.extFilter(), 0 < t && this.module.reader._init(n.join(""))
    }, this.extFilter = function () {
        var e = $("#fika-reader");
        e.find("img").each(function () {
            if (!$(this).attr("src")) {
                var e = $(this)[0].attributes, t = e.length;
                console.log(e);
                for (var n = 0; n < t; n++) -1 === e[n].nodeName.indexOf("src") && -1 === e[n].nodeName.indexOf("data-original-src") && -1 === e[n].nodeName.indexOf("data-actualsrc") || $(this).attr("src", e[n].nodeValue)
            }
            $(this).attr("crossorigin") && "anonymous" === $(this).attr("crossorigin") && $(this).remove()
        }), e.find("figure noscript").each(function () {
            var e = $(this).html();
            -1 !== e.indexOf("<img ") && $(this).parent().html(e.replace(/class="(.+?)"/g, "").replace(/style="(.+?)"/g, ""))
        })
    }, this.openReaderMode = function () {
        location.href !== f && this.findArticle();
        var e = $("#fika-reader"), t = "hidden", n = !1;
        "none" === e.css("display") ? (e.show(), n = !0) : (e.hide(), t = "auto"), $("html, body").css("overflow-y", t), chrome.extension.sendMessage({
            method: "is_open",
            data: n
        }, function () {
        })
    }, this.closeReaderMode = function () {
        var e = $("#fika-reader");
        $("html, body").css("overflow-y", "auto"), e.hide(), chrome.extension.sendMessage({
            method: "is_open",
            data: !1
        }, function () {
        })
    }, this.sendFeedback = function (e) {
        chrome.extension.sendMessage({method: "feedback", data: {is_match: e}}, function () {
        })
    }, this.feedbackResponse = function (e) {
        e.success;
        console.log("fb", e)
    }
});