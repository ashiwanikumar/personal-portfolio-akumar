"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// Shown once, after about two minutes on the site. The two-minute clock runs
// across page navigations (each page remounts this component), and once the
// visitor closes it or clicks through, it stays away for a while.
const SHOW_AFTER_MS = 120000;
const SNOOZE_DAYS_DISMISSED = 30;
const SNOOZE_DAYS_FOLLOWED = 365;
const SNOOZE_KEY = "linkedinModalSnoozedUntil";
const SESSION_START_KEY = "linkedinModalSessionStart";

// Storage can throw (Safari private mode, blocked cookies), so every access
// is guarded and a failure simply means "don't nag".
const readStorage = (storage, key) => {
	try {
		return window[storage].getItem(key);
	} catch {
		return null;
	}
};

const writeStorage = (storage, key, value) => {
	try {
		window[storage].setItem(key, value);
		return true;
	} catch {
		return false;
	}
};

const LinkedInFollowModal = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const closeButtonRef = useRef(null);
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);

	useEffect(() => {
		const snoozedUntil = Number(readStorage("localStorage", SNOOZE_KEY));
		if (snoozedUntil && snoozedUntil > Date.now()) return;

		let sessionStart = Number(readStorage("sessionStorage", SESSION_START_KEY));
		if (!sessionStart) {
			sessionStart = Date.now();
			// Without storage we can't remember a dismissal, so don't show it.
			if (!writeStorage("sessionStorage", SESSION_START_KEY, String(sessionStart))) return;
		}

		const delay = Math.max(SHOW_AFTER_MS - (Date.now() - sessionStart), 0);
		const showTimer = setTimeout(() => {
			const until = Number(readStorage("localStorage", SNOOZE_KEY));
			if (until && until > Date.now()) return;
			previousFocusRef.current = document.activeElement;
			setIsVisible(true);
		}, delay);

		return () => {
			clearTimeout(showTimer);
		};
	}, []);

	const handleClose = useCallback((days = SNOOZE_DAYS_DISMISSED) => {
		const snoozeDays = typeof days === "number" ? days : SNOOZE_DAYS_DISMISSED;
		writeStorage(
			"localStorage",
			SNOOZE_KEY,
			String(Date.now() + snoozeDays * 24 * 60 * 60 * 1000)
		);
		setIsClosing(true);
		setTimeout(() => {
			setIsVisible(false);
			setIsClosing(false);
			const previous = previousFocusRef.current;
			if (previous && typeof previous.focus === "function" && document.contains(previous)) {
				previous.focus();
			}
		}, 300);
	}, []);

	const handleFollowed = () => handleClose(SNOOZE_DAYS_FOLLOWED);

	// While open: focus the close button, lock page scroll, close on Escape
	// and keep Tab inside the dialog.
	useEffect(() => {
		if (!isVisible) return;
		closeButtonRef.current?.focus();
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				handleClose();
				return;
			}
			if (e.key !== "Tab" || !dialogRef.current) return;
			const focusables = dialogRef.current.querySelectorAll("a[href], button:not([disabled])");
			if (!focusables.length) return;
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			} else if (!dialogRef.current.contains(document.activeElement)) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [isVisible, handleClose]);

	if (!isVisible) return null;

	return (
		<div
			className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
				isClosing ? "opacity-0" : "opacity-100"
			}`}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={() => handleClose()}
				aria-hidden="true"
			/>

			{/* Modal Content */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="linkedin-modal-title"
				aria-describedby="linkedin-modal-desc"
				className={`relative bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] w-full max-w-[360px] transform transition-all duration-300 ${
					isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
				}`}
			>
				{/* Close Button */}
				<button
					type="button"
					ref={closeButtonRef}
					onClick={() => handleClose()}
					className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-200 z-10"
					aria-label="Close"
				>
					<i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
				</button>

				{/* Modal Body */}
				<div className="p-7 text-center">
					<h3 id="linkedin-modal-title" className="text-white font-semibold text-lg mb-1 tracking-[-0.01em]">
						Let&apos;s connect
					</h3>
					<p id="linkedin-modal-desc" className="text-white/50 text-sm mb-6">
						Follow me on LinkedIn for DevOps insights and updates
					</p>

					{/* Profile card */}
					<div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6 text-left">
						<div className="flex items-center gap-4 mb-3">
							<Image
								src="/img/hero/ashiwani.png"
								alt="Ashiwani Kumar"
								width={96}
								height={96}
								className="w-14 h-14 rounded-full object-cover border border-white/10 flex-shrink-0"
							/>
							<div className="min-w-0">
								<div className="flex items-center gap-1.5">
									<span className="text-white font-semibold text-[15px] truncate">
										Ashiwani Kumar
									</span>
									<i className="fa-solid fa-circle-check text-[#38bdf8] text-xs" aria-hidden="true"></i>
								</div>
								<span className="text-white/40 text-xs font-mono">
									Astek Middle East · Abu Dhabi, UAE
								</span>
							</div>
						</div>
						<p className="text-white/55 text-[13px] leading-[1.6]">
							Linux DevOps Engineer · Government &amp; airport infrastructure ·
							AWS, Terraform, Kubernetes · CI/CD &amp; DevSecOps · UAE/Oman projects
						</p>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-2.5">
						<a
							href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=ashiwanikumar"
							target="_blank"
							rel="noopener noreferrer"
							onClick={handleFollowed}
							className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10b981] text-[#022c22] font-medium text-sm rounded-lg hover:bg-[#34d399] transition-all duration-300"
						>
							<i className="fa-brands fa-linkedin" aria-hidden="true"></i>
							Follow on LinkedIn
							<span className="sr-only"> (opens in a new tab)</span>
						</a>
						<a
							href="https://www.linkedin.com/in/ashiwanikumar/"
							target="_blank"
							rel="noopener noreferrer"
							onClick={handleFollowed}
							className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-medium text-sm rounded-lg transition-all duration-300"
						>
							View profile
							<span className="sr-only"> (opens in a new tab)</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LinkedInFollowModal;
