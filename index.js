const path = require('path');
const fs = require('fs');

const extend = require('lodash/extend');
const flatten = require('lodash/flatten');
const uniq = require('lodash/uniq');

class JspWebPackPlugin {
    constructor(options) {
        // Default options
        this.options = extend(
            {
                template: path.join(__dirname, 'index.jsp'),
                useBuildPath: true,
                filename: 'index.jsp',
            },
            options
        );

        this.jspFile = this.getFileContent(this.options.template);
    }

    apply(compiler) {
        compiler.hooks.emit.tap('JspWebPackPlugin', compilation => {
            const { filename } = this.options;

            this.getAllChunks(compilation).forEach(chunk => {
                const chunkExtension = this.getChunkExtension(chunk);
                switch (chunkExtension) {
                    case 'js':
                        this.insertScript(chunk);
                        return;
                    case 'css':
                        this.insertStyle(chunk);
                        return;
                    default:
                        return;
                }
            });

            fs.writeFileSync(filename, this.jspFile);
        });
    }

    getFileContent(filename) {
        return fs.readFileSync(filename, 'utf8');
    }

    getAllChunks(compilation) {
        const jsonCompilation = compilation.getStats().toJson();
        return uniq(flatten(jsonCompilation.chunks.map(chunk => chunk.files))).reverse();
    }

    getChunkExtension(chunk) {
        const splittedChunk = chunk.split('.');
        return splittedChunk[splittedChunk.length - 1];
    }

    insertScript(chunk) {
        const bodyRegExp = /(<\/body\s*>)/i;
        const scriptTag = this.generateScriptTag(chunk);

        if (bodyRegExp.test(this.jspFile)) {
            // Append assets to body element
            this.jspFile = this.jspFile.replace(bodyRegExp, match => scriptTag + match);
        } else {
            // Append scripts to the end of the file if no <body> element exists:
            this.jspFile += chunk;
        }
    }

    insertStyle(chunk) {
        const headRegExp = /(<\/head\s*>)/i;
        const styleTag = this.generateStyleTag(chunk);

        if (headRegExp.test(this.jspFile)) {
            // Append assets to head element
            this.jspFile = this.jspFile.replace(headRegExp, match => styleTag + match);
        }
    }

    generateScriptTag(chunk) {
        return `<script type="text/javascript" src="${this.options.useBuildPath ? `<%= buildPath(request,"/${chunk}")%>`: chunk }" charset="utf-8"></script>`;
    }

    generateStyleTag(chunk) {
        return `<link rel="stylesheet" href="${this.options.useBuildPath ? `<%= buildPath(request,"/${chunk}")%>`: chunk }" />`;
    }
}

module.exports = JspWebPackPlugin;
