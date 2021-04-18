// server.js

import {Server} from "https://js.sabae.cc/Server.js"

class body extends Server{
  async api(path, prm){
    let retobj = null;
    switch(path.split("/")[2]){
      case "":
        break;

      case "contests":
        if(path.split("/")[3] == "list"){
          retobj = [];
          for await(const dirEntry of Deno.readDir("Contests")){
            retobj.push(dirEntry);
          }
        }else if(path.split("/")[3] == "search"){
          retobj = await Deno.readTextFile("./Contests/" + prm.name);
        }
        break;

      default:
        break;
    }
    return retobj;
  }
}

new body(468);