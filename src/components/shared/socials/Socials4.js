const Socials4 = ({ type }) => {
	return (
		<ul
			className={`flex items-center gap-x-5 ${
				type === 2 ? "justify-center mb-10 md:mb-50px" : " "
			}`}
		>
			<li>
				<a
					href="https://www.linkedin.com/in/ashiwanikumar/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="LinkedIn (opens in a new tab)"
					className={`text-primary-color hover:text-body-color border ${
						type == 2
							? "border-primary-color dark:border-seondary-color"
							: "border-primary-color"
					} w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-primary-color hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full`}
				>
					<i className="fa-brands fa-linkedin-in" aria-hidden="true"></i>
				</a>
			</li>
			<li>
				<a
					href="https://github.com/ashiwanikumar"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub (opens in a new tab)"
					className={`text-primary-color hover:text-body-color border ${
						type == 2
							? "border-primary-color dark:border-seondary-color"
							: "border-primary-color"
					} w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-primary-color hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full`}
				>
					<i className="fa-brands fa-github" aria-hidden="true"></i>
				</a>
			</li>
			<li>
				<a
					href="https://x.com/byteforge_ai"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="X (opens in a new tab)"
					className={`text-primary-color hover:text-body-color border ${
						type == 2
							? "border-primary-color dark:border-seondary-color"
							: "border-primary-color"
					} w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-primary-color hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full`}
				>
					<i className="fa-brands fa-x-twitter" aria-hidden="true"></i>
				</a>
			</li>
			<li>
				<a
					href="mailto:ashvanikumar109@gmail.com"
					aria-label="Email"
					className={`text-primary-color hover:text-body-color border ${
						type == 2
							? "border-primary-color dark:border-seondary-color"
							: "border-primary-color"
					} w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-primary-color hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full`}
				>
					<i className="fa-solid fa-envelope" aria-hidden="true"></i>
				</a>
			</li>
		</ul>
	);
};

export default Socials4;
