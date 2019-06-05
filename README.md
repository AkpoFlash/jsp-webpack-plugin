# Jsp WebPack Plugin
This plugin intends for generate *.jsp file (with injected your bundles and chunks)

# Install
`npm i --save-dev html-webpack-plugin`

or

`yarn add --dev html-webpack-plugin`

# Usage

**webpack.config.js**

```
const path = require('path');
const JspWebpackPlugin = require('jsp-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'index.js'),
    output: {
        path: path.resolve(__dirname, '/dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new JspWebpackPlugin({
            template: path.join(__dirname, '/index.jsp'),
        })
    ]
};
```