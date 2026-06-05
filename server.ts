import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Render-compatible port
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  let baseline = {
    key_latency: 100,
    click_latency: 250,
    pause: 1.5,
  };

  let thingspeakConfig = {
    channelId: process.env.THINGSPEAK_CHANNEL_ID || "3256608",
    readApiKey:
      process.env.THINGSPEAK_READ_API_KEY || "3KEQE9398VZ5NSW1",
  };

  let fatigueHistory: any[] = [];

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Store Fatigue Data
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

    if (fatigueHistory.length > 100) {
      fatigueHistory.shift();
    }

    res.json({
      success: true,
      data,
    });
  });

  // Dashboard Data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const url = `https://api.thingspeak.com/channels/${
        thingspeakConfig.channelId
      }/feeds.json?results=20${
        thingspeakConfig.readApiKey
          ? `&api_key=${thingspeakConfig.readApiKey}`
          : ""
      }`;

      const response = await axios.get(url);

      const feeds = response.data.feeds || [];

      const mappedFeeds = feeds.map((f: any) => ({
        avg_key_latency: parseFloat(f.field1) || 0,
        click_interval: parseFloat(f.field2) || 0,
        pause_time: parseFloat(f.field3) || 0,
        fatigue_score: parseFloat(f.field4) || 0,
        timestamp: f.created_at,
      }));

      res.json({
        latest:
          mappedFeeds[mappedFeeds.length - 1] ||
          fatigueHistory[fatigueHistory.length - 1] ||
          null,
        history:
          mappedFeeds.length > 0
            ? mappedFeeds
            : fatigueHistory,
        baseline,
        thingspeak: {
          channelId: thingspeakConfig.channelId,
          hasKey: !!thingspeakConfig.readApiKey,
        },
      });
    } catch (error: any) {
      console.error(
        "ThingSpeak fetch failed:",
        error.message
      );

      res.json({
        latest:
          fatigueHistory[fatigueHistory.length - 1] || null,
        history: fatigueHistory,
        baseline,
        thingspeak: {
          channelId: thingspeakConfig.channelId,
          hasKey: !!thingspeakConfig.readApiKey,
          error:
            error.response?.status === 403
              ? "Unauthorized (Check API Key)"
              : "Connection Error",
        },
      });
    }
  });

  // Update ThingSpeak Settings
  app.post("/api/settings/thingspeak", (req, res) => {
    const { channelId, readApiKey } = req.body;

    if (channelId) {
      thingspeakConfig.channelId = channelId;
    }

    if (readApiKey !== undefined) {
      thingspeakConfig.readApiKey = readApiKey;
    }

    res.json({
      success: true,
      thingspeak: {
        channelId: thingspeakConfig.channelId,
        hasKey: !!thingspeakConfig.readApiKey,
      },
    });
  });

  // Update Baseline Settings
  app.post("/api/settings/baseline", (req, res) => {
    baseline = {
      ...baseline,
      ...req.body,
    };

    res.json({
      success: true,
      baseline,
    });
  });

  // Development Mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
