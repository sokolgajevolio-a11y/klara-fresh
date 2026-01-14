import { Card, Button, TextField, Select, InlineStack, BlockStack, Text, ColorPicker, hsbToString } from "@shopify/polaris";
import { useState } from "react";
import styles from "./ThemeEditor.module.css";

export function ThemeEditor({ onClose, onSave }) {
  const [settings, setSettings] = useState({
    primaryColor: "#22d3ee",
    secondaryColor: "#0891b2",
    backgroundColor: "#0f1419",
    textColor: "#ffffff",
    fontFamily: "inter",
    fontSize: "16",
    borderRadius: "8",
  });

  const handleUpdateSetting = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    onSave?.(settings);
  };

  return (
    <div className={styles.themeEditor}>
      <div className={styles.header}>
        <h2>Theme Editor</h2>
        <p>Customize your store's appearance</p>
      </div>

      <div className={styles.content}>
        <Card sectioned>
          <BlockStack gap="400">
            <div className={styles.section}>
              <Text variant="headingMd" as="h3">
                Colors
              </Text>
              <BlockStack gap="300">
                <TextField
                  label="Primary Color"
                  value={settings.primaryColor}
                  onChange={(value) =>
                    handleUpdateSetting("primaryColor", value)
                  }
                  type="color"
                />

                <TextField
                  label="Secondary Color"
                  value={settings.secondaryColor}
                  onChange={(value) =>
                    handleUpdateSetting("secondaryColor", value)
                  }
                  type="color"
                />

                <TextField
                  label="Background Color"
                  value={settings.backgroundColor}
                  onChange={(value) =>
                    handleUpdateSetting("backgroundColor", value)
                  }
                  type="color"
                />

                <TextField
                  label="Text Color"
                  value={settings.textColor}
                  onChange={(value) =>
                    handleUpdateSetting("textColor", value)
                  }
                  type="color"
                />
              </BlockStack>
            </div>

            <div className={styles.section}>
              <Text variant="headingMd" as="h3">
                Typography
              </Text>
              <BlockStack gap="300">
                <Select
                  label="Font Family"
                  value={settings.fontFamily}
                  onChange={(value) =>
                    handleUpdateSetting("fontFamily", value)
                  }
                  options={[
                    { label: "Inter", value: "inter" },
                    { label: "Roboto", value: "roboto" },
                    { label: "Poppins", value: "poppins" },
                    { label: "Playfair Display", value: "playfair" },
                  ]}
                />

                <TextField
                  label="Base Font Size (px)"
                  value={settings.fontSize}
                  onChange={(value) =>
                    handleUpdateSetting("fontSize", value)
                  }
                  type="number"
                />
              </BlockStack>
            </div>

            <div className={styles.section}>
              <Text variant="headingMd" as="h3">
                Layout
              </Text>
              <BlockStack gap="300">
                <TextField
                  label="Border Radius (px)"
                  value={settings.borderRadius}
                  onChange={(value) =>
                    handleUpdateSetting("borderRadius", value)
                  }
                  type="number"
                />
              </BlockStack>
            </div>

            <div className={styles.preview}>
              <Text variant="headingMd" as="h3">
                Preview
              </Text>
              <div
                className={styles.previewBox}
                style={{
                  backgroundColor: settings.backgroundColor,
                  color: settings.textColor,
                  borderRadius: `${settings.borderRadius}px`,
                }}
              >
                <button
                  style={{
                    backgroundColor: settings.primaryColor,
                    color: settings.textColor,
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: `${settings.borderRadius}px`,
                    cursor: "pointer",
                    fontFamily: settings.fontFamily,
                    fontSize: `${settings.fontSize}px`,
                  }}
                >
                  Sample Button
                </button>
                <p style={{ fontFamily: settings.fontFamily }}>
                  Sample text with your theme colors
                </p>
              </div>
            </div>
          </BlockStack>
        </Card>
      </div>

      <div className={styles.footer}>
        <Button onClick={onClose}>Cancel</Button>
        <Button primary onClick={handleSave}>
          Save Theme
        </Button>
      </div>
    </div>
  );
}

export default ThemeEditor;
