/**
 * Helper functions for finding and applying internal images
 * NO EXTERNAL APIs - ONLY EXISTING SHOPIFY STORE IMAGES
 */

/**
 * Find internal image suggestions for a product with image issues
 * Sources:
 * 1. Other variants of the same product
 * 2. Other products with similar title keywords
 * 3. Shopify Files already uploaded
 * 4. Collection images (if product belongs to collections)
 */
export async function findInternalImageSuggestions(admin, productId) {
  const suggestions = [];

  try {
    // Get the product details
    const productResponse = await admin.graphql(
      `query($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                image {
                  id
                  url
                  altText
                }
              }
            }
          }
          collections(first: 5) {
            edges {
              node {
                id
                title
                image {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
      }`,
      { variables: { id: productId } }
    );

    const productData = await productResponse.json();
    const product = productData.data?.product;

    if (!product) {
      return suggestions;
    }

    const existingImageUrls = new Set();
    product.images?.edges?.forEach(({ node }) => {
      if (node.url) existingImageUrls.add(node.url);
    });

    // 1. Check other variants of the SAME product
    const variants = product.variants?.edges || [];
    for (const { node: variant } of variants) {
      if (variant.image && !existingImageUrls.has(variant.image.url)) {
        suggestions.push({
          source: "variant",
          sourceTitle: `Variant: ${variant.title}`,
          url: variant.image.url,
          altText: variant.image.altText || product.title,
          imageId: variant.image.id,
        });
        existingImageUrls.add(variant.image.url);
      }
    }

    // 2. Check collection images
    const collections = product.collections?.edges || [];
    for (const { node: collection } of collections) {
      if (collection.image && !existingImageUrls.has(collection.image.url)) {
        suggestions.push({
          source: "collection",
          sourceTitle: `Collection: ${collection.title}`,
          url: collection.image.url,
          altText: collection.image.altText || collection.title,
          imageId: collection.image.id,
        });
        existingImageUrls.add(collection.image.url);
      }
    }

    // 3. Search for similar products by title keywords
    const titleWords = product.title
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 3);

    if (titleWords.length > 0) {
      const searchQuery = titleWords.join(" ");
      
      const similarProductsResponse = await admin.graphql(
        `query($query: String!) {
          products(first: 10, query: $query) {
            edges {
              node {
                id
                title
                images(first: 3) {
                  edges {
                    node {
                      id
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }`,
        { variables: { query: searchQuery } }
      );

      const similarData = await similarProductsResponse.json();
      const similarProducts = similarData.data?.products?.edges || [];

      for (const { node: similarProduct } of similarProducts) {
        // Skip the same product
        if (similarProduct.id === productId) continue;

        const images = similarProduct.images?.edges || [];
        for (const { node: image } of images) {
          if (!existingImageUrls.has(image.url) && suggestions.length < 10) {
            suggestions.push({
              source: "similar_product",
              sourceTitle: `Similar: ${similarProduct.title}`,
              url: image.url,
              altText: image.altText || similarProduct.title,
              imageId: image.id,
            });
            existingImageUrls.add(image.url);
          }
        }
      }
    }

    // 4. Check Shopify Files (limit to recent uploads)
    try {
      const filesResponse = await admin.graphql(`
        query {
          files(first: 20, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                ... on MediaImage {
                  id
                  image {
                    url
                    altText
                  }
                  createdAt
                }
              }
            }
          }
        }
      `);

      const filesData = await filesResponse.json();
      const files = filesData.data?.files?.edges || [];

      for (const { node: file } of files) {
        if (file.image && !existingImageUrls.has(file.image.url) && suggestions.length < 15) {
          suggestions.push({
            source: "shopify_files",
            sourceTitle: "Shopify Files",
            url: file.image.url,
            altText: file.image.altText || product.title,
            imageId: file.id,
            createdAt: file.createdAt,
          });
          existingImageUrls.add(file.image.url);
        }
      }
    } catch (err) {
      console.log("Could not fetch Shopify files:", err.message);
    }

    // Return up to 5 suggestions
    return suggestions.slice(0, 5);
  } catch (err) {
    console.error("Error finding image suggestions:", err);
    return [];
  }
}

/**
 * Apply an image to a product
 */
export async function applyImageToProduct(admin, productId, imageUrl, altText) {
  try {
    const mutation = `
      mutation productAppendImages($input: ProductAppendImagesInput!) {
        productAppendImages(input: $input) {
          product {
            id
            images(first: 1) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
          }
          newImages {
            id
            url
            altText
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id: productId,
        images: [
          {
            src: imageUrl,
            altText: altText || "",
          },
        ],
      },
    };

    const response = await admin.graphql(mutation, { variables });
    const data = await response.json();

    if (data.data?.productAppendImages?.userErrors?.length > 0) {
      const errors = data.data.productAppendImages.userErrors;
      throw new Error(errors.map((e) => e.message).join(", "));
    }

    return {
      success: true,
      newImages: data.data?.productAppendImages?.newImages || [],
    };
  } catch (err) {
    console.error("Error applying image:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}
