import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // Vite build output - matches vite.config.ts outDir
  const distPath = path.resolve(process.cwd(), "dist/public");

  console.log("Looking for dist at:", distPath);
  console.log("Dist exists:", fs.existsSync(distPath));

  if (!fs.existsSync(distPath)) {
    // List what's actually in the project root for debugging
    console.log("Project root contents:", fs.readdirSync(process.cwd()));
    if (fs.existsSync(path.resolve(process.cwd(), "dist"))) {
      console.log("Dist folder contents:", fs.readdirSync(path.resolve(process.cwd(), "dist")));
    }
    throw new Error(
      `Could not find the build directory: ${distPath}. Make sure the client is built.`,
    );
  }

  // Serve static assets
  app.use(express.static(distPath));

  // SPA fallback (React router, etc.)
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}