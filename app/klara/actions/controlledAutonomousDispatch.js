import { dispatchAction } from "./dispatchAction";
import { AutoFixLimits } from "../autonomy/AutoFixLimits";
import {
  canAutoFix,
  markAutoFixApplied,
  pauseAutoFix
} from "../autonomy/AutoFixSession";

export async function controlledAutonomousDispatch(finding) {
  if (!canAutoFix(AutoFixLimits.IMAGE_MAX_PER_RUN)) {
    pauseAutoFix();
    return { applied: false, paused: true };
  }

  await dispatchAction(finding.action);
  markAutoFixApplied();

  return { applied: true, paused: false };
}
