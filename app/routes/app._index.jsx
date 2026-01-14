import { authenticate } from "../shopify.server";
import KlaraDashboardExact from "../components/klara/KlaraDashboardExact";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return {};
};

export default function Home() {
  return <KlaraDashboardExact />;
}
