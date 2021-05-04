// server.js

import { Server } from "https://js.sabae.cc/Server.js"

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
          const submissionData = {
            "source": prm.source,
            "language": prm.language,
            "problem": prm.problem,
            "status": 0,
            "internalId": 0,
            "subDate": new Date(),
            "score": prm.score,
            "judges": [],
            "internalStatus": false
          }
          if (prm.score != null) submissionData.score = prm.score;
          let nextSubId = 1;
          for await (const _i of Deno.readDir("submits")) nextSubId++;
          const fileName = "sub" + ("00000000" + nextSubId).slice(-8) + ".json";
          Deno.writeTextFile("./submits/" + fileName, JSON.stringify(submissionData));
          retobj = fileName;
        } else if (path.split("/")[3] == "search") {
          retobj = await Deno.readTextFile("./submits/" + prm.subid);
        } else if (path.split("/")[3] == "startJudge") {
          const subFileText = await Deno.readTextFile("./submits/" + prm.subid);
          let subFile = JSON.parse(subFileText);
          subFile.status = -1;
          Deno.writeTextFile("./submits/" + prm.subid, JSON.stringify(subFile));
        } else if (path.split("/")[3] == "runJudge") {
          // 提出ファイルの取得
          const subFileText = await Deno.readTextFile("./submits/" + prm.subid);
          let subFile = JSON.parse(subFileText);
          // 提出ファイルの内部状態を書き換える
          subFile.internalStatus = true;
          Deno.writeTextFile("./submits/" + prm.subid, JSON.stringify(subFile));
          // 問題ファイルの取得
          const problemFileText = await Deno.readTextFile("./Problems/" + subFile.problem);
          const problemFile = JSON.parse(problemFileText);
          // テストケースの取得
          const testcaseFileText = await Deno.readTextFile("./Testcases/" + subFile.problem);
          const testcaseFile = JSON.parse(testcaseFileText);
          const response = await fetch(
            "http://api.paiza.io:80/runners/create",
            {
              method: "POST",
              mode: "cors",
              cache: "no-cache",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
              },
              redirect: "follow",
              referrerPolicy: "no-referrer",
              body: JSON.stringify({
                source_code: subFile.source,
                language: subFile.language,
                input: "hoge",
                longpoll: true,
                longpoll_timeout: problemFile.timeLimit,
                api_key: "guest",
              }),
            }
          );
          // IE処理
          if (response.status / 100 != 2) subFile.status = -7369;
          // 内部ID付加
          subFile.internalId = response.json().id;
          Deno.writeTextFile("./submits/" + prm.subid, JSON.stringify(subFile));
        } else if (path.split("/")[3] == "getJudgeStatus") {
          // 提出ファイルの取得
          const subFileText = await Deno.readTextFile("./submits/" + prm.subid);
          let subFile = JSON.parse(subFileText);
          // 提出内部ID
          const subInternalId = subFile.internalId;
          // get_status
          const currentStatus = await fetch(
            "http://api.paiza.io:80/runners/get_status",
            {
              id: subInternalId,
              api_key: "guest"
            }
          );
          if (currentStatus.json().stats == null){
            // error
            if(currentStatus.json().error.startsWith("longpoll")){
              // TLE
              subFile.status = -8476;
            }else{
              // それ以外の条件が不明なので
              subFile.status = -7776;
            }
          } else if (currentStatus.json().status == "completed") {
            // 結果の解析
            const detail = await fetch(
              "http://api.paiza.io:80/runners/get_details",
              {
                id: subInternalId,
                api_key: "guest"
              }
            );
            if(detail.json().build_result == "failure"){
              // CE
              subFile.status = -6769;
            }else{
              // RE
              if(detail.json().result == "failure"){
                subFile.status = -8269;
              }else{
                // WA判定
                const problemFile
              }
            }
            // ジャッジ未実行へ、テストデータ+1
            subFile.internalStatus = true;
            subFile.status++;
            Deno.writeTextFile("./submits/" + prm.subid, JSON.stringify(subFile));
          }
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

      default:
        break;
    }
    return retobj;
  }
}

new body(468);