/**
 * AI Image Generation (Phase 3)
 * Generate product images using AI for fixing image issues
 * User must manually trigger and approve
 */

const GENERATION_STYLES = {
  STUDIO: {
    name: "Clean Studio Background",
    prompt: "professional product photography, clean white background, studio lighting, high quality, centered composition",
  },
  LIFESTYLE: {
    name: "Lifestyle Setting",
    prompt: "product in lifestyle setting, natural lighting, realistic scene, professional photography, high quality",
  },
  FLATLAY: {
    name: "Minimal Flat Lay",
    prompt: "minimal flat lay photography, top-down view, clean composition, soft lighting, professional product shot",
  },
  PROMOTIONAL: {
    name: "Neutral Promotional",
    prompt: "neutral promotional product image, professional, clean aesthetic, high quality photography",
  },
};

/**
 * Generate AI image using OpenAI DALL-E
 * Requires OPENAI_API_KEY in .env
 */
export async function generateWithOpenAI(prompt, size = "1024x1024") {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set in .env");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        quality: "standard",
        response_format: "url",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error("No images generated");
    }

    return {
      url: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
      provider: "OpenAI DALL-E 3",
    };
  } catch (err) {
    console.error("Error generating image with OpenAI:", err);
    throw err;
  }
}

/**
 * Generate AI image using Stability AI
 * Requires STABILITY_API_KEY in .env
 */
export async function generateWithStability(prompt) {
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    throw new Error("STABILITY_API_KEY not set in .env");
  }

  try {
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
            {
              text: "people, faces, logos, text, watermarks, blurry, low quality",
              weight: -1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Stability API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.artifacts || data.artifacts.length === 0) {
      throw new Error("No images generated");
    }

    // Convert base64 to data URL
    const base64Image = data.artifacts[0].base64;
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return {
      url: dataUrl,
      revisedPrompt: prompt,
      provider: "Stability AI",
    };
  } catch (err) {
    console.error("Error generating image with Stability:", err);
    throw err;
  }
}

/**
 * Build AI generation prompt from product data and style
 */
export function buildPrompt(product, style) {
  const styleConfig = GENERATION_STYLES[style] || GENERATION_STYLES.STUDIO;

  const productInfo = [];

  // Add product type (most important)
  if (product.productType && product.productType.trim()) {
    productInfo.push(product.productType.trim().toLowerCase());
  }

  // Add key words from title
  if (product.title) {
    const titleWords = product.title
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 3)
      .join(" ")
      .toLowerCase();
    productInfo.push(titleWords);
  }

  // Add first tag if relevant
  if (product.tags && product.tags.length > 0) {
    const firstTag = product.tags[0];
    if (firstTag && firstTag.length > 2 && firstTag.length < 20) {
      productInfo.push(firstTag.toLowerCase());
    }
  }

  const productDescription = productInfo.join(", ") || "product";

  // Build final prompt with safety guidelines
  const finalPrompt = `${productDescription}, ${styleConfig.prompt}. No people, no faces, no brand logos, no text, no watermarks. Product-focused, commercial photography style.`;

  return {
    prompt: finalPrompt,
    styleName: styleConfig.name,
  };
}

/**
 * Generate AI image for a product
 * Tries configured provider, falls back if needed
 */
export async function generateAIImage(product, style = "STUDIO") {
  const { prompt, styleName } = buildPrompt(product, style);

  const provider = process.env.AI_IMAGE_PROVIDER || "openai";

  try {
    let result;

    if (provider.toLowerCase() === "stability") {
      result = await generateWithStability(prompt);
    } else {
      // Default to OpenAI
      result = await generateWithOpenAI(prompt);
    }

    return {
      ...result,
      originalPrompt: prompt,
      style: styleName,
    };
  } catch (err) {
    console.error("AI image generation failed:", err);
    throw err;
  }
}

/**
 * Download AI-generated image (if URL) or return data URL as-is
 */
export async function downloadAIImage(imageUrl) {
  try {
    // If it's a data URL, return as-is (Stability returns base64)
    if (imageUrl.startsWith("data:")) {
      return imageUrl;
    }

    // If it's a URL, download it (OpenAI returns URL)
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download AI image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = response.headers.get("content-type") || "image/png";

    return `data:${mimeType};base64,${base64}`;
  } catch (err) {
    console.error("Error downloading AI image:", err);
    throw err;
  }
}

/**
 * Get available generation styles
 */
export function getAvailableStyles() {
  return Object.keys(GENERATION_STYLES).map((key) => ({
    id: key,
    name: GENERATION_STYLES[key].name,
  }));
}

/**
 * Check if AI image generation is configured
 */
export function isAIImageEnabled() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const stabilityKey = process.env.STABILITY_API_KEY;
  
  return !!(openaiKey || stabilityKey);
}
