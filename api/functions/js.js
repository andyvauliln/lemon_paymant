import { json } from 'stream/consumers';

const axios = require('axios');
const base64 = require('base-64');

const githubToken = process.env.GITHUB_TOKEN
const repoOwner = 'andyvauliln'; // Replace with the repository owner's username
const repoName = 'lemon_paymant'; // Replace with the repository name
const filePath = 'api/new/js.js';

const jsCode = `
export default function handler(req, res) {
    res.end('ok');
}
`;


export default async function handler(req, res) {
    let str = "ok"
    try {
        await commitFileToGithub(str);
        res.end(str)
    } catch (error) {
        res.end(error)
    }
}

async function commitFileToGithub(str) {
    try {
        const response = await axios({
            method: 'put',
            url: `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
            headers: {
                Authorization: `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                message: 'Created new file via API',
                content: base64.encode(fileContent)
            }
        });
        str += JSON.stringify(response.data)
        console.log(response.data);
    } catch (error) {
        str += JSON.stringify(response.data)
        console.error(error);
    }
}