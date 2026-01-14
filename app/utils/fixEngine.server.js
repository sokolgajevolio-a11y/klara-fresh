import prisma from "../db.server";

export const ISSUE_TYPES = {
  MISSING_DESCRIPTION: "missing_description",
  MISSING_SEO_DESCRIPTION: "missing_seo_description",
  MISSING_SEO_TITLE: "missing_seo_title",
  MISSING_PRODUCT_TYPE: "missing_product_type",
  MISSING_VENDOR: "missing_vendor",
  MISSING_TAGS: "missing_tags",
  MISSING_IMAGES: "missing_images",
  MISSING_ALT_TEXT: "missing_alt_text",
  LOW_IMAGE_COUNT: "low_image_count",
  MISSING_PRICE: "missing_price",
  OUT_OF_STOCK: "out_of_stock",
  NOT_IN_COLLECTION: "not_in_collection",
  MISSING_SKU: "missing_sku",
};

export const ISSUE_CATEGORIES = {
  CONTENT: "Content & SEO",
  IMAGES: "Images",
  PRICING: "Pricing",
  INVENTORY: "Inventory",
  ORGANIZATION: "Organization",
};

export const ISSUE_INFO = {
  [ISSUE_TYPES.MISSING_DESCRIPTION]: {
    category: ISSUE_CATEGORIES.CONTENT,
    severity: "high",
    impact: "Reduces conversion rate by 20-30%",
    title: "Missing Product Description",
  },
  [ISSUE_TYPES.MISSING_SEO_DESCRIPTION]: {
    category: ISSUE_CATEGORIES.CONTENT,
    severity: "high",
    impact: "Hurts search rankings significantly",
    title: "Missing SEO Description",
  },
  [ISSUE_TYPES.MISSING_SEO_TITLE]: {
    category: ISSUE_CATEGORIES.CONTENT,
    severity: "medium",
    impact: "Reduces click-through from search results",
    title: "Missing SEO Title",
  },
  [ISSUE_TYPES.MISSING_PRODUCT_TYPE]: {
    category: ISSUE_CATEGORIES.ORGANIZATION,
    severity: "low",
    impact: "Affects store organization and filtering",
    title: "Missing Product Type",
  },
  [ISSUE_TYPES.MISSING_VENDOR]: {
    category: ISSUE_CATEGORIES.ORGANIZATION,
    severity: "low",
    impact: "Affects brand filtering and organization",
    title: "Missing Vendor/Brand",
  },
  [ISSUE_TYPES.MISSING_TAGS]: {
    category: ISSUE_CATEGORIES.ORGANIZATION,
    severity: "medium",
    impact: "Reduces discoverability in store",
    title: "No Tags",
  },
  [ISSUE_TYPES.MISSING_IMAGES]: {
    category: ISSUE_CATEGORIES.IMAGES,
    severity: "critical",
    impact: "Products without images rarely sell",
    title: "No Product Images",
  },
  [ISSUE_TYPES.MISSING_ALT_TEXT]: {
    category: ISSUE_CATEGORIES.IMAGES,
    severity: "medium",
    impact: "Hurts SEO and accessibility",
    title: "Missing Image Alt Text",
  },
  [ISSUE_TYPES.LOW_IMAGE_COUNT]: {
    category: ISSUE_CATEGORIES.IMAGES,
    severity: "medium",
    impact: "More images increase conversion by 25%",
    title: "Only 1 Image",
  },
  [ISSUE_TYPES.MISSING_PRICE]: {
    category: ISSUE_CATEGORIES.PRICING,
    severity: "critical",
    impact: "Product cannot be purchased",
    title: "Missing Price",
  },
  [ISSUE_TYPES.OUT_OF_STOCK]: {
    category: ISSUE_CATEGORIES.INVENTORY,
    severity: "high",
    impact: "Lost sales - product unavailable",
    title: "Out of Stock",
  },
  [ISSUE_TYPES.NOT_IN_COLLECTION]: {
    category: ISSUE_CATEGORIES.ORGANIZATION,
    severity: "medium",
    impact: "Product may not appear in store navigation",
    title: "Not in Any Collection",
  },
  [ISSUE_TYPES.MISSING_SKU]: {
    category: ISSUE_CATEGORIES.ORGANIZATION,
    severity: "low",
    impact: "Affects inventory management",
    title: "Missing SKU",
  },
};

