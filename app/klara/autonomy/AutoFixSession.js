let session = {
  applied: 0,
  paused: false
};

export function resetAutoFixSession() {
  session.applied = 0;
  session.paused = false;
}

export function canAutoFix(limit) {
  return !session.paused && session.applied < limit;
}

export function markAutoFixApplied() {
  session.applied += 1;
}

export function pauseAutoFix() {
  session.paused = true;
}

export function isPaused() {
  return session.paused;
}
