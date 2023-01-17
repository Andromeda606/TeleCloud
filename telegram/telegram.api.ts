import * as dotenv from 'dotenv';

dotenv.config();
import {TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
import input from "input";
import {readFileSync} from "fs";

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const session = readFileSync("telegram/session.txt").toString();

if (session.trim() === "") {

}
const stringSession = new StringSession(session.trim());
let client;
export async function getClient(): Promise<TelegramClient> {
    if(client !== undefined){
        return client;
    }
    client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    console.log(await client.start({
        phoneNumber: async () => process.env.PHONE_NUMBER,
        password: async () => process.env.PASSWORD,
        phoneCode: async () =>
            await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    }));
    return client;
}

