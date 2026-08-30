"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, createContext, useContext } from "react";

// ─── Dashboard context ──────────────────────────────────────────
const DashboardContext = createContext(null);
export function useDashboard() { return useContext(DashboardContext); }

// ─── Status helpers ─────────────────────────────────────────────
const defaultChecks = [
	{ name: "health", ok: false, label: "API Server", fallback: "Waiting" },
	{ name: "roles", ok: false, label: "Roles", fallback: "Protected" },
	{ name: "team", ok: false, label: "Team", fallback: "Protected" },
	{ name: "analytics", ok: false, label: "Analytics", fallback: "Protected" },
];

export function getCheck(checks, name) {
	return checks.find((c) => c.name === name);
}

export function getTotalSubscribers(newsletterStats, recentSubscribers) {
	return (
		newsletterStats?.stats?.verification?.total ||
		recentSubscribers?.data?.paginationData?.totalSubscribers ||
		0
	);
}

// ─── SVG Icons ─────────────────────────────────────────────────
export const Icons = {
	dashboard: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
		</svg>
	),
	contacts: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<rect x="2" y="4" width="20" height="16" rx="2" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
		</svg>
	),
	newsletter: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	),
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
	settings: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
		</svg>
	),
	cv: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14,2 14,8 20,8" />
			<line x1="16" y1="13" x2="8" y2="13" />
			<line x1="16" y1="17" x2="8" y2="17" />
			<polyline points="10,9 9,9 8,9" />
		</svg>
	),
	health: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
		</svg>
	),
	menu: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
			<line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
		</svg>
	),
	close: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
			<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
	logout: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
		</svg>
	),
	refresh: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
			<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
		</svg>
	),
	chevronLeft: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
			<polyline points="15,18 9,12 15,6" />
		</svg>
	),
	chevronRight: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
			<polyline points="9,18 15,12 9,6" />
		</svg>
	),
	externalLink: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
		</svg>
	),
	outreach: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" />
		</svg>
	),
};

// ─── Sidebar nav items ─────────────────────────────────────────
const navItems = [
	{ id: "dashboard", label: "Dashboard", icon: Icons.dashboard, href: "/dashboard" },
	{ id: "contacts", label: "Contacts", icon: Icons.contacts, href: "/dashboard/contacts" },
	{ id: "newsletter", label: "Subscribers", icon: Icons.newsletter, href: "/dashboard/subscribers" },
	{ id: "cv", label: "CV Analytics", icon: Icons.cv, href: "/dashboard/cv-analytics" },
	{ id: "outreach", label: "CV Outreach", icon: Icons.outreach, href: "/dashboard/cv-outreach" },
	{ id: "health", label: "System Health", icon: Icons.health, href: "/dashboard/health" },
	{ id: "settings", label: "Settings", icon: Icons.settings, href: "/dashboard/settings" },
];

