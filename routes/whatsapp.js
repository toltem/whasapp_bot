var { MessageType } = require("@adiwajshing/baileys");
const pattern = new RegExp("^[0-9]+$");
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
  const num_req = parseInt(chat.match(pattern)[0]);

  if (num_req === 1) {
    await conn.sendMessage(number, "message for 1", MessageType.text);
  } else {
    await conn.sendMessage(number, "message for 2", MessageType.text);
  }
}


