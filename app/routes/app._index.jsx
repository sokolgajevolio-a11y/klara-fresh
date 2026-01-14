import { redirect } from "@remix-run/node";

export function loader() {
  return redirect("/app/dashboard");
}

export default function AppIndex() {
  return null;
}
