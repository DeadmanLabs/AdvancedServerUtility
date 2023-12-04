const openai = require('openai');
const axios = require('axios');
const backoff = require('backoff');

const apiBase = '';
const model = '';
const apiKey = apiKey;

openai.apiKey = apiKey;

async function sendWithRetries(model, messages, functions, stream) {
    const exponentialBackoff = backoff.exponential({
        initialDelay: 100,
        maxDelay: 10000
    });
    exponentialBackoff.failAfter(10);
    return new Promise((resolve, reject) => {
        exponentialBackoff.on('ready', async () => {
            try {
                const response = await openai.ChatCompletion.create({
                    model: model,
                    messages: messages,
                    temperature: 0,
                    stream: stream
                });
                exponentialBackoff.reset();
                resolve(response);
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    exponentialBackoff.backoff();
                } else {
                    reject(error);
                }
            }
        });
        exponentialBackoff.on('fail', () => {
            reject('Failed to send request after retries.');
        });
        exponentialBackoff.backoff();
    });
}

async function simpleSendWithRetries(model, messages) {
    try {
        const { hash, response } = sendWithRetries(
            model,
            messages,
            undefined,
            false
        );
        return response.choices[0].messages.content;
    } catch {
        return;
    }
}