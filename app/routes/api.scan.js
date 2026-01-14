import { authenticate } from "../shopify.server";
import { detectIssues, saveIssues } from "../utils/fixEngine.server";
import prisma from "../db.server";

export async function action({ request }) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    const task = await prisma.task.create({
      data: { shop, intent: "scan", status: "running" },
    });

    const detectedIssues = await detectIssues(admin, shop);
    const savedIssues = await saveIssues(detectedIssues);

    await prisma.task.update({
      where: { id: task.id },
      data: { status: "done" },
    });

    const openCount = savedIssues.filter(i => i.status === "open").length;
    const score = Math.max(0, 100 - (openCount * 5));

    return new Response(JSON.stringify({
      success: true,
      issuesFound: savedIssues.length,
      openIssues: openCount,
      score,
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Scan error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
