/**
 * DevOps & SRE glossary.
 *
 * Each entry becomes one indexable page at /glossary/<term>. The shape is tuned
 * for search: `shortDefinition` feeds the meta description and DefinedTerm
 * schema, `keyFacts` gives crawlers an at-a-glance table, and `faqs` emit
 * FAQPage schema so the term can win a People-Also-Ask slot.
 *
 * @typedef {Object} GlossaryTerm
 * @property {string}   term            URL slug.
 * @property {string}   name            Display name.
 * @property {string}   shortDefinition One sentence, <=155 chars.
 * @property {string[]} definition      Paragraphs of prose.
 * @property {string}   category
 * @property {string[]} [alsoKnownAs]
 * @property {string[]} relatedTerms    Slugs of sibling terms.
 * @property {{label:string,value:string}[]} [keyFacts]
 * @property {string}   [example]
 * @property {{question:string,answer:string}[]} [faqs]
 */

/** @type {GlossaryTerm[]} */
export const glossaryTerms = [
	// ── Reliability & SRE ──────────────────────────────────────────────────────
	{
		term: "service-level-indicator",
		name: "SLI (Service Level Indicator)",
		shortDefinition:
			"A quantitative measure of one aspect of service health — such as the fraction of requests served successfully under 300 ms.",
		definition: [
			"A Service Level Indicator is the raw number you measure to describe how well a service is behaving. It is always a ratio of good events to total events, which keeps it comparable across services of wildly different traffic volumes. Availability, latency, throughput, and error rate are the four SLIs almost every service starts with.",
			"The discipline is in choosing indicators that track what users actually experience. CPU utilisation is a fine operational metric but a poor SLI, because a server can sit at 90% CPU while every request still succeeds. \"Fraction of HTTP requests that returned a non-5xx status within 300 ms\" is a good SLI, because when it drops, someone is having a bad time.",
			"Measure the SLI as close to the user as you can. A load balancer or CDN log tells you what the client saw; an application-side counter misses every request that never reached the process because the pod was already dead.",
		],
		category: "Reliability & SRE",
		alsoKnownAs: ["Service Level Indicator"],
		relatedTerms: ["service-level-objective", "error-budget", "golden-signals", "observability"],
		keyFacts: [
			{ label: "Expressed as", value: "A ratio — good events ÷ valid events" },
			{ label: "Measured at", value: "The point closest to the user (LB, CDN, or client)" },
			{ label: "Typical window", value: "Rolling 28 or 30 days" },
			{ label: "Common examples", value: "Availability, latency, error rate, freshness" },
		],
		example:
			"On the airport check-in API I measure availability as (requests returning < 500) ÷ (all requests), read from the nginx ingress access log rather than from the application, so requests that never reached a pod still count against us.",
		faqs: [
			{
				question: "What is the difference between an SLI and a metric?",
				answer:
					"Every SLI is a metric, but most metrics are not SLIs. An SLI is specifically a user-facing measure of correctness or speed, expressed as a ratio of good events to total events. CPU usage, memory pressure, and queue depth are metrics that help you debug, but they do not describe whether users are being served.",
			},
			{
				question: "How many SLIs should a service have?",
				answer:
					"Between two and four. Most services are well described by an availability SLI and a latency SLI; data pipelines add a freshness SLI. More than four and nobody remembers them, which means nobody acts on them.",
			},
		],
	},
	{
		term: "service-level-objective",
		name: "SLO (Service Level Objective)",
		shortDefinition:
			"A target value for an SLI over a time window — for example, 99.9% of requests served successfully over a rolling 30 days.",
		definition: [
			"A Service Level Objective is the line you draw on an SLI. It turns a continuous measurement into a binary judgement: either the service met its objective for the window, or it did not. That binary is what makes an SLO useful for making decisions, because it converts a fuzzy argument about whether reliability is \"good enough\" into a number everyone already agreed to.",
			"An SLO should be set below the level users would notice and above the level you can sustain without heroics. Setting it at 100% is the classic mistake: it guarantees permanent failure, removes any room to ship changes, and teaches the team to ignore the number. Setting it far above what users need is nearly as bad, because you spend engineering budget buying reliability nobody values.",
			"The right way to pick the first SLO is to measure current performance for a month and set the objective slightly below the observed level. You then tighten it only when you have evidence that users care about the difference.",
		],
		category: "Reliability & SRE",
		alsoKnownAs: ["Service Level Objective"],
		relatedTerms: ["service-level-indicator", "error-budget", "service-level-agreement", "toil"],
		keyFacts: [
			{ label: "Form", value: "SLI ≥ target, over a stated window" },
			{ label: "Typical window", value: "Rolling 28 or 30 days" },
			{ label: "Set by", value: "Product and engineering together, not ops alone" },
			{ label: "Should be", value: "Stricter than the SLA, looser than 100%" },
		],
		example:
			"99.9% of check-in API requests return successfully within 300 ms, measured over a rolling 30 days. That allows roughly 43 minutes of full outage per month before the objective is missed.",
		faqs: [
			{
				question: "What is the difference between an SLO and an SLA?",
				answer:
					"An SLO is an internal target you hold yourself to; an SLA is an external contract with financial penalties attached. The SLO should always be stricter than the SLA, so that you breach your internal target and start responding well before you owe a customer money.",
			},
			{
				question: "How much downtime does 99.9% allow?",
				answer:
					"About 43 minutes and 12 seconds per 30-day month, or roughly 8 hours 45 minutes per year. 99.99% allows about 4 minutes 19 seconds per month, which is short enough that no human-driven response can meet it — you need automated failover.",
			},
		],
	},
	{
		term: "service-level-agreement",
		name: "SLA (Service Level Agreement)",
		shortDefinition:
			"A contractual promise about service performance, with agreed consequences — usually service credits — if the promise is broken.",
		definition: [
			"A Service Level Agreement is the legal wrapper around reliability. It states what the provider promises, how it will be measured, what is excluded, and what the customer receives when the promise is missed. Unlike an SLO, it is written by lawyers as much as by engineers, and its numbers are deliberately conservative.",
			"The exclusions matter more than the headline number. Scheduled maintenance windows, force majeure, customer-caused faults, and beta features are almost always carved out, which means a service advertising \"99.95% uptime\" may contractually permit far more observed downtime than that figure suggests.",
			"Keep a gap between the SLA and the internal SLO. If the SLA promises 99.5% and the SLO targets 99.9%, the team has an early-warning band: the SLO is breached, and alarms are raised, well before any contractual obligation is triggered.",
		],
		category: "Reliability & SRE",
		alsoKnownAs: ["Service Level Agreement"],
		relatedTerms: ["service-level-objective", "service-level-indicator", "error-budget"],
		keyFacts: [
			{ label: "Audience", value: "External — customers and procurement" },
			{ label: "Enforced by", value: "Contract, usually via service credits" },
			{ label: "Relative to SLO", value: "Always looser" },
			{ label: "Key detail", value: "The exclusions clause, not the percentage" },
		],
		faqs: [
			{
				question: "Do internal platform teams need an SLA?",
				answer:
					"Rarely. Internal teams are better served by an SLO plus a clear escalation path. An internal SLA with no real penalty is just an SLO with extra paperwork, and it encourages teams to argue about blame instead of fixing the service.",
			},
		],
	},
	{
		term: "error-budget",
		name: "Error Budget",
		shortDefinition:
			"The amount of unreliability an SLO permits — 100% minus the objective — treated as a resource the team can spend on shipping changes.",
		definition: [
			"If your SLO is 99.9% over 30 days, then 0.1% of requests are allowed to fail. That 0.1% is the error budget. Framing it as a budget rather than a failure allowance is the important move, because a budget is something you deliberately spend rather than something you are ashamed of.",
			"The budget resolves the oldest argument in operations. Development wants to ship; operations wants stability. With an error budget the answer stops being a matter of temperament: if budget remains, ship, and take reasonable risks. If the budget is exhausted, feature releases pause and the team spends its time on reliability work until the rolling window recovers.",
			"For this to work the policy has to be agreed in advance and applied without negotiation. An error budget that gets waived under deadline pressure teaches everyone that the number is decorative.",
		],
		category: "Reliability & SRE",
		alsoKnownAs: ["Error budget policy"],
		relatedTerms: ["service-level-objective", "service-level-indicator", "canary-deployment", "toil"],
		keyFacts: [
			{ label: "Formula", value: "100% − SLO target" },
			{ label: "At 99.9% / 30 days", value: "≈ 43 minutes of full outage" },
			{ label: "At 99.99% / 30 days", value: "≈ 4 minutes 19 seconds" },
			{ label: "Spent on", value: "Releases, migrations, experiments, planned risk" },
		],
		example:
			"A 99.9% SLO gives about 43 minutes a month. A planned OpenShift control-plane upgrade that costs 6 minutes of API downtime spends roughly 14% of the budget — cheap enough to do monthly, expensive enough to notice.",
		faqs: [
			{
				question: "What happens when the error budget is exhausted?",
				answer:
					"Feature deploys stop and the team switches to reliability work — fixing the causes of the burn, adding tests, improving rollback speed — until the rolling window brings the budget back. The freeze is the mechanism that makes the SLO real rather than aspirational.",
			},
			{
				question: "What is error budget burn rate?",
				answer:
					"How fast you are consuming the budget relative to how fast the window replenishes it. A burn rate of 1 exhausts the budget exactly at the end of the window; a burn rate of 14.4 exhausts a 30-day budget in about 2 days. Alerting on high burn rates catches real incidents far earlier than alerting on the raw SLI.",
			},
		],
	},
	{
		term: "toil",
		name: "Toil",
		shortDefinition:
			"Manual, repetitive, automatable operational work that scales linearly with service size and produces no lasting improvement.",
		definition: [
			"Toil is the specific kind of operational work worth eliminating. Google's SRE definition is precise: work that is manual, repetitive, automatable, tactical rather than strategic, devoid of enduring value, and growing at least linearly with the size of the service. Restarting a stuck pod by hand every Tuesday is toil. Designing the controller that restarts it automatically is not.",
			"The linear-scaling clause is what makes toil dangerous. Overhead that grows with the fleet eventually consumes the entire team, and it does so gradually enough that nobody notices until on-call is unsustainable. A team spending 20% of its time on toil at 100 servers is spending 100% of it at 500.",
			"The usual target is to keep toil below 50% of each engineer's time, measured honestly rather than estimated optimistically. The other half is what funds the automation that keeps toil from growing.",
		],
		category: "Reliability & SRE",
		relatedTerms: ["error-budget", "infrastructure-as-code", "idempotency", "blameless-postmortem"],
		keyFacts: [
			{ label: "Six markers", value: "Manual, repetitive, automatable, tactical, no enduring value, scales linearly" },
			{ label: "Recommended ceiling", value: "50% of an engineer's time" },
			{ label: "Not toil", value: "Design work, one-off migrations, incident investigation" },
		],
		faqs: [
			{
				question: "Is all manual work toil?",
				answer:
					"No. Work that is manual but produces enduring value — designing a new deployment topology, writing a postmortem, reviewing an architecture — is overhead, not toil. The distinguishing test is whether doing the task again next month would create any new value.",
			},
		],
	},
	{
		term: "blameless-postmortem",
		name: "Blameless Postmortem",
		shortDefinition:
			"An incident review that identifies the systemic causes of a failure without attributing fault to individuals.",
		definition: [
			"A blameless postmortem assumes that everyone involved acted reasonably given the information they had at the time. That assumption is not politeness; it is the only way to get an accurate account. When engineers expect to be blamed, they omit details, and the write-up documents a story rather than a failure.",
			"The output should be a timeline, a description of the contributing causes, and a list of concrete action items with owners and dates. \"Be more careful\" is not an action item. \"Add a pre-flight check that refuses to apply a Terraform plan touching more than 10 resources without a second approval\" is.",
			"Blameless does not mean consequence-free. The consequences fall on the system: the missing guardrail, the alert that fired into a channel nobody reads, the runbook that was three versions out of date.",
		],
		category: "Reliability & SRE",
		alsoKnownAs: ["Blameless retrospective", "Incident review"],
		relatedTerms: ["mean-time-to-recovery", "toil", "observability", "error-budget"],
		keyFacts: [
			{ label: "Core assumption", value: "Everyone acted reasonably with the information they had" },
			{ label: "Produces", value: "Timeline, contributing causes, owned action items" },
			{ label: "Written within", value: "3–5 days, while memory is accurate" },
		],
		faqs: [
			{
				question: "Why not identify who caused the outage?",
				answer:
					"Because in a well-designed system no single person can cause an outage. If one mistyped command can take production down, the finding is that the system permitted it — not that someone typed it. Naming the individual stops the investigation exactly where it should start.",
			},
		],
	},
	{
		term: "mean-time-to-recovery",
		name: "MTTR (Mean Time to Recovery)",
		shortDefinition:
			"The average elapsed time from the start of an incident to full service restoration — the headline measure of operational responsiveness.",
		definition: [
			"MTTR measures how quickly you recover, not how rarely you break. It is one of the four DORA metrics, and for most teams it is the one most worth optimising, because failure frequency has a floor and recovery speed does not.",
			"The metric is usually decomposed to be actionable: time to detect, time to acknowledge, time to diagnose, and time to repair. Teams that measure only the total often discover that most of the elapsed time is detection — the outage ran for 20 minutes before any alert fired — which points at monitoring rather than at the fix itself.",
			"Beware the mean. A handful of long-tail incidents will drag the average far above the typical case, so track the median and the 90th percentile alongside it.",
		],
		category: "Reliability & SRE",
		alsoKnownAs: ["MTTR", "Mean time to restore", "Mean time to repair"],
		relatedTerms: ["blameless-postmortem", "observability", "rollback", "canary-deployment"],
		keyFacts: [
			{ label: "One of", value: "The four DORA metrics" },
			{ label: "Decomposes into", value: "Detect → acknowledge → diagnose → repair" },
			{ label: "DORA elite tier", value: "Under 1 hour" },
			{ label: "Watch out for", value: "The mean hiding a bimodal distribution" },
		],
		faqs: [
			{
				question: "What are the four DORA metrics?",
				answer:
					"Deployment frequency, lead time for changes, change failure rate, and mean time to recovery. The research behind them found that speed and stability rise together rather than trading off — teams that deploy more often also recover faster.",
			},
		],
	},
	{
		term: "golden-signals",
		name: "Four Golden Signals",
		shortDefinition:
			"Latency, traffic, errors, and saturation — the four measurements that describe almost any user-facing service.",
		definition: [
			"The four golden signals are a starting checklist for instrumenting a service you do not yet understand. Latency is how long requests take, traffic is how many there are, errors is the fraction that fail, and saturation is how close the system is to a resource limit.",
			"Latency deserves the most care of the four. Averages hide everything interesting, and successful and failed requests must be separated — a fast 500 will otherwise make your latency graph look better during an outage than it does when healthy.",
			"Saturation is the forward-looking one. Latency and errors tell you that something is already wrong; saturation tells you how long you have before it will be. Queue depth, connection-pool utilisation, and disk fill rate are more useful saturation signals than CPU.",
		],
		category: "Observability",
		alsoKnownAs: ["Golden signals", "LTES"],
		relatedTerms: ["service-level-indicator", "observability", "cardinality", "distributed-tracing"],
		keyFacts: [
			{ label: "Latency", value: "Time per request — split success from failure" },
			{ label: "Traffic", value: "Demand on the system (RPS, sessions)" },
			{ label: "Errors", value: "Rate of failed requests" },
			{ label: "Saturation", value: "How full the most constrained resource is" },
		],
		faqs: [
			{
				question: "How do the golden signals relate to the USE and RED methods?",
				answer:
					"RED (Rate, Errors, Duration) is the request-centric subset, best for services. USE (Utilisation, Saturation, Errors) is the resource-centric view, best for machines and queues. The golden signals essentially combine both, which is why they work as a default for a service you are seeing for the first time.",
			},
		],
	},

	// ── Kubernetes ─────────────────────────────────────────────────────────────
	{
		term: "crashloopbackoff",
		name: "CrashLoopBackOff",
		shortDefinition:
			"A Kubernetes pod state meaning a container keeps starting and exiting, so the kubelet is waiting an increasing delay before retrying.",
		definition: [
			"CrashLoopBackOff is not itself an error — it is Kubernetes telling you it has given up restarting a container at full speed. The container started, exited, and was restarted, repeatedly. The kubelet backs off exponentially between attempts, starting at 10 seconds and doubling to a 5-minute ceiling, which is why a pod in this state seems to sit still for long stretches.",
			"The status tells you the pattern, never the cause. The cause is in the logs of the previous attempt, which is why `kubectl logs <pod> --previous` is the first command to run — the current container is usually too young to have logged anything useful.",
			"In practice the causes cluster into a handful: the application crashed on a bad config or a missing secret, a dependency was unreachable at startup, the liveness probe was too aggressive and killed a slow-starting process, the container was OOMKilled, or the image entrypoint is simply wrong and exits immediately.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["Crash loop", "CrashLoop"],
		relatedTerms: ["liveness-probe", "oomkilled", "resource-requests-and-limits", "init-container"],
		keyFacts: [
			{ label: "Backoff starts at", value: "10 seconds" },
			{ label: "Backoff ceiling", value: "5 minutes" },
			{ label: "First command", value: "kubectl logs <pod> --previous" },
			{ label: "Second command", value: "kubectl describe pod <pod> — check Last State and Exit Code" },
		],
		example:
			"Exit code 137 means the container was killed by SIGKILL, nearly always the OOM killer — raise the memory limit or fix the leak. Exit code 1 with an empty log usually means the entrypoint could not find a config file that a ConfigMap was supposed to mount.",
		faqs: [
			{
				question: "How do I fix CrashLoopBackOff?",
				answer:
					"Read the previous container's logs with `kubectl logs <pod> --previous`, then check the exit code in `kubectl describe pod`. Exit code 137 points at memory limits, 1 or 2 at an application-level startup failure, and 127 at a missing binary in the image. Fix the underlying cause; the backoff clears itself once the container stays up.",
			},
			{
				question: "Why does my pod restart even though the app works?",
				answer:
					"Almost always an over-aggressive liveness probe. If the probe's initialDelaySeconds is shorter than the application's real startup time, the kubelet kills the container before it ever becomes ready. Use a startupProbe for slow-starting applications so the liveness probe only begins once startup has genuinely finished.",
			},
		],
	},
	{
		term: "oomkilled",
		name: "OOMKilled",
		shortDefinition:
			"A container terminated by the Linux out-of-memory killer for exceeding its memory limit, reported by Kubernetes as exit code 137.",
		definition: [
			"When a container's memory usage crosses its cgroup limit, the kernel's OOM killer terminates the process immediately. There is no grace period and no chance to shut down cleanly — the process receives SIGKILL. Kubernetes surfaces this as reason `OOMKilled` and exit code 137, which is 128 plus signal 9.",
			"The important distinction is between the container exceeding its own limit and the node running out of memory. The first kills only your container and is a limits problem. The second triggers node-level eviction, where the kubelet starts evicting pods by QoS class — BestEffort first, then Burstable, and Guaranteed last — and is a capacity or requests problem.",
			"JVM and Node.js workloads hit this constantly because their default heap sizing reads the host's total memory rather than the cgroup limit. Modern JVMs handle this correctly with container awareness enabled, but older ones need `-XX:MaxRAMPercentage` set explicitly.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["Out of memory kill", "Exit code 137"],
		relatedTerms: ["resource-requests-and-limits", "crashloopbackoff", "quality-of-service-class", "eviction"],
		keyFacts: [
			{ label: "Exit code", value: "137 (128 + SIGKILL)" },
			{ label: "Signal", value: "SIGKILL — no graceful shutdown" },
			{ label: "Triggered by", value: "Exceeding the container memory limit" },
			{ label: "Node-level variant", value: "Eviction, ordered by QoS class" },
		],
		faqs: [
			{
				question: "Why was my container OOMKilled when it was under the limit?",
				answer:
					"The limit applies to the whole cgroup, which includes the page cache attributed to the container and the memory of every process in it, not just your main application's heap. A sidecar, a large file read, or off-heap allocations can push the cgroup over even when the application's own reported usage looks fine.",
			},
			{
				question: "Should I just remove the memory limit?",
				answer:
					"No. Without a limit the container can consume the node's memory and trigger evictions across every other pod on it, turning a single leaking application into a node-wide incident. Raise the limit to a measured value instead, and set the request to the steady-state usage.",
			},
		],
	},
	{
		term: "resource-requests-and-limits",
		name: "Resource Requests and Limits",
		shortDefinition:
			"Requests reserve CPU and memory for scheduling; limits cap what a container may actually consume at runtime.",
		definition: [
			"Requests and limits do two entirely different jobs, and conflating them causes most Kubernetes capacity problems. The request is a scheduling promise: the scheduler will only place the pod on a node with that much capacity free, and it is what the node considers allocated regardless of actual usage. The limit is a runtime ceiling enforced by cgroups.",
			"CPU and memory behave differently at the limit. CPU is compressible — exceeding the limit gets you throttled, which makes the application slow but keeps it alive. Memory is not compressible — exceeding the limit gets the container killed. That asymmetry means an aggressive CPU limit degrades latency invisibly, while an aggressive memory limit produces a loud, obvious crash.",
			"The practical guidance: always set memory request equal to memory limit, set the CPU request to observed steady-state usage, and be cautious with CPU limits. Many production clusters deliberately omit CPU limits entirely so that bursty workloads can use idle capacity, relying on requests alone for fair scheduling.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["Pod resources", "Resource constraints"],
		relatedTerms: ["quality-of-service-class", "oomkilled", "horizontal-pod-autoscaler", "cpu-throttling"],
		keyFacts: [
			{ label: "Request", value: "Reserved for scheduling; drives node allocation" },
			{ label: "Limit", value: "Runtime ceiling enforced by cgroups" },
			{ label: "CPU over limit", value: "Throttled — slow but alive" },
			{ label: "Memory over limit", value: "OOMKilled — terminated immediately" },
		],
		faqs: [
			{
				question: "Should CPU limits be set at all?",
				answer:
					"It depends on the workload. For latency-sensitive services, CPU limits often do more harm than good: the container gets throttled at the limit even when the node has idle cores, adding tail latency for no benefit. For untrusted or noisy-neighbour workloads on shared clusters, limits are the right guardrail. Memory limits, by contrast, should essentially always be set.",
			},
		],
	},
	{
		term: "quality-of-service-class",
		name: "QoS Class",
		shortDefinition:
			"Kubernetes classifies each pod as Guaranteed, Burstable, or BestEffort based on its requests and limits, which determines eviction order under node pressure.",
		definition: [
			"Kubernetes derives a Quality of Service class from how a pod's requests and limits are set, and uses it to decide who dies first when a node runs short of memory. You do not set the class directly; it is inferred.",
			"A pod is Guaranteed when every container sets both requests and limits for both CPU and memory, and request equals limit in each case. It is BestEffort when no container sets any request or limit at all. Everything in between is Burstable.",
			"Under node memory pressure the kubelet evicts BestEffort pods first, then Burstable pods that are exceeding their requests, and only touches Guaranteed pods as a last resort. Anything that must survive node pressure — ingress controllers, monitoring agents, stateful databases — should therefore be Guaranteed.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["QoS class", "Pod QoS"],
		relatedTerms: ["resource-requests-and-limits", "oomkilled", "eviction", "pod-disruption-budget"],
		keyFacts: [
			{ label: "Guaranteed", value: "requests == limits for CPU and memory, on every container" },
			{ label: "Burstable", value: "At least one request set, but not matching limits" },
			{ label: "BestEffort", value: "No requests or limits at all" },
			{ label: "Eviction order", value: "BestEffort → Burstable → Guaranteed" },
		],
		faqs: [
			{
				question: "How do I check a pod's QoS class?",
				answer:
					"Run `kubectl get pod <name> -o jsonpath='{.status.qosClass}'`, or look for the `QoS Class` line in `kubectl describe pod`. It is computed at admission and cannot be changed without recreating the pod.",
			},
		],
	},
	{
		term: "liveness-probe",
		name: "Liveness Probe",
		shortDefinition:
			"A periodic health check that tells the kubelet to restart a container when it stops responding, used to recover from deadlocks.",
		definition: [
			"A liveness probe answers one question: is this container so broken that restarting it is the right response? If the probe fails enough consecutive times, the kubelet kills the container and lets the restart policy recreate it.",
			"That narrow purpose is routinely misunderstood, and the result is one of the most common self-inflicted outages in Kubernetes. A liveness probe that checks a downstream database will fail across every replica the moment that database has a hiccup, restarting the entire fleet and turning a dependency blip into a full outage. Liveness should only test the process itself.",
			"Kubernetes has three probes and they are not interchangeable. Readiness controls whether the pod receives traffic. Startup gives slow-booting applications time before liveness begins. Liveness restarts a wedged process. Most applications need readiness; many need startup; comparatively few genuinely need liveness.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["livenessProbe"],
		relatedTerms: ["readiness-probe", "crashloopbackoff", "graceful-shutdown", "init-container"],
		keyFacts: [
			{ label: "On failure", value: "Container is killed and restarted" },
			{ label: "Should check", value: "Only the process itself" },
			{ label: "Should never check", value: "Databases, caches, or any downstream dependency" },
			{ label: "For slow starts", value: "Use startupProbe, not a long initialDelaySeconds" },
		],
		faqs: [
			{
				question: "What is the difference between a liveness and a readiness probe?",
				answer:
					"A failing readiness probe removes the pod from Service endpoints so it stops receiving traffic, but leaves it running. A failing liveness probe kills and restarts the container. Readiness is for temporary unfitness — warming a cache, a full request queue. Liveness is for permanent unfitness, such as a deadlock that only a restart can clear.",
			},
		],
	},
	{
		term: "readiness-probe",
		name: "Readiness Probe",
		shortDefinition:
			"A health check that controls whether a pod receives traffic, removing it from Service endpoints while it reports unready.",
		definition: [
			"A readiness probe gates traffic rather than lifecycle. While it fails, the pod's IP is pulled from the Service's endpoint list, so load balancers stop sending it requests — but the container keeps running and can recover on its own.",
			"This is the probe that makes zero-downtime rolling updates possible. During a rollout Kubernetes waits for new pods to report ready before terminating old ones, so if readiness genuinely reflects the application's ability to serve, no request lands on a pod that is not yet warm.",
			"Unlike liveness, readiness is the right place to check critical downstream dependencies — but only when being unable to reach them genuinely means this replica cannot serve. If every replica shares the dependency, failing readiness fleet-wide simply moves the outage rather than containing it.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["readinessProbe"],
		relatedTerms: ["liveness-probe", "graceful-shutdown", "rolling-update", "service-mesh"],
		keyFacts: [
			{ label: "On failure", value: "Removed from Service endpoints; container keeps running" },
			{ label: "Enables", value: "Zero-downtime rolling updates" },
			{ label: "Recovers", value: "Automatically, once the probe passes again" },
		],
		faqs: [
			{
				question: "Why do I still get 502s during a rolling update?",
				answer:
					"Usually because the pod stops accepting connections the instant it receives SIGTERM, while the endpoint removal has not yet propagated to every load balancer. The fix is a preStop hook that sleeps a few seconds before shutdown begins, giving the endpoint change time to reach the data plane.",
			},
		],
	},
	{
		term: "graceful-shutdown",
		name: "Graceful Shutdown",
		shortDefinition:
			"Draining in-flight work after SIGTERM and before SIGKILL, so a terminating pod finishes its current requests instead of dropping them.",
		definition: [
			"When Kubernetes terminates a pod it sends SIGTERM, waits for `terminationGracePeriodSeconds` (30 by default), then sends SIGKILL. Everything the application does in that window is graceful shutdown: stop accepting new connections, finish in-flight requests, flush buffers, close database connections, and exit.",
			"Two failure modes dominate. The first is an application that ignores SIGTERM entirely — common when the container entrypoint is a shell script, because the shell runs as PID 1 and does not forward signals to the child. The fix is `exec` in the entrypoint, or a proper init like tini.",
			"The second is the race between endpoint removal and shutdown. Endpoint propagation to kube-proxy and ingress controllers is asynchronous, so a pod can begin shutting down while traffic is still being routed to it. A preStop hook that sleeps 5–15 seconds before the application starts draining closes the window.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["Pod termination", "Draining"],
		relatedTerms: ["readiness-probe", "rolling-update", "pod-disruption-budget", "liveness-probe"],
		keyFacts: [
			{ label: "Default grace period", value: "30 seconds" },
			{ label: "Sequence", value: "Endpoint removal + preStop → SIGTERM → grace period → SIGKILL" },
			{ label: "Classic bug", value: "Shell as PID 1 swallowing SIGTERM" },
			{ label: "Standard mitigation", value: "preStop sleep of 5–15 seconds" },
		],
		faqs: [
			{
				question: "Why does my app not receive SIGTERM?",
				answer:
					"Because it is not PID 1. If your Dockerfile uses shell-form CMD, the shell becomes PID 1 and does not forward signals to your process. Use exec-form CMD (`CMD [\"node\", \"server.js\"]`) or an init such as tini so your application receives the signal directly.",
			},
		],
	},
	{
		term: "pod-disruption-budget",
		name: "Pod Disruption Budget",
		shortDefinition:
			"A policy limiting how many pods of an application may be voluntarily evicted at once, protecting availability during node drains and upgrades.",
		definition: [
			"A PodDisruptionBudget constrains voluntary disruptions — node drains, cluster autoscaler scale-downs, and rolling node upgrades. It does not, and cannot, constrain involuntary ones such as a node failing or a kernel panic.",
			"You express it as either `minAvailable` or `maxUnavailable`. When an eviction would violate the budget, the eviction API rejects it and `kubectl drain` blocks, waiting for the application to recover enough replicas before continuing.",
			"The most common mistake is setting `minAvailable` equal to the replica count, which makes the budget unsatisfiable: no pod can ever be evicted, so node drains hang forever and cluster upgrades stall. Leave at least one replica of headroom.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["PDB"],
		relatedTerms: ["graceful-shutdown", "rolling-update", "quality-of-service-class", "node-affinity"],
		keyFacts: [
			{ label: "Protects against", value: "Voluntary disruptions only" },
			{ label: "Does not protect against", value: "Node failure, kernel panic, hardware loss" },
			{ label: "Expressed as", value: "minAvailable or maxUnavailable" },
			{ label: "Common trap", value: "minAvailable == replicas, which blocks all drains" },
		],
		faqs: [
			{
				question: "Why is kubectl drain hanging?",
				answer:
					"Almost always an unsatisfiable PodDisruptionBudget — often `minAvailable` equal to the number of replicas, or a single-replica Deployment with `minAvailable: 1`. Check with `kubectl get pdb -A` and look for a budget where ALLOWED DISRUPTIONS is 0.",
			},
		],
	},
	{
		term: "horizontal-pod-autoscaler",
		name: "Horizontal Pod Autoscaler",
		shortDefinition:
			"A Kubernetes controller that adds or removes pod replicas automatically to keep an observed metric near a target value.",
		definition: [
			"The HPA watches a metric — CPU utilisation by default, but any custom or external metric via the metrics API — and adjusts the replica count of a Deployment or StatefulSet to hold that metric near its target. It scales out, not up: pods get more numerous, not larger.",
			"CPU-based autoscaling is the default and often the wrong signal. It works for CPU-bound services and fails for anything I/O-bound, where a saturated service sits at low CPU while requests queue. Queue depth, requests per second, or in-flight request count usually track load far better.",
			"The HPA's target is expressed as a percentage of the pod's CPU *request*, not the limit — so a wrong request value silently distorts every scaling decision. Scale-down is deliberately slow (a 5-minute stabilisation window by default) to prevent thrashing, which surprises people who expect symmetric behaviour.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["HPA"],
		relatedTerms: ["resource-requests-and-limits", "cluster-autoscaler", "vertical-pod-autoscaler", "cpu-throttling"],
		keyFacts: [
			{ label: "Scales", value: "Replica count (horizontally)" },
			{ label: "Default metric", value: "CPU utilisation, as a % of the request" },
			{ label: "Scale-down window", value: "5 minutes by default" },
			{ label: "Requires", value: "metrics-server, or a custom metrics adapter" },
		],
		faqs: [
			{
				question: "Why is my HPA not scaling?",
				answer:
					"Check three things in order: that metrics-server is installed and returning data (`kubectl top pods`), that the target Deployment actually sets a CPU request — without one the HPA has no denominator and reports `<unknown>` — and that you have not already hit maxReplicas.",
			},
		],
	},
	{
		term: "cluster-autoscaler",
		name: "Cluster Autoscaler",
		shortDefinition:
			"A component that adds nodes when pods are unschedulable for lack of capacity, and removes underused nodes when their pods can be placed elsewhere.",
		definition: [
			"Where the HPA scales pods, the cluster autoscaler scales the nodes underneath them. Its scale-up trigger is simple and reactive: a pod is Pending because no node has room. It then picks a node group whose instance shape would fit the pod and increases that group's size.",
			"Scale-down is more conservative. A node must be underutilised for a sustained period, and every pod on it must be relocatable, before it is drained and removed. Anything that pins a pod in place — local storage, a restrictive PodDisruptionBudget, a pod without a controlling Deployment, or `cluster-autoscaler.kubernetes.io/safe-to-evict: false` — will keep an otherwise empty node alive indefinitely.",
			"Because scale-up only begins after a pod is already Pending, there is an unavoidable latency of a minute or more while the instance boots and joins. Workloads that cannot tolerate that wait use over-provisioning: low-priority placeholder pods that get preempted instantly, giving real workloads somewhere to land while the new node arrives.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["CA", "Node autoscaler"],
		relatedTerms: ["horizontal-pod-autoscaler", "pod-disruption-budget", "node-affinity", "taint-and-toleration"],
		keyFacts: [
			{ label: "Scale-up trigger", value: "Pods stuck Pending for lack of capacity" },
			{ label: "Scale-down trigger", value: "Sustained low utilisation with relocatable pods" },
			{ label: "Typical scale-up latency", value: "1–4 minutes (instance boot + join)" },
			{ label: "Blocks scale-down", value: "Local storage, strict PDBs, unmanaged pods" },
		],
		faqs: [
			{
				question: "Why won't the cluster autoscaler remove an almost-empty node?",
				answer:
					"Usually one pod on it cannot be moved. Common culprits are DaemonSet-adjacent workloads, pods using hostPath or emptyDir storage, pods with no controller, or a PodDisruptionBudget that currently allows zero disruptions. The autoscaler logs name the specific pod blocking removal.",
			},
		],
	},
	{
		term: "vertical-pod-autoscaler",
		name: "Vertical Pod Autoscaler",
		shortDefinition:
			"A controller that recommends or applies right-sized CPU and memory requests for pods based on observed historical usage.",
		definition: [
			"The VPA solves the problem nobody enjoys solving by hand: what should the requests actually be? It observes real usage over time and produces recommendations for requests and limits, optionally applying them automatically by evicting and recreating pods with the new values.",
			"Running it in `Off` mode — recommendations only, no automatic changes — is the highest-value, lowest-risk configuration. You get an accurate picture of over- and under-provisioning across the cluster and can act on it deliberately, without pods being restarted at unpredictable times.",
			"VPA in `Auto` mode and the HPA must not target the same metric on the same workload. Both would be adjusting resources in response to the same signal, and they fight: the VPA raises the request, which lowers the HPA's utilisation percentage, which scales in, which raises per-pod load, which raises the request again.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["VPA"],
		relatedTerms: ["horizontal-pod-autoscaler", "resource-requests-and-limits", "cluster-autoscaler"],
		keyFacts: [
			{ label: "Adjusts", value: "CPU and memory requests (vertically)" },
			{ label: "Safest mode", value: "Off — recommendations only" },
			{ label: "Auto mode cost", value: "Pod eviction and recreation to apply changes" },
			{ label: "Conflicts with", value: "HPA on the same metric" },
		],
	},
	{
		term: "taint-and-toleration",
		name: "Taints and Tolerations",
		shortDefinition:
			"A Kubernetes mechanism where nodes repel pods by default, and only pods carrying a matching toleration may be scheduled onto them.",
		definition: [
			"Taints and tolerations are the inverse of affinity. Affinity is a pod saying where it would like to go; a taint is a node saying who is allowed in. Together they let you reserve nodes — GPU instances, licensed hardware, compliance-isolated pools — for the workloads that belong there.",
			"There are three effects. `NoSchedule` refuses new pods that lack the toleration. `PreferNoSchedule` is a soft version that only avoids the node when alternatives exist. `NoExecute` additionally evicts pods already running that do not tolerate the taint, which is how Kubernetes drains workloads off a node marked unreachable.",
			"A toleration grants permission but does not compel placement. A pod tolerating a GPU taint may still be scheduled onto an ordinary node. To actually pin it to the tainted pool you need node affinity as well — taint to keep others out, affinity to draw the right pods in.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["Taints", "Tolerations"],
		relatedTerms: ["node-affinity", "cluster-autoscaler", "eviction", "daemonset"],
		keyFacts: [
			{ label: "NoSchedule", value: "Blocks new pods without the toleration" },
			{ label: "PreferNoSchedule", value: "Soft avoidance" },
			{ label: "NoExecute", value: "Blocks new pods and evicts existing ones" },
			{ label: "Important", value: "A toleration permits placement; it does not require it" },
		],
		faqs: [
			{
				question: "How do I dedicate nodes to one workload?",
				answer:
					"Use both mechanisms. Taint the nodes so nothing else can schedule there, and add matching node affinity to the workload so it is drawn to those nodes. A toleration alone lets the pod land anywhere; affinity alone lets other pods onto your dedicated hardware.",
			},
		],
	},
	{
		term: "node-affinity",
		name: "Node Affinity",
		shortDefinition:
			"Scheduling rules that attract pods to nodes with particular labels, either as a hard requirement or a soft preference.",
		definition: [
			"Node affinity expresses where a pod wants to run in terms of node labels — a zone, an instance type, a hardware capability. It comes in two strengths, and the difference matters operationally.",
			"`requiredDuringSchedulingIgnoredDuringExecution` is a hard constraint: no matching node, no scheduling, and the pod sits Pending. `preferredDuringSchedulingIgnoredDuringExecution` is a weighted preference the scheduler tries to honour but will happily ignore rather than leave the pod unscheduled.",
			"The `IgnoredDuringExecution` half of both names is a real limitation: affinity is evaluated only at scheduling time. Relabel a node afterwards and running pods stay exactly where they are. Pod anti-affinity is the companion rule and is what actually spreads replicas across zones or hosts — though `topologySpreadConstraints` now does that job more precisely and more cheaply.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["Affinity rules", "nodeAffinity"],
		relatedTerms: ["taint-and-toleration", "pod-disruption-budget", "cluster-autoscaler", "daemonset"],
		keyFacts: [
			{ label: "Hard rule", value: "requiredDuringSchedulingIgnoredDuringExecution" },
			{ label: "Soft rule", value: "preferredDuringSchedulingIgnoredDuringExecution" },
			{ label: "Evaluated", value: "At scheduling time only" },
			{ label: "For spreading replicas", value: "Prefer topologySpreadConstraints" },
		],
	},
	{
		term: "daemonset",
		name: "DaemonSet",
		shortDefinition:
			"A Kubernetes workload that runs exactly one copy of a pod on every node (or every node matching a selector), used for agents.",
		definition: [
			"A DaemonSet guarantees one pod per node. Add a node and the controller schedules a pod onto it automatically; remove the node and the pod goes with it. This is the right shape for anything that must observe or serve the node itself.",
			"Log shippers, metrics exporters, CNI plugins, CSI node drivers, and security agents are the canonical uses. All of them need node-local access, and all of them would be wrong as a Deployment, because replica count would have no relationship to fleet size.",
			"DaemonSet pods typically need tolerations for every taint in the cluster, including control-plane taints, since an agent that skips tainted nodes leaves blind spots exactly where you least want them. They are also usually the last thing evicted during node pressure, which is why they should carry Guaranteed QoS.",
		],
		category: "Kubernetes",
		relatedTerms: ["taint-and-toleration", "quality-of-service-class", "node-affinity", "eviction"],
		keyFacts: [
			{ label: "Replicas", value: "Exactly one per matching node" },
			{ label: "Scales with", value: "Node count, automatically" },
			{ label: "Typical uses", value: "Log agents, metrics exporters, CNI, CSI, security agents" },
			{ label: "Usually needs", value: "Tolerations for all cluster taints" },
		],
	},
	{
		term: "statefulset",
		name: "StatefulSet",
		shortDefinition:
			"A Kubernetes workload giving each replica a stable network identity and its own persistent volume, for databases and clustered systems.",
		definition: [
			"A StatefulSet provides the three guarantees a Deployment deliberately does not: stable, ordinal pod names (`db-0`, `db-1`), a stable DNS identity for each via a headless Service, and a persistent volume that follows each ordinal across restarts and reschedules.",
			"Those guarantees cost flexibility. Pods are created in order and terminated in reverse order, so rollouts are serial rather than parallel and a stuck pod blocks the whole update. That is usually correct for a quorum-based system — you do not want three etcd members restarting simultaneously — but it makes StatefulSet rollouts markedly slower than Deployment ones.",
			"One sharp edge catches everyone: deleting a StatefulSet does not delete its PersistentVolumeClaims. That is deliberate data protection, but it means recreating a StatefulSet silently reattaches the old volumes, which can be either a lifesaver or a very confusing bug.",
		],
		category: "Kubernetes",
		relatedTerms: ["persistent-volume-claim", "graceful-shutdown", "pod-disruption-budget", "daemonset"],
		keyFacts: [
			{ label: "Pod names", value: "Stable and ordinal — app-0, app-1, app-2" },
			{ label: "Storage", value: "One PVC per replica, retained across restarts" },
			{ label: "Rollout order", value: "Serial; reverse ordinal on scale-down" },
			{ label: "On delete", value: "PVCs are retained, not removed" },
		],
		faqs: [
			{
				question: "When should I use a StatefulSet instead of a Deployment?",
				answer:
					"When replicas are not interchangeable. Databases, message brokers, and consensus systems need each member to keep its identity and its data across restarts. If your replicas are stateless and identical, a Deployment is simpler and rolls out far faster.",
			},
		],
	},
	{
		term: "persistent-volume-claim",
		name: "PersistentVolumeClaim",
		shortDefinition:
			"A pod's request for durable storage of a given size and access mode, bound to a PersistentVolume by the cluster.",
		definition: [
			"A PersistentVolumeClaim is the abstraction that lets an application ask for storage without knowing anything about the backend. The pod requests \"20Gi, ReadWriteOnce\"; the cluster satisfies it from a StorageClass, which provisions an EBS volume, a Ceph RBD image, or an NFS export as appropriate.",
			"Access modes are the part that most often bites. `ReadWriteOnce` means one node — not one pod — may mount it read-write, which is what block storage like EBS supports. `ReadWriteMany` allows many nodes and needs a file-based backend such as NFS, EFS, or CephFS. Requesting RWX from a block-storage StorageClass leaves the claim Pending forever.",
			"The StorageClass also carries the reclaim policy. `Delete` destroys the underlying volume when the claim goes away; `Retain` keeps it for manual recovery. Production databases should be on Retain, and the default in many clusters is not.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["PVC"],
		relatedTerms: ["statefulset", "eviction", "node-affinity"],
		keyFacts: [
			{ label: "ReadWriteOnce", value: "One node, read-write — block storage" },
			{ label: "ReadWriteMany", value: "Many nodes, read-write — needs NFS/EFS/CephFS" },
			{ label: "ReadOnlyMany", value: "Many nodes, read-only" },
			{ label: "Reclaim policy", value: "Delete or Retain — set on the StorageClass" },
		],
		faqs: [
			{
				question: "Why is my PVC stuck in Pending?",
				answer:
					"Either no StorageClass can satisfy the request, or the access mode is unsupported by the backend — asking for ReadWriteMany from a block-storage class is the usual cause. `kubectl describe pvc` shows the provisioner's error directly. In topology-aware clusters, a PVC also stays Pending until a pod is scheduled, which is normal for WaitForFirstConsumer binding.",
			},
		],
	},
	{
		term: "eviction",
		name: "Eviction",
		shortDefinition:
			"The kubelet or API server terminating pods to reclaim node resources or to permit a drain, ordered by QoS class and priority.",
		definition: [
			"Eviction comes in two forms that are easy to confuse. Node-pressure eviction is the kubelet acting unilaterally when a node runs low on memory, disk, or inodes: it picks victims by QoS class and priority and kills them to protect the node. API-initiated eviction is the polite form used by `kubectl drain`, which respects PodDisruptionBudgets and can be refused.",
			"Node-pressure eviction follows a defined order — BestEffort pods first, then Burstable pods exceeding their requests, then Guaranteed pods — with pod priority applied within each tier. Setting requests accurately is therefore not just a scheduling concern; it directly determines survival odds under pressure.",
			"Disk pressure is the underrated trigger. A node whose ephemeral storage fills up — usually from container logs or an unbounded emptyDir — will evict pods and then start garbage-collecting images, which can cascade into slow pod starts across the whole node.",
		],
		category: "Kubernetes",
		relatedTerms: ["quality-of-service-class", "oomkilled", "pod-disruption-budget", "resource-requests-and-limits"],
		keyFacts: [
			{ label: "Node-pressure eviction", value: "Kubelet-driven; ignores PDBs" },
			{ label: "API-initiated eviction", value: "Drain-driven; respects PDBs" },
			{ label: "Victim order", value: "BestEffort → Burstable over request → Guaranteed" },
			{ label: "Triggers", value: "Memory, disk, inode, and PID pressure" },
		],
	},
	{
		term: "init-container",
		name: "Init Container",
		shortDefinition:
			"A container that runs to completion before an application container starts, used for setup, migrations, and dependency waits.",
		definition: [
			"Init containers run sequentially, each to successful completion, before any application container in the pod starts. If one fails, the pod restarts and the sequence begins again from the first — which makes idempotency a hard requirement, not a nicety.",
			"They exist mainly to keep setup logic and its tooling out of the application image. Waiting for a database to accept connections, running a schema migration, cloning config from git, or fixing volume permissions are all natural init-container work, and none of them need to ship inside the runtime image.",
			"Because they run before the main containers, they are also a clean place to fail fast. An init container that exits non-zero when a required secret is absent turns a subtle runtime misconfiguration into an obvious, immediate startup failure.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["initContainers"],
		relatedTerms: ["crashloopbackoff", "liveness-probe", "idempotency", "sidecar-container"],
		keyFacts: [
			{ label: "Run", value: "Sequentially, before app containers" },
			{ label: "On failure", value: "Pod restarts; sequence begins again" },
			{ label: "Must be", value: "Idempotent — they will be re-run" },
			{ label: "Typical uses", value: "Dependency waits, migrations, permission fixes" },
		],
	},
	{
		term: "sidecar-container",
		name: "Sidecar Container",
		shortDefinition:
			"A helper container running alongside the main application in the same pod, sharing its network and storage.",
		definition: [
			"A sidecar extends an application without modifying it. Because containers in a pod share a network namespace and can share volumes, a sidecar can proxy the application's traffic, ship its logs, or refresh its credentials with no cooperation from the application itself.",
			"Service mesh proxies are the best-known example: Envoy runs as a sidecar and transparently intercepts all traffic, adding mTLS, retries, and telemetry to an application that knows nothing about any of it. Log shippers, secret-refresh agents, and metrics adapters follow the same shape.",
			"The historical difficulty was lifecycle. A plain sidecar had no ordering guarantee against the main container, so proxies could start late and log shippers could exit early, losing the last records. Kubernetes 1.29 introduced native sidecars — init containers with `restartPolicy: Always` — which start before the app, stay running, and terminate after it.",
		],
		category: "Kubernetes",
		relatedTerms: ["service-mesh", "init-container", "graceful-shutdown", "observability"],
		keyFacts: [
			{ label: "Shares", value: "Network namespace and volumes with the main container" },
			{ label: "Native support", value: "Kubernetes 1.29+, via init containers with restartPolicy: Always" },
			{ label: "Typical uses", value: "Mesh proxy, log shipping, secret refresh, metrics adapters" },
		],
	},
	{
		term: "rolling-update",
		name: "Rolling Update",
		shortDefinition:
			"Kubernetes' default deployment strategy, replacing pods incrementally so the service stays available throughout the rollout.",
		definition: [
			"A rolling update replaces old pods with new ones a few at a time, governed by `maxSurge` (how many extra pods may exist above the desired count) and `maxUnavailable` (how many may be missing). The defaults of 25% each mean a 4-replica Deployment can briefly run 5 pods and drop to 3.",
			"The rollout only progresses as new pods become Ready, which is what makes readiness probes load-bearing here. A Deployment with no readiness probe considers a pod ready the moment its container starts, so a rollout of a broken image can replace every healthy replica before anything notices.",
			"`maxUnavailable: 0` with `maxSurge: 1` is the conservative setting: capacity never dips below the desired count, at the cost of a slower rollout and one extra pod's worth of resources. For anything user-facing, that trade is usually worth making.",
		],
		category: "Kubernetes",
		relatedTerms: ["readiness-probe", "canary-deployment", "blue-green-deployment", "rollback"],
		keyFacts: [
			{ label: "maxSurge default", value: "25% above desired replicas" },
			{ label: "maxUnavailable default", value: "25% below desired replicas" },
			{ label: "Progress gated by", value: "Pod readiness" },
			{ label: "Safest config", value: "maxUnavailable: 0, maxSurge: 1" },
		],
		faqs: [
			{
				question: "How do I roll back a bad deployment?",
				answer:
					"`kubectl rollout undo deployment/<name>` reverts to the previous ReplicaSet. `kubectl rollout status` shows whether the current rollout is progressing, and `kubectl rollout history` lists the revisions available to return to. Rollback is itself a rolling update, so it obeys the same surge and unavailability limits.",
			},
		],
	},

	// ── Deployment strategy ────────────────────────────────────────────────────
	{
		term: "blue-green-deployment",
		name: "Blue-Green Deployment",
		shortDefinition:
			"Running two complete environments and switching all traffic from the old one to the new one at once, with instant rollback by switching back.",
		definition: [
			"Blue-green keeps two full production environments. Blue serves live traffic while green sits idle; you deploy to green, verify it, then move the router or load balancer to point at green. Rollback is the same switch in reverse, which makes it close to instantaneous.",
			"The strengths are a clean cutover and a genuinely fast rollback. The costs are that you pay for double the infrastructure during the transition, and that every user moves at once — a defect that survived verification hits 100% of traffic immediately.",
			"Shared state is where blue-green gets difficult. Both environments usually talk to the same database, so any schema change must be compatible with both versions simultaneously. That constraint — expand, migrate, contract — is what makes blue-green harder in practice than the diagram suggests.",
		],
		category: "Deployment",
		alsoKnownAs: ["Red-black deployment"],
		relatedTerms: ["canary-deployment", "rolling-update", "rollback", "feature-flag"],
		keyFacts: [
			{ label: "Traffic shift", value: "All at once" },
			{ label: "Rollback", value: "Near-instant — switch back" },
			{ label: "Infrastructure cost", value: "2× during the transition" },
			{ label: "Hard part", value: "Shared database schema compatibility" },
		],
		faqs: [
			{
				question: "Blue-green or canary?",
				answer:
					"Canary when you want to limit blast radius and can measure health per-slice — it exposes a small percentage first and catches defects before they reach everyone. Blue-green when you need an atomic cutover and the fastest possible rollback, and can afford to run two environments.",
			},
		],
	},
	{
		term: "canary-deployment",
		name: "Canary Deployment",
		shortDefinition:
			"Releasing a change to a small slice of traffic first, watching its metrics, and promoting or aborting based on what they show.",
		definition: [
			"A canary release sends a small fraction of traffic — often 1% or 5% — to the new version while everything else stays on the old one. If the canary's error rate and latency stay within bounds, the share is increased in steps until the rollout completes. If they degrade, traffic shifts back and the blast radius was limited to that fraction.",
			"The whole approach depends on having a signal worth measuring. Comparing the canary's SLIs against the baseline version's, over the same window, is what makes the promote-or-abort decision automatic rather than a judgement call. Without that comparison a canary is just a slow rollout.",
			"Tools like Argo Rollouts and Flagger implement this as a controller: they manage the traffic weights, query Prometheus for the analysis, and abort automatically when a metric breaches its threshold — which is what turns canarying from a manual procedure into a property of the pipeline.",
		],
		category: "Deployment",
		alsoKnownAs: ["Canary release", "Progressive delivery"],
		relatedTerms: ["blue-green-deployment", "rolling-update", "error-budget", "feature-flag", "service-mesh"],
		keyFacts: [
			{ label: "Initial exposure", value: "Typically 1–5% of traffic" },
			{ label: "Promotion gated by", value: "SLI comparison against the baseline" },
			{ label: "Needs", value: "Traffic splitting — mesh, ingress weights, or gateway" },
			{ label: "Common tooling", value: "Argo Rollouts, Flagger" },
		],
		faqs: [
			{
				question: "How long should a canary run?",
				answer:
					"Long enough to accumulate statistically meaningful data at the canary's traffic share. At 1% of a low-traffic service that can be hours; at 5% of a high-traffic one, minutes. Fixed short timers on low-traffic services are the common mistake — they promote on noise.",
			},
		],
	},
	{
		term: "rollback",
		name: "Rollback",
		shortDefinition:
			"Returning a system to its previous known-good version after a bad release, the primary lever for reducing time to recovery.",
		definition: [
			"Rollback is the fastest incident response available, and its speed is worth engineering deliberately. A team that can revert in 90 seconds can take risks a team that needs 40 minutes cannot, which is why rollback time shows up so directly in MTTR.",
			"What makes rollback hard is rarely the application code — it is everything with state. Database migrations that drop columns, message formats that changed, and caches populated with new-format entries all outlive the deployment. The expand/contract pattern exists to solve this: deploy schema changes that are compatible with both versions, ship the code, and only remove the old shape once rollback is no longer plausible.",
			"Rollback should be rehearsed rather than assumed. A procedure that has never been exercised in production has an unknown success rate, and an incident is the wrong moment to discover the gap.",
		],
		category: "Deployment",
		alsoKnownAs: ["Revert", "Roll back"],
		relatedTerms: ["rolling-update", "blue-green-deployment", "mean-time-to-recovery", "feature-flag", "immutable-infrastructure"],
		keyFacts: [
			{ label: "Kubernetes command", value: "kubectl rollout undo deployment/<name>" },
			{ label: "Blocked mainly by", value: "Irreversible database migrations" },
			{ label: "Enabling pattern", value: "Expand → migrate → contract" },
			{ label: "Directly affects", value: "MTTR" },
		],
	},
	{
		term: "feature-flag",
		name: "Feature Flag",
		shortDefinition:
			"A runtime toggle that turns functionality on or off without redeploying, separating code deployment from feature release.",
		definition: [
			"A feature flag decouples two things that are usually welded together: shipping code and exposing behaviour. The code goes to production dark, and the feature is switched on afterwards — for internal users first, then a percentage, then everyone. Turning it off is a config change measured in seconds rather than a rollback measured in minutes.",
			"That makes flags the fastest mitigation available during an incident, and it makes trunk-based development practical: incomplete work can merge to main safely because it is unreachable until its flag is enabled.",
			"The failure mode is accumulation. Every flag is a branch in the code and doubles the state space to reason about; a codebase with fifty stale flags is genuinely harder to change than one with none. Treat each flag as having an expiry date and remove it once the rollout is complete.",
		],
		category: "Deployment",
		alsoKnownAs: ["Feature toggle", "Feature switch"],
		relatedTerms: ["canary-deployment", "rollback", "continuous-delivery", "blue-green-deployment"],
		keyFacts: [
			{ label: "Separates", value: "Deployment from release" },
			{ label: "Kill-switch speed", value: "Seconds — no redeploy" },
			{ label: "Enables", value: "Trunk-based development, dark launches" },
			{ label: "Main risk", value: "Stale flags accumulating as permanent complexity" },
		],
	},

	// ── Infrastructure as Code ─────────────────────────────────────────────────
	{
		term: "infrastructure-as-code",
		name: "Infrastructure as Code",
		shortDefinition:
			"Defining and provisioning infrastructure through version-controlled machine-readable files rather than manual console or CLI steps.",
		definition: [
			"Infrastructure as Code means the authoritative description of your infrastructure lives in a repository. The console becomes a read-only view: you change infrastructure by changing code, reviewing it, and applying it, which brings pull requests, history, and rollback to a domain that used to rely on memory and runbooks.",
			"The real benefit is not automation speed — it is reproducibility and review. When a VPC exists because of a file that someone approved, you can answer why a rule is there, when it changed, and what it looked like before. When it exists because someone clicked, you cannot.",
			"There is a declarative/imperative split worth knowing. Terraform, CloudFormation, and Pulumi describe desired state and compute the diff. Ansible and shell scripts describe actions. Declarative tools handle drift and deletion far better, which is why they dominate provisioning while Ansible dominates configuration.",
		],
		category: "Infrastructure as Code",
		alsoKnownAs: ["IaC"],
		relatedTerms: ["terraform-state", "idempotency", "configuration-drift", "immutable-infrastructure", "gitops"],
		keyFacts: [
			{ label: "Declarative tools", value: "Terraform, OpenTofu, CloudFormation, Pulumi, Crossplane" },
			{ label: "Imperative tools", value: "Ansible, shell, custom SDK scripts" },
			{ label: "Core benefits", value: "Reproducibility, review, history, rollback" },
			{ label: "Main hazard", value: "Drift between code and reality" },
		],
	},
	{
		term: "terraform-state",
		name: "Terraform State",
		shortDefinition:
			"The file mapping Terraform resources in code to real infrastructure IDs, without which Terraform cannot tell creation from modification.",
		definition: [
			"Terraform state is the ledger connecting the `aws_instance.web` in your configuration to `i-0abc123` in the account. Terraform reads it to plan: resources in state get compared and updated, resources absent from state get created, and resources in state but absent from code get destroyed. Lose the state and Terraform will happily try to create everything a second time.",
			"That makes remote state with locking essential for any shared use. Two engineers running `apply` simultaneously against a local state file will produce a corrupted ledger and, often, duplicated infrastructure. S3 with native lockfile support (or DynamoDB on older versions), Terraform Cloud, and GCS all provide the lock.",
			"State also contains every attribute Terraform read, including database passwords and generated keys, in plain text. State backends must be encrypted, versioned, and access-controlled as tightly as any secret store — a public S3 bucket holding state is a full credential leak.",
		],
		category: "Infrastructure as Code",
		alsoKnownAs: ["tfstate", "terraform.tfstate"],
		relatedTerms: ["infrastructure-as-code", "configuration-drift", "idempotency", "immutable-infrastructure"],
		keyFacts: [
			{ label: "Maps", value: "Configuration resources to real infrastructure IDs" },
			{ label: "Contains secrets", value: "Yes — in plain text" },
			{ label: "Needs", value: "Remote backend, encryption, versioning, locking" },
			{ label: "Adopt existing resources with", value: "terraform import, or an import block" },
		],
		faqs: [
			{
				question: "What happens if I lose the Terraform state file?",
				answer:
					"Terraform loses all knowledge of what it manages and treats every resource as new, so the next apply attempts to create duplicates. Recovery means restoring from backend versioning, or importing each existing resource back into a fresh state — which is why versioning on the state bucket is not optional.",
			},
			{
				question: "Do I still need DynamoDB for state locking?",
				answer:
					"Not on recent versions. Terraform 1.10 introduced native S3 lockfile support via `use_lockfile`, and OpenTofu has the same, so a separate DynamoDB table is no longer required for new setups. Existing DynamoDB-based locking continues to work.",
			},
		],
	},
	{
		term: "configuration-drift",
		name: "Configuration Drift",
		shortDefinition:
			"The gap that opens between infrastructure as declared in code and infrastructure as it actually exists, usually from manual changes.",
		definition: [
			"Drift is what happens when reality diverges from the declared state. Someone edits a security group in the console during an incident, an autoscaling policy changes a value, a support engineer bumps an instance size — and the code no longer describes the system it supposedly defines.",
			"The danger is not the drift itself but the next apply. Terraform will faithfully revert the manual fix, potentially re-breaking exactly what the emergency change repaired. Drift turns your IaC from a source of truth into a source of surprise.",
			"The countermeasures are procedural more than technical: detect drift continuously by running `terraform plan` on a schedule and alerting on any non-empty diff, and remove the ability to make manual changes in the first place by restricting console write access in production.",
		],
		category: "Infrastructure as Code",
		alsoKnownAs: ["Drift", "Infrastructure drift"],
		relatedTerms: ["terraform-state", "infrastructure-as-code", "immutable-infrastructure", "idempotency", "gitops"],
		keyFacts: [
			{ label: "Caused by", value: "Manual console changes, out-of-band automation, autoscaling" },
			{ label: "Detect with", value: "Scheduled terraform plan, alerting on non-empty diffs" },
			{ label: "Prevent with", value: "Read-only production console access" },
			{ label: "Structural fix", value: "Immutable infrastructure" },
		],
	},
	{
		term: "immutable-infrastructure",
		name: "Immutable Infrastructure",
		shortDefinition:
			"Replacing servers rather than modifying them, so every running instance was built from a known image and never changed in place.",
		definition: [
			"Immutable infrastructure eliminates in-place change. Instead of patching a running server, you build a new image with the patch applied, deploy fresh instances from it, and terminate the old ones. No server is ever modified after it starts.",
			"This kills configuration drift structurally rather than by discipline. If nothing is ever changed in place, nothing can diverge, and every instance of a given version is byte-identical. It also makes rollback trivially reliable: the previous image still exists and still works.",
			"Containers made this the default almost by accident — you rebuild the image and redeploy because that is the only convenient path. The same idea applies to VMs through baked AMIs built with Packer, and the constraint it imposes is that state must live somewhere designed for it: a database, an object store, or a mounted volume, never on the instance's own disk.",
		],
		category: "Infrastructure as Code",
		alsoKnownAs: ["Immutable servers", "Phoenix servers"],
		relatedTerms: ["configuration-drift", "infrastructure-as-code", "rollback", "idempotency"],
		keyFacts: [
			{ label: "Rule", value: "Replace, never modify in place" },
			{ label: "Eliminates", value: "Configuration drift, snowflake servers" },
			{ label: "Requires", value: "External state — nothing durable on instance disk" },
			{ label: "Tooling", value: "Container images, Packer AMIs" },
		],
	},
	{
		term: "idempotency",
		name: "Idempotency",
		shortDefinition:
			"The property that running an operation repeatedly produces the same result as running it once — the foundation of safe automation.",
		definition: [
			"An idempotent operation can be re-run without additional effect. `ensure this line exists in the file` is idempotent; `append this line to the file` is not. The distinction matters enormously in automation, because retries are constant: pipelines re-run, controllers reconcile, and init containers restart.",
			"Kubernetes is built entirely on this idea. Controllers run a reconciliation loop that compares desired state to actual state and acts on the difference, forever. That loop is only safe because each pass is idempotent — otherwise every reconciliation would compound the last one's effects.",
			"Ansible's module design is the clearest practical example: `state: present` checks before acting and reports `changed` only when it actually did something, which is why `shell` and `command` tasks are the ones that break idempotency and need `creates` or `changed_when` guards.",
		],
		category: "Infrastructure as Code",
		relatedTerms: ["infrastructure-as-code", "toil", "immutable-infrastructure", "init-container", "gitops"],
		keyFacts: [
			{ label: "Definition", value: "f(f(x)) == f(x) — re-running changes nothing further" },
			{ label: "Why it matters", value: "Retries, reconciliation loops, and restarts are constant" },
			{ label: "Ansible", value: "Modules are idempotent; shell/command tasks are not" },
			{ label: "Kubernetes", value: "Every controller reconciliation depends on it" },
		],
	},
	{
		term: "gitops",
		name: "GitOps",
		shortDefinition:
			"An operating model where a Git repository is the single source of truth and an in-cluster agent continuously reconciles reality to match it.",
		definition: [
			"GitOps inverts the direction of deployment. Instead of a CI pipeline pushing changes into the cluster, an agent inside the cluster pulls the desired state from Git and reconciles continuously. Merging a pull request is the deployment; there is no separate deploy step.",
			"The pull model has two consequences worth the switch. Credentials never leave the cluster — CI no longer needs cluster-admin, which removes one of the most dangerous secrets in a typical pipeline. And because reconciliation is continuous rather than one-shot, manual changes are reverted automatically, so drift self-heals instead of accumulating.",
			"Argo CD and Flux are the two mainstream implementations. The pattern's main friction is secrets, since plaintext credentials obviously cannot live in Git — handled with Sealed Secrets, SOPS, or an External Secrets Operator that pulls from Vault or a cloud secret manager at runtime.",
		],
		category: "Infrastructure as Code",
		relatedTerms: ["configuration-drift", "continuous-delivery", "infrastructure-as-code", "idempotency"],
		keyFacts: [
			{ label: "Source of truth", value: "A Git repository" },
			{ label: "Direction", value: "Pull — the agent reconciles from inside the cluster" },
			{ label: "Drift handling", value: "Continuous reconciliation; reverts manual changes" },
			{ label: "Tooling", value: "Argo CD, Flux" },
		],
		faqs: [
			{
				question: "How do you handle secrets in GitOps?",
				answer:
					"Never in plaintext. The three standard approaches are Sealed Secrets (encrypted with a cluster-held key so only that cluster can decrypt), SOPS with a KMS key, or the External Secrets Operator, which keeps secrets in Vault or a cloud secret manager and syncs them into the cluster at runtime so Git only ever holds a reference.",
			},
		],
	},

	// ── CI/CD ──────────────────────────────────────────────────────────────────
	{
		term: "continuous-integration",
		name: "Continuous Integration",
		shortDefinition:
			"The practice of merging every developer's work to a shared mainline many times a day, with each merge verified by an automated build and test run.",
		definition: [
			"Continuous integration is a practice, not a tool. The defining behaviour is that everyone merges to the mainline frequently — at least daily — and that every merge triggers an automated build and test run that must pass. A team running Jenkins on long-lived feature branches merged monthly is not doing CI, whatever the pipeline is called.",
			"The purpose is to keep integration problems small. Merge conflicts, incompatible interfaces, and broken assumptions all grow superlinearly with time apart, so integrating hourly makes each conflict trivial while integrating quarterly makes the merge itself a project.",
			"Two rules make it work: the build must be fast enough that developers wait for it rather than context-switching (ten minutes is the usual target), and a broken mainline must be the team's top priority until it is green again.",
		],
		category: "CI/CD",
		alsoKnownAs: ["CI"],
		relatedTerms: ["continuous-delivery", "pipeline-as-code", "artifact-registry", "feature-flag"],
		keyFacts: [
			{ label: "Merge frequency", value: "At least daily, to a shared mainline" },
			{ label: "Every merge", value: "Triggers an automated build and test run" },
			{ label: "Target build time", value: "Under 10 minutes" },
			{ label: "Rule", value: "A red mainline is the team's top priority" },
		],
	},
	{
		term: "continuous-delivery",
		name: "Continuous Delivery",
		shortDefinition:
			"Keeping software in a permanently releasable state, so any passing build can be deployed to production on demand by pressing a button.",
		definition: [
			"Continuous delivery extends CI past the build. Every change that passes the pipeline produces a deployable artifact and is proven releasable through automated testing and staging deploys, so the decision to ship becomes a business choice rather than an engineering project.",
			"The distinction from continuous deployment is one word: in continuous delivery a human decides when to release, while in continuous deployment every passing build goes to production automatically. Most regulated environments — including the aviation and government infrastructure I work on — need the human gate for audit reasons, which makes delivery the realistic target rather than deployment.",
			"The hard part is not the pipeline; it is the test suite. Continuous delivery is only real if a green pipeline is genuine evidence of releasability. If the team still runs a manual regression pass before every release, the pipeline is decoration.",
		],
		category: "CI/CD",
		alsoKnownAs: ["CD"],
		relatedTerms: ["continuous-integration", "pipeline-as-code", "canary-deployment", "feature-flag", "gitops"],
		keyFacts: [
			{ label: "Continuous delivery", value: "Deployable at any time; a human presses the button" },
			{ label: "Continuous deployment", value: "Every passing build ships automatically" },
			{ label: "Depends on", value: "A test suite trustworthy enough to gate a release" },
			{ label: "DORA metric", value: "Lead time for changes" },
		],
	},
	{
		term: "pipeline-as-code",
		name: "Pipeline as Code",
		shortDefinition:
			"Defining CI/CD pipelines in version-controlled files stored beside the application, rather than configuring them in a web UI.",
		definition: [
			"Pipeline as code puts the build definition in the repository — a Jenkinsfile, `.gitlab-ci.yml`, or workflow YAML — so the pipeline is reviewed, versioned, and branched along with the code it builds.",
			"The branching property is the one people underestimate. When the pipeline lives in the repo, a branch that needs an extra test step simply carries that change, and it merges to main along with the feature. When the pipeline lives in a UI, every branch shares one mutable definition and changing it for one branch risks breaking every other.",
			"It also makes pipeline changes auditable. \"Who removed the security scan stage, and when?\" is answerable from git history rather than from a Jenkins audit log that may not exist.",
		],
		category: "CI/CD",
		relatedTerms: ["continuous-integration", "continuous-delivery", "infrastructure-as-code", "artifact-registry"],
		keyFacts: [
			{ label: "Lives in", value: "The application repository" },
			{ label: "Examples", value: "Jenkinsfile, .gitlab-ci.yml, GitHub Actions workflows" },
			{ label: "Key benefit", value: "Pipeline changes branch and review with the code" },
		],
	},
	{
		term: "artifact-registry",
		name: "Artifact Registry",
		shortDefinition:
			"A versioned store for build outputs — container images, packages, Helm charts — that deployment pulls from instead of rebuilding.",
		definition: [
			"An artifact registry holds what the build produced, so that the exact bytes tested in staging are the bytes deployed to production. Rebuilding per environment breaks that guarantee: two builds from the same commit can differ through dependency resolution, base image updates, or build-time timestamps.",
			"Immutable tags are the practice that makes this reliable. A registry configured to reject overwrites means `myapp:1.4.2` can only ever refer to one image, so a rollback to that tag genuinely returns you to what ran before. Mutable `latest` tags defeat the entire purpose.",
			"Registries are also the natural place to enforce supply-chain policy: vulnerability scanning on push, image signing with cosign, and admission controllers that refuse to run unsigned or unscanned images in production.",
		],
		category: "CI/CD",
		alsoKnownAs: ["Container registry", "Package repository"],
		relatedTerms: ["continuous-delivery", "immutable-infrastructure", "pipeline-as-code", "rollback"],
		keyFacts: [
			{ label: "Rule", value: "Build once, promote the same artifact through environments" },
			{ label: "Tags", value: "Immutable — reject overwrites" },
			{ label: "Enforcement point for", value: "Scanning, signing, admission policy" },
			{ label: "Examples", value: "Harbor, ECR, Artifactory, GHCR, Nexus" },
		],
	},

	// ── Observability & networking ─────────────────────────────────────────────
	{
		term: "observability",
		name: "Observability",
		shortDefinition:
			"The property of a system whose internal state can be understood from its external outputs, including for failures nobody anticipated.",
		definition: [
			"Observability is about unknown-unknowns. Monitoring answers questions you thought to ask in advance — is CPU high, is the disk full, is the error rate above 2%. Observability is whether you can answer a question you had never considered until the incident started.",
			"The practical test is whether you can ask a new question of existing telemetry without shipping code. If diagnosing an unusual failure requires adding a metric and waiting for a deploy, the system is monitored but not observable.",
			"That is why high-cardinality, structured, wide events matter more than more dashboards. A log line carrying user ID, region, tenant, version, and request path lets you slice arbitrarily after the fact; a pre-aggregated counter answers only the question it was defined for.",
		],
		category: "Observability",
		relatedTerms: ["golden-signals", "distributed-tracing", "cardinality", "service-level-indicator", "blameless-postmortem"],
		keyFacts: [
			{ label: "Three pillars", value: "Metrics, logs, traces" },
			{ label: "Monitoring answers", value: "Known questions" },
			{ label: "Observability answers", value: "Questions you had not thought to ask" },
			{ label: "Practical test", value: "Can you ask something new without deploying code?" },
		],
	},
	{
		term: "distributed-tracing",
		name: "Distributed Tracing",
		shortDefinition:
			"Following a single request across every service it touches, using a propagated trace ID to assemble the full causal path.",
		definition: [
			"In a microservice system one user request becomes dozens of internal calls, and per-service metrics cannot tell you which of them made the request slow. Distributed tracing assigns each request a trace ID, propagates it through every hop, and reconstructs the whole path as a tree of timed spans.",
			"That tree is what turns \"checkout is slow\" into \"checkout is slow because the inventory service makes 40 sequential calls to pricing.\" It exposes N+1 call patterns, unexpected fan-out, and serial chains that should be parallel — problems that are effectively invisible in aggregate dashboards.",
			"OpenTelemetry is now the standard instrumentation layer, and its auto-instrumentation covers most common frameworks without code changes. The part that always needs attention is context propagation across asynchronous boundaries — message queues and background jobs drop the trace context unless it is passed explicitly.",
		],
		category: "Observability",
		alsoKnownAs: ["Tracing", "APM tracing"],
		relatedTerms: ["observability", "golden-signals", "service-mesh", "cardinality"],
		keyFacts: [
			{ label: "Unit of work", value: "Span — one operation, with start, duration, and attributes" },
			{ label: "Correlated by", value: "A trace ID propagated across every hop" },
			{ label: "Standard", value: "OpenTelemetry (W3C traceparent header)" },
			{ label: "Usual gap", value: "Context lost across queues and async boundaries" },
		],
	},
	{
		term: "cardinality",
		name: "Cardinality",
		shortDefinition:
			"The number of distinct time series a metric produces — the main driver of cost and the usual cause of monitoring outages.",
		definition: [
			"In Prometheus and similar systems, every unique combination of label values creates a separate time series. A metric with 5 endpoints × 4 status codes × 3 regions is 60 series, which is fine. Add a `user_id` label with a million distinct values and it becomes millions, which is not.",
			"This is called a cardinality explosion and it is the most common way to take down a monitoring stack. Memory usage grows with series count, and the failure often lands during an incident — exactly when a new error type introduces new label values and the monitoring system dies just as you need it.",
			"The rule is that labels are for bounded, low-cardinality dimensions: status code, method, region, service. Unbounded identifiers — user IDs, request IDs, full URL paths, error messages — belong in logs or traces, which are designed for high cardinality.",
		],
		category: "Observability",
		alsoKnownAs: ["Metric cardinality", "Cardinality explosion"],
		relatedTerms: ["observability", "golden-signals", "distributed-tracing"],
		keyFacts: [
			{ label: "Cardinality equals", value: "The product of distinct values across all labels" },
			{ label: "Safe labels", value: "Bounded sets — status, method, region, service" },
			{ label: "Dangerous labels", value: "User ID, request ID, raw URL path, error text" },
			{ label: "Symptom", value: "Prometheus OOMing, usually mid-incident" },
		],
		faqs: [
			{
				question: "How do I find high-cardinality metrics in Prometheus?",
				answer:
					"`topk(10, count by (__name__)({__name__=~\".+\"}))` ranks metrics by series count, and the TSDB status page in the Prometheus UI lists the highest-cardinality metrics and labels directly. Check it before an incident forces you to.",
			},
		],
	},
	{
		term: "service-mesh",
		name: "Service Mesh",
		shortDefinition:
			"An infrastructure layer that handles service-to-service communication — mTLS, retries, traffic splitting, telemetry — through sidecar proxies.",
		definition: [
			"A service mesh moves cross-cutting network concerns out of application code and into proxies that sit beside each service. Mutual TLS, retries, timeouts, circuit breaking, traffic splitting, and per-hop telemetry all become configuration rather than library code, and they apply uniformly regardless of what language each service is written in.",
			"That uniformity is the real value in a polyglot estate. Without a mesh, every language needs its own retry library, its own TLS setup, and its own metrics conventions, and they will disagree. With one, the behaviour is identical everywhere and enforced by policy.",
			"The cost is genuine: an extra network hop, a proxy's memory footprint per pod, and a substantial new control plane to operate and debug. For a handful of services it is rarely worth it. Ambient and eBPF-based modes (Istio ambient, Cilium) exist specifically to reduce the per-pod overhead.",
		],
		category: "Networking",
		relatedTerms: ["sidecar-container", "canary-deployment", "distributed-tracing", "zero-trust"],
		keyFacts: [
			{ label: "Data plane", value: "Per-pod proxies — usually Envoy" },
			{ label: "Control plane", value: "Istio, Linkerd, Consul, Cilium" },
			{ label: "Provides", value: "mTLS, retries, timeouts, traffic splitting, telemetry" },
			{ label: "Costs", value: "Extra hop, per-pod memory, control-plane operations" },
		],
		faqs: [
			{
				question: "Do I need a service mesh?",
				answer:
					"Probably not below roughly a dozen services. The mesh earns its operational cost when you need uniform mTLS across a polyglot estate, fine-grained traffic splitting for canaries, or consistent per-hop telemetry you cannot get from libraries. Below that, an ingress controller and a good HTTP client library cover most of it.",
			},
		],
	},
	{
		term: "zero-trust",
		name: "Zero Trust",
		shortDefinition:
			"A security model that authenticates and authorises every request regardless of network location, replacing implicit trust in the internal network.",
		definition: [
			"The traditional perimeter model trusts anything inside the firewall. Zero trust discards that assumption: network position confers no privilege, and every request must present identity and be authorised on its own merits, whether it comes from the public internet or the next rack.",
			"In practice this means workload identity rather than IP allowlists — SPIFFE identities, service accounts, short-lived certificates — plus mutual TLS between services and authorisation policy evaluated per request. The mesh's mTLS and the cloud's IAM roles are both implementations of the same idea.",
			"The operational win beyond security is blast-radius containment. A compromised pod in a flat trusted network can reach everything; in a zero-trust network it can reach only what its identity is explicitly permitted to reach, which turns a breach into an incident rather than a catastrophe.",
		],
		category: "Security",
		alsoKnownAs: ["Zero trust architecture", "ZTA"],
		relatedTerms: ["service-mesh", "devsecops", "least-privilege"],
		keyFacts: [
			{ label: "Core principle", value: "Never trust, always verify — location grants nothing" },
			{ label: "Identity from", value: "Workload identity (SPIFFE), service accounts, short-lived certs" },
			{ label: "Enforced by", value: "mTLS plus per-request authorisation policy" },
			{ label: "Main benefit", value: "Blast-radius containment" },
		],
	},
	{
		term: "least-privilege",
		name: "Principle of Least Privilege",
		shortDefinition:
			"Granting every identity only the permissions its task requires, for only as long as it requires them.",
		definition: [
			"Least privilege is the oldest rule in security and the most routinely broken one, because over-permissioning is always the faster path. `AdministratorAccess` on a CI role makes the pipeline work today and makes a leaked pipeline credential catastrophic tomorrow.",
			"The temporal half is as important as the scope half. A permission that exists permanently is available to any future compromise; one issued for the duration of a task is not. Short-lived credentials — OIDC federation for CI, IAM Roles for Service Accounts in EKS, Vault dynamic secrets — remove the standing credential entirely.",
			"The practical approach is to grant broadly during development, then use access analysers and CloudTrail to find what was actually used, and tighten to that. Starting from a hand-written minimal policy usually produces a long trail of permission errors and an eventual `*` out of frustration.",
		],
		category: "Security",
		alsoKnownAs: ["PoLP", "Least privilege access"],
		relatedTerms: ["zero-trust", "devsecops", "gitops"],
		keyFacts: [
			{ label: "Two dimensions", value: "Minimal scope, minimal duration" },
			{ label: "Kubernetes", value: "RBAC Roles over ClusterRoles; per-namespace service accounts" },
			{ label: "AWS", value: "IRSA, OIDC federation for CI, no long-lived access keys" },
			{ label: "Tightening method", value: "Grant broadly, observe real usage, then restrict" },
		],
	},
	{
		term: "devsecops",
		name: "DevSecOps",
		shortDefinition:
			"Integrating security controls into the delivery pipeline as automated, fast-feedback checks rather than a manual gate before release.",
		definition: [
			"DevSecOps moves security from a review at the end of the process to automated checks throughout it. Dependency scanning, static analysis, secret detection, container image scanning, and IaC policy checks all run in the pipeline, so a developer learns about a vulnerable dependency in the pull request rather than three weeks later in a report.",
			"Feedback speed is what determines whether it works. A scan that runs in the PR and finishes in two minutes gets fixed immediately; one that runs nightly and files a ticket joins a backlog. The same finding, delivered at different points, produces completely different outcomes.",
			"The main failure mode is noise. A scanner reporting 400 findings, most of them unreachable in the actual runtime, gets ignored wholesale — including the three that matter. Tuning for reachability and failing the build only on genuinely exploitable, high-severity issues is what keeps the signal usable.",
		],
		category: "Security",
		alsoKnownAs: ["Shift-left security", "Secure DevOps"],
		relatedTerms: ["least-privilege", "zero-trust", "continuous-integration", "artifact-registry"],
		keyFacts: [
			{ label: "Pipeline checks", value: "SCA, SAST, secret scanning, image scanning, IaC policy" },
			{ label: "Key property", value: "Fast feedback, inside the pull request" },
			{ label: "Main risk", value: "Alert fatigue from unfiltered findings" },
			{ label: "Build should fail on", value: "Exploitable high-severity issues only" },
		],
	},
	{
		term: "cpu-throttling",
		name: "CPU Throttling",
		shortDefinition:
			"The Linux scheduler pausing a container that has spent its CFS quota for the current period, adding latency without any visible error.",
		definition: [
			"When a container has a CPU limit, the kernel enforces it with CFS quota: within each 100 ms period the container may use its quota of CPU time, and once spent, every thread is stopped until the next period begins. Nothing errors and nothing logs — requests just take longer.",
			"That invisibility is what makes it a nasty class of bug. A service can be throttled 30% of the time while CPU utilisation graphs look comfortable, because average utilisation across the period hides the stop-start pattern within it. The symptom presents as unexplained p99 latency.",
			"Multi-threaded runtimes make it worse. A JVM that sees 32 host cores will size its thread pools accordingly, then burn a 2-core quota in the first few milliseconds of each period and spend the rest of it stopped. `container_cpu_cfs_throttled_seconds_total` is the metric to watch, and raising or removing the limit is usually the fix.",
		],
		category: "Kubernetes",
		alsoKnownAs: ["CFS throttling", "Container throttling"],
		relatedTerms: ["resource-requests-and-limits", "horizontal-pod-autoscaler", "quality-of-service-class"],
		keyFacts: [
			{ label: "Enforced by", value: "Linux CFS quota, over a 100 ms period" },
			{ label: "Symptom", value: "p99 latency with no errors and moderate average CPU" },
			{ label: "Metric", value: "container_cpu_cfs_throttled_seconds_total" },
			{ label: "Worst on", value: "Multi-threaded runtimes sized from host core count" },
		],
	},
];
