const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const INTERVAL = process.env.INTERVAL ?? 60;
const CHECK_INTERVAL = INTERVAL * 1000; // 60 seconds
const STATUS_ENDPOINT =
  "https://project-epoch-tracker.onrender.com/api/status/realms";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let lastPostedOnline = false;
let lastPostedKezanOnline = false;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const readyCheck = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      await channel.send("🟢 Status is now ONLINE!");
    } catch (err) {
      console.error(`Failed to access channel ${channelId}:`, err);
    }
  };

  readyCheck();

  setInterval(async () => {
    try {
      const res = await axios.get(STATUS_ENDPOINT);
      const status = res.data?.status;

      if (status === "online" && !lastPostedOnline) {
        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send("🟢 Auth Server is now ONLINE!");
        lastPostedOnline = true;
      }

      if (status === "online" && !lastPostedKezanOnline) {
        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send("🟢 Kezan is now ONLINE!");
        lastPostedKezanOnline = true;
      }

      if (status === "online" && !lastPostedGurubashiOnline) {
        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send("🟢 Gurubashi is now ONLINE!");
        lastPostedGurubashiOnline = true;
      }

      if (status !== "online") {
        lastPostedOnline = false;
        lastPostedKezanOnline = false;
        lastPostedGurubashiOnline = false;
      }
    } catch (err) {
      console.error("Error checking status:", err.message);
    }
  }, CHECK_INTERVAL);
});

client.login(DISCORD_BOT_TOKEN);

// const example_data = {
//   status: "offline",
//   realms: [
//     {
//       name: "Kezan",
//       type: "Normal",
//       locked: 0,
//       flags: 0,
//       population: 0,
//       realmId: 0,
//       worldServerOnline: false,
//       flagDescriptions: [],
//       lastOnline: null,
//     },
//     {
//       name: "Gurubashi",
//       type: "PvP",
//       locked: 0,
//       flags: 0,
//       population: 0,
//       realmId: 0,
//       worldServerOnline: false,
//       flagDescriptions: [],
//       lastOnline: null,
//     },
//   ],
//   authServerStatus: false,
//   lastChecked: "2025-07-29T01:14:18.1677566Z",
//   lastOnline: null,
// };
