export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'TPU';

export interface PrintParameters {
  material: MaterialType;
  infill: number; // e.g. 15, 40, 100
  layerHeight: number; // e.g. 0.12, 0.2, 0.28
}

export interface PrintEstimation {
  weightGrams: number;
  printTimeHours: number;
  materialCost: number;
  makerPrice: number;
  royaltyFee: number;
  platformFee: number;
  totalPrice: number;
}

export const MATERIAL_SPECS: Record<MaterialType, { density: number; pricePerGram: number }> = {
  PLA: { density: 1.24, pricePerGram: 2.5 },   // 2500 RUB per kg
  PETG: { density: 1.27, pricePerGram: 3.0 },  // 3000 RUB per kg
  ABS: { density: 1.04, pricePerGram: 3.0 },   // 3000 RUB per kg
  TPU: { density: 1.21, pricePerGram: 5.5 },   // 5500 RUB per kg
};

const MAKER_BASE_FEE = 150.0; // Flat fee for machine setup
const HOURLY_PRINT_RATE = 120.0; // Machine running fee per hour
const PLATFORM_FEE_PERCENT = 5.0; // 5% platform escrow commission

/**
 * Calculates physical estimates and financial breakdown of printing a 3D model.
 * 
 * @param volume - Model solid volume in cm³
 * @param royaltyPercent - Artist royalty percentage (5% to 25%)
 * @param params - Selected print parameters
 */
export function estimatePrint(
  volume: number,
  royaltyPercent: number,
  params: PrintParameters
): PrintEstimation {
  const { material, infill, layerHeight } = params;
  const spec = MATERIAL_SPECS[material] || MATERIAL_SPECS.PLA;

  // 1. Calculate weight (in grams)
  // Standard shell & infill ratio weight approximation
  const fillRatio = infill / 100;
  // Shell makes up ~20% of volume at 100% density. Remaining 80% scales with infill.
  const volumeMultiplier = 0.2 + 0.8 * fillRatio;
  const weightGrams = Math.min(volume * volumeMultiplier * spec.density, volume * spec.density);

  // 2. Calculate printing time (in hours)
  // Time depends on volume, infill density, and layer height.
  // Shorter layer heights mean more slices/layers, which dramatically increases print time.
  const heightMultiplier = 0.2 / layerHeight; // 0.2mm is baseline (1.0x)
  const infillMultiplier = 0.5 + 0.5 * fillRatio;
  const baseTimeHours = volume * 0.08; // Roughly 5 mins per cm³ baseline
  const printTimeHours = Math.max(0.2, baseTimeHours * infillMultiplier * heightMultiplier);

  // 3. Financial breakdown
  // Material cost
  const materialCost = weightGrams * spec.pricePerGram;
  
  // Cost for the maker's service (Flat base fee + hourly operation fee)
  const makerPrice = MAKER_BASE_FEE + (printTimeHours * HOURLY_PRINT_RATE);
  
  // Designer royalty (calculated as % of material + maker cost)
  const royaltyFee = (materialCost + makerPrice) * (royaltyPercent / 100);
  
  // Platform escrow charge
  const subtotal = materialCost + makerPrice + royaltyFee;
  const platformFee = subtotal * (PLATFORM_FEE_PERCENT / 100);
  
  // Grand total
  const totalPrice = Math.round(subtotal + platformFee);

  return {
    weightGrams: Math.round(weightGrams * 10) / 10,
    printTimeHours: Math.round(printTimeHours * 10) / 10,
    materialCost: Math.round(materialCost * 100) / 100,
    makerPrice: Math.round(makerPrice * 100) / 100,
    royaltyFee: Math.round(royaltyFee * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    totalPrice,
  };
}
