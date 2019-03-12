App.view.extend('update', function() {

    this.layout = function() {
        return `
            {{ for var i in data }}
            <h2>{{ i }}</h2>
            <ul>
                {{ for var j in data[i] }}
                <li>{{ data[i][j] }}</li>
                {{ end }}
            </ul>
            {{ end }}
        `;
    }
});
