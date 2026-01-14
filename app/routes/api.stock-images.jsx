import { authenticate } from "../shopify.server";
import { searchStockImages, generateSearchQuery } from "../utils/imageSources.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");

  if (!productId) {
    return new Response(JSON.stringify({ error: "Missing productId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get product details for search query
    const productResponse = await admin.graphql(
      `query($id: ID!) {
        product(id: $id) {
          id
          title
          productType
          tags
        }
      }`,
      { variables: { id: productId } }
    );

    const productData = await productResponse.json();
    const product = productData.data?.product;

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate search query from product data
    const searchQuery = generateSearchQuery(product);

    // Search stock images
    const images = await searchStockImages(searchQuery, 6);
    
    return new Response(
      JSON.stringify({ 
        images,
        searchQuery,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error searching stock images:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to search stock images" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
