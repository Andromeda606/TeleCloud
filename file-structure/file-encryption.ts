import {createCipheriv, createDecipheriv, scryptSync} from "crypto";

const ENCRYPTION_KEY = Buffer.from(process.env.AES_KEY);
const IV = Buffer.from(process.env.AES_IV);
const ALGORITHM = "aes-256-ctr";
const ENCRYPTION = process.env.ENCRYPTION;

export function encrypt(data) {
    const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
    // @ts-ignore
    let encrypted = cipher.update(data, 'utf8', ENCRYPTION);
    // @ts-ignore
    encrypted += cipher.final(ENCRYPTION);
    return encrypted;
}

