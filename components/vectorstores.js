const { ChromaClient } = require('chromadb');

const { Chroma } = require('langchain/vectorstores/chroma');
const { HuggingFaceInferenceEmbeddings } = require('langchain/embeddings/hf');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { TextLoader } = require('langchain/document_loaders/fs/text');
const { CSVLoader } = require('langchain/document_loaders/fs/csv');
const { JSONLoader } = require('langchain/document_loaders/fs/json');
const { DocxLoader } = require('langchain/document_loaders/fs/docx');
const { HTMLLoader } = require('langchain/document_loaders/fs/html')
const { DirectoryLoader } = require('langchain/document_loaders/fs/directory');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

const { AudioLoader } = require('./loaders/AudioLoader');
const { CommandLoader } = require('./loaders/CommandLoader');
const { HTMLLoader } = require('./loaders/HTMLLoader');
const { XMLLoader } = require('./loaders/XMLLoader');
const { MarkdownLoader } = require('./loaders/MarkdownLoader');
const { JSLoader } = require('./loaders/JSLoader');
const { CSSLoader } = require('./loaders/CSSLoader');
const { PythonLoader } = require('./loaders/PythonLoader');
const { CPPLoader } = require('./loaders/CPPLoader');
const { CPPHeaderLoader } = require('./loaders/CPPHeaderLoader');
const { CSLoader } = require('./loaders/CSLoader');
const { SLNLoader } = require('./loaders/SLNLoader');
const { BATLoader } = require('./loaders/BATLoader');
const { SHLoader } = require('./loaders/SHLoader');
const { YAMLLoader } = require('./loaders/YAMLLoader');
const { ConfigLoader } = require('./loaders/ConfigLoader');
const { JSXLoader } = require('./loaders/JSXLoader');
const { TSXLoader } = require('./loaders/TSXLoader');
const { TSLoader } = require('./loaders/TSLoader');
const { DBLoader } = require('./loaders/DBLoader');
const { PS1Loader } = require('./loaders/PS1Loader');
const { JavaLoader } = require('./loaders/JavaLoader');
const { GradleLoader } = require('./loaders/GradleLoader');
const { PropsLoader } = require('./loaders/PropsLoader');
const { VCXProjectLoader } = require('./loaders/VCXProjectLoader');
const { RubyLoader } = require('./loaders/RubyLoader');
const { CMakeLoader } = require('./loaders/CMakeLoader');
const { EnvironmentLoader } = require('./loaders/EnvironmentLoader');
const { PHPLoader } = require('./loaders/PHPLoader');
const { CLoader } = require('./loaders/CLoader');
const { SCSSLoader } = require('./loaders/SCSSLoader');
const { VBScriptLoader } = require('./loaders/VBScriptLoader');
const { WikiLoader } = require('./loaders/WikiLoader');
const { InfoLoader } = require('./loaders/InfoLoader');
const { PythonNotebookLoader } = require('./loaders/PythonNotebookLoader');
const { SQLLoader } = require('./loaders/SQLLoader');
const { ResourceLoader } = require('./loaders/ResourceLoader');
const { VueLoader } = require('./loaders/VueLoader');
const { MQL5Loader } = require('./loaders/MQL5Loader');
const { MQHLoader } = require('./loaders/MQHLoader');
const { MQProjectLoader } = require('./loaders/MQProjectLoader');
const { LuaLoader } = require('./loaders/LuaLoader');
const { AssemblyLoader } = require('./loaders/AssemblyLoader');
const { CSProjectLoader } = require('./loaders/CSProjectLoader');
const { CProjectLoader } = require('./loaders/CProjectLoader');
const { ArduinoLoader } = require('./loaders/ArduinoLoader');



const fs = require('fs');
const path = require('path')

function createDatastore(datastoreName) {
    if (fs.existsSync(`datastores/${datastoreName}`)) {
        throw new Error(`Failed! Datastore already exists.`);
    }
    fs.mkdirSync(`datastores/${datastoreName}`);
    return;
}

async function listDatastore() {
    if (!fs.existsSync('datastores')) {
        return [];
    }
    fs.readdir('datastores', (err, files) => {
        if (err) {
            throw err;
        }
        return files;
    })
}

async function listDatastoreContents(datastoreName) {
    const datastorePath = `datastores/${datastoreName}`;
    if (!fs.existsSync(datastorePath)) {
        throw new Error('Failed! Datastore does not exist.');
    }
    async function readFilesRecursively(dir) {
        const filesInDir = await fs.promises.readdir(dir);
        const files = await Promise.all(filesInDir.map(async file => {
            const filePath = path.join(dir, file);
            const stat = await fs.promises.stat(filePath);
            if (stat.isDirectory()) {
                return readFilesRecursively(filePath);
            } else {
                return filePath;
            }
        }));
        return files.flat();
    }
    const files = await readFilesRecursively(datastorePath);
    const urlFiles = files.filter(file => path.basename(file) === 'urls.txt');
    const allUrlsSet = new Set();
    for (const urlFile of urlFiles) {
        const data = await fs.promises.readFile(urlFile, 'utf8');
        const urls = data.split(/\r?\n/);
        urls.forEach(url => allUrlsSet.add(url));
    }
    return { files: files.filter(file => !urlFiles.includes(file)), urls: Array.from(allUrlsSet) };
}

async function createVectorstore(name) {
    const embeddings = new HuggingFaceInferenceEmbeddings();
    vectorStore = new Chroma(embeddings, {
        collectionName: name,
        url: "http://localhost:8000",
        collectionMetadata: {
            "hnsw:space": "cosine",
        }
    });
    await vectorStore.ensureCollection();
    return vectorStore;
}

