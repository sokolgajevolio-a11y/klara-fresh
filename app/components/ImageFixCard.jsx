import { useState } from "react";
import { useFetcher } from "react-router";
import styles from "./ImageFixCard.module.css";

export function ImageFixCard({ issue, onFixed }) {
  const fetcher = useFetcher();
  const [activeTab, setActiveTab] = useState("internal"); // "internal", "stock", or "ai"
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockImages, setStockImages] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStyles, setAiStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("STUDIO");
  const [loadingGeneration, setLoadingGeneration] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const isLoading = fetcher.state !== "idle";

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/image-suggestions?productId=${encodeURIComponent(issue.entityId)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Failed to load suggestions:", err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const loadStockImages = async () => {
    setLoadingStock(true);
    try {
      const response = await fetch(`/api/stock-images?productId=${encodeURIComponent(issue.entityId)}`);
      const data = await response.json();
      setStockImages(data.images || []);
    } catch (err) {
      console.error("Failed to load stock images:", err);
      setStockImages([]);
    } finally {
      setLoadingStock(false);
    }
  };

  const loadAIStyles = async () => {
    try {
      const response = await fetch('/api/generate-image?action=styles');
      const data = await response.json();
      setAiEnabled(data.enabled);
      setAiStyles(data.styles || []);
      if (data.styles && data.styles.length > 0) {
        setSelectedStyle(data.styles[0].value);
      }
    } catch (err) {
      console.error("Failed to load AI styles:", err);
      setAiEnabled(false);
    }
  };

  const generateAIImage = async () => {
    setLoadingGeneration(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: issue.entityId,
          style: selectedStyle,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedImage(data.image);
      } else {
        console.error("AI generation failed:", data.error);
        alert("Failed to generate image: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to generate AI image:", err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoadingGeneration(false);
    }
  };

  const handleApplyImage = (suggestion, isStock = false, isAI = false) => {
    setSelectedImage(suggestion);
    
    const formData = new FormData();
    formData.append("issueId", issue.id);
    formData.append("productId", issue.entityId);
    formData.append("imageUrl", suggestion.url);
    formData.append("altText", suggestion.altText || suggestion.description || suggestion.prompt || issue.title);
    formData.append("source", isAI ? `AI (${suggestion.provider})` : (isStock ? suggestion.provider : suggestion.source));
    formData.append("sourceTitle", isAI ? `AI-Generated: ${suggestion.style}` : (isStock ? `${suggestion.provider}: ${suggestion.photographer}` : suggestion.sourceTitle));
    
    // Stock image specific fields
    if (isStock) {
      formData.append("isStockImage", "true");
      formData.append("stockProvider", suggestion.provider);
      formData.append("downloadUrl", suggestion.downloadUrl || suggestion.url);
      formData.append("photographer", suggestion.photographer || "Unknown");
      formData.append("photographerUrl", suggestion.photographerUrl || "");
    } else {
      formData.append("isStockImage", "false");
    }

    // AI image specific fields
    if (isAI) {
      formData.append("isAIImage", "true");
      formData.append("aiProvider", suggestion.provider);
      formData.append("aiPrompt", suggestion.prompt || "");
      formData.append("aiStyle", suggestion.style || "");
    } else {
      formData.append("isAIImage", "false");
    }
    
    fetcher.submit(formData, {
      method: "POST",
      action: "/api/fix-image",
    });
  };

  // Check if fix was successful
  if (fetcher.data?.success) {
    if (onFixed) {
      setTimeout(() => onFixed(issue.id), 500);
    }
  }

  const issueLabel = issue.issueType === "missing_images" ? "No Images" : "Only 1 Image";

  // Auto-load based on tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "internal" && !suggestions) {
      loadSuggestions();
    } else if (tab === "stock" && !stockImages) {
      loadStockImages();
    } else if (tab === "ai" && aiStyles.length === 0) {
      loadAIStyles();
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.productInfo}>
          <div className={styles.thumbnail}>
            {issue.issueType === "missing_images" ? (
              <div className={styles.placeholderIcon}>📷</div>
            ) : (
              <div className={styles.placeholderIcon}>🖼️</div>
            )}
          </div>
          <div>
            <h3 className={styles.productTitle}>{issue.title}</h3>
            <span className={styles.issueLabel}>{issueLabel}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "internal" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("internal")}
        >
          📦 From My Store
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "stock" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("stock")}
        >
          🌐 Free Stock Images
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "ai" ? styles.tabActive : ""}`}
          onClick={() => handleTabChange("ai")}
        >
          🎨 Generate AI Image
        </button>
      </div>

      {fetcher.data?.error && (
        <div className={styles.error}>
          ❌ {fetcher.data.error}
        </div>
      )}

      {fetcher.data?.success && (
        <div className={styles.success}>
          ✅ Image applied successfully!
        </div>
      )}

      {/* Internal images tab */}
      {activeTab === "internal" && (
        <>
          {!suggestions && (
            <div className={styles.tabContent}>
              <button
                type="button"
                className={styles.loadBtn}
                onClick={loadSuggestions}
                disabled={loadingSuggestions}
              >
                {loadingSuggestions ? "Searching your store..." : "Search My Store Images"}
              </button>
            </div>
          )}

          {suggestions && suggestions.length === 0 && (
            <div className={styles.noSuggestions}>
              <p>No existing images found in your store for this product.</p>
              <p className={styles.hint}>
                Try the "Free Stock Images" tab or upload images manually.
              </p>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <h4 className={styles.suggestionsTitle}>
                Found {suggestions.length} image{suggestions.length !== 1 ? "s" : ""} from your store:
              </h4>
              <div className={styles.grid}>
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className={styles.suggestionCard}>
                    <div className={styles.imagePreview}>
                      <img src={suggestion.url} alt={suggestion.altText} />
                    </div>
                    <div className={styles.suggestionInfo}>
                      <span className={styles.source}>{suggestion.sourceTitle}</span>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.previewBtn}
                          onClick={() => window.open(suggestion.url, "_blank")}
                          disabled={isLoading}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className={styles.applyBtn}
                          onClick={() => handleApplyImage(suggestion, false)}
                          disabled={isLoading}
                        >
                          {isLoading && selectedImage === suggestion ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Stock images tab */}
      {activeTab === "stock" && (
        <>
          {!stockImages && (
            <div className={styles.tabContent}>
              <button
                type="button"
                className={styles.loadBtn}
                onClick={loadStockImages}
                disabled={loadingStock}
              >
                {loadingStock ? "Searching free stock images..." : "Search Free Stock Images"}
              </button>
              <p className={styles.stockNote}>
                Free images from Unsplash and Pexels
              </p>
            </div>
          )}

          {stockImages && stockImages.length === 0 && (
            <div className={styles.noSuggestions}>
              <p>No stock images found for this product.</p>
              <p className={styles.hint}>
                Try the "From My Store" tab or upload images manually.
              </p>
            </div>
          )}

          {stockImages && stockImages.length > 0 && (
            <div className={styles.suggestions}>
              <h4 className={styles.suggestionsTitle}>
                Found {stockImages.length} free stock image{stockImages.length !== 1 ? "s" : ""}:
              </h4>
              <div className={styles.grid}>
                {stockImages.map((image, idx) => (
                  <div key={idx} className={styles.suggestionCard}>
                    <div className={styles.imagePreview}>
                      <img src={image.thumbUrl || image.url} alt={image.description} />
                    </div>
                    <div className={styles.suggestionInfo}>
                      <span className={styles.source}>
                        {image.provider}
                      </span>
                      <span className={styles.photographer}>
                        Photo by {image.photographer}
                      </span>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.previewBtn}
                          onClick={() => window.open(image.url, "_blank")}
                          disabled={isLoading}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className={styles.applyBtn}
                          onClick={() => handleApplyImage(image, true)}
                          disabled={isLoading}
                        >
                          {isLoading && selectedImage === image ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* AI generation tab */}
      {activeTab === "ai" && (
        <>
          {!aiEnabled && aiStyles.length === 0 && (
            <div className={styles.tabContent}>
              <div className={styles.aiDisabled}>
                <p>⚙️ AI image generation is not configured.</p>
                <p className={styles.hint}>
                  Add your OpenAI or Stability AI API key to your .env file to enable this feature.
                </p>
              </div>
            </div>
          )}

          {aiEnabled && !generatedImage && (
            <div className={styles.tabContent}>
              <div className={styles.aiGenerator}>
                <h4 className={styles.aiTitle}>Generate a Product Image with AI</h4>
                <p className={styles.costWarning}>
                  ⚠️ AI image generation uses your API credits and may incur costs.
                </p>
                
                <div className={styles.styleSelector}>
                  <label htmlFor="styleSelect">Image Style:</label>
                  <select 
                    id="styleSelect"
                    value={selectedStyle} 
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className={styles.styleDropdown}
                  >
                    {aiStyles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className={styles.generateBtn}
                  onClick={generateAIImage}
                  disabled={loadingGeneration}
                >
                  {loadingGeneration ? "🎨 Generating..." : "🎨 Generate Image"}
                </button>
              </div>
            </div>
          )}

          {generatedImage && (
            <div className={styles.aiPreview}>
              <h4 className={styles.suggestionsTitle}>AI-Generated Image:</h4>
              <div className={styles.generatedCard}>
                <div className={styles.imagePreview}>
                  <img src={generatedImage.url} alt={generatedImage.prompt} />
                  <span className={styles.aiProvider}>
                    {generatedImage.provider === 'openai' ? 'OpenAI DALL-E' : 'Stability AI'}
                  </span>
                </div>
                <div className={styles.suggestionInfo}>
                  <span className={styles.aiPromptLabel}>Style: {generatedImage.style}</span>
                  <span className={styles.aiPrompt}>
                    Prompt: {generatedImage.prompt}
                  </span>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.regenerateBtn}
                      onClick={() => {
                        setGeneratedImage(null);
                        generateAIImage();
                      }}
                      disabled={isLoading || loadingGeneration}
                    >
                      Regenerate
                    </button>
                    <button
                      type="button"
                      className={styles.applyBtn}
                      onClick={() => handleApplyImage(generatedImage, false, true)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Applying..." : "Apply Image"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
