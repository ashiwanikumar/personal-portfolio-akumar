// Smooth scrolling for in-page links ("#id", and "/#id" while on the home page).
// Uses one delegated listener so links rendered after mount are covered too,
// offsets for the fixed header, and moves keyboard focus to the target so the
// skip link and anchor links work for keyboard and screen reader users.
const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getHeaderOffset = () => {
  const header = document.querySelector("header.header-sticky");
  return header ? header.offsetHeight : 0;
};

const focusTarget = (el) => {
  if (!el) return;
  if (!el.hasAttribute("tabindex") && !el.matches("a[href], button, input, select, textarea")) {
    el.setAttribute("tabindex", "-1");
  }
  el.focus({ preventScroll: true });
};

const smoothScroll = () => {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const link = e.target.closest && e.target.closest("a[href]");
    if (!link || (link.target && link.target !== "_self")) return;

    const href = link.getAttribute("href");
    let hash = null;
    if (href.startsWith("#")) {
      hash = href;
    } else if (href.startsWith("/#") && window.location.pathname === "/") {
      hash = href.substring(1);
    }
    if (!hash) return;

    e.preventDefault();
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    const targetId = decodeURIComponent(hash.substring(1));
    let targetElement = targetId ? document.getElementById(targetId) : null;

    // Pages without a #main-content wrapper still have a <main>.
    if (!targetElement && targetId === "main-content") {
      targetElement = document.querySelector("main");
    }

    if (targetElement) {
      const top =
        targetElement.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
      window.scrollTo({ top: Math.max(top, 0), left: 0, behavior });
      focusTarget(targetElement);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior });
    }
  };

  // Capture phase, so this runs before next/link's own click handler, which
  // then sees defaultPrevented and leaves the scroll to us.
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
};

export default smoothScroll;
