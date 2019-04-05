/**
 * SpinXS Content View
 */
App.view.extend('content', function() {

    this.layout = function() {
        return `
            <div class="fika-reader-mode" id="fika-reader" style="display: none;">
                <div id="fika" class="fika-app theme-vanilla">
                    <!--drawer-->
                    <div class="fika-tool">
                        <!--open-->
                        <button class="fika-btn fika-btn-icon mr-1" id="fika-tool-btn">
                            <svg class="fika-icon" viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                        </button>
                        <!--toc-->
                        <button class="fika-btn fika-btn-icon" id="fika-toc-btn">
                            <svg class="fika-icon" viewBox="0 0 24 24">
                                <path d="M4 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zM7 8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1zm-3 5c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zM7 8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1z"/>
                            </svg>
                        </button>
                        <button class="fika-btn fika-btn-icon" id="fika-appearance">
                            <svg class="fika-icon" viewBox="0 0 24 24">
                                <path d="M21.94,18.66l-5-14a1,1,0,0,0-1.88,0L10.48,17.48,7.43,9.64a1,1,0,0,0-1.86,0l-3.5,9a1,1,0,1,0,1.86.72l.66-1.68H8.41l.66,1.68A1,1,0,0,0,10,20a.92.92,0,0,0,.36-.07.67.67,0,0,0,.14-.09.7.7,0,0,0,.16.1,1,1,0,0,0,1.28-.6l1-2.84h6.1l1,2.84A1,1,0,0,0,21,20a1,1,0,0,0,.34-.06A1,1,0,0,0,21.94,18.66Zm-16.58-3L6.5,12.76l1.14,2.92Zm8.31-1.18L16,8l2.33,6.53Z"/></svg>
                        </button>
                        <!--appearance settings-->
                        <div class="fika-menu"></div>
                        <!--print-->
                        <!--<button class="fika-btn fika-btn-icon" id="fika-print">-->
                            <!--<svg class="fika-icon" viewBox="0 0 24 24">-->
                                <!--<path d="M19,8H5c-1.7,0-3,1.3-3,3v6h4v4h12v-4h4v-6C22,9.3,20.7,8,19,8z M16,19H8v-5h8V19z M19,12c-0.5,0-1-0.4-1-1s0.5-1,1-1-->
                    <!--s1,0.4,1,1S19.5,12,19,12z M18,3H6v4h12V3z"/>-->
                            <!--</svg>-->
                        <!--</button>-->
                        <!--fullscreen-->
                        <button class="fika-btn fika-btn-icon" id="fika-fullscreen">
                            <!--exit-->
                            <svg class="fika-icon" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                            <!--fs-->
                            <svg class="fika-icon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                        </button>
                            <!--exit-->
                            <button class="fika-btn px-1" id="fika-login">
                              <span>Login</span>
                                <!--<svg class="fika-icon" viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>-->
                            </button>
                    </div>
                    <div class="fika-drawer">
                        <div class="my-2 d-flex align-center justify-space-between">
                            <div class="fika-select-label" style="margin: 8px">Table of content</div>
                            <button class="fika-btn fika-btn-icon ml-1 fika-drawer-close">
                                <svg class="fika-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </button>
                        </div>

                        <div class="fika-drawer-content">
                            <div class="fika-drawer-content-wrap">
                                <!-- ** toc-->
                                <div class="fika-toc"></div>
                            </div>
                        </div>
                    </div>
                    <!--overlay-->
                    <div class="fika-overlay"></div>
                    <!--paper-->
                    <div class="fika-main-body">
                        <div class="fika-toc-static fika-toc-static-active">
                            <div class="fika-toc"></div>
                        </div>
                        <div class="fika-paper">
                            <div class="fika-article size-medium font-geogia">
                                <div class="fika-article-domain">
                                    <img src="{{ data['favicon'] }}"/>
                                    {{ data['domain'] }}
                                </div>
                                <h1 class="fika-article-title">
                                    {{ data['title'] }}
                                </h1>
                                <div class="fika-article-divider"></div>
                                <div class="fika-content">
                                    {{ data['content'] }}
                                </div>
                            </div>
                            <div class="fika-share">
                                <div class="fika-share-divider"></div>
                                <div class="fika-share-buttons">
                                    <button id="fika-twitter-share" class="fika-btn fika-btn-icon">
                                        <svg class="fika-icon fika-icon-large" viewBox="0 0 32 32">
                                            <path d="M23.9,11.9c0,0.2,0,0.3,0,0.5c0,5.3-4.1,11.4-11.4,11.4c-2.2,0-4.4-0.7-6.2-1.8c0.3,0.1,0.7,0.1,1,0.1
                        c1.9,0,3.7-0.7,5-1.7c-1.7,0-3.3-1.2-3.8-2.8c0.2,0.1,0.5,0.1,0.7,0.1c0.4,0,0.7,0,1.1-0.1c-1.9-0.4-3.3-2-3.3-3.9v-0.1
                        c0.5,0.3,1.1,0.5,1.8,0.5c-1.1-0.7-1.8-2-1.8-3.3c0-0.7,0.2-1.4,0.6-2c2,2.4,4.9,4,8.4,4.1c0-0.3-0.1-0.6-0.1-0.9c0-2.2,1.8-4,4-4
                        C21,8,22,8.5,22.8,9.3c0.9-0.2,1.7-0.5,2.5-1c-0.3,0.9-1,1.7-1.8,2.2c0.8,0,1.5-0.2,2.3-0.6C25.2,10.8,24.6,11.4,23.9,11.9z"/>
                                        </svg>
                                    </button>
                                    <button id="fika-facebook-share" class="fika-btn fika-btn-icon">
                                        <svg class="fika-icon fika-icon-large" viewBox="0 0 32 32">
                                            <path d="M21.2,9.2h-2c-1.5,0-1.9,0.8-1.9,1.8v2.5h3.8l-0.8,3.7h-3l0.1,8.9h-3.7v-8.8h-3v-3.8h3v-3c0-3.1,2-4.6,4.7-4.6
                        C19.9,5.9,21,6,21.2,6V9.2z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="fika-feedback my-6">
                                <p id="fika-feedback-msg">Is Fika working properly on this site?</p>
                                <div class="my-3">
                                    <button class="fika-btn fika-btn-icon fika-btn-large fika-btn-depress fika-feedback-button" data-match="1">
                                                <svg class="fika-icon fika-icon-large" viewBox="0 0 24 24"><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.41-6.11c-.35-.22-.82-.11-1.03.24-.74 1.17-2 1.87-3.38 1.87s-2.64-.7-3.38-1.88c-.22-.35-.68-.46-1.03-.24-.35.22-.46.68-.24 1.03C8.37 16.54 10.1 17.5 12 17.5s3.63-.97 4.65-2.58c.22-.35.11-.81-.24-1.03z"/></svg>
                                            </button>
                                    <button class="fika-btn fika-btn-icon fika-btn-large fika-btn-depress ml-2 fika-feedback-button" data-match="0">
                                        <svg class="fika-icon fika-icon-large" viewBox="0 0 24 24"><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-6c-1.9 0-3.63.97-4.65 2.58-.22.35-.11.81.24 1.03.35.22.81.11 1.03-.24.74-1.18 2-1.88 3.38-1.88s2.64.7 3.38 1.88c.14.23.39.35.64.35.14 0 .27-.04.4-.11.35-.22.46-.68.24-1.03C15.63 14.96 13.9 14 12 14z"/></svg>
                                        </button>
                                </div>
                            </div>
   
                        </div>
                        <div class="fika-footer">
                            <a class="fika-footer-logo" href="https://chrome.google.com/webstore/detail/fika-reader-mode/fbcdnjeoghampomjjaahjgjghdjdbbcj" target="_blank">
                                <img style="" src="{{ chrome.runtime.getURL('images/logo64.png') }}">
                                Made with love by Fika
                            </a>
                            <div class="d-flex align-center"><b>Alt+R (Option+R)</b>: to open Fika  <b class="ml-2">Esc</b>: to close reader mode
                            </div>
                        </div>
                    </div>
                    <!--background photo-->
                    <div class="fika-photo-bg">
                      <img />
                    <div>
                </div>
            </div>
        `;
    };

    // settings menu
    this.menu = function () {
        return `
            <div class="fika-menu-nav d-flex column">
                <div class="fika-menu-nav-item active">Text</div>
                <div class="fika-menu-nav-item">Theme</div>
                <div class="fika-menu-nav-item">Autopilot</div>
                <div class="flex-fill"></div>
                <a class="fika-menu-nav-item small" href="http://fika.io/updatelog" target="_blank">What's new</a>
                <a class="fika-menu-nav-item small" href="http://fika.io/pro" target="_blank">Upgrade to Pro</a>
                <div class="fika-menu-login">
                    <div class="mb-1">Log in</div>
                    <div style="font-size:11px">with Google account</div>
                </div>
            </div>
            <div class="fika-menu-view-cont">
                <!--text-->
                <div class="fika-menu-view" style="display: block">
                    <div class="fika-menu-label">Text</div>
                    <div class="fika-tab">
                        <div class="fika-tab-item" style="font-size:12px" data-sel="size-small">small</div>
                        <div class="fika-tab-item" style="font-size:14px" data-sel="size-medium">medium</div>
                        <div class="fika-tab-item" style="font-size:16px" data-sel="size-large">large</div>
                    </div>
                    <div class="fika-menu-label mt-3">Font</div>
                    <div class="fika-select fika-select-fonts"></div>
                </div>
                <!--theme-->
                <div class="fika-menu-view">
                    <div class="fika-menu-label">Theme Color</div>
                    <div class="fika-select-themes">
                        <div class="fika-select-theme theme-vanilla" data-sel="theme-vanilla"></div>
                        <div class="fika-select-theme theme-latte" data-sel="theme-latte"></div>
                        <div class="fika-select-theme theme-blabar" data-sel="theme-blabar"></div>
                        <div class="fika-select-theme theme-licorice" data-sel="theme-licorice"></div>
                    </div> 
                    <div class="mt-3 d-flex justify-space-between">
                        <div class="fika-menu-label">
                            <span class="fika-pro">Photo Background</span>
                            <div class="desc">Use inspiring photos as background</div>
                        </div>
                        <input type="checkbox" id="photo-bg">
                        <label class="fika-toggle" for="photo-bg"></label>
                    </div>
                    <div class="fika-photo-grid">
                        
                    </div>
                </div>
                <div class="fika-menu-view">
                    autopilot
                </div>
            </div>
        
        `
    };
});

/*<!--font size selection-->
<div class="fika-select-label" style="margin-top: 0px">text size</div>
<div class="fika-tab-items">
    <div class="fika-tab-item size-small active">small</div>
    <div class="fika-tab-item size-medium">medium</div>
    <div class="fika-tab-item size-large">large</div>
    </div>
    <!--theme selection-->
    <div class="fika-select-label">theme</div>
    <div class="fika-select-themes">
    <div class="fika-select-theme theme-vanilla"></div>
    <div class="fika-select-theme theme-latte"></div>
    <div class="fika-select-theme theme-blabar"></div>
    <div class="fika-select-theme theme-licorice"></div>
    </div>
    <!--font selection-->
    <div class="fika-select-label">Font</div>
    <div class="fika-select-fonts"></div>
    <!--photo background-->
    <div class="mt-2">
    <input type="checkbox" name="photo-bg">
    <label for="photo-bg">Photo Background</label>
</div>*/
