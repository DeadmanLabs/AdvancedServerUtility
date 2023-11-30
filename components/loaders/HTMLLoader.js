const { Document } = require('langchain/util/document');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

export class HTMLLoader {
    constructor(webPaths, options = {}) {
        this.webPaths = Array.isArray(webPaths) ? webPaths : [webPaths];
        if (options == {}) {
            this.options = {
                headers: {
                    'User-Agent': '',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Referer': 'https://www.google.com/',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            }
        } else {
            this.options = options;
        }
    }

    _buildMetadata(html, url) {
        const metadata = { source: url };
        const root = parse(html);
        const title = root.querySelector('title')?.textContent;
        const description = root.querySelector('meta[name="description"]')?.getAttribute('content');
        const language = root.querySelector('html')?.getAttribute('lang');

        metadata.title = title || 'No title found.';
        metadata.description = description || 'No description found.';
        metadata.language = language || 'No language found.';

        return metadata;
    }

    async load() {
        const documents = await Promise.all(this.webPaths.map(async (path) => {
            const response = await fetch(path, { headers: this.options.headers });
            const content = await response.text();
            const metadata = this._buildMetadata(content, path);
            return new Document({ pageContent: content, metadata });
        }));
        return documents;
    }
}