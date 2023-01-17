import bigInt = require("big-integer");
import {Api, client, errors, TelegramClient} from "telegram";
import {UploadFileParams} from "telegram/client/uploads";
import {generateRandomBytes, readBigIntFromBuffer, sleep} from "telegram/Helpers";
import {getAppropriatedPartSize} from "telegram/Utils";
import {MTProtoSender} from "telegram/network";

const KB_TO_BYTES = 1024;
const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024;
const UPLOAD_TIMEOUT = 15 * 1000;
const DISCONNECT_SLEEP = 1000;
const BUFFER_SIZE_2GB = 2 ** 31;


export class SendFile {
    fileId: bigInt.BigInteger;
    onProgress: (progress: number) => void;
    onFinished: () => void;
    progress: number;
    parts: number;
    peer;
    client;
    fileName: string;
    size: number = 0;

    getStatus() {
        process.stdout.moveCursor(0, -1)
        process.stdout.clearLine(1);
        console.log(`Uploading ${(this.progress / this.parts)}% on ${this.fileName}`);
    }

    constructor(fileName) {
        this.fileId = readBigIntFromBuffer(generateRandomBytes(8), true, true);
        this.progress = -1;
        this.parts = -1;
        this.fileName = fileName;
    }

    async sync(client) {
        this.peer = await client.getInputEntity("me");
        this.client = client;
        return this;
    }


    async sendBuffer(bytes: Buffer) {
        this.size += Buffer.byteLength(bytes);
        this.parts += 1;
        const sender = await this.client.getSender(this.client.session.dcId);
        const fileId = this.fileId;
        const part = this.parts;
        while (true) {
            try {
                console.log(await sender.send(
                    true
                        ? new Api.upload.SaveBigFilePart({
                            fileId,
                            filePart: part,
                            fileTotalParts: 329,
                            bytes,
                        })
                        : new Api.upload.SaveFilePart({
                            fileId,
                            filePart: part,
                            bytes,
                        })
                ));
            } catch (err: any) {
                if (sender && !sender.isConnected()) {
                    await sleep(DISCONNECT_SLEEP);
                    continue;
                } else if (err instanceof errors.FloodWaitError) {
                    await sleep(err.seconds * 1000);
                    continue;
                } else if (err instanceof errors.RPCError && err.code === 400) {
                    await sleep(2 * 1000);
                    console.log(err.message);
                    this.progress += 1;
                    if (this.onProgress) {
                        this.onProgress(this.progress);
                    }
                    //this.getStatus();
                    if (this.parts === this.progress && this.onFinished) {
                        this.onFinished();
                    }
                    break;
                }
            }
            this.progress += 1;
            if (this.onProgress) {
                this.onProgress(this.progress);
            }
            //this.getStatus();
            if (this.parts === this.progress && this.onFinished) {
                this.onFinished();
            }
            break;
        }
    }

    async upload() {
        console.log("Uploading telegram... part length: ", this.parts)
        const data = true
            ? new Api.InputFileBig({
                id: this.fileId,
                parts: this.parts,
                name: this.fileName,
            })
            : new Api.InputFile({
                id: this.fileId,
                parts: this.parts + 1,
                name: "teledrive.txt", //fileName
                md5Checksum: "", // This is not a "flag", so not sure if we can make it optional.
            });

        const media = new Api.InputMediaUploadedDocument({
            file: data,
            mimeType: "text",
            attributes: [],
            thumb: data,
            forceFile: true,
        });

        const request = new Api.messages.SendMedia({
            peer: this.peer,
            media,
            replyToMsgId: undefined,
            message: "",
            entities: [this.peer],
            replyMarkup: null,
            silent: undefined,
            scheduleDate: undefined,
            clearDraft: undefined,
            noforwards: undefined,
        });
        const result = await this.client.invoke(request);
        return this.client._getResponseMessage(request, result, this.peer) as Api.Message;


    }
}