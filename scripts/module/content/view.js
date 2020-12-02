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
                        <button class="fika-btn fika-btn-icon mr-1" id="fika-tool-btn" data-whats-new="menu">
                            <svg class="fika-icon" viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                        </button>
                        <!--toc-->
                        <button class="fika-btn fika-btn-icon" id="fika-toc-btn">
                            <svg class="fika-icon" viewBox="0 0 24 24">
                                <path d="M4 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zM7 8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1zm-3 5c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zM7 8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1z"/>
                            </svg>
                            <div class="fika-tooltip">TOC</div>
                        </button>
                        <button class="fika-btn fika-btn-icon" id="fika-settings" data-whats-new="settings">
                            <svg class="fika-icon" width="20px" height="20px" viewBox="0 0 20 20"><path d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
                            <div class="fika-tooltip">Settings</div>
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
                            <div class="fika-tooltip">Fullscreen</div>
                        </button>
                        <!--autopilot-->
                        <button class="fika-btn fika-btn-icon fika-pro-item fika-disabled" id="fika-autopilot-local" data-whats-new="autopilot-local">
                            <!--on  .on-->
                          <svg class="fika-icon" viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
                          <!--off-->
                          <svg class="fika-icon" viewBox="0 0 24 24"><path d="M18 6l-2.91 6.26 5.25 5.25C21.39 15.93 22 14.04 22 12c0-5.52-4.48-10-10-10-2.04 0-3.93.61-5.51 1.66l5.25 5.25L18 6zM2.81 5.64l.85.85c-1.37 2.07-2 4.68-1.48 7.45.75 3.95 3.92 7.13 7.88 7.88 2.77.52 5.38-.1 7.45-1.48l.85.85c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L4.22 4.22c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.03 0 1.42zm6.1 6.1l3.35 3.35L6 18l2.91-6.26z"/></svg>
                          <div class="fika-tooltip">Autopilot</div>
                        </button>
                    </div>
                    <div class="fika-drawer">
                        <div class="my-2 d-flex fika-align-center fika-justify-space-between">
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
                                    {{ if data['favicon'] }}
                                        <img src="{{ data['favicon'] }}"/>
                                    {{ end }}
                                    <span>{{ data['domain'] }}</span>
                                </div>
                                <div class="fika-article-title">
                                    {{ data['title'] }}
                                </div>
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
                            <a class="fika-footer-logo" href="http://fika.io" target="_blank">
                                <img style="" src="{{ chrome.runtime.getURL('images/logo64.png') }}">
                                Made with love by Fika
                            </a>
                            <div class="d-flex fika-align-center"><b>Alt+R (Option+R)</b>: to open Fika  <b class="ml-2">Esc</b>: to close reader mode
                            </div>
                        </div>
                    </div>
                    <!--message toast-->
                    <div class="fika-toast">
                        <span id="fika-toast-msg"></span>
                        <a class="ml-5" id="fika-toast-close">close</a>
                    </div>
                    <!--background photo-->
                    <div class="fika-bg"></div>
                    <div class="fika-loading" id="fika-loading-bg" style="display: none;position: fixed;right: 24px;bottom: 24px;"></div>
                    <a class="fika-bg-credit" target="_blank"></a>
                </div>
            </div>
        `;
    };

    // settings menu
    this.menu = function () {
        return `
            <div class="fika-menu-nav d-flex flex-column">
                <div class="fika-menu-nav-item active">Text</div>
                <div class="fika-menu-nav-item">Theme</div>
                <div class="fika-menu-nav-item fika-pro">Autopilot</div>
                <div class="flex-fill"></div>
                <a class="fika-menu-nav-item small flex-y-center fika-share-fika"
                data-type="fb" style="display:none;margin-bottom: -6px;margin-left: -4px" href="https://www.facebook.com/dialog/feed?app_id=393950891439557&display=popup&link=https://chrome.google.com/webstore/detail/fika-reader-mode/fbcdnjeoghampomjjaahjgjghdjdbbcj" target="_blank">
                    <svg class="fika-icon" height="20px" width="20px" viewBox="0 0 32 32">
                    <path class="st0" d="M21.2,9.2h-2c-1.5,0-1.9,0.8-1.9,1.8v2.5h3.8l-0.8,3.7h-3l0.1,8.9h-3.7v-8.8h-3v-3.8h3v-3c0-3.1,2-4.6,4.7-4.6
                        C19.9,5.9,21,6,21.2,6V9.2z"/>
                    </svg>
                    Share to Facebook
                </a>
                <a class="fika-menu-nav-item small flex-y-center fika-share-fika"
                 data-type="tw" style="display:none;margin-bottom: -6px;margin-left: -4px" href="https://twitter.com/intent/retweet?tweet_id=1117715831540965376" target="_blank">
                    <svg class="fika-icon" height="20px" width="20px" viewBox="0 0 32 32">
                    <path class="st0" d="M23.9,11.9c0,0.2,0,0.3,0,0.5c0,5.3-4.1,11.4-11.4,11.4c-2.2,0-4.4-0.7-6.2-1.8c0.3,0.1,0.7,0.1,1,0.1
                        c1.9,0,3.7-0.7,5-1.7c-1.7,0-3.3-1.2-3.8-2.8c0.2,0.1,0.5,0.1,0.7,0.1c0.4,0,0.7,0,1.1-0.1c-1.9-0.4-3.3-2-3.3-3.9v-0.1
                        c0.5,0.3,1.1,0.5,1.8,0.5c-1.1-0.7-1.8-2-1.8-3.3c0-0.7,0.2-1.4,0.6-2c2,2.4,4.9,4,8.4,4.1c0-0.3-0.1-0.6-0.1-0.9c0-2.2,1.8-4,4-4
                        C21,8,22,8.5,22.8,9.3c0.9-0.2,1.7-0.5,2.5-1c-0.3,0.9-1,1.7-1.8,2.2c0.8,0,1.5-0.2,2.3-0.6C25.2,10.8,24.6,11.4,23.9,11.9z"/>
                    </svg>
                    Share to Twitter
                </a>       
           
                <a class="fika-menu-nav-item small mb-1" href="http://fika.io/updatelog" target="_blank">What's new</a>
