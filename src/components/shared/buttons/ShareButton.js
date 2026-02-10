"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const ShareButton = ({ title, text, className = "", isRound = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentUrl, setCurrentUrl] = useState("");
	const [copied, setCopied] = useState(false);
	const [mounted, setMounted] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		setMounted(true);
		setCurrentUrl(window.location.href);
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [isOpen]);

	const shareTitle = title || "Ashiwani Kumar - Site Reliability Engineer";
	const shareText = text || "Check out Ashiwani Kumar's portfolio - Site Reliability Engineer & DevOps Practitioner";

	const socialLinks = [
		{
			name: "WhatsApp",
			icon: "fa-brands fa-whatsapp",
			color: "#ffffff",
			bgColor: "#25D366",
			url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`,
		},
		{
			name: "LinkedIn",
			icon: "fa-brands fa-linkedin-in",
			color: "#ffffff",
			bgColor: "#0A66C2",
			url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
		},
		{
			name: "Twitter",
			icon: "fa-brands fa-x-twitter",
			color: "#ffffff",
			bgColor: "#000000",
			url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
		},
		{
			name: "Facebook",
			icon: "fa-brands fa-facebook-f",
			color: "#ffffff",
			bgColor: "#1877F2",
			url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
		},
		{
			name: "Telegram",
			icon: "fa-brands fa-telegram",
			color: "#ffffff",
			bgColor: "#0088cc",
			url: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
		},
		{
			name: "Email",
			icon: "fa-solid fa-envelope",
			color: "#ffffff",
			bgColor: "#EA4335",
			url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`,
		},
	];

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(currentUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const toggleShareMenu = () => {
		setIsOpen(!isOpen);
	};

	return (
		<>
			{/* Share Button */}
			{isRound ? (
				<button
					onClick={toggleShareMenu}
					className="text-dark-color group-hover:text-white-color dark:text-white-color border border-border-color dark:border-border-color-3 group-hover:border-transparent dark:group-hover:border-transparent w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-gradient-primary-8 hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full hover:text-white-color"
					aria-label="Share"
				>
					<i className="fa-solid fa-share-nodes"></i>
				</button>
			) : (
				<button
					onClick={toggleShareMenu}
					className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#002200] border border-[#00ff41]/30 text-[#00ff41] font-mono text-sm rounded-full hover:border-[#00ff41] hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all duration-300 ${className}`}
					aria-label="Share"
				>
					<i className="fa-solid fa-share-nodes"></i>
					Share
				</button>
			)}

			{/* Share Menu Popup - Portal to body */}
			{isOpen && mounted && createPortal(
				<div
					ref={menuRef}
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 99999,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '16px',
					}}
				>
					{/* Backdrop */}
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: 'rgba(0, 0, 0, 0.85)',
							backdropFilter: 'blur(4px)',
						}}
						onClick={() => setIsOpen(false)}
					></div>

					{/* Modal */}
					<div
						style={{
							position: 'relative',
							width: '100%',
							maxWidth: '320px',
							backgroundColor: '#001100',
							border: '2px solid rgba(0, 255, 65, 0.5)',
							borderRadius: '16px',
							padding: '16px',
							boxShadow: '0 0 40px rgba(0, 255, 65, 0.3)',
							zIndex: 10,
						}}
					>
						{/* Header */}
						<div style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: '16px',
							paddingBottom: '12px',
							borderBottom: '1px solid rgba(0, 255, 65, 0.3)',
						}}>
							<span style={{
								color: '#00ff41',
								fontFamily: 'monospace',
								fontWeight: 'bold',
								fontSize: '14px',
							}}>
								<i className="fa-solid fa-share-nodes" style={{ marginRight: '8px' }}></i>
								Share
							</span>
							<button
								onClick={() => setIsOpen(false)}
								style={{
									width: '32px',
									height: '32px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									backgroundColor: '#dc2626',
									color: 'white',
									borderRadius: '50%',
									border: 'none',
									cursor: 'pointer',
								}}
							>
								<i className="fa-solid fa-xmark" style={{ fontWeight: 'bold' }}></i>
							</button>
						</div>

						{/* Social Icons Grid - 3 columns */}
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, 1fr)',
							gap: '8px',
							marginBottom: '16px',
						}}>
							{socialLinks.map((social, idx) => (
								<a
									key={idx}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '6px',
										padding: '12px 8px',
										borderRadius: '12px',
										backgroundColor: social.bgColor,
										textDecoration: 'none',
										transition: 'transform 0.3s',
									}}
									onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
									onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
								>
									<i
										className={social.icon}
										style={{ fontSize: '20px', color: social.color }}
									></i>
									<span style={{
										fontSize: '10px',
										fontFamily: 'monospace',
										fontWeight: '500',
										color: social.color,
										textAlign: 'center',
									}}>
										{social.name}
									</span>
								</a>
							))}
						</div>

						{/* Copy Link */}
						<div style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							padding: '10px',
							backgroundColor: '#002200',
							borderRadius: '12px',
							border: '1px solid rgba(0, 255, 65, 0.3)',
						}}>
							<input
								type="text"
								value={currentUrl}
								readOnly
								style={{
									flex: 1,
									minWidth: 0,
									backgroundColor: 'transparent',
									color: '#00ff41',
									fontSize: '12px',
									fontFamily: 'monospace',
									outline: 'none',
									border: 'none',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							/>
							<button
								onClick={copyToClipboard}
								style={{
									flexShrink: 0,
									padding: '8px 12px',
									borderRadius: '8px',
									fontFamily: 'monospace',
									fontSize: '12px',
									fontWeight: 'bold',
									border: 'none',
									cursor: 'pointer',
									whiteSpace: 'nowrap',
									backgroundColor: copied ? '#00ff41' : 'rgba(0, 255, 65, 0.2)',
									color: copied ? '#001100' : '#00ff41',
									transition: 'all 0.3s',
								}}
							>
								{copied ? (
									<>
										<i className="fa-solid fa-check" style={{ marginRight: '4px' }}></i>
										Copied!
									</>
								) : (
									<>
										<i className="fa-solid fa-copy" style={{ marginRight: '4px' }}></i>
										Copy
									</>
								)}
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}
		</>
	);
};

export default ShareButton;