// ─── Login page ─────────────────────────────────────────────────
function LoginPage({ loadDashboard }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [loginMethod, setLoginMethod] = useState("password");
	const [otpStep, setOtpStep] = useState("email");
	const [otpCode, setOtpCode] = useState("");
	const [otpMessage, setOtpMessage] = useState("");

	function switchLoginMethod(method) {
		setLoginMethod(method);
		setError("");
		setOtpMessage("");
		setOtpStep("email");
		setOtpCode("");
	}

	async function handleLogin(e) {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		try {
			const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Login failed.");
			setEmail(""); setPassword("");
			await loadDashboard();
		} catch (err) { setError(err.message || "Login failed."); } finally { setSubmitting(false); }
	}

	async function handleOtpRequest(e) {
		e.preventDefault();
		setSubmitting(true); setError(""); setOtpMessage("");
		try {
			const res = await fetch("/api/admin/otp/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
			const data = await res.json();
			setOtpStep("verify");
			setOtpMessage(data.message || "Check your email for the code.");
		} catch (err) { setError(err.message || "Failed to send OTP."); } finally { setSubmitting(false); }
	}

	async function handleOtpVerify(e) {
		e.preventDefault();
		setSubmitting(true); setError("");
		try {
			const res = await fetch("/api/admin/otp/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp: otpCode }) });
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Verification failed.");
			setOtpCode(""); setOtpStep("email");
			await loadDashboard();
		} catch (err) { setError(err.message || "OTP verification failed."); } finally { setSubmitting(false); }
	}

	const tabStyle = (active) => ({ flex: 1, padding: "10px 0", fontSize: "13px", fontWeight: 600, textAlign: "center", cursor: "pointer", color: active ? "#10b981" : "#71717a", background: active ? "rgba(16, 185, 129, 0.06)" : "transparent", border: "none", borderBottom: active ? "2px solid #10b981" : "2px solid transparent", transition: "all 0.2s", letterSpacing: "0.02em" });

	return (
		<main style={{ position: "relative", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#0a0a0b", padding: "16px" }}>
			<div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
				<div style={{ width: "600px", height: "600px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.04)", filter: "blur(120px)" }} />
			</div>
			<div className="dash-card" style={{ position: "relative", zIndex: 10 }}>
				<div style={{ marginBottom: "24px", textAlign: "center" }}>
					<div style={{ width: "56px", height: "56px", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
						<svg viewBox="0 0 24 24" fill="none" style={{ width: "28px", height: "28px", color: "#34d399" }}>
							<path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
							<path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							<path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
					<h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.025em" }}>Welcome back</h1>
					<p style={{ marginTop: "8px", fontSize: "14px", color: "#71717a" }}>Sign in to your portfolio dashboard</p>
				</div>

				<div style={{ display: "flex", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
					<button type="button" onClick={() => switchLoginMethod("password")} style={tabStyle(loginMethod === "password")}>Password</button>
					<button type="button" onClick={() => switchLoginMethod("otp")} style={tabStyle(loginMethod === "otp")}>Email OTP</button>
				</div>

				{error && (
					<div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "12px", borderRadius: "8px", padding: "12px 16px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
						<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", marginTop: "2px", flexShrink: 0, color: "#f87171" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
						<p style={{ fontSize: "14px", color: "rgba(252,165,165,0.9)" }}>{error}</p>
					</div>
				)}
				{otpMessage && !error && (
					<div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "12px", borderRadius: "8px", padding: "12px 16px", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
						<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", marginTop: "2px", flexShrink: 0, color: "#34d399" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
						<p style={{ fontSize: "14px", color: "rgba(110,231,183,0.9)" }}>{otpMessage}</p>
					</div>
				)}

				{loginMethod === "password" && (
					<form onSubmit={handleLogin}>
						<div style={{ marginBottom: "20px" }}>
							<label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>Email</label>
							<div style={{ position: "relative" }}>
								<div style={{ position: "absolute", top: 0, bottom: 0, left: "14px", display: "flex", alignItems: "center", pointerEvents: "none" }}>
									<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", color: "#52525b" }}><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="1.5" /></svg>
								</div>
								<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="dash-input" placeholder="you@example.com" autoComplete="email" required />
							</div>
						</div>
						<div style={{ marginBottom: "24px" }}>
							<label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>Password</label>
							<div style={{ position: "relative" }}>
								<div style={{ position: "absolute", top: 0, bottom: 0, left: "14px", display: "flex", alignItems: "center", pointerEvents: "none" }}>
									<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", color: "#52525b" }}><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" /></svg>
								</div>
								<input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="dash-input dash-input-password" placeholder="Enter your password" autoComplete="current-password" required />
								<button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", top: 0, bottom: 0, right: 0, display: "flex", alignItems: "center", paddingRight: "14px", color: "#52525b", cursor: "pointer" }} tabIndex={-1}>
									<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}>{showPassword ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></>}</svg>
								</button>
							</div>
						</div>
						<button type="submit" disabled={submitting} className="dash-btn-primary">
							<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
								{submitting ? <><span className="dash-spinner" />Signing in...</> : <>Sign in<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></>}
							</span>
						</button>
					</form>
				)}

				{loginMethod === "otp" && otpStep === "email" && (
					<form onSubmit={handleOtpRequest}>
						<p style={{ marginBottom: "20px", fontSize: "13px", color: "#71717a", lineHeight: 1.6 }}>We&apos;ll send a 6-digit code to your email. No password needed.</p>
						<div style={{ marginBottom: "24px" }}>
							<label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>Email</label>
							<div style={{ position: "relative" }}>
								<div style={{ position: "absolute", top: 0, bottom: 0, left: "14px", display: "flex", alignItems: "center", pointerEvents: "none" }}>
									<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px", color: "#52525b" }}><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="1.5" /></svg>
								</div>
								<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="dash-input" placeholder="you@example.com" autoComplete="email" required />
							</div>
						</div>
						<button type="submit" disabled={submitting} className="dash-btn-primary">
							<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
								{submitting ? <><span className="dash-spinner" />Sending code...</> : <>Send OTP<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></>}
							</span>
						</button>
					</form>
				)}

				{loginMethod === "otp" && otpStep === "verify" && (
					<form onSubmit={handleOtpVerify}>
						<p style={{ marginBottom: "6px", fontSize: "13px", color: "#71717a" }}>Enter the 6-digit code sent to</p>
						<p style={{ marginBottom: "20px", fontSize: "14px", fontWeight: 600, color: "#e4e4e7" }}>{email}</p>
						<div style={{ marginBottom: "24px" }}>
							<label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a1a1aa" }}>Verification Code</label>
							<input type="text" inputMode="numeric" maxLength={6} value={otpCode} onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6)); }} className="dash-input dash-input-otp" placeholder="000000" autoFocus autoComplete="one-time-code" required />
						</div>
						<button type="submit" disabled={submitting || otpCode.length !== 6} className="dash-btn-primary">
							<span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
								{submitting ? <><span className="dash-spinner" />Verifying...</> : <>Verify &amp; Sign in<svg viewBox="0 0 24 24" fill="none" style={{ width: "16px", height: "16px" }}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></>}
							</span>
						</button>
						<button type="button" onClick={(e) => { setOtpCode(""); setError(""); handleOtpRequest(e); }} style={{ display: "block", width: "100%", marginTop: "12px", padding: "8px", fontSize: "13px", color: "#71717a", background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
							Didn&apos;t receive it? <span style={{ color: "#10b981", fontWeight: 500 }}>Send again</span>
						</button>
						<button type="button" onClick={() => { setOtpStep("email"); setOtpCode(""); setError(""); setOtpMessage(""); }} style={{ display: "block", width: "100%", marginTop: "4px", padding: "8px", fontSize: "12px", color: "#52525b", background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
							Change email
						</button>
					</form>
				)}
			</div>
		</main>
	);
}

// ─── Pagination component ───────────────────────────────────────
export function Pagination({ currentPage, totalPages, onPageChange }) {
	if (totalPages <= 1) return null;

	const pages = [];
	const maxVisible = 5;
	let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
	let end = Math.min(totalPages, start + maxVisible - 1);
	if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

	for (let i = start; i <= end; i++) pages.push(i);

	return (
		<div className="flex items-center justify-between pt-4">
			<p className="text-xs text-zinc-400">
				Page {currentPage} of {totalPages}
			</p>
			<div className="flex items-center gap-1">
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none"
				>
					Prev
				</button>
				{pages.map((p) => (
					<button
						key={p}
						onClick={() => onPageChange(p)}
						className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
							p === currentPage
								? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
								: "border border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200"
						}`}
					>
						{p}
					</button>
				))}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
					className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none"
				>
					Next
				</button>
			</div>
		</div>
	);
}

// ─── Data table ─────────────────────────────────────────────────
export function DataTable({ columns, data, emptyText, renderRow }) {
	if (!data.length) {
		return (
			<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
				<p className="text-sm text-zinc-400">{emptyText}</p>
			</div>
		);
	}
	return (
		<div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
			<table className="w-full text-left">
				<thead>
					<tr className="border-b border-white/[0.08]">
						{columns.map((col) => (
							<th key={col} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{col}</th>
						))}
					</tr>
				</thead>
				<tbody>{data.map(renderRow)}</tbody>
			</table>
		</div>
	);
}

// ─── Shell component ────────────────────────────────────────────
export default function DashboardShell({ children }) {
	const pathname = usePathname();
	const [session, setSession] = useState(null);
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	// Pages that want the full width — the mailbox is its own workspace, so the
	// dashboard rail is hidden and reachable from the header menu button instead.
	const immersive = pathname === "/dashboard/cv-outreach";
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	const checks = summary?.checks || defaultChecks;

	const loadDashboard = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const sessionRes = await fetch("/api/admin/session", { cache: "no-store" });
			if (!sessionRes.ok) { setSession({ authenticated: false }); setSummary(null); return; }
			const sessionData = await sessionRes.json();
			setSession(sessionData);
			const summaryRes = await fetch("/api/admin/summary", { cache: "no-store" });
			if (summaryRes.ok) setSummary(await summaryRes.json());
		} catch (err) { setError(err.message || "Failed to load dashboard."); } finally { setLoading(false); }
	}, []);

	useEffect(() => { loadDashboard(); }, [loadDashboard]);

	// Close the nav drawer on navigation, or it stays open over the new page.
	useEffect(() => { setMobileSidebarOpen(false); }, [pathname]);

	async function handleLogout() {
		await fetch("/api/admin/logout", { method: "POST" });
		setSession({ authenticated: false });
		setSummary(null);
	}

	// Loading
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

	// Not authenticated
	if (!session?.authenticated) {
		return <LoginPage loadDashboard={loadDashboard} />;
	}

	const userName = session.user?.name?.split(" ")[0] || "Admin";
	const userEmail = session.user?.email || "";
	const userInitial = (session.user?.name?.[0] || "A").toUpperCase();

	// Get current page info
	const currentNav = navItems.find((n) => pathname === n.href) || navItems[0];

	const pageDesc = {
		"/dashboard": "Overview of your portfolio and platform analytics",
		"/dashboard/contacts": "Manage contact form submissions",
		"/dashboard/subscribers": "Manage newsletter subscribers",
		"/dashboard/cv-analytics": "CV download & view tracking with geo analytics",
		"/dashboard/cv-outreach": "CVs you sent from Gmail, with reply tracking",
		"/dashboard/health": "API and service health monitoring",
		"/dashboard/settings": "Configuration and preferences",
	};

	const ctx = { session, summary, checks, loadDashboard, cards: null };

	// Build cards
	const health = getCheck(checks, "health");
	const contactStats = getCheck(checks, "contactStats");
	const newsletterStats = getCheck(checks, "newsletterStats");
	const recentSubscribers = getCheck(checks, "recentSubscribers");
	const contactsTotal = contactStats?.data?.statistics?.totalContacts || 0;
	const subscribersTotal = getTotalSubscribers(newsletterStats?.data, recentSubscribers);

	ctx.cards = [
		{ label: "API Server", value: health?.ok ? "Online" : "Offline", detail: health?.ok ? "Server is up and running" : health?.error || "No response", ok: !!health?.ok, icon: Icons.server, color: "emerald" },
		{ label: "Access Role", value: session?.user?.roleInfo?.name || session?.user?.role || "Super Admin", detail: session?.user?.email || "Protected", ok: !!session?.authenticated, icon: Icons.shield, color: "blue" },
		{ label: "Contact Requests", value: String(contactsTotal), detail: contactStats?.ok ? "Total submissions" : contactStats?.error || "Protected", ok: !!contactStats?.ok, icon: Icons.contacts, color: "violet" },
		{ label: "Newsletter", value: String(subscribersTotal), detail: newsletterStats?.ok ? "Active subscribers" : "Protected", ok: !!newsletterStats?.ok, icon: Icons.newsletter, color: "amber" },
	];

	return (
		<DashboardContext.Provider value={ctx}>
			<div className="flex min-h-screen bg-[#0b0d10] text-zinc-100">
				{/* Mobile overlay */}
				{mobileSidebarOpen && <div className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm ${immersive ? "" : "lg:hidden"}`} onClick={() => setMobileSidebarOpen(false)} />}

				{/* Sidebar */}
				<aside className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-white/[0.06] bg-[#0d0f13] transition-all duration-300 ${sidebarCollapsed ? "w-[68px]" : "w-60"} ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${immersive ? "" : "lg:translate-x-0"}`}>
					<div className={`flex h-16 shrink-0 items-center border-b border-white/[0.06] ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-5"}`}>
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-bold text-white">A</div>
						{!sidebarCollapsed && <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">Ashiwani Kumar</p><p className="truncate text-[11px] text-zinc-500">Admin Panel</p></div>}
						<button onClick={() => setMobileSidebarOpen(false)} className="ml-auto text-zinc-500 hover:text-white lg:hidden">{Icons.close}</button>
					</div>

					<nav className="flex-1 overflow-y-auto px-3 py-4">
						<div className="space-y-1">
							{navItems.map((item) => {
								const isActive = pathname === item.href;
								return (
									<Link
										key={item.id}
										href={item.href}
										onClick={() => setMobileSidebarOpen(false)}
										className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
											isActive ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
										} ${sidebarCollapsed ? "justify-center" : ""}`}
										title={sidebarCollapsed ? item.label : undefined}
									>
										<span className="shrink-0">{item.icon}</span>
										{!sidebarCollapsed && <span>{item.label}</span>}
									</Link>
								);
							})}
						</div>
					</nav>

					<div className="shrink-0 border-t border-white/[0.06] p-3">
						<button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 transition-all hover:bg-white/[0.04] hover:text-zinc-300 lg:flex">
							{sidebarCollapsed ? Icons.chevronRight : Icons.chevronLeft}
							{!sidebarCollapsed && <span>Collapse</span>}
						</button>
						<div className={`mt-2 flex items-center gap-3 rounded-lg px-3 py-2 ${sidebarCollapsed ? "justify-center" : ""}`}>
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">{userInitial}</div>
							{!sidebarCollapsed && <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-zinc-200">{userName}</p><p className="truncate text-[10px] text-zinc-500">{userEmail}</p></div>}
						</div>
						<button onClick={handleLogout} className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 ${sidebarCollapsed ? "justify-center" : ""}`} title="Sign out">
							{Icons.logout}{!sidebarCollapsed && <span>Sign Out</span>}
						</button>
					</div>
				</aside>

				{/* Main */}
				<div className={`flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-300 ${immersive ? "" : sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-60"}`}>
					<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0b0d10]/80 px-4 backdrop-blur-xl sm:px-6">
						<div className="flex items-center gap-3">
							<button onClick={() => setMobileSidebarOpen(true)} aria-label="Open navigation" className={`rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white ${immersive ? "" : "lg:hidden"}`}>{Icons.menu}</button>
							<div>
								<h1 className="text-base font-semibold text-white">{currentNav.label}</h1>
								<p className="hidden text-xs text-zinc-400 sm:block">{pageDesc[pathname] || ""}</p>
							</div>
						</div>
						<Link href="https://ashiwanikumar.com" target="_blank" className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400 sm:inline-flex">
							Visit Site {Icons.externalLink}
						</Link>
					</header>

					<main className="flex-1 p-4 sm:p-6">{children}</main>

					<footer className="mt-auto shrink-0 border-t border-white/[0.06] px-4 py-4 sm:px-6">
						<div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
							<p className="text-[11px] text-zinc-500">&copy; {new Date().getFullYear()} Ashiwani Kumar. All rights reserved.</p>
							<div className="flex items-center gap-4 text-[11px] text-zinc-500">
								<a href="https://ashiwanikumar.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-300">Privacy</a>
								<a href="https://ashiwanikumar.com/terms-service" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-300">Terms</a>
								<a href="https://ashiwanikumar.com/contact" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-300">Contact</a>
							</div>
						</div>
					</footer>
				</div>
			</div>
		</DashboardContext.Provider>
	);
}
