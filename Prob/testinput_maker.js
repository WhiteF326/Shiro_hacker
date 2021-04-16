const fs = require("fs");
let writeobj = [];

for(let i = 1; i <= 100; i++){
    writeobj.push(
        {"input": i,
        "output": i * 206}
    );
}
fs.writeFileSync("..\\Testcases\\0002.json", JSON.stringify(writeobj));