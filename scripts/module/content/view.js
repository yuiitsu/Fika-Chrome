/**
 * SpinXS Content View
 */
App.view.extend('content', function() {

    this.layout = function() {
        return `
            <div class="fika-reader-mode">
                <div id="fika" class="f-app theme-blabar">
                    <!--drawer-->
                    <div class="f-tool">
                        <button class="f-btn f-btn-icon" id="tool-btn">
                            <svg class="f-icon" viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                        </button>
                        <button class="f-btn f-btn-icon" id="toc-btn">
                            <svg class="f-icon" viewBox="0 0 24 24">
                                <path d="M4 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zM7 8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1zm-3 5c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zM7 8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1z"/>
                            </svg>
                        </button>
                        <button class="f-btn f-btn-icon" id="appearance">
                            <svg class="f-icon" viewBox="0 0 24 24">
                                <path d="M21.94,18.66l-5-14a1,1,0,0,0-1.88,0L10.48,17.48,7.43,9.64a1,1,0,0,0-1.86,0l-3.5,9a1,1,0,1,0,1.86.72l.66-1.68H8.41l.66,1.68A1,1,0,0,0,10,20a.92.92,0,0,0,.36-.07.67.67,0,0,0,.14-.09.7.7,0,0,0,.16.1,1,1,0,0,0,1.28-.6l1-2.84h6.1l1,2.84A1,1,0,0,0,21,20a1,1,0,0,0,.34-.06A1,1,0,0,0,21.94,18.66Zm-16.58-3L6.5,12.76l1.14,2.92Zm8.31-1.18L16,8l2.33,6.53Z"/></svg>
                        </button>
                        <!--appearance settings-->
                        <div class="f-menu">
                            <!--font size selection-->
                            <div class="f-select-label" style="margin-top: 0px">text size</div>
                            <div class="f-select-sizes">
                                <div class="f-select-size size-small active">small</div>
                                <div class="f-select-size size-medium">medium</div>
                                <div class="f-select-size size-large">large</div>
                            </div>
                            <!--theme selection-->
                            <div class="f-select-label">theme</div>
                            <div class="f-select-themes">
                                <div class="f-select-theme theme-vanilla"></div>
                                <div class="f-select-theme theme-latte"></div>
                                <div class="f-select-theme theme-blabar"></div>
                                <div class="f-select-theme theme-licorice"></div>
                            </div>
                            <!--font selection-->
                            <div class="f-select-label">Font</div>
                            <div class="f-select-fonts">
                            </div>
                            <div class="f-select-label">Shortcut</div>
                            <div style="font-size:14px;line-height: 1.5">

                                <div><b>Alt+R (Option+R)</b>: to open reader mode</div>
                                <div><b>Esc</b>: to close reader mode</div>
                            </div>
                        </div>
                        <!--print-->
                        <button class="f-btn f-btn-icon" id="print">
                            <svg class="f-icon" viewBox="0 0 24 24">
                                <path d="M19,8H5c-1.7,0-3,1.3-3,3v6h4v4h12v-4h4v-6C22,9.3,20.7,8,19,8z M16,19H8v-5h8V19z M19,12c-0.5,0-1-0.4-1-1s0.5-1,1-1
                    s1,0.4,1,1S19.5,12,19,12z M18,3H6v4h12V3z"/>
                            </svg>
                        </button>
                        <!--fullscreen-->
                        <button class="f-btn f-btn-icon" id="fullscreen">
                            <!--exit-->
                            <svg class="f-icon" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                            <!--fs-->
                            <svg class="f-icon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                        </button>
                    </div>
                    <div class="f-drawer">
                        <div class="my-2 d-flex align-center justify-space-between">
                            <!-- ** sign in button-->
                            <!--
                            <button class="f-btn" style="display: none;">Sign in</button>
                            -->
                            <!-- ** authorized user avatar & name -->
                            <!--
                            <button class="f-btn f-avatar">
                                <img src="https://lh3.googleusercontent.com/-IvSppfPGUEE/AAAAAAAAAAI/AAAAAAAAAAA/ACevoQPWKABIL1pznV_P0TGMb18IA8PXpw/s32-c-mo/photo.jpg">
                                <span>Username</span>
                            </button>
                            -->
                            <div class="f-select-label" style="margin: 8px">Table of content</div>
                            <!-- tabs' buttons -->
                            <div class="flex-fill"></div>
                            <button class="f-btn f-btn-icon ml-1 f-drawer-close">
                                <svg class="f-icon" viewBox="0 0 24 24">
                                    <path d="M14.71 15.88L10.83 12l3.88-3.88c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .38-.39.39-1.03 0-1.42z"/>
                                </svg>
                            </button>
                        </div>

                        <div class="f-drawer-content">
                            <div class="f-drawer-content-wrap">
                                <!-- ** toc-->
                                <div class="f-toc"></div>
                                <!-- ** highlights 仅仅是这篇文章中的highlights -->
                                <!--<div class="f-hl-list">-->
                                    <!--<a><span>Details are what keep them there. And details are what actually make our app stand out from our competition.</span></a>-->
                                    <!--<a><span>As first described in Dan Saffer’s book Microinteractions, these tiny details typically serve these essential functions:</span></a>-->
                                <!--</div>-->
                            </div>
                        </div>

                    </div>
                    <!--overlay-->
                    <div class="f-overlay"></div>
                    <!--paper-->
                    <div class="f-main-body">
                        <div class="f-paper">{{ data['content'] }}</div>
                        <div class="f-footer mt-3">
                            <a class="f-footer-logo">
                                <img style="" src="images/logo64.png">
                                Made with love by Fika
                            </a>
                            <div class="f-footer-share">
                                <a href="https://twitter.com/intent/tweet?text=https://chrome.google.com/webstore/detail/fika-reader-mode/fbcdnjeoghampomjjaahjgjghdjdbbcj" target="_blank">
                                    <svg style="fill: currentColor;"  height="32px" width="32px" viewBox="0 0 32 32">
                                        <path class="st0" d="M23.9,11.9c0,0.2,0,0.3,0,0.5c0,5.3-4.1,11.4-11.4,11.4c-2.2,0-4.4-0.7-6.2-1.8c0.3,0.1,0.7,0.1,1,0.1
                    c1.9,0,3.7-0.7,5-1.7c-1.7,0-3.3-1.2-3.8-2.8c0.2,0.1,0.5,0.1,0.7,0.1c0.4,0,0.7,0,1.1-0.1c-1.9-0.4-3.3-2-3.3-3.9v-0.1
                    c0.5,0.3,1.1,0.5,1.8,0.5c-1.1-0.7-1.8-2-1.8-3.3c0-0.7,0.2-1.4,0.6-2c2,2.4,4.9,4,8.4,4.1c0-0.3-0.1-0.6-0.1-0.9c0-2.2,1.8-4,4-4
                    C21,8,22,8.5,22.8,9.3c0.9-0.2,1.7-0.5,2.5-1c-0.3,0.9-1,1.7-1.8,2.2c0.8,0,1.5-0.2,2.3-0.6C25.2,10.8,24.6,11.4,23.9,11.9z"/>
                                    </svg>

                                </a>
                                <a href="https://www.facebook.com/sharer/sharer.php?u=https://chrome.google.com/webstore/detail/fika-reader-mode/fbcdnjeoghampomjjaahjgjghdjdbbcj" target="_blank">
                                    <svg style="fill: currentColor;" height="32px" width="32px" viewBox="0 0 32 32">
                                        <path class="st0" d="M21.2,9.2h-2c-1.5,0-1.9,0.8-1.9,1.8v2.5h3.8l-0.8,3.7h-3l0.1,8.9h-3.7v-8.8h-3v-3.8h3v-3c0-3.1,2-4.6,4.7-4.6
                    C19.9,5.9,21,6,21.2,6V9.2z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
});