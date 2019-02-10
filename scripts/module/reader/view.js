App.view.extend('reader', function() {

    this.container = function() {
        return `
            <div class="f-article f-size-medium f-font-geogia">
                <h1 class="f-title">
                    {{ data['title'] }}
                </h1>
                <div class="f-subtitle" style="display: none;">
                    By Nick Babich
                </div>
                <div class="f-content">
                    {{ data['content'] }}
                </div>
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
});
