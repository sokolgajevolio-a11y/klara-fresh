import { authenticate } from "../shopify.server";
import { applyImageToProduct } from "../utils/imageHelper.server";
import { downloadStockImage } from "../utils/imageSources.server";
import { downloadAIImage } from "../utils/aiImages.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { admin, session } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const issueId = formData.get("issueId");
    const productId = formData.get("productId");
    const imageUrl = formData.get("imageUrl");
    const altText = formData.get("altText");
    const source = formData.get("source");
    const sourceTitle = formData.get("sourceTitle");
    const isStockImage = formData.get("isStockImage") === "true";
    const stockProvider = formData.get("stockProvider");
    const downloadUrl = formData.get("downloadUrl");
    const photographer = formData.get("photographer");
    const photographerUrl = formData.get("photographerUrl");
    const isAIImage = formData.get("isAIImage") === "true";
    const aiProvider = formData.get("aiProvider");
    const aiPrompt = formData.get("aiPrompt");
    const aiStyle = formData.get("aiStyle");

    if (!issueId || !productId || !imageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return new Response(JSON.stringify({ error: "Issue not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get product before state
    const beforeResponse = await admin.graphql(
      `query($id: ID!) {
        product(id: $id) {
          id
          title
          images(first: 10) {
            edges {
              node {
                id
                url
              }
            }
          }
        }
      }`,
      { variables: { id: productId } }
    );

    const beforeData = await beforeResponse.json();
    const beforeSnapshot = {
      productId,
      imageCount: beforeData.data?.product?.images?.edges?.length || 0,
      images: beforeData.data?.product?.images?.edges?.map((e) => e.node.url) || [],
    };

    // For stock images or AI images, download first then upload to Shopify
    let finalImageUrl = imageUrl;
    if (isStockImage && stockProvider) {
      try {
        // Download image from stock provider
        const imageBuffer = await downloadStockImage(imageUrl, downloadUrl, stockProvider);
        
        // Upload to Shopify as base64
        const base64Image = imageBuffer.toString('base64');
        const mimeType = imageUrl.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg' : 'image/png';
        finalImageUrl = `data:${mimeType};base64,${base64Image}`;
      } catch (err) {
        console.error("Failed to download stock image:", err);
        return new Response(
          JSON.stringify({ error: "Failed to download stock image: " + err.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else if (isAIImage && aiProvider) {
      try {
        // Download AI-generated image (handles both URLs and data URLs)
        finalImageUrl = await downloadAIImage(imageUrl);
      } catch (err) {
        console.error("Failed to download AI image:", err);
        return new Response(
          JSON.stringify({ error: "Failed to download AI image: " + err.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Apply the image
    const result = await applyImageToProduct(admin, productId, finalImageUrl, altText);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || "Failed to apply image" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get product after state
    const afterResponse = await admin.graphql(
      `query($id: ID!) {
        product(id: $id) {
          id
          images(first: 10) {
            edges {
              node {
                id
                url
              }
            }
          }
        }
      }`,
      { variables: { id: productId } }
    );

    const afterData = await afterResponse.json();
    const afterSnapshot = {
      productId,
      imageCount: afterData.data?.product?.images?.edges?.length || 0,
      images: afterData.data?.product?.images?.edges?.map((e) => e.node.url) || [],
    };

    // Mark issue as fixed
    await prisma.issue.update({
      where: { id: issueId },
      data: { status: "fixed" },
    });

    // Save fix history
    const fixAction = isAIImage 
      ? "ADD_IMAGE_AI" 
      : (isStockImage ? "ADD_IMAGE_STOCK" : "ADD_IMAGE_INTERNAL");

    const fixMetadata = {
      imageUrl,
      altText,
      source,
      sourceTitle,
      ...(isStockImage && {
        stockProvider,
        photographer,
        photographerUrl,
        downloadUrl,
      }),
      ...(isAIImage && {
        aiProvider,
        aiPrompt,
        aiStyle,
      }),
    };

    await prisma.fixHistory.create({
      data: {
        issueId,
        action: fixAction,
        beforeSnapshot: JSON.stringify(beforeSnapshot),
        afterSnapshot: JSON.stringify(afterSnapshot),
        metadata: JSON.stringify(fixMetadata),
        success: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Image applied successfully",
        newImages: result.newImages,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error applying image fix:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
