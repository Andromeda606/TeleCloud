import {getClient} from "./telegram/telegram.api";
import * as dotenv from 'dotenv';

dotenv.config();
import {FtpSrv} from "ftp-srv";
import {DatabaseFileSystem} from "./file-structure/file-system";
import {networkInterfaces} from "os";

let client;

getClient().then(clientPromise => {
    client = clientPromise;
    console.log("TeleDrive Started!");
});

const nets = networkInterfaces();
const results = [];

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            results.push(net.address);
        }
    }
}
process.env.FTP_HOST = results[0];

const ftpServer = new FtpSrv({
    url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
    pasv_url: process.env.FTP_HOST,
    anonymous: true,
});
ftpServer.on('login', ({connection, username, password}, resolve, reject) => {
    console.log("bilgi istendi", username, password);
    if (username === 'anonymous' && password === '@anonymous') {
        connection.on('RETR', (error, filePath) => {
            console.log("retr", filePath);
        });
        connection.on('STOR', async (error, filePath) => {
            console.log("stor", filePath);
        });
        return resolve({
            fs: new DatabaseFileSystem(connection, {
                root: "ftp", cwd: "/"
            }), root: "ftp"
        });
    }
    return reject(Error('Invalid username or password'));
});

ftpServer.listen().then(() => {
    console.log('Ftp server is starting...')
});