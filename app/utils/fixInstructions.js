/**
 * Manual Fix Instructions System
 * Provides detailed step-by-step guidance for merchants to fix issues
 */

export const FIX_INSTRUCTIONS = {
  MISSING_SKU: {
    title: "Add Product SKU",
    severity: "medium",
    impact: "SKUs help you track inventory, fulfill orders accurately, and prevent stock confusion.",
    estimatedTime: "1 minute",
    steps: [
      {
        step: 1,
        action: "Click 'Edit Product' below to open this product",
        icon: "click"
      },
      {
        step: 2,
        action: "Scroll down to the 'Inventory' section",
        icon: "scroll"
      },
      {
        step: 3,
        action: "In the 'SKU' field, enter a unique identifier",
        icon: "edit",
        example: "Example: SNOW-DAWN-001 or PROD-12345"
      },
      {
        step: 4,
        action: "Click 'Save' at the top right",
        icon: "save"
      }
    ],
    tips: [
      "Use a consistent naming pattern (e.g., CATEGORY-NAME-NUMBER)",
      "Keep SKUs short but descriptive",
      "Avoid special characters that might cause issues with other systems"
    ],
    resources: [
      {
        title: "SKU Best Practices",
        url: "https://help.shopify.com/en/manual/products/add-update-products#add-product-details"
      }
    ]
  },

  MISSING_PRODUCT_DESCRIPTION: {
    title: "Add Product Description",
    severity: "high",
    impact: "Descriptions help customers understand your product and improve SEO rankings.",
    estimatedTime: "5-10 minutes",
    steps: [
      {
        step: 1,
        action: "Click 'Edit Product' below",
        icon: "click"
      },
      {
        step: 2,
        action: "Find the 'Description' field (large text area)",
        icon: "scroll"
      },
      {
        step: 3,
        action: "Write a compelling description that includes:",
        icon: "edit",
        bullets: [
          "What the product is and who it's for",
          "Key features and benefits",
          "Materials, dimensions, or specifications",
          "Use cases or how to use it"
        ]
      },
      {
        step: 4,
        action: "Use the formatting toolbar to add headers, bullets, and bold text",
        icon: "format"
      },
      {
        step: 5,
        action: "Click 'Save'",
        icon: "save"
      }
    ],
    tips: [
      "Write for your customers, not search engines",
      "Include keywords naturally in the first paragraph",
      "Break up text with bullets and short paragraphs",
      "Answer common questions customers might have"
    ],
    aiSuggestion: "💡 Tip: Klara can write this for you! Upgrade to enable AI-powered product descriptions.",
    resources: [
      {
        title: "Writing Great Product Descriptions",
        url: "https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords#write-keyword-rich-product-descriptions"
      }
    ]
  },

  MISSING_SEO_TITLE: {
    title: "Add SEO Title",
    severity: "medium",
    impact: "SEO titles appear in search results and browser tabs. They're crucial for getting found on Google.",
    estimatedTime: "2 minutes",
    steps: [
      {
        step: 1,
        action: "Click 'Edit Product' below",
        icon: "click"
      },
      {
        step: 2,
        action: "Scroll down to 'Search engine listing' section",
        icon: "scroll"
      },
      {
        step: 3,
        action: "Click 'Edit website SEO'",
        icon: "click"
      },
      {
        step: 4,
        action: "In the 'Page title' field, write a title under 60 characters",
        icon: "edit",
        example: "Example: Premium Snowboard - Complete Kit | YourStore"
      },
      {
        step: 5,
        action: "Click 'Save'",
        icon: "save"
      }
    ],
    tips: [
      "Include your main keyword near the beginning",
      "Keep it under 60 characters to avoid truncation",
      "Make it compelling to encourage clicks",
      "Include your brand name at the end"
    ],
    resources: [
      {
        title: "SEO Best Practices",
        url: "https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords"
      }
    ]
  },

  MISSING_IMAGE_ALT_TEXT: {
    title: "Add Image Alt Text",
    severity: "medium",
    impact: "Alt text helps visually impaired customers and improves SEO. It's also required for accessibility compliance.",
    estimatedTime: "1 minute per image",
    steps: [
      {
        step: 1,
        action: "Click 'Edit Product' below",
        icon: "click"
      },
      {
        step: 2,
        action: "Find the image in the 'Media' section",
        icon: "scroll"
      },
      {
        step: 3,
        action: "Click on the image to open image details",
        icon: "click"
      },
      {
        step: 4,
        action: "Click 'Add alt text'",
        icon: "edit"
      },
      {
        step: 5,
        action: "Describe what's in the image clearly and concisely",
        icon: "edit",
        example: "Example: Red snowboard with white graphics on snowy mountain slope"
      },
      {
        step: 6,
        action: "Click 'Save' on the modal, then 'Save' on the product",
        icon: "save"
      }
    ],
    tips: [
      "Describe what's actually visible in the image",
      "Keep it under 125 characters when possible",
      "Include relevant keywords naturally",
      "Don't start with 'Image of...' or 'Picture of...'",
      "Be specific about colors, positions, and key details"
    ],
    resources: [
      {
        title: "Image Alt Text Best Practices",
        url: "https://help.shopify.com/en/manual/online-store/images/theme-images#add-alt-text-to-images"
      }
    ]
  }
};

export function generateShopifyLink(shop, issueType, resourceId) {
  const baseUrl = `https://admin.shopify.com/store/${shop.replace('.myshopify.com', '')}`;
  
  const linkMap = {
    MISSING_SKU: (id) => `${baseUrl}/products/${id}`,
    MISSING_PRODUCT_DESCRIPTION: (id) => `${baseUrl}/products/${id}`,
    MISSING_SEO_TITLE: (id) => `${baseUrl}/products/${id}`,
    MISSING_IMAGE_ALT_TEXT: (id) => `${baseUrl}/products/${id}`,
  };
  
  const linkGenerator = linkMap[issueType];
  return linkGenerator ? linkGenerator(resourceId) : `${baseUrl}`;
}

export function getSeverityColor(severity) {
  const colors = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' }
  };
  
  return colors[severity] || colors.medium;
}

export function getStepIcon(iconType) {
  const icons = {
    click: "👆",
    scroll: "⬇️",
    edit: "✏️",
    save: "💾",
    check: "☑️",
    upload: "📤",
    drag: "↕️",
    search: "🔍",
    format: "📝"
  };
  
  return icons[iconType] || "•";
}
