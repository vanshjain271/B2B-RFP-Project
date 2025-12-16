import type { RFPSummary } from "@shared/schema";

/**
 * Sales Agent - Extracts and summarizes RFP requirements
 * Parses the RFP text to extract key information like title, due date,
 * technical specifications, and compliance requirements.
 */
export function runSalesAgent(rfpText: string): RFPSummary {
  const lines = rfpText.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Extract title
  let title = "Untitled RFP";
  const titleLine = lines.find(line => 
    line.toLowerCase().includes('rfp title:') || 
    line.toLowerCase().includes('title:') ||
    line.toLowerCase().includes('subject:')
  );
  if (titleLine) {
    title = titleLine.split(':').slice(1).join(':').trim() || title;
  }

  // Extract due date
  let dueDate: string | null = null;
  const dateLine = lines.find(line => 
    line.toLowerCase().includes('due date:') || 
    line.toLowerCase().includes('deadline:') ||
    line.toLowerCase().includes('submission date:')
  );
  if (dateLine) {
    const dateMatch = dateLine.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}/);
    if (dateMatch) {
      dueDate = dateMatch[0];
    }
  }

  // Extract voltage
  let voltage: string | null = null;
  const voltagePatterns = [
    /(\d+(?:\.\d+)?)\s*kv/i,
    /voltage[:\s]+(\d+(?:\.\d+)?)\s*kv/i,
    /(\d+(?:\.\d+)?)\s*kv\s*rating/i
  ];
  for (const pattern of voltagePatterns) {
    const match = rfpText.match(pattern);
    if (match) {
      voltage = `${match[1]}kV`;
      break;
    }
  }
  // Check for low voltage
  if (!voltage && rfpText.toLowerCase().includes('low voltage')) {
    voltage = 'LV';
  }

  // Extract material
  let material: string | null = null;
  if (rfpText.toLowerCase().includes('copper')) {
    material = 'Copper';
  } else if (rfpText.toLowerCase().includes('aluminium') || rfpText.toLowerCase().includes('aluminum')) {
    material = 'Aluminium';
  }

  // Extract insulation
  let insulation: string | null = null;
  if (rfpText.toLowerCase().includes('xlpe')) {
    insulation = 'XLPE';
  } else if (rfpText.toLowerCase().includes('pvc')) {
    insulation = 'PVC';
  }

  // Extract compliance standards
  const compliance: string[] = [];
  const compliancePatterns = [
    /is\s*compliant/i,
    /iec\s*\d+/i,
    /ieee\s*\d+/i,
    /astm\s*\w+/i,
    /bs\s*\d+/i,
    /iso\s*\d+/i,
    /industrial\s*grade/i
  ];
  for (const pattern of compliancePatterns) {
    const match = rfpText.match(pattern);
    if (match) {
      const standard = match[0].trim();
      if (!compliance.includes(standard)) {
        compliance.push(standard.charAt(0).toUpperCase() + standard.slice(1).toLowerCase());
      }
    }
  }

  // Extract requirements (lines starting with - or *)
  const requirements: string[] = [];
  for (const line of lines) {
    if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
      const requirement = line.replace(/^[-*•]\s*/, '').trim();
      if (requirement && !requirement.toLowerCase().includes('rfp title') && !requirement.toLowerCase().includes('due date')) {
        requirements.push(requirement);
      }
    }
  }

  return {
    title,
    dueDate,
    voltage,
    material,
    insulation,
    compliance,
    requirements
  };
}
