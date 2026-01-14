let state = {
  enabled: false,
  appliedThisSession: 0,
  lastRun: null
};

export function getAutonomyState() {
  return state;
}

export function resetAutonomySession() {
  state.appliedThisSession = 0;
}

export function incrementAutonomyCount() {
  state.appliedThisSession += 1;
}

export function setAutonomyEnabled(value) {
  state.enabled = value;
}
