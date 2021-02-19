const Redis = require("ioredis");
const redis = new Redis();
var wa_interact = require("./whatsapp");
const pattern = new RegExp("^[0-9]+$");

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
        const state = await redis.get(`${msg.jid}`);
        const msg_history = await conn.loadMessages(msg.jid, 10);
        if (msg.messages) {
          //mark message as read
          await conn.chatRead(msg.jid);
        }
        //if state is null and has chat history
        if (state === null && msg_history.messages.length > 1) {
          await redis.set(`${msg.jid}`, "welcome", "EX", 60 * 60 * 24);
          await conn.sendMessage(msg.jid, old_customers, MessageType.text);
        } else if (state === null && msg_history.messages.length < 2) {
          await redis.set(`${msg.jid}`, "welcome", "EX", 60 * 60 * 24);
          await conn.sendMessage(msg.jid, new_customers, MessageType.text);
        } else {
          if (msg.messages) {
            //get converstion
            let chat = msg.messages.array[0].message.conversation;
            if (chat.match(pattern)) {
              wa_interact.interactive_reply(conn, chat, msg.jid);
            } else {
              //do nothing
            }
          }
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
};
