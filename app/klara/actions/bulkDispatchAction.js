import { navigateToTarget } from "./navigateToTarget";

export async function bulkDispatchAction(action) {
  switch (action.type) {
    case "BULK_FIX_IMAGES_AI":
      navigateToTarget({
        section: "images"
      });
      break;

    default:
      console.warn("Unknown bulk Klara action:", action);
  }
}
