const { exec } = require('child_process');
const { Document } = require('langchain/util/document');
const path = require('path');
const fs = require('fs');

export class AudioLoader {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.options = options;
    }

    constructCommand() {
        let command = '';
        if (this.options.whisperPath) {
            command += `\"${this.options.whisperPath}\" `;
        } else {
            command += `whisper `;
        }
        if (this.options.fp16) {
            const fp16val = this.options.fp16 ? "True" : "False";
            command += `--fp16 ${fp16val} `;
        } else {
            command += `--fp16 False `;
        }
        command += `--output_format txt `;
        if (this.options.model) {
            command += `--model ${this.options.model} `;
        } else {
            command += `--model small.en `;
        }
        command += `${this.filePath}`;
        return command;
    }

    async load() {
        const command = this.constructCommand();
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`Standard Error: ${stderr}`);
                    return;
                }
                const documents = this.parseOutput(stdout);
                fs.unlink(this.filePath.replace(/\.[^/.]+$/, '.txt'), (err) => {
                    if (err) {
                        console.error(`Error deleting file ${this.filePath.replace(/\.[^/.]+$/, '.txt')}:`, err);
                    }
                });
                resolve(documents);
            });
        })
    }

    parseOutput(output) {
        const lines = output.split('\n');
        const regex = /\[(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})\]\s*(.+)/;
        return lines.map(line => {
            const match = line.match(regex);
            if (match) {
                let parsed = {
                    startTime: match[1],
                    endTime: match[2],
                    content: match[3]
                };
                return new Document({
                    content: parsed.content,
                    metadata: {
                        startTime: parsed.startTime,
                        endTime: parsed.endTime
                    }
                });
            }
            else {
                return new Document({ content: line });
            }
        });
    }
}