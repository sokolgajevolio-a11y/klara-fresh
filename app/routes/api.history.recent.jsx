import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Get recent fix history (last 10)
    const fixes = await prisma.fixHistory.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return Response.json({
      success: true,
      fixes: fixes.map(fix => ({
        id: fix.id,
        action: fix.action,
        issueType: fix.issueType,
        productTitle: fix.productTitle,
        description: fix.description || `${fix.action} - ${fix.productTitle}`,
        createdAt: fix.createdAt,
        undone: fix.undone,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch fix history:", error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
