import { MakerProfile, User } from '@prisma/client';

export interface MatchingResult {
  maker: User & { makerProfile: MakerProfile | null };
  distanceKm: number;
  score: number;
  isEligible: boolean;
  reasons: string[];
}

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves text-based address to approximate coordinates in Russia for matching.
 */
export function geocodeMockAddress(address: string): { latitude: number; longitude: number } {
  const addr = address.toLowerCase();
  if (addr.includes('казан') || addr.includes('kazan')) {
    return { latitude: 55.7887, longitude: 49.1221 };
  }
  if (addr.includes('петербург') || addr.includes('спб') || addr.includes('petersburg')) {
    return { latitude: 59.9343, longitude: 30.3351 };
  }
  // Default to Moscow
  return { latitude: 55.7558, longitude: 37.6173 };
}

interface MatchOrderInput {
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  material: string;
  color: string;
  deliveryAddress: string;
}

/**
 * Scores and matches available makers against an order's physical requirements and delivery location.
 */
export function scoreMakers(
  order: MatchOrderInput,
  makers: (User & { makerProfile: MakerProfile | null })[]
): MatchingResult[] {
  const clientCoords = geocodeMockAddress(order.deliveryAddress);
  const orderDim = [order.sizeX, order.sizeY, order.sizeZ].sort((a, b) => a - b);

  return makers
    .map((maker) => {
      const profile = maker.makerProfile;
      const reasons: string[] = [];
      let isEligible = true;

      if (!profile) {
        return {
          maker,
          distanceKm: 9999,
          score: 0,
          isEligible: false,
          reasons: ['Профиль мейкера отсутствует'],
        };
      }

      // 1. Build Plate check (handles rotation, sorting dimensions smallest-to-largest)
      const bedDim = [profile.bedSizeX, profile.bedSizeY, profile.bedSizeZ].sort((a, b) => a - b);
      const dimensionsFit =
        orderDim[0] <= bedDim[0] && orderDim[1] <= bedDim[1] && orderDim[2] <= bedDim[2];

      if (!dimensionsFit) {
        isEligible = false;
        reasons.push(
          `Модель (${order.sizeX}x${order.sizeY}x${order.sizeZ}мм) превышает область печати (${profile.bedSizeX}x${profile.bedSizeY}x${profile.bedSizeZ}мм)`
        );
      }

      // 2. Material availability check
      const availableMaterials = profile.materials
        .split(',')
        .map((m) => m.trim().toUpperCase());
      const hasMaterial = availableMaterials.includes(order.material.toUpperCase());

      if (!hasMaterial) {
        isEligible = false;
        reasons.push(`Пластик ${order.material} отсутствует в наличии (доступны: ${profile.materials})`);
      }

      // 3. Color availability check
      const availableColors = profile.colors
        .split(',')
        .map((c) => c.trim().toLowerCase());
      const hasColor = availableColors.includes(order.color.toLowerCase());

      if (!hasColor) {
        isEligible = false;
        reasons.push(`Цвет ${order.color} отсутствует в наличии (доступны: ${profile.colors})`);
      }

      // 4. Calculate Distance
      const distanceKm = calculateHaversineDistance(
        clientCoords.latitude,
        clientCoords.longitude,
        profile.latitude,
        profile.longitude
      );

      // 5. Scoring Formula (only for eligible makers)
      let score = 0;
      if (isEligible) {
        // Distance score (scales from 100 at 0km to ~0 at >1000km)
        // Drops off exponentially (half-life of 200km)
        const distanceScore = 100 * Math.exp(-distanceKm / 200);

        // Rating score (1-5 scaled to 0-100)
        const ratingScore = profile.rating * 20;

        // Combined score (60% proximity, 40% rating)
        score = Math.round(distanceScore * 0.6 + ratingScore * 0.4);
      }

      return {
        maker,
        distanceKm: Math.round(distanceKm * 10) / 10,
        score,
        isEligible,
        reasons,
      };
    })
    // Sort eligible makers first, then by highest score, then by closest distance
    .sort((a, b) => {
      if (a.isEligible !== b.isEligible) {
        return a.isEligible ? -1 : 1;
      }
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return a.distanceKm - b.distanceKm;
    });
}
