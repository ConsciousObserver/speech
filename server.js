const fs = require('fs');
const key = fs.readFileSync('./ssl-certs/key.pem');
const cert = fs.readFileSync('./ssl-certs/cert.pem');
const https = require('https');

const express = require('express');
const app = express();

app.use(express.static('public'))

const server = https.createServer({key: key, cert: cert }, app);

server.listen(3000, () => { console.log('Server started on https://localhost:3000') });