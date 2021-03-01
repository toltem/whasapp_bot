var { WAConnection, MessageType } = require("@adiwajshing/baileys");
const Redis = require("ioredis");
const redis = new Redis();
run()

async function run(){
        const conn = new WAConnection();
   
        let auth=await redis.get("auth")
        conn.loadAuthInfo(JSON.parse(auth));
        
        await conn.connect();
        console.log( conn.user);
        // conn.on("chat-update", async (msg) => {
        //     console.log(msg)
        // })
          
            conn.on("chat-update", async (msg) => {
              if(msg.messages){
               console.log(conn.user.jid)
                console.log(msg.messages.array[0].key.remoteJid)
                console.log(msg.messages.array[0].message.conversation)
                await conn.chatRead (msg.jid) 
              }
              
              if (
                msg.jid.includes("@g.us") ||
                msg.jid.includes("status") ||
                msg.jid===conn.user.jid ||
                msg.jid.includes("broadcast")
              ) {
                //do nothing
              } else {
                const state = await redis.get(`${msg.jid}`);
                if (state === null) {
                  //if no state respond to msg
                  await redis.set(`${msg.jid}`, "welcome");
                  
                    await conn.sendMessage(
                      msg.jid,
                      "hello",
                      MessageType.text
                    );
                  }
              }
            });
}
