import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const FIXABLE_TYPES = [
  "missing_description",
  "missing_seo_description", 
  "missing_seo_title",
  "missing_alt_text",
];

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
    const { issueId, fixData } = body;

    if (!issueId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing issueId",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const issue = await prisma.issue.findUnique({ where: { id: issueId } });

    if (!issue) {
      return new Response(JSON.stringify({
        success: false,
        error: "Issue not found",
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (issue.status === "fixed") {
      return new Response(JSON.stringify({
        success: false,
        error: "Issue already fixed",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!FIXABLE_TYPES.includes(issue.issueType)) {
      return new Response(JSON.stringify({
        success: false,
        error: "This issue type requires manual action",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let beforeSnapshot = {};
    let afterSnapshot = {};
    let success = false;
    let errorMessage = null;

    try {
      if (issue.issueType === "missing_seo_description") {
        const currentResponse = await admin.graphql(`
          query($id: ID!) {
            product(id: $id) {
              seo { description }
            }
          }
        `, { variables: { id: issue.entityId } });
        const currentData = await currentResponse.json();
        beforeSnapshot = { seoDescription: currentData.data?.product?.seo?.description || "" };

        const newValue = fixData?.seoDescription || `Shop ${issue.title} - Premium quality, fast shipping, great prices.`;

        const updateResponse = await admin.graphql(`
          mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id }
              userErrors { field message }
            }
          }
        `, {
          variables: {
            input: {
              id: issue.entityId,
              seo: { description: newValue }
            }
          }
        });

        const updateData = await updateResponse.json();
        if (updateData.data?.productUpdate?.userErrors?.length > 0) {
          throw new Error(updateData.data.productUpdate.userErrors[0].message);
        }

        afterSnapshot = { seoDescription: newValue };
        success = true;

      } else if (issue.issueType === "missing_seo_title") {
        const currentResponse = await admin.graphql(`
          query($id: ID!) {
            product(id: $id) {
              seo { title }
            }
          }
        `, { variables: { id: issue.entityId } });
        const currentData = await currentResponse.json();
        beforeSnapshot = { seoTitle: currentData.data?.product?.seo?.title || "" };

        const newValue = fixData?.seoTitle || `${issue.title} | Shop Now`;

        const updateResponse = await admin.graphql(`
          mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id }
              userErrors { field message }
            }
          }
        `, {
          variables: {
            input: {
              id: issue.entityId,
              seo: { title: newValue }
            }
          }
        });

        const updateData = await updateResponse.json();
        if (updateData.data?.productUpdate?.userErrors?.length > 0) {
          throw new Error(updateData.data.productUpdate.userErrors[0].message);
        }

        afterSnapshot = { seoTitle: newValue };
        success = true;

      } else if (issue.issueType === "missing_description") {
        const currentResponse = await admin.graphql(`
          query($id: ID!) {
            product(id: $id) {
              descriptionHtml
            }
          }
        `, { variables: { id: issue.entityId } });
        const currentData = await currentResponse.json();
        beforeSnapshot = { descriptionHtml: currentData.data?.product?.descriptionHtml || "" };

        const newValue = fixData?.descriptionHtml || `<p>Introducing ${issue.title}. Built with quality materials and designed for performance.</p>`;

        const updateResponse = await admin.graphql(`
          mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id }
              userErrors { field message }
            }
          }
        `, {
          variables: {
            input: {
              id: issue.entityId,
              descriptionHtml: newValue
            }
          }
        });

        const updateData = await updateResponse.json();
        if (updateData.data?.productUpdate?.userErrors?.length > 0) {
          throw new Error(updateData.data.productUpdate.userErrors[0].message);
        }

        afterSnapshot = { descriptionHtml: newValue };
        success = true;

      } else if (issue.issueType === "missing_alt_text") {
        beforeSnapshot = { altText: "" };

        const newValue = fixData?.altText || issue.title || "Product image";

        const updateResponse = await admin.graphql(`
          mutation updateMedia($files: [FileUpdateInput!]!) {
            fileUpdate(files: $files) {
              files { id alt }
              userErrors { field message }
            }
          }
        `, {
          variables: {
            files: [{
              id: issue.entityId,
              alt: newValue
            }]
          }
        });

        const updateData = await updateResponse.json();
        if (updateData.data?.fileUpdate?.userErrors?.length > 0) {
          throw new Error(updateData.data.fileUpdate.userErrors[0].message);
        }

        afterSnapshot = { altText: newValue };
        success = true;
      }

      if (success) {
        await prisma.issue.update({
          where: { id: issue.id },
          data: { status: "fixed" },
        });
      }

    } catch (error) {
      success = false;
      errorMessage = error.message;
    }

    await prisma.fixHistory.create({
      data: {
        issueId: issue.id,
        action: `fix_${issue.issueType}`,
        beforeSnapshot: JSON.stringify(beforeSnapshot),
        afterSnapshot: JSON.stringify(afterSnapshot),
        success,
        errorMessage,
      },
    });

    return new Response(JSON.stringify({
      success,
      error: errorMessage,
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Fix error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
