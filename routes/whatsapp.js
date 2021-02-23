var { MessageType } = require("@adiwajshing/baileys");
const pattern = new RegExp("^[0-9]+$");
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const Redis = require("ioredis");
const redis = new Redis(REDIS_URL);
const reply = require("./answers");

var hydrate = require("./hydrate");
exports.whatsapp = async (conn, req, res) => {
  try {
    if (req.body.toggle === "on") {
      res.json({
        succcess: true,
        message: `bot successfully toggled ${req.body.toggle}`,
      });
      hydrate.hydrate(conn);
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

exports.interactive_reply = async (conn, chat, number) => {
  const anwer = reply.answers();
  if (chat.toLowerCase().trim() === "back") {
    await conn.chatRead(number);
    await conn.sendMessage(number, anwer["welcome"], MessageType.text);
  } else if (chat.toLowerCase().trim() === "bola") {
    const bola = `
Thank you for contacting Bola, Please type your question below.\n 
Kindly be patient for my reply, i will be with you shortly ❤️`;

    await redis.set(`${number}`, `dont_reply`, "EX", 60 * 60 * 1);
    await conn.sendMessage(number, bola, MessageType.text);
  } else if (chat.toLowerCase().trim() === "full") {
    await redis.set(`${number}`, "dont_reply", "EX", 60 * 60 * 1);
  } else if (chat.toLowerCase().trim() === "confirm payment") {
    await conn.chatRead(number);
    await redis.set(`${number}`, "confirm", "EX", 60 * 60 * 1);
    await conn.sendMessage(number, anwer["confirm"], MessageType.text);
  } else if (chat.match(pattern)) {
    await conn.chatRead(number);
    const reply_num = anwer[`${chat}`];
    if (reply_num) {
      await conn.sendMessage(number, reply_num, MessageType.text);
    }else{
      await conn.chatRead(number);
      await conn.sendMessage(number, `Inavlid message option please use any of the follwing commands`, MessageType.text);
      await conn.sendMessage(number, anwer["welcome"], MessageType.text);  
    }
  }else{
    if(chat){
      await conn.chatRead(number);
      await conn.sendMessage(number, `Inavlid message option please use any of the follwing commands`, MessageType.text);
      await conn.sendMessage(number, anwer["welcome"], MessageType.text);
      return
    }
  }
};
