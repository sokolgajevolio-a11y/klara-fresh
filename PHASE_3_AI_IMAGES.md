# Phase 3: AI-Generated Images - Implementation Summary

## Overview
Phase 3 adds **AI-generated product images** as a third option in the Klara AI image fix system, complementing Phase 1 (internal store images) and Phase 2 (free stock images).

## Features
- ✅ **OpenAI DALL-E 3** integration (default provider)
- ✅ **Stability AI** integration (alternative provider)
- ✅ **4 Generation Styles**: STUDIO, LIFESTYLE, FLATLAY, PROMOTIONAL
- ✅ **Safe Prompts**: Excludes people, faces, logos, text, watermarks
- ✅ **Cost Warning**: Users are informed about API costs before generation
- ✅ **Preview & Regenerate**: Users can preview and regenerate before applying
- ✅ **Full Undo Support**: AI images tracked in FixHistory with action "ADD_IMAGE_AI"

## Files Created/Modified

### New Files
1. **`app/utils/aiImages.server.js`** (217 lines)
   - Core AI image generation logic
   - Functions:
     - `generateWithOpenAI(prompt, size)` - DALL-E 3 generation
     - `generateWithStability(prompt)` - Stability AI generation
     - `buildPrompt(product, style)` - Constructs safe prompts
     - `downloadAIImage(imageUrl)` - Downloads both URLs and data URLs
     - `getAvailableStyles()` - Returns style options
     - `isAIImageEnabled()` - Checks if API keys are configured

2. **`app/routes/api.generate-image.jsx`**
   - HTTP endpoint for AI image generation
   - Routes:
     - `GET ?action=styles` - Returns enabled status + available styles
     - `POST` with productId + style - Generates image

### Modified Files
1. **`app/routes/api.fix-image.jsx`**
   - Added AI image support
   - New formData fields: `isAIImage`, `aiProvider`, `aiPrompt`, `aiStyle`
   - Downloads AI images before uploading to Shopify
   - FixHistory action: "ADD_IMAGE_AI" for AI-generated images

2. **`app/components/ImageFixCard.jsx`**
   - Added 3rd tab: "🎨 Generate AI Image"
   - Style selector dropdown (STUDIO/LIFESTYLE/FLATLAY/PROMOTIONAL)
   - Generate button with cost warning
   - Preview section with provider label, prompt, Apply/Regenerate buttons

3. **`app/components/ImageFixCard.module.css`**
   - New styles for AI generation tab
   - `.aiGenerator`, `.aiPreview`, `.generateBtn`, `.costWarning`
   - `.styleSelector`, `.aiProvider`, `.regenerateBtn`

4. **`.env`**
   - Added AI configuration placeholders:
     - `AI_IMAGE_PROVIDER` - Choose "openai" or "stability"
     - `OPENAI_API_KEY` - OpenAI API key
     - `STABILITY_API_KEY` - Stability AI API key

## Configuration

### 1. Choose Your Provider
Edit `.env`:
```bash
AI_IMAGE_PROVIDER="openai"  # or "stability"
```

### 2. Add Your API Key

