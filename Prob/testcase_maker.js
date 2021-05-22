const fs = require("fs");
let writeobj = [];

for (let v = 1; v <= 40; v++) {
    let i = Math.min(Math.floor(Math.random() * v) + 1, 50);
    let j = Math.min(Math.floor(Math.random() * v * 5 + v) + 1, 234);
    if (i > j) {
        let tmp = i; i = j; j = tmp;
    } else if (i == j) {
        j = ((j + Math.floor(Math.random() * 233) + 1) % 234);
        if (i > j) {
            let tmp = i; i = j; j = tmp;
        }
    }

    let ans = [];
    for (let a = j; a >= i; a--) {
        for (let b = j; b >= i; b--) {
            for (let c = j; c >= i; c--) {
                if(a != b && b != c && a != c){
                    if (468 % (a * b * c) == 0 || (a * b * c) % 468 == 0) {
                        ans[0] = a;
                        ans[1] = b;
                        ans[2] = c;
                    }
                }
            }
        }
    }

    let d = "";

    if(!ans.length){
        d = "Not Found\n";
    }else{
        d = ans[0] + " " + ans[1] + " " + ans[2];
    }

    writeobj.push(
        {
            "input": (i + " " + j),
            "output": d
        }
    );
}
fs.writeFileSync("..\\Testcases\\0006.json", JSON.stringify(writeobj));