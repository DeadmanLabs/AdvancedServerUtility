const vectorstores = require("./components/vectorstores");

const { ChatOpenAI } = require("langchain/chat_models/openai");
const { OpenAI } = require("langchain/llms/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { SerpAPI, ChainTool } = require("langchain/tools");
const { Calculator } = require("langchain/tools/calculator");
const { ConversationalRetrievalQAChain } = require("langchain/chains");
const { Chroma } = require("langchain/vectorstores/chroma");
const { HuggingFaceInferenceEmbeddings } = require("langchain/embeddings/hf");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { BufferMemory } = require("langchain/memory"); 

const fs = require('fs');
const path = require('fs');

function readDirectory(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(files.filter(file => !fs.statSync(path.join(directoryPath, file)).isDirectory()));
        });
    });
}

function readFullDirectory(directoryPath) {
    function readFilesRecursively(dir) {
        const filesInDir = fs.readdirSync(dir);
        const files = filesInDir.flatMap(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                return readFullDirectory(filePath);
            } else {
                return filePath;
            }
        });
        return files;
    }
    return readFilesRecursively(directoryPath);
}

async function understandYourself() {
    let backendFiles = [
        "config.json",
        "index.js",
        "index.test.js",
        "notes.txt",
        "package.json",
        "builder.js"
    ];
    const directoryFiles = readFullDirectory("components");
    backendFiles = backendFiles.concat(directoryFiles);
    let frontendFiles = [
        "frontendUI/package.json",
        "frontendUI/src/App.js",
        "frontendUI/src/App.css"
    ];
    frontendFiles = frontendFiles.concat(readFullDirectory("frontendUI/src/Components"));
    const vectorstore = vectorstores.createVectorstore("self");
    backendFiles.forEach(file => {
        const ids = vectorstores.addDocument(file);
    });
    frontendFiles.forEach(file => {
        const ids = vectorstores.addDocument(file);
    });
    return vectorstore;
}

async function querySelf(query) {

}

async function buildSelf(query) {

}

async function main() {
    const model = new ChatOpenAI({});
    const selfStore = await understandYourself();
    
    let streamedResponse = "";
    const streamingModel = new ChatOpenAI({
        streaming: true,
        callbacks: [
            {
                handleLLMNewToken(token) {
                    streamedResponse += token;
                }
            }
        ]
    });
    const chain = ConversationalRetrievalQAChain.fromLLM(
        streamingModel,
        [selfStore.asRetriever()],
        {
            returnSourceDocuments: true,
            memory: new BufferMemory({
                memoryKey: "chat_history",
                inputKey: "question",
                outputKey: "text",
                returnMessages: true
            }),
            questionGeneratorChainOptions: {
                llm: model
            }
        }
    );
    const question = "";
    const res = await chain.call({ question });
    console.log({ streamedResponse });


    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    // Deal
    rl.on('line', (input) => {
        if (input.toLowerCase() === 'exit') {
            rl.close();
        } else {
            // Handle
        }
    });
}

main();