import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  
  // Fetch products from Shopify
  const response = await admin.graphql(`
    query getProducts {
      products(first: 50) {
        nodes {
          id
          title
          handle
          status
          totalInventory
          featuredImage {
            url
            altText
          }
          seo {
            title
            description
          }
          description
          variants(first: 1) {
            nodes {
              price
            }
          }
        }
      }
    }
  `);

  const data = await response.json();
  return { shop: session.shop, products: data.data?.products?.nodes || [] };
};

export default function ProductsPage() {
  const { shop, products } = useLoaderData();

  const getProductScore = (product) => {
    let score = 100;
    if (!product.description || product.description.length < 100) score -= 25;
    if (!product.seo?.title) score -= 20;
    if (!product.seo?.description) score -= 20;
    if (!product.featuredImage) score -= 25;
    if (product.featuredImage && !product.featuredImage.altText) score -= 10;
    return Math.max(score, 0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ maxWidth: "1400px" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>
            Products
          </h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            {products.length} products • SEO & Content Analysis
          </p>
        </div>
        <button style={{
          padding: "12px 24px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
        }}>
          Bulk Fix Issues
        </button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "16px",
      }}>
        {products.map((product) => {
          const score = getProductScore(product);
          const issues = [];
          if (!product.description || product.description.length < 100) issues.push("Short description");
          if (!product.seo?.title) issues.push("Missing SEO title");
          if (!product.seo?.description) issues.push("Missing SEO description");
          if (!product.featuredImage) issues.push("No image");
          if (product.featuredImage && !product.featuredImage.altText) issues.push("Missing alt text");

          return (
            <div key={product.id} style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e5e5e5",
              overflow: "hidden",
              transition: "box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{
                position: "relative",
                paddingTop: "100%",
                background: "#f9fafb",
              }}>
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    color: "#ccc",
                  }}>
                    📦
                  </div>
                )}
                <div style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: getScoreColor(score),
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                  {score}
                </div>
              </div>

              <div style={{ padding: "16px" }}>
                <h3 style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: "8px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {product.title}
                </h3>

                {product.variants?.nodes?.[0]?.price && (
                  <div style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "12px",
                  }}>
                    ${product.variants.nodes[0].price}
                  </div>
                )}

                {issues.length > 0 && (
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}>
                    {issues.map((issue, i) => (
                      <span key={i} style={{
                        fontSize: "11px",
                        padding: "4px 8px",
                        background: "#fef3c7",
                        color: "#92400e",
                        borderRadius: "4px",
                        fontWeight: "500",
                      }}>
                        {issue}
                      </span>
                    ))}
                  </div>
                )}

                {issues.length === 0 && (
                  <div style={{
                    fontSize: "13px",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    <span>✓</span>
                    <span>All good</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "64px",
          textAlign: "center",
          border: "1px solid #e5e5e5",
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
          <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>
            No products yet
          </h3>
          <p style={{ color: "#666" }}>
            Add products to your Shopify store to see them here
          </p>
        </div>
      )}
    </div>
  );
}
