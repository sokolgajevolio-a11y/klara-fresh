import { authenticate } from "../shopify.server";
import { Dashboard360 } from "../components/klara/Dashboard360";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return {};
};

export default function Home() {
  return <Dashboard360 />;
}
