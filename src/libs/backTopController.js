const backTopController = () => {
  // Progress bar setup
  const progressPath = document.querySelector(".progress-wrap path");
  const progressWrap = document.querySelector(".progress-wrap");

  // Exit early if elements don't exist
  if (!progressPath || !progressWrap) {
    return;
  }

  // The wrapper is a plain <div>, so give it button semantics, a name and
  // keyboard support. The SVG ring is decorative.
  progressWrap.setAttribute("role", "button");
  progressWrap.setAttribute("tabindex", "0");
  progressWrap.setAttribute("aria-label", "Back to top");
  progressWrap.setAttribute("title", "Back to top");
  progressPath.closest("svg")?.setAttribute("aria-hidden", "true");

  const pathLength = progressPath.getTotalLength();

  // Set initial stroke properties
  progressPath.style.transition = progressPath.style.WebkitTransition = "none";
  progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
  progressPath.style.strokeDashoffset = pathLength;
  progressPath.getBoundingClientRect(); // Trigger reflow
  progressPath.style.transition = progressPath.style.WebkitTransition =
    "stroke-dashoffset 10ms linear";

  // Update the ring and show/hide the button on scroll
  const onScroll = () => {
    const scrollTop = window.scrollY;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
    progressPath.style.strokeDashoffset = pathLength * (1 - scrollPercent);

    const visible = scrollTop > 50;
    progressWrap.classList.toggle("active-progress", visible);
    // Keep it out of the tab order while it is invisible.
    progressWrap.setAttribute("tabindex", visible ? "0" : "-1");
    progressWrap.setAttribute("aria-hidden", visible ? "false" : "true");
  };

  const scrollToTop = () => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const onClick = (event) => {
    event.preventDefault();
    scrollToTop();
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      scrollToTop();
    }
  };

  onScroll(); // Initialize on load
  window.addEventListener("scroll", onScroll, { passive: true });
  progressWrap.addEventListener("click", onClick);
  progressWrap.addEventListener("keydown", onKeyDown);

  return () => {
    window.removeEventListener("scroll", onScroll);
    progressWrap.removeEventListener("click", onClick);
    progressWrap.removeEventListener("keydown", onKeyDown);
  };
};

export default backTopController;
