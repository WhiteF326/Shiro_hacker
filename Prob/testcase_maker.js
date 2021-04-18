const fs = require("fs");
let writeobj = [];

for(let i = 1; i <= 30; i++){
    let a = Math.floor(Math.random() * 400);
    let b = Math.floor(Math.random() * 400);
    let c = Math.floor(Math.random() * 400);

    let ans = 0;
    for(let i = 1; i <= a; i++){
        for(let j = 1; j <= b; j++){
            for(let k = 1; k <= c; k++){
                if(i * j * k % 18 == 0) ans++;
            }
        }
    }

    let e = a + " " + b + " " + c;
    
    writeobj.push(
        {"input": e,
        "output": ans}
    );
}
fs.writeFileSync("..\\Testcases\\0004.json", JSON.stringify(writeobj));