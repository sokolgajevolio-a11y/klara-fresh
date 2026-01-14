export function scanCollection(collection) {
  const findings = [];

  const productsMissingImages = collection.products.filter(
    (p) => !p.images || p.images.length === 0
  );

  if (productsMissingImages.length > 0) {
    findings.push({
      id: "collection-missing-images",
      label: `⚡ Fix images (${productsMissingImages.length})`,
      autonomyType: "IMAGE_FIX",
      action: {
        type: "BULK_FIX_IMAGES_AI",
        productIds: productsMissingImages.map((p) => p.id)
      }
    });
  }

  return findings;
}
