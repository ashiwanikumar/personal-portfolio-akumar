"use client";
import { useHeaderContext } from "@/context_api/HeaderContext";
import getNavItems from "@/libs/getNavItems";
import isNavLinkActive from "@/libs/indexingAndActiveLink";
import Link from "next/link";
import { usePathname } from "next/navigation";

const contactLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ashiwanikumar/",
    icon: "fa-brands fa-linkedin-in",
  },
  {
    label: "GitHub",
    href: "https://github.com/ashiwanikumar",
    icon: "fa-brands fa-github",
  },
  {
    label: "X",
    href: "https://x.com/byteforge_ai",
    icon: "fa-brands fa-x-twitter",
  },
];

const MobileMenu = ({ isActiveMobileMenu, setIsActiveMobileMenu }) => {
  const { isIndexPage } = useHeaderContext();
  const pathname = usePathname();
  const navItems = getNavItems();
  const closeMenu = () => setIsActiveMobileMenu?.(false);
  return (
    <div
      id="mobile-menu"
      aria-hidden={!isActiveMobileMenu}
      inert={!isActiveMobileMenu}
      className={`mobile-menu absolute left-0 top-full min-h-screen-90 w-full bg-[#09090b] block origin-top-left lg:hidden ${
        isActiveMobileMenu ? "active visible" : "invisible"
      }`}
    >
      <nav aria-label="Mobile" className="container py-5">
        <ul className="ml-4">
          {navItems?.length
            ? navItems?.map(({ name, path, path2 }, idx) => {
                const href = isIndexPage ? path : path2;
                const isActive = isNavLinkActive(pathname, href);
                return (
                  <li key={idx}>
                    <Link
                      href={href}
                      onClick={closeMenu}
                      aria-current={isActive ? "page" : undefined}
                      className={`text-2xl ${
                        isActive ? "text-[#34d399]" : "text-white/70"
                      } hover:text-white capitalize leading-1.2 py-15px font-semibold tracking-[-0.01em] block transition-all duration-300`}
                    >
                      {name}
                    </Link>
                  </li>
                );
              })
            : ""}
        </ul>
        <div className="ml-4 mt-6 pt-6 border-t border-white/10">
          <a
            href="mailto:ashvanikumar109@gmail.com"
            onClick={closeMenu}
            className="text-sm font-mono text-white/60 hover:text-[#34d399] transition-colors duration-300"
          >
            ashvanikumar109@gmail.com
          </a>
          <ul className="flex items-center gap-3 mt-4">
            {contactLinks.map(({ label, href, icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (opens in a new tab)`}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-[#34d399] hover:border-[#10b981]/50 transition-colors duration-300"
                >
                  <i className={icon} aria-hidden="true"></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
