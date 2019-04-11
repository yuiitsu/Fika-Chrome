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
            <div class="fika-photo-grid-item fika-photo-grid-default" data-type="default">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <div class="fill">Default</div>
            </div>
            {{ for var i in data['value'] }}
            <div class="fika-photo-grid-item" data-type="{{ data['type'] }}" data-index="{{ i }}">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                {{ if data['type'] === 'photo' }}
                <img class="fill" src="{{ data['value'][i]['small'] }}"/>
                {{ else }}
                <div class="fill" style="background-color:{{ data['value'][i]['color'] }}"></div>
                {{ end }}
            </div>
            {{ end }}
        `
    }

    // auto pilot
    this.autopilot = function () {
        return `
            {{ for var i in data }}
                <div class="fika-select-item fika-autopilot-whitelist-item" data-domain="{{ data[i] }}">
					<span>{{ data[i] }}</span>
					<div class="fika-autopilot-delete">
						<svg class="fika-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</div>
				</div>
            {{ end }}
        `
    }

    // login user
    this.userProfile = function () {
        return `
            {{ if Boolean(data) === true }}
                <div class="fika-user">
                    <img class="fika-user-avatar" src="{{ data['avatar'] }}">
                    <div class="fika-user-name mx-1">{{ data['name'] }}</div>
                    <div class="flex-fill"></div>
                    <svg class="fika-icon" width="24" height="24" viewBox="0 0 24 24"><path d="M8.12 9.29L12 13.17l3.88-3.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0L6.7 10.7c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"/></svg>
                </div>
                <a class="fika-menu-nav-item small d-block" id="fika-retweet">Share Fika</a>
            {{ else }}
                <div id="fika-login" class="px-2">
                    <div class="mb-1">Log in</div>
                    <div>with Google account</div>
                </div>
            {{ end }}
        `
    }

});