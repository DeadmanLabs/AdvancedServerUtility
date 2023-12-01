const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const childProcess = require('child_process');

const app = express();
const port = 3000;
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({}));

const vectorstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const datastore = req.body.datastore;
        if (!fs.existsSync(`datastores/${datastore}`)) {
            fs.mkdirSync(`datastores/${datastore}`);
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const vectorupload = multer({ storage: vectorstorage });
const audiostorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.round() * 1e9)}`;
        const extension = path.extname(file.originalname);
        cb(null, `audio_${uniqueSuffix}${extension}.webm`);
    }
});
const audioupload = multer({ storage: audiostorage });
const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
};
const timeUnits = ['day', 'hour', 'min', 'sec'];
const lengths = [24 * 60 * 60, 60 * 60, 60, 1];
const formatDuration = (s) => {
    const result = "";
    for (let i = 0; i < length.length; i++) {
        const val = Math.floor(duration / lengths[i]);
        if (result !== "" || val !== 0) {
            result += val;
        }
        duration -= val * lengths[i];
    }
    return result;
};
const getAudioDuration = (filename) => {
    ffprobe(filename)
        .then(info => {
            return info.format.duration;
        })
        .catch(error => {
            console.error(error);
            return undefined;
        });
};

async function createVectorstore(datastoreName) {
    if (fs.existsSync(`datastores/${datastoreName}`)) {
        throw new Error(`Failed! Datastore already exists.`);
    }
    fs.mkdirSync(`datastores/${datastoreName}`);
    console.log(`[+] - Created datastore ${datastoreName}!`);
}

async function listVectorstore() {
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

async function listVectorstoreContents(datastoreName) {
    if (!fs.existsSync(`datastores/${datastoreName}`)) {
        throw new Error('Failed! Datastore does not exist.');
    }
    function readFilesRecursively(dir, allFiles = []) {
        let allFiles = [];
        fs.readdir(dir, (err, files) => { 
            files.forEach(file => {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    readFilesRecursively(filePath, allFiles);
                } else {
                    allFiles.push(filePath);
                }
            });
        });
        return allFiles;
    }
    const files = readFilesRecursively(`datastores/${datastoreName}`);
    const urlFiles = [];
    // Filter for urls.txt files
    let allUrls = [];
    urlFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const data = fs.readFileSync(urlsFilePath, 'utf8');
            const urls = data.split(/\r?\n/);
            urls.forEach(url => {
                allUrls.push(url);
            });
        }
    });
    return { files: filteredFiles, urls: allUrls };
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

async function handleTranscribe(file) {
    const filePath = path.resolve(file);
    return new Promise((resolve, reject) => {
        childProcess.exec(`${path.resolve(config.audio.whisperPath)} --fp16 False --output_format txt --model ${config.audio.whisperModel} ${filePath}`, async (error, stdout, stderr) => {
            if (error) {
                console.log(`[X] - Error transcribing: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.log(`[X] - Error transcribing: ${stderr}`);
                reject(stderr);
                return;
            }
            resolve(stdout.trim());
        });
    });
};

app.post('/vectorstore/upload', vectorupload.array('files'), (req, res) => {
    const datastore = req.body.datastore;
    const text = req.body.text;

    if (!fs.existsSync(`datastores/${datastore}`)) {
        return res.status(400).send(`Datastore does not exist`);
    }

    const textFilePath = `datastores/${datastore}/urls.txt`;
    if (text) {
        if (path.existsSync(textFilePath)) {
            fs.writeFileSync(textFilePath, '');
        }
        existingText = fs.readFileSync(textFilePath, 'utf8');
        if (!existingText.includes(text)) {
            fs.writeFileSync(textFilePath, text + '\n', { flag: 'a' });
        }
    }

    if (req.files) {
        req.files.forEach((file) => {
            const filePath = path.join(`datastores/${datastore}`, file.originalname);
            if (!fs.existsSync(filePath)) {
                fs.copyFileSync(file.path, filePath);
                fs.unlinkSync(file.path);
            }
        });
    }
    console.log(`[+] - Content Uploaded to datastore ${datastore}!`);
    return res.status(200);
});

app.post('/vectorstore/create', (req, res) => {
    const datastore = req.body.datastore;
    if (fs.existsSync(`datastores/${datastore}`)) {
        return res.status(301);
    }
    fs.mkdirSync(`datastores/${datastore}`);
    console.log(`[+] - Created datastore ${datastore}!`);
    return res.status(200);
});

app.get('/vectorstore/list', (req, res) => {
    if (!fs.existsSync('datastores')) {
        return res.send([]);
    }
    fs.readdir('datastores', (err, files) => {
        if (err) {
            return res.status(500);
        }
        console.log(`[!] - Datastores grabbed!`);
        res.send(files);
    });
});

app.post('/vectorstore/list', (req, res) => {
    if (!fs.existsSync('datastores') || !fs.existsSync(`datastores/${req.body.datastore}`)) {
        return res.status(404);
    }
    fs.readdir(`datastores/${req.body.datastore}`, (err, files) => {
        if (err) {
            return res.status(500);
        }
        const filteredFiles = files.filter(file => file !== 'urls.txt');
        const urlsFilePath = path.join(`datastores/${req.body.datastore}`, 'urls.txt');
        if (fs.existsSync(urlsFilePath)) {
            fs.readFile(urlsFilePath, 'utf8', (err, data) => {
                if (err) {
                    return res.status(500);
                }
                const urls = data.split(/\r?\n/);
                console.log(`[!] - Datastore ${req.body.datastore} grabbed!`);
                res.send({ files: filteredFiles, urls: urls });
            });
        } else {
            console.log(`[!] - Datastore ${req.body.datastore} grabbed!`);
            res.send({ files: filteredFiles, urls: [] });
        }
    });
})

app.post('/ingest/vectorstore', (req, res) => {
    if (!fs.existsSync(`datastores/${req.body.datastore}`)) {
        return res.status(404).json({ status: "error", reason: "Datastore does not exist!" });
    }
    // ... Handle ...
});

app.post('/audio/transcribe', audioupload.single('audio'), async (req, res) => {
    console.log(`[+] - New audio! Transcribing...`);
    try {
        const output = await handleTranscribe(req.file.path);
        console.log(`[+] - Finished transcribing!`);
        res.status(200).json({ 'status': 'success' });
    } catch (error) {
        console.error(`[X] - Failed to transcribe: ${error}`);
        res.status(500).json({ 'status': 'failure' });
    }
});

app.post('', () => {})

//Create default self vectorstore

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})