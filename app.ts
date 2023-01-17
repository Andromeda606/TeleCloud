import {getClient} from "./telegram/telegram.api";
import * as dotenv from 'dotenv';

dotenv.config();
import {FtpSrv, FileSystem} from "ftp-srv";
import {Stat} from "./types/file-system";
import {createReadStream, createWriteStream, writeFileSync} from "fs";
import {sleep} from "telegram/Helpers";
import {createFile, getFile} from "./database/file-manager";
import {DatabaseFileSystem} from "./database/file-system";


let client;

getClient().then(clientPromise => {
    client = clientPromise;
    console.log("TeleDrive Started!");
});

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