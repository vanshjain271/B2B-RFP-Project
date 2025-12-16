import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processRfpRequestSchema, type RFPResponse } from "@shared/schema";
import { runSalesAgent } from "./agents/salesAgent";
import { runTechnicalAgent } from "./agents/technicalAgent";
import { runPricingAgent } from "./agents/pricingAgent";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy" });
  });

  // Get SKU catalog
  app.get("/api/sku-catalog", async (_req, res) => {
    try {
      const catalog = await storage.getSkuCatalog();
      res.json(catalog);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SKU catalog" });
    }
  });

  // Process RFP - Main orchestrator endpoint
  app.post("/api/process-rfp", async (req, res) => {
    try {
      // Validate request
      const parseResult = processRfpRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          success: false, 
          error: parseResult.error.errors[0]?.message || "Invalid request" 
        });
      }

      const { rfpText } = parseResult.data;

      // Run Sales Agent - Extract and summarize RFP
      const summary = runSalesAgent(rfpText);

      // Run Technical Agent - Match specs to SKUs
      const matches = runTechnicalAgent(summary);

      // Run Pricing Agent - Generate cost estimates
      const { items: pricing, grandTotal } = runPricingAgent(matches);

      // Return consolidated RFP response
      const response: RFPResponse = {
        success: true,
        summary,
        matches,
        pricing,
        grandTotal,
      };

      res.json(response);
    } catch (error) {
      console.error("RFP processing error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to process RFP" 
      });
    }
  });

  return httpServer;
}
