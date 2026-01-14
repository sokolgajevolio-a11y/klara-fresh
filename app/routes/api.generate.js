import { authenticate } from "../shopify.server";
import { generateMultipleOptions } from "../utils/ai.server.js";
import prisma from "../db.server";

export async function action({ request }) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { admin } = await authenticate.admin(request);
    const body = await request.json();
    const { issueId } = body;

    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return new Response(JSON.stringify({ error: "Issue not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch product details from Shopify
    const productResponse = await admin.graphql(`
      query($id: ID!) {
        product(id: $id) {
          title
          vendor
          productType
          descriptionHtml
          seo { title description }
          priceRangeV2 {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          variants(first: 5) {
            edges {
              node { title }
            }
          }
        }
      }
    `, { variables: { id: issue.entityId } });

    const productData = await productResponse.json();
    const product = productData.data?.product;

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Format product for AI
    const productInfo = {
      title: product.title,
      vendor: product.vendor,
      productType: product.productType,
      variants: product.variants?.edges?.map(e => e.node) || [],
      priceRange: product.priceRangeV2?.minVariantPrice 
        ? `${product.priceRangeV2.minVariantPrice.amount} ${product.priceRangeV2.minVariantPrice.currencyCode}`
        : null,
    };

    const options = await generateMultipleOptions(productInfo, issue.issueType);

    return new Response(JSON.stringify({
      success: true,
      options,
      product: productInfo,
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Generate error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
