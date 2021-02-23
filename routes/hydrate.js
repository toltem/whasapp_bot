const Redis = require("ioredis");
const redis = new Redis();
var wa_interact = require("./whatsapp");
const pattern = new RegExp("^[0-9]+$");
var { MessageType } = require("@adiwajshing/baileys");
const reply = require("./answers");

exports.hydrate = async (conn) => {
  try {
    console.log("oh hello " + conn.user.name + "! You connected");
    conn.on("chat-update", async (msg) => {
      //avoid sending messages to group chat status, self or broadcast or none clients
      let clients = await redis.get("clients");
      let old_customers = await redis.get("old_customers");
      let new_customers = await redis.get("new_customers");

      if (clients !== null) {
        let list = clients.split("|");
        if (list.includes(msg.jid)) {
          return;
        }
      }

      if (
        msg.jid.includes("@g.us") ||
        msg.jid.includes("status") ||
        msg.jid === conn.user.jid ||
        msg.jid.includes("broadcast")
      ) {
        //do nothing
      } else {
        if (msg.messages!==undefined) {
          const state = await redis.get(`${msg.jid}`);
          const msg_history = await conn.loadMessages(msg.jid, 10);
          const anwer = reply.answers();

          //if state is null and has chat history
          if (state === null && msg_history.messages.length > 1) {
            //mark message as read
            await conn.chatRead(msg.jid);
            await redis.set(`${msg.jid}`, "welcome", "EX", 60 * 60 * 24);
            await conn.sendMessage(msg.jid, old_customers+`\n\n${anwer["welcome"]}`, MessageType.text);
            return
          } else if (state === null && msg_history.messages.length < 2) {
            //mark message as read
            await conn.chatRead(msg.jid);
            await redis.set(`${msg.jid}`, "welcome", "EX", 60 * 60 * 24);
            await conn.sendMessage(msg.jid, new_customers+`\n\n${anwer["welcome"]}`, MessageType.text);
            return
          } else if (state === "welcome") {
            //get converstion
            let chat = msg.messages.array[0].message.conversation;
            if (
              chat.match(pattern) ||
              chat.toLowerCase().trim() === "bola" ||
              chat.toLowerCase().trim() === "back" ||
              chat.toLowerCase().trim() === "full"
            ) {
              wa_interact.interactive_reply(conn, chat, msg.jid);
            }
            return
          } else if (state === "dont_reply") {
            return
          } else {
            await conn.chatRead(msg.jid);
            return
          }
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
};
