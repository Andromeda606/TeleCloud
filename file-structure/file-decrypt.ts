import {createDecipheriv} from "crypto";

const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = Buffer.from(process.env.AES_KEY);
const IV = Buffer.from(process.env.AES_IV);
const ENCRYPTION = process.env.ENCRYPTION;

export class FileDecrypt {
    decipher;

    constructor() {
        this.decipher = createDecipheriv(algorithm, ENCRYPTION_KEY, IV);
    }

    async* iter(iter) {
        for await (const chunk of iter) {
            console.log("chunk telegram", chunk.length);
            yield this.add(chunk.toString());
        }
        yield this.end();
    }

    add(data: string) {
        // @ts-ignore
        return this.decipher.update(Buffer.from(data, ENCRYPTION)); //.toString("binary");
    }

    end(): Buffer {
        return this.decipher.final(ENCRYPTION);
    }
}