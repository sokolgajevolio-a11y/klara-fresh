import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateMultipleOptions(product, issueType) {
  let prompt = "";
  
  if (issueType === "missing_description") {
    prompt = `You are a professional e-commerce copywriter. Generate 3 different product descriptions for this product.

Product: ${product.title}
${product.vendor ? `Brand: ${product.vendor}` : ""}
${product.productType ? `Category: ${product.productType}` : ""}

Generate 3 DIFFERENT styles:
1. SHORT: A brief, punchy 1-sentence description
2. DETAILED: A comprehensive 2-3 sentence description with features
3. STORYTELLING: An engaging description that connects emotionally

Format your response as JSON only, no other text:
{"options": ["option1", "option2", "option3"]}`;
  } else if (issueType === "missing_seo_description") {
    prompt = `You are an SEO expert. Generate 3 different meta descriptions for this product.

Product: ${product.title}
${product.vendor ? `Brand: ${product.vendor}` : ""}
${product.productType ? `Category: ${product.productType}` : ""}

Generate 3 DIFFERENT approaches (each 120-155 characters):
1. BENEFIT-FOCUSED: Highlights what the customer gets
2. KEYWORD-RICH: Optimized for search engines
3. ACTION-ORIENTED: Includes a call to action

Format your response as JSON only, no other text:
{"options": ["option1", "option2", "option3"]}`;
  } else if (issueType === "missing_alt_text") {
    prompt = `Write 3 different alt text options for a product image.

Product: ${product.title}
${product.productType ? `Category: ${product.productType}` : ""}

Generate 3 DIFFERENT alt texts (each under 125 characters):
1. DESCRIPTIVE: Describes the product visually
2. CONTEXTUAL: Describes how the product might be used
3. SIMPLE: Just the product name and type

Format your response as JSON only, no other text:
{"options": ["option1", "option2", "option3"]}`;
  }

  if (!prompt) {
    return ["Default fix option 1", "Default fix option 2", "Default fix option 3"];
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.options || [];
    }
  } catch (e) {
    console.error("Failed to generate AI options:", e);
  }
  
  return ["Default fix option 1", "Default fix option 2", "Default fix option 3"];
}
