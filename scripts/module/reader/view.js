App.view.extend('reader', function() {

    this.container = function() {
        return `
            <h1 class="f-title">
                {{ data['title'] }}
            </h1>
            <div class="f-subtitle" style="display: none;">
                By Nick Babich
            </div>
            <div class="f-content">
                {{ data['content'] }}
            </div>
        `;
    };

    this.toc = function() {
        return `
            {{ for var i in data }}
            <a href="#{{ data[i]['id'] }}"><{{ data[i]['tag'] }}>{{ data[i]['text'] }}</{{ data[i]['tag'] }}></a>
            {{ end }}
        `;
    };

    // if TOC is empty, display this message instead - nil
    this.tocEmpty = function() {
        return `
            <div class="f-toc-empty">
              TOC is not available for this article!
            </div>
        `
    };

    // add font selections
    this.fonts = function () {
        return `
            {{ for var i in data }}
                <div class="f-select-font {{ 'font-' + data[i]['class'] }}">{{ data[i]['name'] }}</div>
            {{ end }}
        `
    }
});
