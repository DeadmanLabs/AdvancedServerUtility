const { exec } = require('child_process');
const { Document } = require('langchain/util/document');

export class CommandLoader {
    constructor(command) {
        this.command = command;
    }

    async load() {
        return new Promise((resolve) => {
            exec(this.command, (error, stdout, stderr) => {
                let content;
                let isError = false;

                if (error) {
                    content = `Error: ${error.message}`;
                    isError = true;
                } else if (stderr) {
                    content = `Standard Error: ${stderr}`;
                    isError = true;
                } else {
                    content = stdout;
                }

                const document = new Document({
                    content: content,
                    metadata: {
                        command: this.command,
                        isError: isError
                    }
                });
                resolve(document);
            });
        })
    }
}