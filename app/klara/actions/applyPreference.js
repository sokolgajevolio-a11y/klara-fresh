import { getPreference } from "../preferences/PreferenceStore";
import { dispatchAction } from "./dispatchAction";

export async function applyPreference(finding) {
  if (finding.autonomyType !== "IMAGE_FIX") return false;

  const pref = getPreference("IMAGE_FIX_STRATEGY");
  if (!pref) return false;

  if (pref === "STOCK") {
    await dispatchAction({
      type: "FIX_IMAGE_STOCK",
      productId: finding.action.productId
    });
    return true;
  }

  if (pref === "AI") {
    await dispatchAction({
      type: "FIX_IMAGE_AI",
      productId: finding.action.productId
    });
    return true;
  }

  return false;
}