export async function detectIssues(admin, shop) {
  const issues = [];

  const productsResponse = await admin.graphql(`
    query {
      products(first: 100) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            productType
            vendor
            tags
            status
            seo {
              title
              description
            }
            totalInventory
            images(first: 20) {
              edges {
                node {
                  id
                  altText
                }
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  inventoryQuantity
                }
              }
            }
            collections(first: 5) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `);

  const productsData = await productsResponse.json();
  const products = productsData.data?.products?.edges || [];

  for (const { node: product } of products) {
    const productTitle = product.title;
    const images = product.images?.edges || [];
    const variants = product.variants?.edges || [];
    const collections = product.collections?.edges || [];

    // Missing Description
    if (!product.descriptionHtml || product.descriptionHtml.trim() === "" || product.descriptionHtml === "<br>") {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.MISSING_DESCRIPTION,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_DESCRIPTION].impact,
      });
    }

    // Missing SEO Description
    if (!product.seo?.description || product.seo.description.trim() === "") {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.MISSING_SEO_DESCRIPTION,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_SEO_DESCRIPTION].impact,
      });
    }

    // Missing SEO Title
    if (!product.seo?.title || product.seo.title.trim() === "") {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.MISSING_SEO_TITLE,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_SEO_TITLE].impact,
      });
    }

    // Missing Product Type
    if (!product.productType || product.productType.trim() === "") {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.MISSING_PRODUCT_TYPE,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_PRODUCT_TYPE].impact,
      });
    }

    // Missing Vendor
    if (!product.vendor || product.vendor.trim() === "") {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.MISSING_VENDOR,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_VENDOR].impact,
      });
    }

    // Missing Tags
    if (!product.tags || product.tags.length === 0) {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.MISSING_TAGS,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_TAGS].impact,
      });
    }

    // No Images
    if (images.length === 0) {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.MISSING_IMAGES,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_IMAGES].impact,
      });
    } else {
      // Only 1 image
      if (images.length === 1) {
        issues.push({
          shop,
          entityType: "product",
          entityId: product.id,
          issueType: ISSUE_TYPES.LOW_IMAGE_COUNT,
          title: productTitle,
          explanation: ISSUE_INFO[ISSUE_TYPES.LOW_IMAGE_COUNT].impact,
        });
      }

      // Missing alt text
      for (const { node: image } of images) {
        if (!image.altText || image.altText.trim() === "") {
          issues.push({
            shop,
            entityType: "image",
            entityId: image.id,
            issueType: ISSUE_TYPES.MISSING_ALT_TEXT,
            title: `Image in "${productTitle}"`,
            explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_ALT_TEXT].impact,
            parentId: product.id,
          });
        }
      }
    }

    // Missing SKU
    for (const { node: variant } of variants) {
      if (!variant.sku || variant.sku.trim() === "") {
        issues.push({
          shop,
          entityType: "variant",
          entityId: variant.id,
          issueType: ISSUE_TYPES.MISSING_SKU,
          title: `${productTitle}${variant.title !== "Default Title" ? ` - ${variant.title}` : ""}`,
          explanation: ISSUE_INFO[ISSUE_TYPES.MISSING_SKU].impact,
          parentId: product.id,
        });
      }
    }

    // Out of Stock
    if (product.totalInventory === 0 && product.status === "ACTIVE") {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.OUT_OF_STOCK,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.OUT_OF_STOCK].impact,
      });
    }

    // Not in Collection
    if (collections.length === 0) {
      issues.push({
        shop,
        entityType: "product",
        entityId: product.id,
        issueType: ISSUE_TYPES.NOT_IN_COLLECTION,
        title: productTitle,
        explanation: ISSUE_INFO[ISSUE_TYPES.NOT_IN_COLLECTION].impact,
      });
    }
  }

  return issues;
}

export async function saveIssues(issues) {
  const saved = [];

  for (const issue of issues) {
    try {
      const existing = await prisma.issue.findUnique({
        where: {
          shop_entityId_issueType: {
            shop: issue.shop,
            entityId: issue.entityId,
            issueType: issue.issueType,
          },
        },
      });

      if (!existing) {
        const created = await prisma.issue.create({
          data: {
            shop: issue.shop,
            entityType: issue.entityType,
            entityId: issue.entityId,
            issueType: issue.issueType,
            title: issue.title,
            explanation: issue.explanation,
          },
        });
        saved.push(created);
      } else if (existing.status === "fixed") {
        const updated = await prisma.issue.update({
          where: { id: existing.id },
          data: { status: "open" },
        });
        saved.push(updated);
      } else {
        saved.push(existing);
      }
    } catch (e) {
      console.error("Error saving issue:", e);
    }
  }

  return saved;
}

export async function getIssues(shop, status = null) {
  const where = { shop };
  if (status) where.status = status;

  return prisma.issue.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { fixes: { orderBy: { createdAt: "desc" } } },
  });
}

export async function getIssuesByCategory(shop) {
  const issues = await getIssues(shop, "open");
  
  const categories = {};
  for (const issue of issues) {
    const info = ISSUE_INFO[issue.issueType] || { category: "Other", severity: "low" };
    if (!categories[info.category]) {
      categories[info.category] = [];
    }
    categories[info.category].push({
      ...issue,
      severity: info.severity,
      categoryTitle: info.title,
    });
  }
  
  return categories;
}

export async function getFixHistory(shop) {
  return prisma.fixHistory.findMany({
    where: { issue: { shop } },
    orderBy: { createdAt: "desc" },
    include: { issue: true },
  });
}

export async function getStoreHealth(shop) {
  const issues = await getIssues(shop);
  const openIssues = issues.filter(i => i.status === "open");
  const fixedIssues = issues.filter(i => i.status === "fixed");
  
  let deductions = 0;
  for (const issue of openIssues) {
    const info = ISSUE_INFO[issue.issueType];
    if (info?.severity === "critical") deductions += 10;
    else if (info?.severity === "high") deductions += 5;
    else if (info?.severity === "medium") deductions += 2;
    else deductions += 1;
  }
  
  const score = Math.max(0, 100 - deductions);
  
  const byCategory = {};
  for (const issue of openIssues) {
    const info = ISSUE_INFO[issue.issueType] || { category: "Other" };
    byCategory[info.category] = (byCategory[info.category] || 0) + 1;
  }
  
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const issue of openIssues) {
    const info = ISSUE_INFO[issue.issueType];
    if (info?.severity) bySeverity[info.severity]++;
  }
  
  return {
    score,
    totalIssues: openIssues.length,
    fixedIssues: fixedIssues.length,
    byCategory,
    bySeverity,
  };
}

export async function scanStore(admin, shop) {
  // Detect all issues
  const detectedIssues = await detectIssues(admin, shop);
  
  // Save them to database
  const savedIssues = await saveIssues(detectedIssues);
  
  return {
    issuesFound: savedIssues.length,
    issues: savedIssues,
  };
}
