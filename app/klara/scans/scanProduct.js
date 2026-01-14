export function scanProduct(product) {
  const findings = [];

  if (!product.images || product.images.length === 0) {
    findings.push({
      id: "missing-images",
      label: "⚡ Fix missing images",
      autonomyType: "IMAGE_FIX",
      action: {
        type: "FIX_IMAGE_AI",
        productId: product.id
      }
    });
  }

  if (!product.seoTitle || product.seoTitle.length < 30) {
    findings.push({
      id: "seo-title",
      label: "🔍 Fix SEO",
      action: {
        type: "FIX_SEO",
        productId: product.id
      }
    });
  }

  if (!product.description || product.description.length < 100) {
    findings.push({
      id: "description",
      label: "📝 Improve description",
      action: {
        type: "IMPROVE_DESCRIPTION",
        productId: product.id
      }
    });
  }

  return findings;
}
