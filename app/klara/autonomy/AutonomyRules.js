export const AutonomyRules = {
  IMAGE_FIX: {
    enabled: true,
    maxPerSession: 5,
    allowedActions: ["FIX_IMAGE_STOCK"],
    requireConfirmationAbove: 3
  },

  SEO_FIX: {
    enabled: false
  },

  DESCRIPTION_FIX: {
    enabled: false
  }
};
