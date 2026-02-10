// SVG Country Flags - Cross-platform compatible

export const UAEFlag = ({ className = "w-8 h-6" }) => (
	<svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
		<path fill="#00732f" d="M0 0h640v160H0z"/>
		<path fill="#fff" d="M0 160h640v160H0z"/>
		<path fill="#000" d="M0 320h640v160H0z"/>
		<path fill="#f00" d="M0 0h220v480H0z"/>
	</svg>
);

export const IndiaFlag = ({ className = "w-8 h-6" }) => (
	<svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
		<path fill="#f93" d="M0 0h640v160H0z"/>
		<path fill="#fff" d="M0 160h640v160H0z"/>
		<path fill="#128807" d="M0 320h640v160H0z"/>
		<g transform="translate(320 240)">
			<circle r="48" fill="#008"/>
			<circle r="43.5" fill="#fff"/>
			<circle r="10" fill="#008"/>
			<g fill="#008">
				{[...Array(24)].map((_, i) => (
					<rect key={i} width="2" height="16" x="-1" y="-44" transform={`rotate(${i * 15})`}/>
				))}
			</g>
		</g>
	</svg>
);

export const GlobalFlag = ({ className = "w-8 h-6" }) => (
	<svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
		<rect fill="#001100" width="640" height="480"/>
		<circle cx="320" cy="240" r="150" fill="none" stroke="#00ff41" strokeWidth="4"/>
		<ellipse cx="320" cy="240" rx="60" ry="150" fill="none" stroke="#00ff41" strokeWidth="2"/>
		<line x1="170" y1="240" x2="470" y2="240" stroke="#00ff41" strokeWidth="2"/>
		<line x1="320" y1="90" x2="320" y2="390" stroke="#00ff41" strokeWidth="2"/>
		<ellipse cx="320" cy="240" rx="150" ry="60" fill="none" stroke="#00ff41" strokeWidth="2"/>
	</svg>
);

// Flag mapping helper
export const getFlag = (countryCode) => {
	const flags = {
		'UAE': UAEFlag,
		'India': IndiaFlag,
		'Global': GlobalFlag,
	};
	return flags[countryCode] || GlobalFlag;
};

// Flag component that accepts country name
const CountryFlag = ({ country, className = "w-8 h-6" }) => {
	const FlagComponent = getFlag(country);
	return <FlagComponent className={className} />;
};

export default CountryFlag;
