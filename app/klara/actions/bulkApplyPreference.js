import { applyPreference } from "./applyPreference";

export async function bulkApplyPreference(findings) {
  for (const f of findings) {
    await applyPreference(f);
  }
}