<!--                <div class="fika-menu-nav-item static small" style="font-size: 12px;-->
<!--    line-height: 16px;" id="fika-beta-info">-->
<!--                    <div class="fika-pro" style=" margin-left: -4px;"></div>-->
<!--                    Login and share Fika to gain BETA access.-->
<!--                </div>-->
                <!--<a class="fika-menu-nav-item small" href="http://fika.io/pro" target="_blank">Upgrade to Pro</a>-->
                <div class="fika-menu-login"></div>
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
                    <div class="fika-menu-label mt-3">Alignment</div>
                    <div class="fika-tab">
                        <div class="fika-tab-item" data-sel="align-normal">normal</div>
                        <div class="fika-tab-item" data-sel="align-justify">justify</div>
                    </div>
                    <div class="fika-menu-label mt-3">Font</div>
                    <div class="fika-select fika-select-fonts"></div>
                </div>
                <!--theme-->
                <div class="fika-menu-view" data-tab="theme">
                    <div class="fika-menu-label">Theme Color</div>
                    <div class="fika-select-themes">
                        <div class="fika-select-theme theme-vanilla" data-sel="theme-vanilla"></div>
                        <div class="fika-select-theme theme-latte" data-sel="theme-latte"></div>
                        <div class="fika-select-theme theme-blabar" data-sel="theme-blabar"></div>
                        <div class="fika-select-theme theme-licorice" data-sel="theme-licorice"></div>
                    </div>
                    
                    <div class="fika-pro-item has-unlock-btn fika-disabled">
                        <div class="fika-share-to-unlock"></div>
                        <div class="mt-3 fika-menu-label fika-pro">Background</div>
                        <div class="my-2 d-flex fika-justify-space-between">
                            <div class="fika-menu-label">
                                <span class="fika-menu-label-sec">Photo Rotation</span>
                                <div class="fika-menu-label-desc">Rotate photo backgrounds everyday</div>
                            </div>
                            <input type="checkbox" id="fika-photo-bg" disabled>
                            <label class="fika-toggle" for="fika-photo-bg"></label>
                        </div>
                        <div class="d-flex fika-align-center mb-1 mt-2">
                            <div class="fika-photo-grid-tab active" data-tab="photo">PHOTO</div>
                            <div class="ml-2 fika-photo-grid-tab" data-tab="color">COLOR</div>
                        </div>
                        <div class="fika-photo-grid" data-tab="photo"></div>
                        <div class="fika-photo-grid" data-tab="color" style="display: none;"></div>
                    </div>
                </div>
                <!--autopilot-->
                <div class="fika-menu-view fika-pro-item has-unlock-btn fika-disabled">
                    <div class="fika-share-to-unlock"></div>
                    <div class="fika-menu-label mt-1">
                        <div class="fika-pro">Autopilot</div>
                        <div class="fika-menu-label-desc">Automatically open Fika reader mode on whitelisted websites</div>
                    </div>
                    <div class="fika-menu-label d-flex fika-align-center">
                        <svg width="24" height="24" class="fika-icon" style="opacity: 0.7;min-width:24px;" viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
                        <div class="ml-1 fika-menu-label-desc" style="margin-top: 0px;">Tip: whitelist current website</div>
                    </div>
                    <div class="fika-menu-label mt-3">Whitelist</div>
                    <div class="fika-select">
                        <input class="fika-input" disabled id="fika-autopilot-input" type="url" placeholder="Add new website URL">
                        <div class="fika-autopilot-whitelist"></div>
                    </div>
                    
                </div>
            </div>
        
        `
    };
});