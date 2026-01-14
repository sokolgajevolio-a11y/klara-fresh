# Quick Start: Testing AI Image Generation

## Setup (Choose ONE)

### Option 1: OpenAI DALL-E 3 (Recommended)
1. Get API key: https://platform.openai.com/api-keys
2. Edit `.env`:
   ```bash
   OPENAI_API_KEY="sk-proj-..."
   AI_IMAGE_PROVIDER="openai"
   ```
3. Cost: ~$0.04 per image

### Option 2: Stability AI
1. Get API key: https://platform.stability.ai/account/keys
2. Edit `.env`:
   ```bash
   STABILITY_API_KEY="sk-..."
   AI_IMAGE_PROVIDER="stability"
   ```
3. Cost: ~$0.02 per image

## Test Flow

1. **Start the app** (if not already running)
2. **Find a product** with missing images in the Issues list
3. **Click the product card** to expand image fix options
4. **Click "🎨 Generate AI Image" tab**
5. **Select a style** from dropdown:
   - STUDIO (white background)
   - LIFESTYLE (natural setting)
   - FLATLAY (top-down)
   - PROMOTIONAL (neutral professional)
6. **Click "🎨 Generate Image"**
7. **Wait 10-30 seconds** for generation
8. **Review the image** (provider label shows OpenAI/Stability)
9. **Try "Regenerate"** to create a new variation
10. **Click "Apply Image"** to add to product
11. **Verify success** message appears
12. **Check FixHistory** logs "ADD_IMAGE_AI" action

## Verify All Phases Work

- ✅ Phase 1: "📦 From My Store" tab
- ✅ Phase 2: "🌐 Free Stock Images" tab  
- ✅ Phase 3: "🎨 Generate AI Image" tab

## Generation Styles

| Style | Best For | Description |
|-------|----------|-------------|
| **STUDIO** | Any product | Clean white background, professional |
| **LIFESTYLE** | Fashion, home decor | Natural setting, contextual |
| **FLATLAY** | Small items, accessories | Top-down, minimal aesthetic |
| **PROMOTIONAL** | Marketing images | Neutral background, pro lighting |

## Troubleshooting

**"AI image generation is not configured"**
- Check `.env` has API key (OPENAI_API_KEY or STABILITY_API_KEY)
- Restart the app after adding API key

**Generation fails**
- Check API key is valid
- Check you have credits/quota remaining
- Check browser console for error messages
- Try the other provider (OpenAI ↔ Stability)

**Slow generation**
- OpenAI: 10-20 seconds (normal)
- Stability: 15-30 seconds (normal)
- If > 60 seconds, check your internet connection

**Poor quality images**
- Try different style
- Click "Regenerate" for new variation
- Consider using stock images instead (Phase 2)

## Cost Management

To avoid unexpected costs:
1. Test with small quotas first
2. Monitor API usage in provider dashboard
3. Set up billing alerts in provider account
4. Use stock images (Phase 2) for bulk fixes
5. Reserve AI generation for specific products

## Example Products to Test

**Good candidates for AI generation:**
- Products with generic descriptions (e.g., "Blue T-Shirt")
- Products with tags (e.g., "cotton", "summer", "casual")
- Products with clear type (e.g., "Coffee Mug", "Sneakers")

**Poor candidates:**
- Products with unique/branded features
- Products requiring specific logos/text
- Products with complex custom designs
- Products that need human models (AI won't generate people)

## Success Indicators

✅ Image generates in 10-30 seconds
✅ Preview shows provider badge (OpenAI/Stability)
✅ Image matches selected style
✅ No people/faces/logos in image
✅ Apply button works
✅ Success message appears
✅ Product now has the new image
✅ Undo works (reverts the image)

## Next Steps

After confirming AI generation works:
1. Test all 4 styles (STUDIO, LIFESTYLE, FLATLAY, PROMOTIONAL)
2. Try both providers (OpenAI and Stability)
3. Test regeneration multiple times
4. Verify undo functionality
5. Check Phase 1 and Phase 2 still work
6. Monitor API costs in provider dashboard

## Questions?

Check `PHASE_3_AI_IMAGES.md` for detailed documentation.
