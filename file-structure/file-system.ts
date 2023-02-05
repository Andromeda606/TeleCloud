import {FileSystem} from "ftp-srv";
import {createFile, deleteFile, getFile, listDir, renameFile} from "../database/file-manager";
import {createReadStream, createWriteStream, existsSync, readFileSync, statSync, writeFileSync} from "fs";
import {getClient} from "../telegram/telegram.api";
import {Directory} from "../types/file-system";
import {SendFile} from "../telegram/send-file";
import {encrypt} from "./file-encryption";
import {FileDecrypt} from "./file-decrypt";

const teledrivePath = "ftp/"
const UNIX_SEP_REGEX = /\//g;
const WIN_SEP_REGEX = /\\/g;

function randomStr(length) {
    return Buffer.from(Math.random().toString()).toString("base64").substring(10, 10 + length);
}

export class DatabaseFileSystem extends FileSystem {
    path: string = ""

    read(fileName: string, {start}: { start?: any }): Promise<any> {
        const emptyFilePath = `${teledrivePath}emptyfile.txt`;
        if (!existsSync(emptyFilePath)) {
            writeFileSync(emptyFilePath, "");
        }
        return Promise.resolve(createReadStream(emptyFilePath));
    }

    async getCode(filePath: string) {
        let splittedPath;
        splittedPath = filePath.split(UNIX_SEP_REGEX);
        if (process.platform === "win32") {
            splittedPath = filePath.split(WIN_SEP_REGEX);
        }

        const fileName = splittedPath.at(-1);
        splittedPath.pop();
        let realFilePath;
        if (process.platform === "win32") {
            realFilePath = splittedPath.join("\\") + "\\";
        }else{
            realFilePath = splittedPath.join("/") + "/";
        }
        console.log("realFilePath",realFilePath,"fileName", fileName);
        const file = await getFile(realFilePath, fileName);

        if (file === null || file === "") {
            return "";
        }
        return this.readTelegram(Number(file));
    }

    async rename(from, to) {
        console.log("RENAME", from, to)
        console.log(await renameFile(this.getPath(), from.replace(this.getPath(), ""), to.replace(this.getPath(), "")));
        return true;
    }

    resolvePath(path: string) {
        return path.replace(this.getPath(), "");
    }

    getPath() {
        if (this.path.trim() === "") {
            this.path = "/";
        }
        return this.path;
    }

    async mkdir(path: string) {
        path = path.replace(this.getPath(), "")
        const date = new Date();
        console.log(await createFile({
                name: path,
                dev: parseInt(String(Math.random() * 1000)),
                ino: parseInt(String(Math.random() * 1000)),
                mode: parseInt(String(Math.random() * 1000)),
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: 0,
                size: 0,
                blksize: parseInt(String(Math.random() * 1000)),
                blocks: 8,
                atime: date,
                mtime: date,
                ctime: date,
                birthtime: date,
                isDirectory: () => true
            },
            this.getPath(),
            ""
        ));
        return Promise.resolve(path)
    }

    write(fileName: string, {append, start}: { append?: boolean; start?: any }): any {
        const stream = createWriteStream(`${teledrivePath}${randomStr(10)}.txt`, start);
        return Promise.resolve(stream);
    }

    chdir(path) {
        //console.log("chdir aktif",path);
        this.path = path;
        return Promise.resolve(this.getPath());
    }

    async file(fileName: string): Promise<SendFile> {
        return new SendFile(fileName).sync(await getClient());
    }

    async saveBuffer(fileName, telegramId, size) {
        const date = new Date();
        console.log(await createFile({
                name: fileName,
                dev: parseInt(String(Math.random() * 1000)),
                ino: parseInt(String(Math.random() * 1000)),
                mode: parseInt(String(Math.random() * 1000)),
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: 0,
                size: Number(size),
                blksize: Number(size),
                blocks: 8,
                atime: date,
                mtime: date,
                ctime: date,
                birthtime: date,
                isDirectory: () => false
            },
            this.getPath(),
            String(telegramId)
        ));
    }

    async save(fileName, filePath: string) {
        let message;
        const size = statSync(filePath).size;
        if (size !== 0) {
            const client = await getClient();
            message = await client.sendFile("me", {
                file: new Buffer(encrypt(readFileSync(filePath))),
            });
        } else {
            message = {
                document: {
                    size: 0
                },
                id: ""
            };
        }

        const date = new Date();
        console.log(await createFile({
                name: fileName,
                dev: parseInt(String(Math.random() * 1000)),
                ino: parseInt(String(Math.random() * 1000)),
                mode: parseInt(String(Math.random() * 1000)),
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: 0,
                size: Number(message.document.size),
                blksize: Number(message.document.size),
                blocks: 8,
                atime: date,
                mtime: date,
                ctime: date,
                birthtime: date,
                isDirectory: () => false
            },
            this.getPath(),
            String(message.id)
        ));

    }

    async list() {
        //console.log("list",this.getPath());
        return Promise.resolve(await listDir(this.getPath()));
    }

    async delete(fileName: string): Promise<any> {
        return await deleteFile(this.getPath(), fileName);
    }

    async get(fileName: string) {
        fileName = this.resolvePath(fileName);
        let file: Directory | string = await getFile(this.getPath(), fileName, true);
        if (file === null || typeof file !== "string") {
            file = {
                directory: true,
                isDirectory: () => true
            };
        }

        return file;
    }

    async readTelegram(id: number) {
        if (String(id) === "") {
            return "";
        }
        const client = await getClient();
        const message = await client.getMessages("me", {
            ids: Number(id)
        });
        if (message.length === 0 || message.length === undefined || !message[0].media) {
            return [""];
        }
        //return [new Buffer(decrypt((await client.downloadMedia(message[0].media)).toString()).toString())]
        return new FileDecrypt().iter(client.iterDownload({
            file: message[0].media,
            requestSize: 512 * 1024
        }));
    }
}


