import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateProductDescription(product) {
  const prompt = `You are writing a product description for an e-commerce store selling snowboards and outdoor gear.

Product Name: ${product.title}
${product.vendor ? `Brand: ${product.vendor}` : ""}
${product.productType ? `Category: ${product.productType}` : ""}
${product.tags && product.tags.length > 0 ? `Tags: ${product.tags.join(", ")}` : ""}

Write a compelling 2-3 sentence product description that:
- Describes what this product actually IS based on its name
- Highlights key benefits or features a customer would care about
- Sounds natural, professional, and specific to THIS product
- Does NOT use generic filler phrases

Return ONLY the description text, no quotes, no preamble.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim();
}

export async function generateSeoDescription(product) {
  const prompt = `Write a meta description for this product page:

Product Name: ${product.title}
${product.vendor ? `Brand: ${product.vendor}` : ""}
${product.productType ? `Category: ${product.productType}` : ""}

Requirements:
- Maximum 155 characters
- Describe what THIS specific product is
- Make it compelling for search results
- Be specific, not generic

Return ONLY the meta description text, nothing else.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim();
}

export async function generateSeoTitle(product) {
  const prompt = `Write an SEO page title for this product:

Product Name: ${product.title}
${product.vendor ? `Brand: ${product.vendor}` : ""}
${product.productType ? `Category: ${product.productType}` : ""}

Requirements:
- Maximum 60 characters total
- Must include the product name or a clear version of it
- Should be descriptive and search-friendly
- NO generic phrases like "Shop Now" or "Buy Online" or "| Store Name"

Return ONLY the title text, nothing else.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 50,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim();
}

export async function generateAltText(product, imageIndex) {
  const prompt = `Write image alt text for a product photo:

Product Name: ${product.title}
${product.vendor ? `Brand: ${product.vendor}` : ""}
${product.productType ? `Category: ${product.productType}` : ""}
Image number: ${imageIndex + 1}

Requirements:
- Under 125 characters
- Describe what the image likely shows (product photo)
- Be specific to this product
- Good for accessibility

Return ONLY the alt text, nothing else.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 50,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim();
}

export async function generateSku(product) {
  const prompt = `Generate a SKU (stock keeping unit) code for this product:

Product Name: ${product.title}
${product.vendor ? `Brand: ${product.vendor}` : ""}
${product.productType ? `Category: ${product.productType}` : ""}

Requirements:
- 8-12 characters
- Use uppercase letters and numbers only
- Should be memorable and relate to the product
- Format like: CAT-PROD-001 or BRAND-ITEM

Return ONLY the SKU code, nothing else.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 30,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim();
}
