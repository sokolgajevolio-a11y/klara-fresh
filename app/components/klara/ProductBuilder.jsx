import { Card, Button, TextField, Select, InlineStack, BlockStack, Text } from "@shopify/polaris";
import { useState } from "react";
import styles from "./ProductBuilder.module.css";

export default function ProductBuilder({ onClose, onBuild }) {
  const [products, setProducts] = useState([
    {
      id: 1,
      title: "",
      description: "",
      price: "",
      category: "general",
      images: 0,
    },
  ]);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now(),
        title: "",
        description: "",
        price: "",
        category: "general",
        images: 0,
      },
    ]);
  };

  const handleUpdateProduct = (id, field, value) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleBuild = () => {
    onBuild?.(products.filter((p) => p.title.trim()));
  };

  return (
    <div className={styles.productBuilder}>
      <div className={styles.header}>
        <h2>AI Product Builder</h2>
        <p>Create and configure new products for your store</p>
      </div>

      <div className={styles.productsList}>
        {products.map((product, idx) => (
          <Card key={product.id} sectioned>
            <BlockStack gap="300">
              <div className={styles.productNumber}>Product {idx + 1}</div>

              <TextField
                label="Product Title"
                value={product.title}
                onChange={(value) =>
                  handleUpdateProduct(product.id, "title", value)
                }
                placeholder="Enter product title"
              />

              <TextField
                label="Description"
                value={product.description}
                onChange={(value) =>
                  handleUpdateProduct(product.id, "description", value)
                }
                placeholder="Enter product description"
                multiline
              />

              <InlineStack gap="300">
                <TextField
                  label="Price"
                  value={product.price}
                  onChange={(value) =>
                    handleUpdateProduct(product.id, "price", value)
                  }
                  placeholder="0.00"
                  type="number"
                />

                <Select
                  label="Category"
                  value={product.category}
                  onChange={(value) =>
                    handleUpdateProduct(product.id, "category", value)
                  }
                  options={[
                    { label: "General", value: "general" },
                    { label: "Electronics", value: "electronics" },
                    { label: "Clothing", value: "clothing" },
                    { label: "Home", value: "home" },
                    { label: "Sports", value: "sports" },
                  ]}
                />
              </InlineStack>

              <InlineStack gap="200">
                <Button
                  onClick={() => handleRemoveProduct(product.id)}
                  destructive
                >
                  Remove
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        ))}
      </div>

      <div className={styles.actions}>
        <Button onClick={handleAddProduct}>+ Add Another Product</Button>
      </div>

      <div className={styles.footer}>
        <Button onClick={onClose}>Cancel</Button>
        <Button primary onClick={handleBuild}>
          Build Products
        </Button>
      </div>
    </div>
  );
}


