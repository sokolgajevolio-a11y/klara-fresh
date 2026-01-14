/**
 * Free Stock Image Providers
 * Phase 2: Add stock image options (Unsplash + Pexels)
 * User must manually select and apply
 */

/**
 * Search Unsplash for free stock images
 * Requires UNSPLASH_ACCESS_KEY in .env
 */
export async function searchUnsplashImages(query, limit = 6) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    console.warn("UNSPLASH_ACCESS_KEY not set in .env");
    return [];
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=squarish`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      console.error("Unsplash API error:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    return results.map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      downloadUrl: photo.links.download_location, // Required for Unsplash attribution
      thumbUrl: photo.urls.thumb,
      description: photo.description || photo.alt_description || query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      provider: "Unsplash",
      providerUrl: "https://unsplash.com",
    }));
  } catch (err) {
    console.error("Error fetching Unsplash images:", err);
    return [];
  }
}

/**
 * Search Pexels for free stock images
 * Requires PEXELS_API_KEY in .env
 */
export async function searchPexelsImages(query, limit = 6) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    console.warn("PEXELS_API_KEY not set in .env");
    return [];
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=square`;

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      console.error("Pexels API error:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const results = data.photos || [];

    return results.map((photo) => ({
      id: photo.id.toString(),
      url: photo.src.large,
      downloadUrl: photo.src.original,
      thumbUrl: photo.src.medium,
      description: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      provider: "Pexels",
      providerUrl: "https://www.pexels.com",
    }));
  } catch (err) {
    console.error("Error fetching Pexels images:", err);
    return [];
  }
}

/**
 * Search all enabled stock image providers
 * Returns combined results with provider labels
 */
export async function searchStockImages(query, limit = 6) {
  const limitPerProvider = Math.ceil(limit / 2);

  const [unsplashResults, pexelsResults] = await Promise.all([
    searchUnsplashImages(query, limitPerProvider),
    searchPexelsImages(query, limitPerProvider),
  ]);

  // Interleave results for better UX
  const combined = [];
  const maxLength = Math.max(unsplashResults.length, pexelsResults.length);

  for (let i = 0; i < maxLength; i++) {
    if (unsplashResults[i]) combined.push(unsplashResults[i]);
    if (pexelsResults[i]) combined.push(pexelsResults[i]);
  }

  return combined.slice(0, limit);
}

/**
 * Download image from stock provider and return as buffer
 * Required for uploading to Shopify
 */
export async function downloadStockImage(imageUrl, downloadUrl = null, provider = null) {
  try {
    // For Unsplash, trigger download endpoint for attribution
    if (provider === "Unsplash" && downloadUrl) {
      try {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;
        if (accessKey) {
          await fetch(downloadUrl, {
            headers: {
              Authorization: `Client-ID ${accessKey}`,
            },
          });
        }
      } catch (err) {
        console.warn("Failed to trigger Unsplash download attribution:", err);
      }
    }

    // Download the actual image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error("Error downloading stock image:", err);
    throw err;
  }
}

/**
 * Generate search query from product data
 */
export function generateSearchQuery(product) {
  const parts = [];

  // Use product type if available (most specific)
  if (product.productType && product.productType.trim()) {
    parts.push(product.productType.trim());
  }

  // Add first meaningful word from title
  if (product.title) {
    const titleWords = product.title
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 2);
    parts.push(...titleWords);
  }

  // Add first tag if available
  if (product.tags && product.tags.length > 0) {
    const firstTag = product.tags[0];
    if (firstTag && firstTag.length > 2) {
      parts.push(firstTag);
    }
  }

  // Fallback to generic if nothing available
  return parts.length > 0 ? parts.join(" ") : "product";
}
