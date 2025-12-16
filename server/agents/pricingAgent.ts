import type { SKUMatch, PricingItem } from "@shared/schema";

/**
 * Pricing Agent - Generates cost estimates for matched SKUs
 * Uses a dummy pricing model with material costs, service fees, and testing costs.
 * Only prices the top-matched SKU (the recommended one).
 */
export function runPricingAgent(matches: SKUMatch[]): { items: PricingItem[]; grandTotal: number } {
  if (matches.length === 0) {
    return { items: [], grandTotal: 0 };
  }

  // Price the top match (recommended SKU)
  const topMatch = matches[0];
  
  // Dummy pricing model
  const quantity = 100; // Default quantity for estimate
  const basePrice = topMatch.basePrice;
  
  // Material cost: base price * quantity * material factor
  const materialFactor = topMatch.material === 'Copper' ? 1.2 : 0.8;
  const materialCost = Math.round(basePrice * quantity * materialFactor * 0.6);
  
  // Service cost: 5% of material cost
  const serviceCost = Math.round(materialCost * 0.05);
  
  // Testing cost: flat fee based on voltage rating
  let testingCost = 1500; // Base testing cost
  if (topMatch.voltage.includes('33')) {
    testingCost = 5000;
  } else if (topMatch.voltage.includes('22')) {
    testingCost = 3500;
  } else if (topMatch.voltage.includes('11')) {
    testingCost = 2500;
  } else if (topMatch.voltage.includes('6.6')) {
    testingCost = 2000;
  }

  const totalCost = (basePrice * quantity) + materialCost + serviceCost + testingCost;

  const items: PricingItem[] = [
    {
      sku: topMatch.sku,
      description: topMatch.description,
      basePrice,
      quantity,
      materialCost,
      serviceCost,
      testingCost,
      totalCost,
    }
  ];

  // Optionally add second match if it has high enough score
  if (matches.length > 1 && matches[1].matchPercentage >= 70) {
    const secondMatch = matches[1];
    const qty2 = 50; // Smaller quantity for secondary
    const matFactor2 = secondMatch.material === 'Copper' ? 1.2 : 0.8;
    const matCost2 = Math.round(secondMatch.basePrice * qty2 * matFactor2 * 0.6);
    const svcCost2 = Math.round(matCost2 * 0.05);
    let testCost2 = 1500;
    if (secondMatch.voltage.includes('33')) testCost2 = 4000;
    else if (secondMatch.voltage.includes('22')) testCost2 = 3000;
    else if (secondMatch.voltage.includes('11')) testCost2 = 2000;
    else if (secondMatch.voltage.includes('6.6')) testCost2 = 1500;

    const total2 = (secondMatch.basePrice * qty2) + matCost2 + svcCost2 + testCost2;

    items.push({
      sku: secondMatch.sku,
      description: secondMatch.description,
      basePrice: secondMatch.basePrice,
      quantity: qty2,
      materialCost: matCost2,
      serviceCost: svcCost2,
      testingCost: testCost2,
      totalCost: total2,
    });
  }

  const grandTotal = items.reduce((sum, item) => sum + item.totalCost, 0);

  return { items, grandTotal };
}
