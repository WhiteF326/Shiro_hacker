// server.js

import { Server } from "https://js.sabae.cc/Server.js"
import { fetchJSON } from "https://js.sabae.cc/fetchJSON.js";

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
        const submissionData = {
          "source": prm.source,
          "language": prm.language,
          "status": 0
        }
        let nextSubId = 1;
        for await (const i of Deno.readDir("submits")) nextSubId++;
        const fileName = "sub" + ("00000000" + nextSubId).slice(-8) + ".json";
        Deno.writeTextFile("./submits/" + fileName, JSON.stringify(submissionData));
        retobj = fileName;
        break;

      // 実行
      case "languages":
        retobj = await Deno.readTextFile("./static/materials/languages.json");
        break;

      default:
        break;
    }
    return retobj;
  }
}

new body(468);