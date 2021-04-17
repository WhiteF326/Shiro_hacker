const fs = require("fs");
let writeobj = JSON.parse(fs.readFileSync("..\\Testcases\\0003.json"));

for(let i = 1; i <= 100; i++){
    writeobj.push(
        {"input": i,
        "output": i * 206}
    );
}
fs.writeFileSync("..\\Testcases\\0003.json", JSON.stringify(writeobj));