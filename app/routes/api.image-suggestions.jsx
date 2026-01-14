import { authenticate } from "../shopify.server";
import { findInternalImageSuggestions } from "../utils/imageHelper.server";

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
    const suggestions = await findInternalImageSuggestions(admin, productId);
    
    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to find suggestions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
