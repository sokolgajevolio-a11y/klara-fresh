import { Outlet, useLoaderData } from "react-router";
import { AppProvider } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import enTranslations from "@shopify/polaris/locales/en.json";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  
  // Fetch first product for context
  const response = await admin.graphql(`
    query {
      products(first: 1) {
        edges {
          node {
            id
            title
            description
            images(first: 5) {
              edges {
                node {
                  id
                  url
                }
              }
            }
            seo {
              title
              description
            }
          }
        }
      }
    }
  `);
  
  const data = await response.json();
  const product = data.data?.products?.edges?.[0]?.node || null;
  
  const transformedProduct = product ? {
    id: product.id,
    title: product.title,
    description: product.description,
    images: product.images?.edges?.map(e => e.node) || [],
    seoTitle: product.seo?.title || "",
  } : null;
  
  return { shop: session.shop, product: transformedProduct };
};

export default function AppLayout() {
  const { shop, product } = useLoaderData();

  return (
    <AppProvider i18n={enTranslations}>
      <Outlet context={{ shop, product }} />
    </AppProvider>
  );
}

