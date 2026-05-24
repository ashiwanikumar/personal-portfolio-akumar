"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Status helpers ─────────────────────────────────────────────
const defaultChecks = [
	{ name: "health", ok: false, label: "API Server", fallback: "Waiting" },
	{ name: "roles", ok: false, label: "Roles", fallback: "Protected" },
	{ name: "team", ok: false, label: "Team", fallback: "Protected" },
	{ name: "analytics", ok: false, label: "Analytics", fallback: "Protected" },
];

function getCheck(checks, name) {
	return checks.find((c) => c.name === name);
}

function getTotalSubscribers(newsletterStats, recentSubscribers) {
	return (
		newsletterStats?.stats?.verification?.total ||
		recentSubscribers?.data?.paginationData?.totalSubscribers ||
		0
	);
}

// ─── Animated grid background ───────────────────────────────────
function GridBackground() {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		let animId;
		let particles = [];

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		resize();
		window.addEventListener("resize", resize);

		// Create floating particles
		for (let i = 0; i < 50; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * 0.3,
				vy: (Math.random() - 0.5) * 0.3,
				size: Math.random() * 2 + 0.5,
				opacity: Math.random() * 0.5 + 0.1,
			});
		}

		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw grid
			ctx.strokeStyle = "rgba(0, 255, 65, 0.03)";
			ctx.lineWidth = 1;
			const gridSize = 60;
			for (let x = 0; x < canvas.width; x += gridSize) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, canvas.height);
				ctx.stroke();
			}
			for (let y = 0; y < canvas.height; y += gridSize) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(canvas.width, y);
				ctx.stroke();
			}

			// Draw particles
			particles.forEach((p) => {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0) p.x = canvas.width;
				if (p.x > canvas.width) p.x = 0;
				if (p.y < 0) p.y = canvas.height;
				if (p.y > canvas.height) p.y = 0;

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(0, 255, 65, ${p.opacity})`;
				ctx.fill();
			});

			animId = requestAnimationFrame(draw);
		}
		draw();

		return () => {
			window.removeEventListener("resize", resize);
			cancelAnimationFrame(animId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed inset-0 z-0"
			aria-hidden="true"
		/>
	);
}

// ─── Stat card icon SVGs ────────────────────────────────────────
const icons = {
	server: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<rect x="2" y="2" width="20" height="8" rx="2" />
			<rect x="2" y="14" width="20" height="8" rx="2" />
			<circle cx="6" cy="6" r="1" fill="currentColor" />
			<circle cx="6" cy="18" r="1" fill="currentColor" />
		</svg>
	),
	shield: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
			<path d="m9 12 2 2 4-4" />
		</svg>
	),
	mail: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<rect x="2" y="4" width="20" height="16" rx="2" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
		</svg>
	),
	users: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	),
};

// ─── Main component ─────────────────────────────────────────────
export default function DashboardApp() {
	const [session, setSession] = useState(null);
	const [summary, setSummary] = useState(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [mounted, setMounted] = useState(false);
	const [loginMethod, setLoginMethod] = useState("password"); // "password" | "otp"
	const [otpStep, setOtpStep] = useState("email"); // "email" | "verify"
	const [otpCode, setOtpCode] = useState("");
	const [otpMessage, setOtpMessage] = useState("");

	const checks = summary?.checks || defaultChecks;

	useEffect(() => {
		setMounted(true);
	}, []);

	const cards = useMemo(() => {
		const health = getCheck(checks, "health");
		const roles = getCheck(checks, "roles");
		const contactStats = getCheck(checks, "contactStats");
		const newsletterStats = getCheck(checks, "newsletterStats");
		const recentSubscribers = getCheck(checks, "recentSubscribers");
		const contactsTotal = contactStats?.data?.statistics?.totalContacts || 0;
		const subscribersTotal = getTotalSubscribers(newsletterStats?.data, recentSubscribers);

		return [
			{
				label: "API Server",
				value: health?.ok ? "Online" : "Offline",
				detail: health?.ok ? health.data?.message || "Healthy" : health?.error || "No response",
				ok: !!health?.ok,
				icon: icons.server,
			},
			{
				label: "Access Role",
				value: session?.user?.roleInfo?.name || session?.user?.role || "Super Admin",
				detail: session?.user?.email || "Protected",
				ok: !!session?.authenticated,
				icon: icons.shield,
			},
			{
				label: "Contact Requests",
				value: String(contactsTotal),
				detail: contactStats?.ok ? "Total submissions" : contactStats?.error || "Protected",
				ok: !!contactStats?.ok,
				icon: icons.mail,
			},
			{
				label: "Newsletter",
				value: String(subscribersTotal),
				detail: newsletterStats?.ok ? "Active subscribers" : "Protected",
				ok: !!newsletterStats?.ok,
				icon: icons.users,
			},
		];
	}, [checks, session]);

	const loadDashboard = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const sessionRes = await fetch("/api/admin/session", { cache: "no-store" });
			if (!sessionRes.ok) {
				setSession({ authenticated: false });
				setSummary(null);
				return;
			}
			const sessionData = await sessionRes.json();
			setSession(sessionData);

			const summaryRes = await fetch("/api/admin/summary", { cache: "no-store" });
			if (summaryRes.ok) setSummary(await summaryRes.json());
		} catch (err) {
			setError(err.message || "Failed to load dashboard.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadDashboard();
	}, [loadDashboard]);

	async function handleLogin(e) {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		try {
			const res = await fetch("/api/admin/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Login failed.");
			setEmail("");
			setPassword("");
			await loadDashboard();
		} catch (err) {
			setError(err.message || "Login failed.");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleLogout() {
		await fetch("/api/admin/logout", { method: "POST" });
		setSession({ authenticated: false });
		setSummary(null);
	}

	async function handleOtpRequest(e) {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		setOtpMessage("");
		try {
			const res = await fetch("/api/admin/otp/request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await res.json();
			setOtpStep("verify");
			setOtpMessage(data.message || "Check your email for the code.");
		} catch (err) {
			setError(err.message || "Failed to send OTP.");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleOtpVerify(e) {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		try {
			const res = await fetch("/api/admin/otp/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp: otpCode }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Verification failed.");
			setOtpCode("");
			setOtpStep("email");
			await loadDashboard();
		} catch (err) {
			setError(err.message || "OTP verification failed.");
		} finally {
			setSubmitting(false);
		}
	}

	function switchLoginMethod(method) {
		setLoginMethod(method);
		setError("");
		setOtpMessage("");
		setOtpStep("email");
		setOtpCode("");
	}

	// ─── Loading state ────────────────────────────────────────
	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
				<div className="flex flex-col items-center gap-4">
					<div className="relative h-10 w-10">
						<div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400" />
						<div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-b-emerald-400/30" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
					</div>
					<p className="text-sm font-medium tracking-wide text-zinc-500">Initializing...</p>
				</div>
			</main>
		);
	}

	// ─── Login page ───────────────────────────────────────────
	if (!session?.authenticated) {
		const tabStyle = (active) => ({
			flex: 1,
			padding: "10px 0",
			fontSize: "13px",
			fontWeight: 600,
			textAlign: "center",
			cursor: "pointer",
			color: active ? "#10b981" : "#71717a",
			background: active ? "rgba(16, 185, 129, 0.06)" : "transparent",
			border: "none",
			borderBottom: active ? "2px solid #10b981" : "2px solid transparent",
			transition: "all 0.2s",
			letterSpacing: "0.02em",
		});

		return (
			<main
				style={{
					position: "relative",
					display: "flex",
					minHeight: "100vh",
					alignItems: "center",
					justifyContent: "center",
					overflow: "hidden",
					background: "#0a0a0b",
					padding: "16px",
				}}
			>
				<GridBackground />

				{/* Ambient glow */}
				<div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
					<div style={{ width: "600px", height: "600px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.04)", filter: "blur(120px)" }} />
				</div>

				{/* Single centered card */}
				<div className="dash-card" style={{ position: "relative", zIndex: 10 }}>
					{/* Header */}
					<div style={{ marginBottom: "24px", textAlign: "center" }}>
						<div style={{
							width: "56px",
							height: "56px",
							margin: "0 auto 20px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							borderRadius: "16px",
							background: "rgba(16, 185, 129, 0.1)",
							border: "1px solid rgba(16, 185, 129, 0.2)",
						}}>
							<svg viewBox="0 0 24 24" fill="none" style={{ width: "28px", height: "28px", color: "#34d399" }}>
								<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
								<path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.025em" }}>
							Welcome back
						</h1>
						<p style={{ marginTop: "8px", fontSize: "14px", color: "#71717a" }}>
							Sign in to your portfolio dashboard
						</p>
					</div>

					{/* Tabs */}
					<div style={{ display: "flex", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", borderRadius: 0 }}>
						<button type="button" onClick={() => switchLoginMethod("password")} style={tabStyle(loginMethod === "password")}>
							Password
						</button>
						<button type="button" onClick={() => switchLoginMethod("otp")} style={tabStyle(loginMethod === "otp")}>
							Email OTP
						</button>
					</div>

					{/* Error */}
					{error && (
						<div style={{
							marginBottom: "20px",
							display: "flex",
							alignItems: "flex-start",
							gap: "12px",
							borderRadius: "8px",
							padding: "12px 16px",
							background: "rgba(239, 68, 68, 0.07)",
							border: "1px solid rgba(239, 68, 68, 0.2)",
						}}>
							<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", marginTop: "2px", flexShrink: 0, color: "#f87171" }}>
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
								<path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
							<p style={{ fontSize: "14px", color: "rgba(252, 165, 165, 0.9)" }}>{error}</p>
						</div>
					)}

					{/* Success message for OTP */}
					{otpMessage && !error && (
						<div style={{
							marginBottom: "20px",
							display: "flex",
							alignItems: "flex-start",
							gap: "12px",
							borderRadius: "8px",
							padding: "12px 16px",
							background: "rgba(16, 185, 129, 0.07)",
							border: "1px solid rgba(16, 185, 129, 0.2)",
						}}>
							<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", marginTop: "2px", flexShrink: 0, color: "#34d399" }}>
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
								<path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<p style={{ fontSize: "14px", color: "rgba(110, 231, 183, 0.9)" }}>{otpMessage}</p>
						</div>
					)}

					{/* ── Password form ── */}
					{loginMethod === "password" && (
						<form onSubmit={handleLogin}>
							<div style={{ marginBottom: "20px" }}>
								<label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>
									Email
								</label>
								<div style={{ position: "relative" }}>
									<div style={{ position: "absolute", top: 0, bottom: 0, left: "14px", display: "flex", alignItems: "center", pointerEvents: "none" }}>
										<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", color: "#52525b" }}>
											<rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
											<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="1.5" />
										</svg>
									</div>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="dash-input"
										placeholder="you@example.com"
										autoComplete="email"
										required
									/>
								</div>
							</div>

							<div style={{ marginBottom: "24px" }}>
								<label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>
									Password
								</label>
								<div style={{ position: "relative" }}>
									<div style={{ position: "absolute", top: 0, bottom: 0, left: "14px", display: "flex", alignItems: "center", pointerEvents: "none" }}>
										<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", color: "#52525b" }}>
											<rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
											<path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" />
										</svg>
									</div>
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="dash-input dash-input-password"
										placeholder="Enter your password"
										autoComplete="current-password"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										style={{
											position: "absolute",
											top: 0,
											bottom: 0,
											right: 0,
											display: "flex",
											alignItems: "center",
											paddingRight: "14px",
											color: "#52525b",
											cursor: "pointer",
										}}
										tabIndex={-1}
									>
										{showPassword ? (
											<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}>
												<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
												<line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
											</svg>
										) : (
											<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}>
												<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
												<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
											</svg>
										)}
									</button>
								</div>
							</div>

							<button type="submit" disabled={submitting} className="dash-btn-primary">
								{submitting ? (
									<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
										<span className="dash-spinner" />
										Signing in...
									</span>
								) : (
									<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
										Sign in
										<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}>
											<path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</span>
								)}
							</button>
						</form>
					)}

					{/* ── OTP form ── */}
					{loginMethod === "otp" && otpStep === "email" && (
						<form onSubmit={handleOtpRequest}>
							<p style={{ marginBottom: "20px", fontSize: "13px", color: "#71717a", lineHeight: 1.6 }}>
								We&apos;ll send a 6-digit code to your email. No password needed.
							</p>
							<div style={{ marginBottom: "24px" }}>
								<label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>
									Email
								</label>
								<div style={{ position: "relative" }}>
									<div style={{ position: "absolute", top: 0, bottom: 0, left: "14px", display: "flex", alignItems: "center", pointerEvents: "none" }}>
										<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", color: "#52525b" }}>
											<rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
											<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="1.5" />
										</svg>
									</div>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="dash-input"
										placeholder="you@example.com"
										autoComplete="email"
										required
									/>
								</div>
							</div>

							<button type="submit" disabled={submitting} className="dash-btn-primary">
								{submitting ? (
									<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
										<span className="dash-spinner" />
										Sending code...
									</span>
								) : (
									<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
										Send OTP
										<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}>
											<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</span>
								)}
							</button>
						</form>
					)}

					{/* ── OTP verify step ── */}
					{loginMethod === "otp" && otpStep === "verify" && (
						<form onSubmit={handleOtpVerify}>
							<p style={{ marginBottom: "6px", fontSize: "13px", color: "#71717a" }}>
								Enter the 6-digit code sent to
							</p>
							<p style={{ marginBottom: "20px", fontSize: "14px", fontWeight: 600, color: "#e4e4e7" }}>
								{email}
							</p>

							<div style={{ marginBottom: "24px" }}>
								<label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>
									Verification Code
								</label>
								<input
									type="text"
									inputMode="numeric"
									maxLength={6}
									value={otpCode}
									onChange={(e) => {
										const val = e.target.value.replace(/\D/g, "").slice(0, 6);
										setOtpCode(val);
									}}
									className="dash-input dash-input-otp"
									placeholder="000000"
									autoFocus
									autoComplete="one-time-code"
									required
								/>
							</div>

							<button type="submit" disabled={submitting || otpCode.length !== 6} className="dash-btn-primary">
								{submitting ? (
									<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
										<span className="dash-spinner" />
										Verifying...
									</span>
								) : (
									<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
										Verify &amp; Sign in
										<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}>
											<path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</span>
								)}
							</button>

							<button
								type="button"
								onClick={(e) => { setOtpCode(""); setError(""); handleOtpRequest(e); }}
								style={{
									display: "block",
									width: "100%",
									marginTop: "12px",
									padding: "8px",
									fontSize: "13px",
									color: "#71717a",
									background: "none",
									border: "none",
									cursor: "pointer",
									textAlign: "center",
								}}
							>
								Didn&apos;t receive it? <span style={{ color: "#10b981", fontWeight: 500 }}>Send again</span>
							</button>

							<button
								type="button"
								onClick={() => { setOtpStep("email"); setOtpCode(""); setError(""); setOtpMessage(""); }}
								style={{
									display: "block",
									width: "100%",
									marginTop: "4px",
									padding: "8px",
									fontSize: "12px",
									color: "#52525b",
									background: "none",
									border: "none",
									cursor: "pointer",
									textAlign: "center",
								}}
							>
								Change email
							</button>
						</form>
					)}

				</div>
			</main>
		);
	}

	// ─── Authenticated dashboard ──────────────────────────────
	return (
		<main className="relative min-h-screen bg-[#0a0a0b] text-zinc-100">
			<GridBackground />

			{/* Header */}
			<header className="relative z-10 border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-xl">
				<div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
							<svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 text-emerald-400">
								<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
								<path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<div>
							<h1 className="text-base font-semibold text-white">Dashboard</h1>
							<p className="hidden text-xs text-zinc-500 sm:block">{session.user?.email}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Link
							href="/super-admin"
							className="hidden rounded-lg bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-all hover:bg-white/[0.1] hover:text-white sm:inline-flex"
						>
							Admin Console
						</Link>
						<button
							onClick={handleLogout}
							className="rounded-lg border border-white/[0.08] px-3.5 py-2 text-xs font-medium text-zinc-400 transition-all hover:border-red-500/30 hover:text-red-400"
						>
							Sign out
						</button>
					</div>
				</div>
			</header>

			{/* Welcome section */}
			<section className="relative z-10 border-b border-white/[0.06] bg-gradient-to-b from-emerald-500/[0.03] to-transparent">
				<div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
						Overview
					</p>
					<h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
						Welcome, {session.user?.name?.split(" ")[0] || "Admin"}
					</h2>
					<p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
						Real-time operational data from your portfolio API. All endpoints are verified through protected admin routes.
					</p>
				</div>
			</section>

			{/* Stats cards */}
			<section className="relative z-10 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
				<div className="grid gap-3 grid-cols-2 lg:grid-cols-4 sm:gap-4">
					{cards.map((card) => (
						<div
							key={card.label}
							className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
						>
							<div className="flex items-center justify-between">
								<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-400 transition-colors group-hover:text-emerald-400">
									{card.icon}
								</span>
								<span className="relative flex h-2.5 w-2.5">
									{card.ok && (
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
									)}
									<span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${card.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
								</span>
							</div>
							<p className="mt-3 text-lg font-bold text-white sm:mt-4 sm:text-2xl">{card.value}</p>
							<p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">{card.label}</p>
							<p className="mt-2 truncate text-[10px] text-zinc-600 sm:mt-3 sm:text-xs">{card.detail}</p>
						</div>
					))}
				</div>

				{/* Live API Checks */}
				<div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:mt-8 sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="text-base font-semibold text-white">System Health</h3>
							<p className="mt-1 text-xs text-zinc-500">
								Last checked: {summary?.checkedAt || "N/A"}
							</p>
						</div>
						<button
							onClick={loadDashboard}
							className="group inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3.5 py-2 text-xs font-medium text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400"
						>
							<svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" style={{ transitionDuration: "500ms" }}>
								<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							Refresh
						</button>
					</div>

					<div className="mt-4 space-y-2 sm:mt-5">
						{checks.map((check) => (
							<div
								key={check.name}
								className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 sm:px-4 sm:py-3"
							>
								<div className="flex items-center gap-2 sm:gap-3">
									<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${check.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
									<div className="min-w-0">
										<p className="text-xs font-medium capitalize text-zinc-200 sm:text-sm">{check.label || check.name}</p>
										<p className="truncate text-[10px] text-zinc-600 sm:text-xs">{check.ok ? "Connected" : check.error || check.fallback}</p>
									</div>
								</div>
								<span
									className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:px-2.5 sm:py-1 sm:text-[10px] ${
										check.ok
											? "bg-emerald-500/10 text-emerald-400"
											: "bg-amber-500/10 text-amber-400"
									}`}
								>
									{check.ok ? "Healthy" : "Pending"}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Data panels */}
				<div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2">
					<DataPanel
						title="Contact Requests"
						icon={icons.mail}
						check={getCheck(checks, "recentContacts")}
						emptyText="No contact submissions yet."
						getItems={(data) => data?.contacts || []}
						renderItem={(contact) => (
							<div key={contact._id || contact.email} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-white">{contact.name || "Unknown"}</p>
										<p className="mt-0.5 truncate text-xs text-zinc-500">{contact.email}</p>
									</div>
									<span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
										{contact.category?.name || contact.category?.id || "General"}
									</span>
								</div>
								<p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-500">{contact.message}</p>
							</div>
						)}
					/>

					<DataPanel
						title="Newsletter Subscribers"
						icon={icons.users}
						check={getCheck(checks, "recentSubscribers")}
						emptyText="No subscribers yet."
						getItems={(data) => data?.subscribers || []}
						renderItem={(sub) => (
							<div key={sub._id || sub.email} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-white">
											{sub.name?.firstName || sub.name || "Subscriber"}
										</p>
										<p className="mt-0.5 truncate text-xs text-zinc-500">{sub.email}</p>
									</div>
									<span className="shrink-0 rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-400">
										{sub.status || "active"}
									</span>
								</div>
								<p className="mt-3 text-xs text-zinc-500">
									{sub.communicationPrefs?.emailFrequency || "weekly"} updates
								</p>
							</div>
						)}
					/>
				</div>
			</section>
		</main>
	);
}

// ─── Reusable data panel ────────────────────────────────────────
function DataPanel({ title, icon, check, emptyText, getItems, renderItem }) {
	const items = check?.ok ? getItems(check.data) : [];

	return (
		<section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-400">
						{icon}
					</span>
					<h3 className="text-base font-semibold text-white">{title}</h3>
				</div>
				<span
					className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
						check?.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-500"
					}`}
				>
					{check?.ok ? `${items.length} shown` : "Protected"}
				</span>
			</div>
			<div className="mt-5 space-y-3">
				{check?.ok ? (
					items.length ? (
						items.map(renderItem)
					) : (
						<p className="py-4 text-center text-xs text-zinc-600">{emptyText}</p>
					)
				) : (
					<p className="py-4 text-center text-xs text-zinc-600">{check?.error || "Sign in to access."}</p>
				)}
			</div>
		</section>
	);
}
