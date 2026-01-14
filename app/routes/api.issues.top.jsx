import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Get top 10 open issues sorted by severity
    const issues = await prisma.issue.findMany({
      where: {
        shop,
        status: "open",
      },
      orderBy: [
        { severity: "desc" },
        { createdAt: "desc" },
      ],
      take: 10,
    });

    // Calculate score based on open issues
    const openCount = issues.length;
    const criticalCount = issues.filter(i => i.severity === "critical").length;
    const highCount = issues.filter(i => i.severity === "high").length;
    
    // Deduct more points for critical/high severity
    const score = Math.max(0, 100 - (criticalCount * 10) - (highCount * 5) - (openCount * 2));

    return Response.json({
      success: true,
      issues: issues.map(issue => ({
        id: issue.id,
        title: `${issue.productTitle} - ${issue.issueType.replace(/_/g, ' ')}`,
        issueType: issue.issueType,
        severity: issue.severity,
        category: issue.category || "General",
        productTitle: issue.productTitle,
        entityId: issue.entityId,
      })),
      score,
      openCount,
      criticalCount,
      highCount,
    });
  } catch (error) {
    console.error("Failed to fetch top issues:", error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
