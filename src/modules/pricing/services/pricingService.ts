import { PRICING_CONFIG } from "../../../shared/utils/pricingUtil";

class PricingService {
  getPricingRates() {
    return {
      platformFee: PRICING_CONFIG.platformFee,
      weightSlabs: PRICING_CONFIG.weightSlabs.map((slab) => ({
        upTo: slab.upTo === Infinity ? null : slab.upTo,
        ratePerKg: slab.rate,
      })),
      priorityMultipliers: PRICING_CONFIG.priorityMultiplier,
      fragileSurcharge: PRICING_CONFIG.fragileSurcharge,
      gstPercent: 18,
    };
  }
}

export default new PricingService();
