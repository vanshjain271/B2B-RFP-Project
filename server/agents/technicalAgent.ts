import type { RFPSummary, SKUMatch } from "@shared/schema";
import { SKU_CATALOG } from "@shared/schema";

/**
 * Technical Agent - Matches RFP specifications to SKU catalog
 * Calculates match percentages based on voltage, material, and insulation specs.
 * Returns top 3 matching SKUs sorted by match percentage.
 */
export function runTechnicalAgent(summary: RFPSummary): SKUMatch[] {
  const matches: SKUMatch[] = [];

  for (const sku of SKU_CATALOG) {
    let score = 0;
    let maxScore = 0;

    // Voltage matching (40% weight)
    if (summary.voltage) {
      maxScore += 40;
      const summaryVoltage = summary.voltage.toLowerCase().replace(/\s/g, '');
      const skuVoltage = sku.voltage.toLowerCase().replace(/\s/g, '');
      
      if (summaryVoltage === skuVoltage) {
        score += 40;
      } else if (summaryVoltage.includes(skuVoltage.replace('kv', '')) || skuVoltage.includes(summaryVoltage.replace('kv', ''))) {
        score += 20; // Partial match
      }
    }

    // Material matching (30% weight)
    if (summary.material) {
      maxScore += 30;
      if (summary.material.toLowerCase() === sku.material.toLowerCase()) {
        score += 30;
      }
    }

    // Insulation matching (30% weight)
    if (summary.insulation) {
      maxScore += 30;
      if (summary.insulation.toLowerCase() === sku.insulation.toLowerCase()) {
        score += 30;
      }
    }

    // Calculate percentage (if no specs provided, give base score based on general matching)
    let matchPercentage: number;
    if (maxScore === 0) {
      // No specific requirements, check requirements text for any matches
      matchPercentage = 50; // Base score
      const reqText = summary.requirements.join(' ').toLowerCase();
      if (reqText.includes(sku.voltage.toLowerCase())) matchPercentage += 15;
      if (reqText.includes(sku.material.toLowerCase())) matchPercentage += 15;
      if (reqText.includes(sku.insulation.toLowerCase())) matchPercentage += 15;
    } else {
      matchPercentage = Math.round((score / maxScore) * 100);
    }

    matches.push({
      sku: sku.sku,
      description: sku.description,
      matchPercentage,
      voltage: sku.voltage,
      material: sku.material,
      insulation: sku.insulation,
      basePrice: sku.basePrice,
    });
  }

  // Sort by match percentage descending and return top 3
  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return matches.slice(0, 3);
}
