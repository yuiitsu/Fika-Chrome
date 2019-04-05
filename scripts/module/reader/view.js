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
                <div class="fika-select-item {{ 'font-' + data[i]['class'] }}" data-sel="{{ 'font-' + data[i]['class'] }}">{{ data[i]['name'] }}</div>
            {{ end }}
        `
    };
    
    // add photo selections
    this.photos = function () {
        return `
            {{ for var i in data }}
                <div class="fika-photo-grid-item" data-id="{{ data[i]['id'] }}">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <img src="{{ data[i]['small'] }}"/>
                </div>
            {{ end }}
        `
    }

});