"use client";
const MobileMenuController = ({
	setIsActiveMobileMenu,
	isActiveMobileMenu,
}) => {
	return (
		<div className="mobile-menu-toggle">
			<button
				type="button"
				className={isActiveMobileMenu ? "active" : ""}
				onClick={() => setIsActiveMobileMenu(!isActiveMobileMenu)}
				aria-label={isActiveMobileMenu ? "Close menu" : "Open menu"}
				aria-expanded={isActiveMobileMenu}
				aria-controls="mobile-menu"
			>
				<span className="hamburger-line" aria-hidden="true"></span>
				<span className="hamburger-line" aria-hidden="true"></span>
				<span className="hamburger-line" aria-hidden="true"></span>
			</button>
		</div>
	);
};

export default MobileMenuController;
