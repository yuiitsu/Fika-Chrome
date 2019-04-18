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
                    <svg class="fika-icon" width="24" height="24" viewBox="0 0 24 24" id="fika-user-expand"><path d="M8.12 9.29L12 13.17l3.88-3.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0L6.7 10.7c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"/></svg>
                </div>
                <a class="fika-menu-nav-item small mt-1" id="fika-logout" style="display: none" id="fika-logout">Logout</a>
            {{ else }}
                <div id="fika-login" class="px-2">
                    <div class="mb-1">Log in</div>
                    <div>with Google account</div>
                </div>
                <div class="fika-loading" id="fika-loading-login" style="display: none;position: absolute;right: 16px;bottom: 24px;"></div>
            {{ end }}
        `
    }

    this.shareToUnlock = function () {
        return `
            <div style="font-weight: bold">Login & Share to Unlock</div>
            <div class="mt-2">
                <button class="fika-btn fika-share-to-unlock-btn" data-type="fb" style="background: #3A5CA9">
                    <svg  height="20px" width="20px" viewBox="0 0 32 32" fill="#fff">
                    <path class="st0" d="M21.2,9.2h-2c-1.5,0-1.9,0.8-1.9,1.8v2.5h3.8l-0.8,3.7h-3l0.1,8.9h-3.7v-8.8h-3v-3.8h3v-3c0-3.1,2-4.6,4.7-4.6
                        C19.9,5.9,21,6,21.2,6V9.2z"/>
                    </svg>
                    Facebook
                </button>
                <button class="ml-2 fika-btn fika-share-to-unlock-btn" data-type="tw" style="background: #1A97F0">
                    <svg height="20px" width="20px" viewBox="0 0 32 32" fill="#fff">
                    <path class="st0" d="M23.9,11.9c0,0.2,0,0.3,0,0.5c0,5.3-4.1,11.4-11.4,11.4c-2.2,0-4.4-0.7-6.2-1.8c0.3,0.1,0.7,0.1,1,0.1
                        c1.9,0,3.7-0.7,5-1.7c-1.7,0-3.3-1.2-3.8-2.8c0.2,0.1,0.5,0.1,0.7,0.1c0.4,0,0.7,0,1.1-0.1c-1.9-0.4-3.3-2-3.3-3.9v-0.1
                        c0.5,0.3,1.1,0.5,1.8,0.5c-1.1-0.7-1.8-2-1.8-3.3c0-0.7,0.2-1.4,0.6-2c2,2.4,4.9,4,8.4,4.1c0-0.3-0.1-0.6-0.1-0.9c0-2.2,1.8-4,4-4
                        C21,8,22,8.5,22.8,9.3c0.9-0.2,1.7-0.5,2.5-1c-0.3,0.9-1,1.7-1.8,2.2c0.8,0,1.5-0.2,2.3-0.6C25.2,10.8,24.6,11.4,23.9,11.9z"/>
                    </svg>
                    Twitter
                </button>
            </div>
        `
    }

});