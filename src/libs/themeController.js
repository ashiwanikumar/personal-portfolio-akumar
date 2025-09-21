const themeController = () => {
  const html = document.querySelector("html");
  const body = document.querySelector("body");
  const isDark = html?.classList?.contains("dark");
  
  // Apply initial theme
  if (isDark) {
    html.classList.add("dark");
    body.classList.remove("hacker-theme");
  } else {
    html.classList.remove("dark");
    body.classList.add("hacker-theme");
  }

  const currentMode = localStorage.getItem("theme");
  if (currentMode === "light") {
    html.classList.remove("dark");
    body.classList.add("hacker-theme");
  } else if (currentMode === "dark") {
    html.classList.add("dark");
    body.classList.remove("hacker-theme");
  }
  
  const themeController = document.querySelector(".theme-controller");
  themeController.addEventListener("click", function () {
    html.classList.toggle("dark");
    const currentMode = html.classList.contains("dark");
    if (currentMode) {
      // Dark mode
      localStorage.setItem("theme", "dark");
      body.classList.remove("hacker-theme");
    } else {
      // Light mode (hacker theme)
      localStorage.setItem("theme", "light");
      body.classList.add("hacker-theme");
    }
  });
};

export default themeController;
