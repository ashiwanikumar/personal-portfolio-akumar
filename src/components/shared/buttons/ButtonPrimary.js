import Link from "next/link";

const ButtonPrimary = ({ children, type, url, className, isIcon, href }) => {
	return (
		<Link
			href={url || href || "#"}
			className={`text-size-15 font-bold text-[#001100] capitalize py-17px px-35px ${
				type === 2 ? "" : "ml-10px"
			} bg-[#00ff41] hover:bg-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] rounded-full leading-1 ${className} ${
				isIcon ? "inline-flex gap-10px items-center " : ""
			} transition-all duration-300 group font-mono`}
		>
			{children ? children : ""}{" "}
			{isIcon ? (
				<i className="fa-regular fa-arrow-right transition-all duration-400 -rotate-45 group-hover:rotate-0"></i>
			) : (
				""
			)}
		</Link>
	);
};

export default ButtonPrimary;
