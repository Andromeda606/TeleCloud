
const date = new Date();
// Mon, 10 Oct 2011 23:24:11 GMT
console.log(date.getDate())
console.log(date.getMonth() + 1)
console.log(date.getUTCFullYear())
const {statSync} = require("node:fs");
console.log(date.toLocaleTimeString("tr-TR"))
console.log(date.toLocaleDateString("tr-TR"))
console.log(date.toISOString())
console.log(statSync("app.ts"));