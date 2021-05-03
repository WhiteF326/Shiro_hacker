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
            "score": prm.score
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
          // ジャッジ開始
          subFile.status = -1;
          Deno.writeTextFile("./submits/" + prm.subid, JSON.stringify(subFile));
        } else if (path.split("/")[3] == "waitJudge") {
          //
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