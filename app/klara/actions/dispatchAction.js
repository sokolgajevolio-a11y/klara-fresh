import { navigateToTarget } from "./navigateToTarget";
import { logFix } from "../history/FixHistory";

export async function dispatchAction(action) {
  switch (action.type) {
    case "FIX_IMAGE_AI": {
      navigateToTarget({ section: "images" });

      logFix({
        type: "ADD_IMAGE_AI",
        targetId: action.productId,
        description: "AI image generated",
        undo: () => {
          console.log("Undo AI image for product", action.productId);
        }
      });
      break;
    }

    case "FIX_IMAGE_STOCK": {
      navigateToTarget({ section: "images" });

      logFix({
        type: "ADD_IMAGE_STOCK",
        targetId: action.productId,
        description: "Stock image applied",
        undo: () => {
          console.log("Undo stock image for product", action.productId);
        }
      });
      break;
    }

    case "FIX_SEO": {
      navigateToTarget({ section: "seo" });

      logFix({
        type: "FIX_SEO",
        targetId: action.productId,
        description: "SEO fixed",
        undo: () => {
          console.log("Undo SEO for product", action.productId);
        }
      });
      break;
    }

    case "IMPROVE_DESCRIPTION": {
      navigateToTarget({ section: "description" });

      logFix({
        type: "IMPROVE_DESCRIPTION",
        targetId: action.productId,
        description: "Description improved",
        undo: () => {
          console.log("Undo description for product", action.productId);
        }
      });
      break;
    }

    default:
      console.warn("Unknown Klara action:", action);
  }
}
