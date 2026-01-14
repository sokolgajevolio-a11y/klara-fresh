export function navigateToTarget({ section }) {
  const el = document.querySelector(`[data-section="${section}"]`);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("klara-highlight");

  setTimeout(() => {
    el.classList.remove("klara-highlight");
  }, 2000);
}
