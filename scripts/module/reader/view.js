App.view.extend('reader', function() {

    this.container = function() {
        return `
            <h1 class="fika-title">
                {{ data['title'] }}
            </h1>
            <div class="fika-content">
                {{ data['content'] }}
            </div>
        `;
    };

    this.toc = function() {
        return `
            {{ for var i in data }}
            <a data-id="#{{ data[i]['id'] }}" class="{{ data[i]['class'] }}">{{ data[i]['text'] }}</a>
            {{ end }}
            <div class="fika-toc-overlay"></div>
        `;
    };

    // add font selections
    this.fonts = function () {
        return `
            {{ for var i in data }}
                <div class="fika-select-font {{ 'font-' + data[i]['class'] }}">{{ data[i]['name'] }}</div>
            {{ end }}
        `
    }
});
