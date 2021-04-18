const fs = require("fs");
let writeobj = [];

for(let i = 1; i <= 30; i++){
    let n = Math.floor(Math.random() * 400);        //ここ素数
    let a = Math.min(Math.floor(Math.random() * n * 400), 4000000);
    let b = Math.min(Math.floor(Math.random() * n * 400), 4000000);
    let c = Math.min(Math.floor(Math.random() * n * 400), 4000000);

    let ans = 0;
    for(let i = 1; i <= a; i++){
        for(let j = 1; j <= b; j++){
            for(let k = 1; k <= c; k++){
                if(i * j * k % 18 == 0) ans++;
            }
        }
    }

    let e = a + " " + b + " " + c + "\n" + n;
    
    writeobj.push(
        {"input": e,
        "output": ans}
    );
}
fs.writeFileSync("..\\Testcases\\0004.json", JSON.stringify(writeobj));