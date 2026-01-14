import { AutonomyRules } from "./AutonomyRules";
import {
  getAutonomyState,
  incrementAutonomyCount
} from "./AutonomyState";

export function evaluateAutonomy(finding) {
  const state = getAutonomyState();
  if (!state.enabled) return false;

  const rule = AutonomyRules[finding.autonomyType];
  if (!rule || !rule.enabled) return false;

  if (state.appliedThisSession >= rule.maxPerSession) {
    return false;
  }

  incrementAutonomyCount();
  return true;
}
