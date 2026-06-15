export const PRICING_CONFIG = {
  platformFee: 50,
  weightSlabs: [
    { upTo: 0.5, rate: 20 },
    { upTo: 2, rate: 30 },
    { upTo: 5, rate: 40 },
    { upTo: 10, rate: 50 },
    { upTo: Infinity, rate: 60 },
  ],

  priorityMultiplier: {
    STANDARD: 1.0,
    EXPRESS: 1.2,
    SAME_DAY: 1.5,
  },

  fragileSurcharge: 30,
};

export function calculateShippingAmount(
  packageWeight: number,
  shipmentPriority: "STANDARD" | "EXPRESS" | "SAME_DAY",
  isFragile: boolean,
) {
  //  find slab
  const slab = PRICING_CONFIG.weightSlabs.find((s) => packageWeight <= s.upTo)!;
  const weightCharge = slab.rate*packageWeight

  const platformFee = PRICING_CONFIG.platformFee;

  const priority = shipmentPriority ?? "STANDARD";
  const priorityCharge = Math.round(
    weightCharge * (PRICING_CONFIG.priorityMultiplier[priority] - 1),
  );

  const fragileCharge = isFragile ? PRICING_CONFIG.fragileSurcharge : 0;

  // subtotal
  const subtotal = platformFee + weightCharge + priorityCharge + fragileCharge;

  // GST
  const gst = Math.round(subtotal * 0.18);

  const total = subtotal + gst;

  return {
    breakdown: {
      platformFee,
      weightCharge,
      priorityCharge,
      fragileCharge,
      subtotal,
      gst,
      total,
    },
    total,
  };
}
