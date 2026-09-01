/** Renders one or many JSON-LD blocks. Server component — no client cost. */
const JsonLd = ({ data }) => {
	const schemas = Array.isArray(data) ? data : [data];
	return (
		<>
			{schemas.map((schema, i) => (
				<script
					key={i}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
				/>
			))}
		</>
	);
};

export default JsonLd;
