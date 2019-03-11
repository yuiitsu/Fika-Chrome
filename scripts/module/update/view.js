App.view.extend('update', function() {

    this.layout = function() {
        return `
            {{ for var i in data }}
            <li>{{ data[i] }}</li>
            {{ end }}
        `;
    }
});