**Option A: OpenAI DALL-E 3** (default)
1. Get key at: https://platform.openai.com/api-keys
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY="sk-..."
   ```
3. Pricing: ~$0.040 per image (1024x1024, standard quality)

**Option B: Stability AI**
1. Get key at: https://platform.stability.ai/account/keys
2. Add to `.env`:
   ```bash
   STABILITY_API_KEY="sk-..."
   ```
3. Pricing: ~$0.02 per image (1024x1024)

## User Flow

1. **Navigate to AI Tab**: Click "🎨 Generate AI Image"
2. **Select Style**: Choose from dropdown:
   - **STUDIO**: Clean white background, professional product shot
   - **LIFESTYLE**: Natural setting with complementary elements
   - **FLATLAY**: Top-down view, minimal aesthetic
   - **PROMOTIONAL**: Neutral background with professional lighting
3. **Generate Image**: Click "🎨 Generate Image" (sees cost warning)
4. **Preview**: Generated image appears with provider label and prompt
5. **Apply or Regenerate**: 
   - Click "Apply Image" to use the image
   - Click "Regenerate" to try again with same style
6. **Undo**: Full undo support via FixHistory

## Safety Features

### Negative Prompts
All AI generations include negative prompts to prevent:
- ❌ People or faces
- ❌ Logos or branding
- ❌ Text or watermarks
- ❌ Inappropriate content

### Prompt Construction
Prompts are built from:
- Product type (e.g., "T-shirt", "Coffee Mug")
- Product title keywords (cleaned of brand names)
- Product tags (filtered for relevant descriptors)
- Style-specific instructions

Example prompt:
```
A professional product photo of a blue ceramic coffee mug.
Clean white background, centered composition, high-quality product photography.
Negative prompt: no people, no faces, no logos, no text, no watermarks
```

## Technical Details

### OpenAI DALL-E 3
- Model: `dall-e-3`
- Size: `1024x1024`
- Quality: `standard`
- Response: HTTP URL (expires after ~1 hour)

### Stability AI
- Model: `stable-diffusion-xl-1024-v1-0`
- CFG Scale: 7
- Steps: 30
- Response: Base64 data URL

### Image Download & Upload
Both providers return different formats:
- OpenAI: HTTP URL → Download → Convert to base64
- Stability: Base64 data URL → Use directly

Both are converted to base64 data URLs before uploading to Shopify.

### FixHistory Tracking
AI-generated images are tracked with:
```javascript
{
  action: "ADD_IMAGE_AI",
  metadata: {
    imageUrl: "https://...",
    altText: "Product photo",
    source: "AI (openai)",
    sourceTitle: "AI-Generated: STUDIO",
    aiProvider: "openai",
    aiPrompt: "A professional product photo...",
    aiStyle: "STUDIO"
  }
}
```

## Testing

### 1. Test with OpenAI
```bash
# Add to .env
OPENAI_API_KEY="sk-..."
AI_IMAGE_PROVIDER="openai"
```

### 2. Test with Stability AI
```bash
# Add to .env
STABILITY_API_KEY="sk-..."
AI_IMAGE_PROVIDER="stability"
```

### 3. Test the UI
1. Find a product with missing images
2. Click "🎨 Generate AI Image" tab
3. Select a style (STUDIO, LIFESTYLE, etc.)
4. Click "Generate Image"
5. Verify cost warning appears
6. Wait for generation (10-30 seconds)
7. Preview the image
8. Click "Regenerate" to test new generation
9. Click "Apply Image" to use it
10. Verify FixHistory logs ADD_IMAGE_AI

### 4. Verify Other Phases Still Work
- Phase 1: "📦 From My Store" tab should work
- Phase 2: "🌐 Free Stock Images" tab should work
- All three phases should coexist without conflicts

## Pricing Comparison

| Provider | Cost per Image | Quality | Speed |
|----------|---------------|---------|-------|
| **OpenAI DALL-E 3** | ~$0.040 | Excellent | 10-20s |
| **Stability AI** | ~$0.020 | Very Good | 15-30s |
| **Stock Images** | Free | Variable | Instant |
| **Store Images** | Free | Existing | Instant |

## Shopify Compliance

✅ **Clearly Labeled**: "AI-Generated" badge on all images
✅ **Opt-In Only**: No automatic generation, explicit user action required
✅ **Cost Transparent**: Warning shown before generation
✅ **Undoable**: Full undo support via FixHistory
✅ **Safe Content**: Negative prompts prevent inappropriate images

## Limitations

1. **API Costs**: Each generation costs money (not free like stock images)
2. **Generation Time**: 10-30 seconds per image
3. **Quality Variance**: Results may vary, regeneration recommended
4. **No Exact Control**: AI interpretation may not match expectations
5. **API Limits**: Subject to provider rate limits and quotas

## Future Enhancements

- [ ] Batch generation for multiple products
- [ ] Custom prompt editing (advanced mode)
- [ ] Image upscaling options
- [ ] Background removal integration
- [ ] Cost tracking/limits per merchant
- [ ] Style preview examples
- [ ] Favorite/save generated prompts

## Support

If you encounter issues:
1. Check `.env` has correct API key
2. Check `AI_IMAGE_PROVIDER` matches your key (openai/stability)
3. Check API key is valid and has credits
4. Check browser console for error messages
5. Check server logs for generation failures

## Conclusion

Phase 3 completes the three-tier image fix system:
- **Tier 1**: Use existing store images (free, instant)
- **Tier 2**: Use free stock images (free, instant, attribution required)
- **Tier 3**: Generate AI images (paid, slow, custom-created)

All three phases work independently and can be used based on the merchant's needs and budget.
