"use client";

import { useState, useCallback } from "react";
import CVModal from "@/components/shared/modals/CVModal";
import { trackCvEvent } from "@/libs/cv";

const ButtonViewCV = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = useCallback(() => {
		setIsModalOpen(true);
		trackCvEvent("view");
	}, []);

	const closeModal = useCallback(() => setIsModalOpen(false), []);

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className="text-sm font-medium text-white/60 hover:text-white py-2.5 px-5 bg-transparent border border-white/10 hover:border-white/25 rounded-lg leading-1 inline-flex gap-x-2.5 items-center transition-all duration-300"
			>
				<i className="fa-solid fa-eye" aria-hidden="true"></i>
				View CV
			</button>

			{isModalOpen && <CVModal onClose={closeModal} />}
		</>
	);
};

export default ButtonViewCV;
