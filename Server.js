// server.js

import { Server } from "https://js.sabae.cc/Server.js"

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  // return response.json();
  return response;
}

async function getData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  // return response.json();
  return response;
}

class body extends Server {
  async api(path, prm) {
    let retobj = null;
    switch (path.split("/")[2]) {
      case "":
        break;

      // コンテスト情報の取得
      case "contests":
        if (path.split("/")[3] == "list") {
          retobj = [];
          for await (const dirEntry of Deno.readDir("Contests")) {
            retobj.push(dirEntry);
          }
        } else if (path.split("/")[3] == "search") {
          retobj = await Deno.readTextFile("./Contests/" + prm.name);
        }
        break;

      // 問題情報の取得
      case "problems":
        if (path.split("/")[3] == "list") {
          retobj = [];
          for await (const dirEntry of Deno.readDir("Problems")) {
            retobj.push(dirEntry);
          }
        } else if (path.split("/")[3] == "search") {
          retobj = await Deno.readTextFile("./Problems/" + prm.name);
        }
        break;

      // 提出
      case "submission":
        if (path.split("/")[3] == "write") {
          // テストケースの取得
          const testcaseFileText = await Deno.readTextFile("./Testcases/" + prm.problem);
          const testcaseFile = JSON.parse(testcaseFileText);
          // 登録データの作成
          const submissionData = {
            "source": prm.source,
            "language": prm.language,
            "problem": prm.problem,
            "status": 0,
            "subDate": new Date(),
            "score": prm.score,
            "judges": [],
            "forcedExit": false,
          }
          // 待ちジャッジを設定
          testcaseFile.forEach(testcase => {
            submissionData.judges.push({
              "internalId": "",
              "input": testcase.input,
              "expected": testcase.output,
              "output": "",
              "resultText": "",
              "isFinished": false
            });
          });
          if (prm.score != null) submissionData.score = prm.score;
          let nextSubId = 1;
          for await (const _i of Deno.readDir("submits")) nextSubId++;
          const fileName = "sub" + ("00000000" + nextSubId).slice(-8) + ".json";
          await Deno.writeTextFile("./submits/" + fileName, JSON.stringify(submissionData));
          retobj = fileName;
        } else if (path.split("/")[3] == "search") {
          retobj = await Deno.readTextFile("./submits/" + prm.subid);
        } else if (path.split("/")[3] == "startJudge") {
          // ジャッジ開始
          const subFileText = await Deno.readTextFile("./submits/" + prm.subid);
          let subFile = JSON.parse(subFileText);
          subFile.status = -1;
          await Deno.writeTextFile("./submits/" + prm.subid, JSON.stringify(subFile));
        } else if (path.split("/")[3] == "runJudge") {
          // 提出ファイルの取得
          const subFileText = await Deno.readTextFile("./submits/" + prm.subid);
          let subFile = JSON.parse(subFileText);
          // 問題ファイルの取得
          const problemFileText = await Deno.readTextFile("./Problems/" + subFile.problem);
          const problemFile = JSON.parse(problemFileText);
          // テストケースの取得
          const testcaseFileText = await Deno.readTextFile("./Testcases/" + subFile.problem);
          const testcaseFile = JSON.parse(testcaseFileText);
          // 実行していないテストがある？
          if (subFile.judges.map(r => r.internalId).includes("")) {
            // そのテストケースを実行する
            const targetJudge = subFile.judges.map(r => r.internalId).findIndex(x => x === "");
            const response = await postData(
              "http://api.paiza.io:80/runners/create",
              {
                source_code: subFile.source,
                language: subFile.language,
                input: String(subFile.judges[targetJudge].input),
                api_key: "guest",
              }
            );
            const responseJSON = await response.json();
            subFile.judges[targetJudge].internalId = responseJSON.id;
            await Deno.writeTextFile("./submits/" + prm.subid, JSON.stringify(subFile));
          }
          // 終了していないテストがある？
          let res_no = 0;
          if (subFile.judges.map(r => r.isFinished).includes(false)) {
            // そのテストケースの状態を確認
            const targetJudge = subFile.judges.map(r => r.isFinished).findIndex(x => x == false);
            res_no = targetJudge;
            if (subFile.judges[targetJudge].internalId == "") return [res_no, subFile.judges.length];
            const currentStatus = await getData(
              "http://api.paiza.io:80/runners/get_status",
              {
                id: subFile.judges[targetJudge].internalId,
                api_key: "guest"
              }
            );
            const currentStatusJSON = await currentStatus.json();
            if (currentStatusJSON.status == null) {
              subFile.judges[targetJudge].isFinished = true;
              // error
              if (currentStatusJSON.error.startsWith("longpoll")) {
                // TLE
                subFile.judges[targetJudge].resultText = "TLE";
              } else {
                // それ以外の条件が不明なので
                subFile.judges[targetJudge].resultText = "MLE";
              }
            } else if (currentStatusJSON.status == "completed") {
              subFile.judges[targetJudge].isFinished = true;
              // 結果の解析
              const detail = await getData(
                "http://api.paiza.io:80/runners/get_details",
                {
                  id: subFile.judges[targetJudge].internalId,
                  api_key: "guest"
                }
              );
              const detailJSON = await detail.json();
              console.log("detail " + JSON.stringify(detailJSON));
              if (detailJSON.build_result == "failure") {
                // CE
                subFile.judges[targetJudge].resultText = "CE";
                subFile.judges[targetJudge].output = detailJSON.build_stderr;
              } else {
                // RE
                if (detailJSON.result == "failure") {
                  subFile.judges[targetJudge].resultText = "RE";
                  subFile.judges[targetJudge].output = detailJSON.stderr;
                } else {
                  subFile.judges[targetJudge].output = detailJSON.stdout;
                  // WA判定
                  // 特殊ジャッジではない？
                  if (problemFile.codeJudge) {
                    // 特殊ジャッジ
                    const p = await Deno.run({
                      cmd: ["py", "./Judge/" + subFile.problem.split(".")[0] + "/runner.py"],
                      stdin: "piped",
                      stdout: "piped",
                    });
                    await p.stdin.write(new TextEncoder().encode(
                      subFile.judges[targetJudge].input + "\n" +
                      subFile.judges[targetJudge].expected + "\n" +
                      detailJSON.stdout + "\n"
                    ));
                    await p.stdin.close();
                    const { code } = await p.status();
                    if (code == 0){
                      const rawOutput = await p.output();
                      const check = new TextDecoder().decode(rawOutput);
                      if(check == "AC\r\n"){
                        subFile.judges[targetJudge].resultText = "AC";
                      }else{
                        subFile.judges[targetJudge].resultText = "WA";
                      }
                    }
                  } else if (detailJSON.stdout != (subFile.judges[targetJudge].expected + "\n")) {
                    // 通常ジャッジ WA
                    subFile.judges[targetJudge].resultText = "WA";
                  } else {
                    // 通常ジャッジ AC
                    subFile.judges[targetJudge].resultText = "AC";
                  }
                }
              }
            }
          } else {
            // テスト終了
            console.log("____________STR " + String(subFile.status) + " " + testcaseFile.length);
            if (subFile.judges.filter(r => r.resultText == "IE").length > 1) {
              // IE
              subFile.status = -7369;
            } else if (subFile.judges.filter(r => r.resultText == "CE").length > 1) {
              // CE
              subFile.status = -6769;
            } else if (subFile.judges.filter(r => r.resultText == "WA").length > 1) {
              // WA
              subFile.status = -8765;
            } else if (subFile.judges.filter(r => r.resultText == "RE").length > 1) {
              // RE
              subFile.status = -8269;
            } else if (subFile.judges.filter(r => r.resultText == "MLE").length > 1) {
              // MLE
              subFile.status = -7776;
            } else if (subFile.judges.filter(r => r.resultText == "TLE").length > 1) {
              // TLE
              subFile.status = -8476;
            } else if (subFile.judges.filter(r => r.resultText == "OLE").length > 1) {
              // OLE
              subFile.status = -7976;
            } else {
              // AC
              subFile.status = 6567;
            }
          }
          await Deno.writeTextFile("./submits/" + prm.subid, JSON.stringify(subFile));
          retobj = [res_no, subFile.judges.length];
        }
        break;

      // 言語一覧
      case "languages":
        if (path.split("/")[3] == "list") {
          retobj = await Deno.readTextFile("./Inside/languages.json");
        } else if (path.split("/")[3] == "getName") {
          const languageListText = await Deno.readTextFile("./Inside/languages.json");
          const languageList = JSON.parse(languageListText);
          const langName = languageList.find(r => r.id == prm.languageId).name;
          retobj = langName;
        }
        break;

      case "user":
        if (path.split("/")[3] == "register") {
          const userListText = await Deno.readTextFile("./Users/User.json");
          const userList = JSON.parse(userListText);
          if(userList.map(r => r.username).includes(prm.id)){
            retobj = false;
          }else{
            userList.push(
              {
                "username": prm.id,
                "password": prm.pass,
                "rate": 0,
                "subs": []
              }
            );
            await Deno.writeTextFile("./Users/User.json", JSON.stringify(userList));
            retobj = true;
          }
        } else if (path.split("/")[3] == "search") {
          const userListText = await Deno.readTextFile("./Users/User.json");
          const userList = JSON.parse(userListText);
          if(userList.find(r => r.username == prm.id)){
            // passは一致するか？
            if(userList.find(r => r.username == prm.id).password == prm.pass){
              // 
            }
          }
        }
        break;

      default:
        break;
    }
    return retobj;
  }
}

new body(468);
