import {createInterface} from "readline/promises";
import {networkInterfaces} from 'os';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

export function getPrivateIpAddress(): string[] {
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
    return results;

}

export async function getPublicIpAddress(): Promise<string> {
    try {
        const res = await fetch("https://ipinfo.io/json");
        const resJson: {
            ip: string
        } = await res.json();
        return resJson.ip;
    } catch (e) {
        return "1";
    }

}

export async function createQuestion(question: string, params: string[]) {
    while (true) {
        const answer = (await rl.question(question)).trim();
        if (params.includes(answer)) {
            return answer;
        } else {
            console.log("Try Again");
        }
    }
}

export function range(stop) {
    const arr = [];
    for (let i = 1; i <= stop; i++) {
        arr.push(i);
    }
    return arr;
}
