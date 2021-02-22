var { MessageType } = require("@adiwajshing/baileys");
const pattern = new RegExp("^[0-9]+$");
const fs =require("fs")
const Redis = require("ioredis");
const redis = new Redis();


var hydrate=require("./hydrate")
exports.whatsapp = async (conn, req, res) => {
  try {
    if (req.body.toggle === "on") {
      res.json({
        succcess: true,
        message: `bot successfully toggled ${req.body.toggle}`,
      });
      hydrate.hydrate(conn)
    } else if (req.body.toggle === "off") {
      res.json({
        succcess: true,
        message: `bot successfully toggled ${req.body.toggle}`,
      });
      conn.on("chat-update", async (msg) => {
        //do nothing
      });
    } else {
      res.json({
        succcess: false,
        message: "Invalid input request",
      });
    }
  } catch (e) {
    return res.json({
      succcess: false,
      message: "error togggling bot. Please scan qr code again",
    });
  }
};

exports.interactive_reply=async(conn, chat, number)=> {
  let answers=JSON.parse(fs.readFileSync("answers.json",  { encoding: 'utf-8' }))
  if(chat.toLowerCase().trim()==="back"){
    await conn.chatRead(number);
    await conn.sendMessage(number, "These are the optios again", MessageType.text)
  }else if(chat.toLowerCase().trim()==="bola"){
    await redis.set(`${number}`, "dont_reply", "EX", 60 * 60 * 24);
    await conn.sendMessage(number, "Bola would be right with you", MessageType.text)
  }else if(chat.toLowerCase().trim()==="full"){
    await redis.set(`${number}`, "dont_reply", "EX", 60 * 60 * 24);
  }else if(chat.match(pattern)){
    await conn.chatRead(number);
    await conn.sendMessage(number, "get response from answer", MessageType.text)

  }
}


