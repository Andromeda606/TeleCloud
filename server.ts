const {randomBytes, createCipheriv, createDecipheriv} = require('crypto');
const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = randomBytes(32); // or generate sample key Buffer.from('FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=', 'base64');
const IV_LENGTH = 16;
console.log(ENCRYPTION_KEY);

let iv = randomBytes(IV_LENGTH);
const iter = [];
for (let i = 0; i < 10; i++) {
    iter.push(randomBytes(15).toString('hex'))
}
console.log(iter)
let cipher = createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
let encrypted = Buffer.from("");
for (const byte of iter) {
    encrypted = Buffer.concat([Buffer.from(encrypted), cipher.update(byte)]);
}


let decipher = createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
decrypted = Buffer.concat([decrypted, decipher.final()]);
console.log(decrypted.toString());