// Every nav item is its own page (/about, /services, ...), so the active link
// is decided by the current route rather than by which section is scrolled
// into view. Returns true when `href` is the current page or a parent of it.
const indexingAndActiveLink = (pathname, href) => {
  if (!pathname || !href || href.includes("#")) return false;
  const clean = (value) => (value.length > 1 ? value.replace(/\/+$/, "") : value);
  const current = clean(pathname);
  const target = clean(href);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
};

export default indexingAndActiveLink;
