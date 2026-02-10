"use client";
const MobileMenuController = ({
	setIsActiveMobileMenu,
	isActiveMobileMenu,
}) => {
	return (
		<div className="mobile-menu-toggle">
			<button
				className={isActiveMobileMenu ? "active" : ""}
				onClick={() => setIsActiveMobileMenu(!isActiveMobileMenu)}
				aria-label="Toggle mobile menu"
			>
				<span className="hamburger-line"></span>
				<span className="hamburger-line"></span>
				<span className="hamburger-line"></span>
			</button>
		</div>
	);
};

export default MobileMenuController;
