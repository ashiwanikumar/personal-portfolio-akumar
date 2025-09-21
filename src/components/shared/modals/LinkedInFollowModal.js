"use client";

import { useState, useEffect } from "react";

const LinkedInFollowModal = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		// Show modal after 10 seconds
		const showTimer = setTimeout(() => {
			setIsVisible(true);
		}, 10000); // 10 seconds

		// Auto close after 20 more seconds (total 30 seconds)
		const closeTimer = setTimeout(() => {
			handleClose();
		}, 30000); // 30 seconds total

		// Cleanup timers on unmount
		return () => {
			clearTimeout(showTimer);
			clearTimeout(closeTimer);
		};
	}, []);

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => {
			setIsVisible(false);
			setIsClosing(false);
		}, 300); // Match animation duration
	};

	if (!isVisible) return null;

	return (
		<div
			className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
				isClosing ? "opacity-0" : "opacity-100"
			}`}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
				onClick={handleClose}
			/>

			{/* Modal Content */}
			<div
				className={`relative bg-white dark:bg-dark-color rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
					isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
				}`}
			>
				{/* Close Button */}
				<button
					onClick={handleClose}
					className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
					aria-label="Close modal"
				>
					<i className="fa-solid fa-xmark text-gray-600 dark:text-gray-400 text-lg"></i>
				</button>

				{/* Modal Body */}
				<div className="p-8 text-center">
					{/* LinkedIn Icon */}
					<div className="mb-6 flex justify-center">
						<div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
							<i className="fa-brands fa-linkedin-in text-white text-3xl"></i>
						</div>
					</div>

					{/* Title */}
					<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
						Connect with Me on LinkedIn
					</h3>

					{/* Description */}
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						Stay updated with my latest DevOps insights, projects, and professional journey.
					</p>

					{/* LinkedIn Follow Button */}
					<a
						href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=ashiwanikumar"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
					>
						<i className="fa-brands fa-linkedin text-xl"></i>
						Follow on LinkedIn
					</a>
				</div>
			</div>
		</div>
	);
};

export default LinkedInFollowModal;