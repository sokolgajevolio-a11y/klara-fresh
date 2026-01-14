import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { admin, session } = await authenticate.admin(request);
    const formData = await request.formData();
    const fixId = parseInt(formData.get("fixId"));

    if (!fixId) {
      return Response.json({
        success: false,
        error: "Missing fixId",
      }, { status: 400 });
    }

    const fixHistory = await prisma.fixHistory.findUnique({
      where: { id: fixId },
    });

    if (!fixHistory) {
      return Response.json({
        success: false,
        error: "Fix not found",
      }, { status: 404 });
    }

    if (fixHistory.undone) {
      return Response.json({
        success: false,
        error: "Fix already undone",
      }, { status: 400 });
    }

    if (!fixHistory.beforeSnapshot) {
      return Response.json({
        success: false,
        error: "No backup available for this fix",
      }, { status: 400 });
    }

    // Restore the before snapshot using Shopify Admin API
    const beforeData = JSON.parse(fixHistory.beforeSnapshot);
    
    try {
      // Restore based on issue type
      if (fixHistory.issueType === "missing_seo_description") {
        await admin.graphql(`
          mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
              }
            }
          }
        `, {
          variables: {
            input: {
              id: fixHistory.entityId,
              seo: {
                description: beforeData.seo?.description || "",
              },
            },
          },
        });
      } else if (fixHistory.issueType === "missing_seo_title") {
        await admin.graphql(`
          mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
              }
            }
          }
        `, {
          variables: {
            input: {
              id: fixHistory.entityId,
              seo: {
                title: beforeData.seo?.title || "",
              },
            },
          },
        });
      } else if (fixHistory.issueType === "missing_description") {
        await admin.graphql(`
          mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
              }
            }
          }
        `, {
          variables: {
            input: {
              id: fixHistory.entityId,
              descriptionHtml: beforeData.descriptionHtml || "",
            },
          },
        });
      }
      // Add more issue types as needed

      // Mark as undone
      await prisma.fixHistory.update({
        where: { id: fixId },
        data: { undone: true },
      });

      return Response.json({
        success: true,
        message: "Fix successfully undone",
      });

    } catch (graphqlError) {
      console.error("GraphQL error during undo:", graphqlError);
      return Response.json({
        success: false,
        error: "Failed to undo fix: " + graphqlError.message,
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Undo error:", error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
