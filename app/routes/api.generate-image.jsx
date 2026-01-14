import { authenticate } from "../shopify.server";
import { generateAIImage, getAvailableStyles, isAIImageEnabled } from "../utils/aiImages.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // Get available styles
  if (action === "styles") {
    const enabled = isAIImageEnabled();
    return new Response(
      JSON.stringify({
        enabled,
        styles: enabled ? getAvailableStyles() : [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { admin } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const productId = formData.get("productId");
    const style = formData.get("style") || "STUDIO";

    if (!productId) {
      return new Response(
        JSON.stringify({ error: "Missing productId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if AI generation is enabled
    if (!isAIImageEnabled()) {
      return new Response(
        JSON.stringify({
          error: "AI image generation is not configured. Please add OPENAI_API_KEY or STABILITY_API_KEY to .env",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get product details for prompt generation
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

    // Generate AI image
    const result = await generateAIImage(product, style);

    return new Response(
      JSON.stringify({
        success: true,
        image: {
          url: result.url,
          provider: result.provider,
          prompt: result.originalPrompt,
          revisedPrompt: result.revisedPrompt,
          style: result.style,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error generating AI image:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to generate AI image",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
