"use client";

const DevOpsAnimation = () => {
	return (
		<div className="relative w-full max-w-[500px] h-[500px] mx-auto pointer-events-none">
			{/* Subtle background glow */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
			
			{/* Central DevOps Infinity Symbol */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
				<div className="relative w-32 h-32">
					<svg 
						className="w-full h-full" 
						viewBox="0 0 200 100" 
						xmlns="http://www.w3.org/2000/svg"
					>
						<defs>
							<linearGradient id="devopsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" style={{stopColor: "#10B981", stopOpacity: 1}} />
								<stop offset="50%" style={{stopColor: "#3B82F6", stopOpacity: 1}} />
								<stop offset="100%" style={{stopColor: "#8B5CF6", stopOpacity: 1}} />
							</linearGradient>
						</defs>
						<path 
							d="M50,50 C50,30 35,15 20,15 C5,15 0,30 0,50 C0,70 5,85 20,85 C35,85 50,70 50,50 M100,50 C100,30 115,15 130,15 C145,15 150,30 150,50 C150,70 145,85 130,85 C115,85 100,70 100,50" 
							fill="none" 
							stroke="url(#devopsGradient)" 
							strokeWidth="4"
							className="animate-pulse"
						/>
					</svg>
					
					{/* Clean Dev/Ops Labels */}
					<div className="absolute -top-8 left-4 text-green-400 font-bold text-sm tracking-wider">
						DEV
					</div>
					<div className="absolute -bottom-4 right-4 text-blue-400 font-bold text-sm tracking-wider">
						OPS
					</div>
				</div>
			</div>

			{/* Simplified Tech Icons - positioned around the infinity symbol */}
			{/* Docker */}
			<div className="absolute top-16 left-16 w-16 h-16 bg-blue-500/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-400/20">
				<div className="text-blue-400 text-xl">🐳</div>
				<div className="absolute -bottom-5 text-xs text-blue-300 font-medium">Docker</div>
			</div>
			
			{/* Kubernetes */}
			<div className="absolute top-20 right-20 w-14 h-14 bg-orange-500/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-orange-400/20">
				<div className="text-orange-400 text-lg">☸️</div>
				<div className="absolute -bottom-5 text-xs text-orange-300 font-medium">K8s</div>
			</div>
			
			{/* AWS */}
			<div className="absolute bottom-24 left-12 w-16 h-16 bg-yellow-500/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-yellow-400/20">
				<div className="text-yellow-400 text-xl">☁️</div>
				<div className="absolute -bottom-5 text-xs text-yellow-300 font-medium">AWS</div>
			</div>
			
			{/* Git */}
			<div className="absolute bottom-20 right-16 w-14 h-14 bg-red-500/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-red-400/20">
				<div className="text-red-400 text-lg">📋</div>
				<div className="absolute -bottom-5 text-xs text-red-300 font-medium">Git</div>
			</div>

			{/* Simple CI/CD Pipeline */}
			<div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
				<div className="flex items-center gap-2 bg-gray-900/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600/20">
					<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
					<div className="w-6 h-0.5 bg-green-400/50"></div>
					<div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse animation-delay-1000"></div>
					<div className="w-6 h-0.5 bg-blue-400/50"></div>
					<div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse animation-delay-2000"></div>
				</div>
			</div>

			{/* Simple Monitoring */}
			<div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
				<div className="flex items-end gap-1 bg-gray-900/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-gray-600/20">
					<div className="w-1 h-3 bg-cyan-400 animate-pulse rounded-t"></div>
					<div className="w-1 h-5 bg-cyan-400 animate-pulse animation-delay-200 rounded-t"></div>
					<div className="w-1 h-4 bg-cyan-400 animate-pulse animation-delay-400 rounded-t"></div>
					<div className="w-1 h-6 bg-cyan-400 animate-pulse animation-delay-600 rounded-t"></div>
					<div className="w-1 h-3 bg-cyan-400 animate-pulse animation-delay-800 rounded-t"></div>
				</div>
			</div>

			{/* Subtle orbital ring */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div className="w-80 h-80 border border-blue-500/5 rounded-full animate-spin-slow"></div>
			</div>
		</div>
	);
};

export default DevOpsAnimation;