const { Document } = require('langchain/util/document');
const path = require('path');
const fs = require('fs');

export class JSLoader {
    constructor(filepath, options = {}) {
        this.filepath = filepath;
        this.options = options;
    }

    async load() {
        return new Promise((resolve) => {

            const document = new Document({
                content: content,
                metadata: {
                    command: this.command,
                    isError: isError
                }
            });
            resolve(document);
        })
    }
}