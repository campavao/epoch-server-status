require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const INTERVAL = parseInt(process.env.INTERVAL) ?? 60;
const CHECK_INTERVAL = INTERVAL * 1000; // 60 seconds
const STATUS_ENDPOINT =
  "https://project-epoch-tracker.onrender.com/api/status/realms";

const STATUS_ENDPOINT_TWO =
  "https://epoch-status.info/api/trpc/post.getStatus?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D%7D";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let lastPostedOnline = false;
let lastPostedKezanOnline = false;
let lastPostedGurubashiOnline = false;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const readyCheck = async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      await channel.send("🟢 Bot is now ONLINE!");
      console.log("Bot is now ONLINE!");
    } catch (err) {
      console.error(`Failed to access channel ${CHANNEL_ID}:`, err);
    }
  };

  readyCheck();

  setInterval(async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);

      const {
        authServerOnline: authServerOnlineOne,
        kezanOnline: kezanOnlineOne,
        gurubashiOnline: gurubashiOnlineOne,
      } = await checkStatusSiteOne();

      const {
        authServerOnline: authServerOnlineTwo,
        kezanOnline: kezanOnlineTwo,
        gurubashiOnline: gurubashiOnlineTwo,
      } = await checkStatusSiteTwo();

      const authServerOnline = authServerOnlineOne || authServerOnlineTwo;
      const kezanOnline = kezanOnlineOne || kezanOnlineTwo;
      const gurubashiOnline = gurubashiOnlineOne || gurubashiOnlineTwo;

      if (authServerOnline && !lastPostedOnline) {
        await channel.send("🟢 Auth Server is now ONLINE!");
        console.log("Auth Server is now ONLINE!");
        lastPostedOnline = true;
      }

      if (kezanOnline && !lastPostedKezanOnline) {
        await channel.send("🟢 Kezan is now ONLINE!");
        console.log("Kezan is now ONLINE!");
        lastPostedKezanOnline = true;
      }

      if (gurubashiOnline && !lastPostedGurubashiOnline) {
        await channel.send("🟢 Gurubashi is now ONLINE!");
        console.log("Gurubashi is now ONLINE!");
        lastPostedGurubashiOnline = true;
      }

      if (lastPostedOnline && !authServerOnline) {
        await channel.send("🔴 Auth Server is now OFFLINE!");
        console.log("Auth Server is now OFFLINE!");
        lastPostedOnline = false;
      }

      if (lastPostedKezanOnline && !kezanOnline) {
        await channel.send("🔴 Kezan is now OFFLINE!");
        console.log("Kezan is now OFFLINE!");
        lastPostedKezanOnline = false;
      }

      if (lastPostedGurubashiOnline && !gurubashiOnline) {
        await channel.send("🔴 Gurubashi is now OFFLINE!");
        console.log("Gurubashi is now OFFLINE!");
        lastPostedGurubashiOnline = false;
      }
    } catch (err) {
      console.error("Error checking status:", err.message);
    }
  }, CHECK_INTERVAL);
});

client.login(DISCORD_BOT_TOKEN);

const checkStatusSiteOne = async () => {
  try {
    const res = await axios.get(STATUS_ENDPOINT);
    const authServerOnline = res.data?.authServerStatus;
    const kezanOnline = res.data?.realms?.find(
      (realm) => realm.name === "Kezan"
    )?.worldServerOnline;
    const gurubashiOnline = res.data?.realms?.find(
      (realm) => realm.name === "Gurubashi"
    )?.worldServerOnline;

    const result = {
      authServerOnline,
      kezanOnline,
      gurubashiOnline,
    };

    console.log("Checked status for site one", result);

    return result;
  } catch (error) {
    console.error("Error checking status for site one:", error.message);
  }
};

const checkStatusSiteTwo = async () => {
  try {
    const res = await axios.get(STATUS_ENDPOINT_TWO);
    const authServerOnline = res.data[0].result.data.json.auth;
    const kezanOnline = res.data[0].result.data.json.world1;
    const gurubashiOnline = res.data[0].result.data.json.world2;

    const result = {
      authServerOnline,
      kezanOnline,
      gurubashiOnline,
    };

    console.log("Checked status for site two", result);

    return result;
  } catch (error) {
    console.error("Error checking status for site two:", error.message);
  }
};

// const example_data_one = {
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

// const example_data_two = {
//   0: {
//     result: {
//       data: {
//         json: {
//           auth: true,
//           authLastTime: "2025-08-02T13:09:26.017Z",
//           world1: false,
//           world1LastTime: "2025-08-02T08:53:10.180Z",
//           world2: false,
//           world2LastTime: "2025-07-28T09:53:10.180Z",
//           checkedAt: "2025-08-02T13:09:26.017Z",
//         },
//         meta: {
//           values: {
//             authLastTime: ["Date"],
//             world1LastTime: ["Date"],
//             world2LastTime: ["Date"],
//             checkedAt: ["Date"],
//           },
//         },
//       },
//     },
//   },
// };
