import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  
  let baseline = {
    key_latency: 100,
    click_latency: 250,
    pause: 1.5
  };

 let thingspeakConfig = {
  channelId: "3256608",
  readApiKey: "3KEQE9398VZ5NSW1"
};

  
  let fatigueHistory: any[] = [];

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

 
  app.post("/api/fatigue-data", (req, res) => {
    const data = req.body;
    
    if (!data.fatigue_score) {
      data.fatigue_score = (
        0.4 * (data.avg_key_latency / baseline.key_latency) +
        0.3 * (data.click_interval / baseline.click_latency) +
        0.3 * (data.pause_time / baseline.pause)
      ).toFixed(2);
    }
    data.timestamp = new Date().toISOString();
    fatigueHistory.push(data);
    if (fatigueHistory.length > 100) fatigueHistory.shift();
    
    res.json({ success: true, data });
  });

  
  app.get("/api/dashboard", async (req, res) => {
    try {
      
      const url = `https://api.thingspeak.com/channels/${thingspeakConfig.channelId}/feeds.json?results=20${thingspeakConfig.readApiKey ? `&api_key=${thingspeakConfig.readApiKey}` : ""}`;
      const response = await axios.get(url);
      const feeds = response.data.feeds || [];
      
      // Map ThingSpeak fields to our format
      // Field1: key_latency, Field2: click_interval, Field3: pause_time, Field4: fatigue_score
      const mappedFeeds = feeds.map((f: any) => ({
        avg_key_latency: parseFloat(f.field1) || 0,
        click_interval: parseFloat(f.field2) || 0,
        pause_time: parseFloat(f.field3) || 0,
        fatigue_score: parseFloat(f.field4) || 0,
        timestamp: f.created_at
      }));

      res.json({
        latest: mappedFeeds[mappedFeeds.length - 1] || fatigueHistory[fatigueHistory.length - 1] || null,
        history: mappedFeeds.length > 0 ? mappedFeeds : fatigueHistory,
        baseline,
        thingspeak: {
          channelId: thingspeakConfig.channelId,
          hasKey: !!thingspeakConfig.readApiKey
        }
      });
    } catch (error: any) {
      console.error("ThingSpeak fetch failed:", error.message);
      res.json({
        latest: fatigueHistory[fatigueHistory.length - 1] || null,
        history: fatigueHistory,
        baseline,
        thingspeak: {
          channelId: thingspeakConfig.channelId,
          hasKey: !!thingspeakConfig.readApiKey,
          error: error.response?.status === 403 ? "Unauthorized (Check API Key)" : "Connection Error"
        }
      });
    }
  });

  app.post("/api/settings/thingspeak", (req, res) => {
    const { channelId, readApiKey } = req.body;
    if (channelId) thingspeakConfig.channelId = channelId;
    if (readApiKey !== undefined) thingspeakConfig.readApiKey = readApiKey;
    res.json({ success: true, thingspeak: { channelId: thingspeakConfig.channelId, hasKey: !!thingspeakConfig.readApiKey } });
  });

  app.post("/api/settings/baseline", (req, res) => {
    baseline = { ...baseline, ...req.body };
    res.json({ success: true, baseline });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
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
