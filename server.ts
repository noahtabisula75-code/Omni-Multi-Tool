import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
