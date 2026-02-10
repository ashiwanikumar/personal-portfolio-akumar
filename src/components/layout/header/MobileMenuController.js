"use client";
const MobileMenuController = ({
	setIsActiveMobileMenu,
	isActiveMobileMenu,
}) => {
	return (
		<div className="mobile-menu-toggle">
			<button
				className="flex flex-col justify-center items-center w-10 h-10 bg-transparent border-none p-0"
				onClick={() => setIsActiveMobileMenu(!isActiveMobileMenu)}
				aria-label="Toggle mobile menu"
				style={{ background: 'transparent', border: 'none' }}
			>
				<span
					className={`block w-6 h-0.5 bg-[#00ff41] transition-all duration-300 ${isActiveMobileMenu ? "rotate-45 translate-y-[7px]" : ""}`}
					style={{ background: '#00ff41', height: '2px', width: '24px' }}
				></span>
				<span
					className={`block w-6 h-0.5 bg-[#00ff41] my-[5px] transition-all duration-300 ${isActiveMobileMenu ? "opacity-0" : ""}`}
					style={{ background: '#00ff41', height: '2px', width: '24px' }}
				></span>
				<span
					className={`block w-6 h-0.5 bg-[#00ff41] transition-all duration-300 ${isActiveMobileMenu ? "-rotate-45 -translate-y-[7px]" : ""}`}
					style={{ background: '#00ff41', height: '2px', width: '24px' }}
				></span>
			</button>
		</div>
	);
};

export default MobileMenuController;