async function addDocument(vectorstore, filePath) {
    const fileType = path.extname(filePath).slice(1);
    switch (fileType) {
        case "txt":
            {
                const loader = new TextLoader(filePath);
                const docs = await loader.load();
                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 1024,
                    chunkOverlap: 50
                });
                const splitDocs = await splitter.splitDocuments(docs);
                const ids = await vectorstore.addDocuments(splitDocs);
                return ids;
            }
            break;
        case "pdf":
            {
                const loader = new PDFLoader(filePath);
                const docs = await loader.load();
                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 1024,
                    chunkOverlap: 50
                });
                const splitDocs = await splitter.splitDocuments(docs);
                const ids = await vectorstore.addDocuments(splitDocs);
                return ids;
            }
            break;
        case "docx":
            {
                const loader = new DocxLoader(filePath);
                const docs = await loader.load();
                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 1024,
                    chunkOverlap: 50
                });
                const splitDocs = await splitter.splitDocuments(docs);
                const ids = await vectorstore.addDocuments(splitDocs);
                return ids;
            }
            break;
        case "json":
            {
                const loader = new JSONLoader(filePath);
                const docs = await loader.load();
                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 1024,
                    chunkOverlap: 50
                });
                const splitDocs = await splitter.splitDocuments(docs);
                const ids = await vectorstore.addDocuments(splitDocs);
                return ids;
            }
            break;
        case "csv":
            {
                const loader = new CSVLoader(filePath);
                const docs = await loader.load();
                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 1024,
                    chunkOverlap: 50
                });
                const splitDocs = await splitter.splitDocuments(docs);
                const ids = await vectorstore.addDocuments(splitDocuments);
                return ids;
            }
            break;
    }
}

async function addDirectory(vectorstore, directoryPath) {
    const loader = new DirectoryLoader(
        directoryPath,
        {
            ".txt": (path) => new TextLoader(path),
            ".pdf": (path) => new PDFLoader(path),
            ".json": (path) => new JSONLoader(path),
            ".csv": (path) => new CSVLoader(path),
            ".docx": (path) => new CSVLoader(path),
            ".mp3": (path) => new AudioLoader(path),
            ".webm": (path) => new AudioLoader(path),
            /*
            ".html": (path) => new HTMLLoader(path),
            ".xml": (path) => new XMLLoader(path),
            ".md": (path) => new MarkdownLoader(path),
            ".js": (path) => new JSLoader(path),
            ".css": (path) => new CSSLoader(path),
            ".py": (path) => new PythonLoader(path),
            ".cpp": (path) => new CPPLoader(path),
            ".h": (path) => new CPPHeaderLoader(path),
            ".cs": (path) => new CSLoader(path),
            ".sln": (path) => new SLNLoader(path),
            ".bat": (path) => new BATLoader(path),
            ".sh": (path) => new SHLoader(path),
            ".yml": (path) => new YAMLLoader(path),
            ".cfg": (path) => new ConfigLoader(path),
            ".jsx": (path) => new JSXLoader(path),
            ".tsx": (path) => new TSXLoader(path),
            ".ts": (path) => new TSLoader(path),
            ".db": (path) => new DBLoader(path),
            ".ps1": (path) => new PS1Loader(path),
            ".java": (path) => new JavaLoader(path),
            ".gradle": (path) => new GradleLoader(path),
            ".props": (path) => new PropsLoader(path),
            ".vcxproj": (path) => new VCXProjectLoader(path),
            ".wav": (path) => new AudioLoader(path),
            ".rb": (path) => new RubyLoader(path),
            ".command": (path) => new BATLoader(path),
            ".cmake": (path) => new CMakeLoader(path),
            ".env": (path) => new EnvironmentLoader(path),
            ".php": (path) => new PHPLoader(path),
            ".conf": (path) => new ConfigLoader(path),
            ".config": (path) => new ConfigLoader(path),
            ".c": (path) => new CLoader(path),
            ".scss": (path) => new SCSSLoader(path),
            ".vbs": (path) => new VBScriptLoader(path),
            //".csc": (path) => undefined,
            ".wiki": (path) => new WikiLoader(path),
            ".info": (path) => new InfoLoader(path),
            ".ipynb": (path) => new PythonNotebookLoader(path),
            ".sql": (path) => new SQLLoader(path),
            ".resx": (path) => new ResourceLoader(path),
            ".vue": (path) => new VueLoader(path),
            ".doc": (path) => new DocxLoader(path),
            ".mq5": (path) => new MQL5Loader(path),
            ".mqh": (path) => new MQHLoader(path),
            ".mqproj": (path) => new MQProjectLoader(path),
            ".lua": (path) => new LuaLoader(path),
            ".asm": (path) => new AssemblyLoader(path),
            ".wasm": (path) => new AssemblyLoader(path),
            //".tsv": (path) => undefined,
            ".csproj": (path) => new CSProjectLoader(path),
            ".htm": (path) => new HTMLLoader(path),
            ".cproj": (path) => new CProjectLoader(path),
            ".ino": (path) => new ArduinoLoader(path)
            */
        }
    );
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1024,
        chunkOverlap: 50
    });
    const splitDocs = await splitter.splitDocuments(docs);
    const ids = await vectorstore.addDocuments(splitDocs);
    return ids;
}

async function addAudio(vectorstore, audioPath) {
    // ... Here ...
}

async function addYoutubeVideo(vectorstore, url) {
    // ... Here ...
}

async function addYoutubeChannel(vectorstore, url) {
    // ... Here ...
}

async function addWebsite(vectorstore, url) {
    // ... Here ...
}

async function addTwitterThread(vectorstore, url) {
    // ... Here ...
}

export {
    createVectorstore,
    addDocument,
    addDirectory,
    createDatastore,
    listDatastore,
    listDatastoreContents
};