import {createQuestion, getPrivateIpAddress, getPublicIpAddress, range} from "./helper";


console.log("TeleDrive Setup");

console.log("Select IP address");
(async () => {

    let address = await createQuestion(`
[1] Localhost (Only working local device)
[2] Private Host (Only working private network. Same modem or router etc.)
[3] Internet (Access with everyting I dont recomment.)
`, ["1", "2", "3"]);
    let ip: string;
    switch (address) {
        case "1":
            ip = "127.0.0.1";
            break;
        case "2":
            const ipArr: string[] = getPrivateIpAddress();
            if (ipArr.length > 1) {
                const rangeArr = range(ipArr.length);
                let builder = "Select Private IP Address\n";
                for (const i of rangeArr) {
                    builder += `[${i}] ${ipArr[i - 1]}\n`;
                }
                address = "2_" + await createQuestion(builder, rangeArr);

            } else {
                ip = ipArr[0];
            }
            break;
        case "3":
            ip = await getPublicIpAddress();
            if (ip === "1") {
                console.log("Not found ip address. Used localhost.");
                ip = "127.0.0.1";
            }
            break;
    }
    console.log("Server ip address is:", ip);
    console.log("");


})();