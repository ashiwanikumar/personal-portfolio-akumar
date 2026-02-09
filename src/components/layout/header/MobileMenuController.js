"use client";
const MobileMenuController = ({
	setIsActiveMobileMenu,
	isActiveMobileMenu,
}) => {
	return (
		<div className="menu-bar">
			<button
				className={`flex flex-col justify-center items-center w-10 h-10 ${isActiveMobileMenu ? "active" : ""}`}
				onClick={() => setIsActiveMobileMenu(!isActiveMobileMenu)}
				aria-label="Toggle mobile menu"
			>
				<span className={`block w-6 h-0.5 bg-[#00ff41] transition-all duration-300 ${isActiveMobileMenu ? "rotate-45 translate-y-1.5" : ""}`}></span>
				<span className={`block w-6 h-0.5 bg-[#00ff41] my-1 transition-all duration-300 ${isActiveMobileMenu ? "opacity-0" : ""}`}></span>
				<span className={`block w-6 h-0.5 bg-[#00ff41] transition-all duration-300 ${isActiveMobileMenu ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
			</button>
		</div>
	);
};

export default MobileMenuController;
