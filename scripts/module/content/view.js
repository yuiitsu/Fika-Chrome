/**
 * SpinXS Content View
 */
App.view.extend('content', function() {

    this.translate = function() {
        return `
            <div class="spinxs spin-mask" id="spin-js-mask"></div>
            <div id="spin-js-translate" class="spinxs spin-translate">
                <div class="spinxs spin-translate-inner" id="spin-js-translate-inner">
                    <div class="spinxs spin-translate-title">{{ data['query'] }}</div>
                    <div class="spinxs spin-translate-phonetic">
                    {{ for var i in data['phonetic'] }}
                        {{ var type = data['phonetic'][i]['t'] }}
                        {{ var text = data['phonetic'][i]['text'] }}
                        {{ if type }}
                            <span>{{ type }} [{{ text }}]</span>
                        {{ else }}
                            <span>[{{ text }}]</span>
                        {{ end }}
                    {{ end }}
                    </div>
                    <div class="spinxs spin-translate-explains">
                        {{ for var i in data['explains'] }}
                        <div>{{ data['explains'][i] }}</div>
                        {{ end }}
                    </div>
                    <!--
                    <ul class="spinxs spin-translate-explains">
                        {{ for var i in data['explains'] }}
                        <li>{{ data['explains'][i] }}</li>
                        {{ end }}
                    </ul>
                    -->
                </div>
            </div>
        `;
    };

    this.reader_page = function() {
        return `
            <div style="position: fixed;width:100%;height:100%;top:0;left:0;z-index: 123456789;" id="fika-reader">
                <dialog style="position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; background: rgb(251, 251, 251); z-index: 2147483647; display: block; padding: 0px; border: none; margin: 0px;">
                    <iframe src="{{ data['src'] }}" style="border:0;width:100%;height:100%;"></iframe>
                </dialog>
            </div>
        `;
    };
});