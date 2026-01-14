import { evaluateAutonomy } from "../autonomy/evaluateAutonomy";
import { dispatchAction } from "./dispatchAction";

export async function autonomousDispatch(finding) {
  const allowed = evaluateAutonomy(finding);
  if (!allowed) return false;

  await dispatchAction(finding.action);
  return true;
}
