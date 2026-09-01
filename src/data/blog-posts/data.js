/**
 * Blog posts.
 *
 * `content` is trusted HTML authored here and rendered with dangerouslySetInnerHTML —
 * it never contains user input. `quickAnswer` and `keyTakeaways` sit above the body
 * so answer engines have a self-contained extract to lift.
 *
 * @typedef {Object} BlogPost
 * @property {string}   slug
 * @property {string}   title
 * @property {string}   seoTitle
 * @property {string}   seoDescription
 * @property {string}   excerpt
 * @property {string}   quickAnswer
 * @property {string[]} keyTakeaways
 * @property {string}   content        Trusted HTML.
 * @property {string}   category
 * @property {string[]} tags
 * @property {string[]} keywords
 * @property {string}   date           ISO date published.
 * @property {string}   lastUpdated
 * @property {string}   readTime
 * @property {string}   coverImage
 * @property {{question:string,answer:string}[]} faqs
 * @property {string[]} relatedSlugs
 * @property {string[]} relatedTerms   Glossary slugs.
 * @property {string[]} [relatedGuides]
 */

/** @type {BlogPost[]} */
export const blogPosts = [
	{
		slug: "fix-crashloopbackoff-kubernetes",
		title: "How to Fix CrashLoopBackOff in Kubernetes",
		seoTitle: "How to Fix CrashLoopBackOff in Kubernetes",
		seoDescription:
			"CrashLoopBackOff tells you a container keeps dying, never why. Here are the six real causes, the exit codes that identify each, and how to fix them.",
		excerpt:
			"CrashLoopBackOff is a symptom, not a diagnosis. The status tells you a container keeps restarting; the cause is always somewhere else. Here is the order I work through it.",
		quickAnswer:
			"CrashLoopBackOff means a container started, exited, and was restarted repeatedly, so the kubelet is now backing off between attempts. Diagnose it by reading the previous container's logs with kubectl logs --previous and checking the exit code: 137 means OOMKilled, 1 or 2 means an application startup failure, and 127 means a missing binary.",
		keyTakeaways: [
			"CrashLoopBackOff is the backoff state, not the error — the error is in the previous container's logs.",
			"kubectl logs <pod> --previous is the first command, every time. The current container is usually too young to have logged anything.",
			"Exit code 137 is OOMKilled, 1 or 2 is an application-level failure, 127 is a missing binary, 143 is a clean SIGTERM.",
			"An over-aggressive liveness probe is the most common cause of a crash loop in an application that actually works.",
			"The backoff runs 10s, 20s, 40s… up to a 5-minute ceiling, which is why the pod appears to sit idle.",
		],
		content: `
<h2 id="what-it-means">What CrashLoopBackOff actually means</h2>
<p>CrashLoopBackOff is one of the most misread statuses in Kubernetes, because it looks like an error and is not one. It is the kubelet telling you that it has already tried restarting a container several times, that the container keeps exiting, and that it is now waiting before the next attempt rather than hammering the node.</p>
<p>The backoff is exponential: 10 seconds, then 20, then 40, doubling to a ceiling of 5 minutes. That ceiling is why a pod in this state seems to do nothing for long stretches. It is not stuck. It is waiting.</p>
<p>The important consequence is that the status carries no diagnostic information at all. Every crash loop looks identical from the outside. The cause is always in the container's own logs, and specifically in the logs of the attempt that already failed.</p>

<h2 id="first-two-commands">The first two commands</h2>
<p>These two, in this order, resolve the large majority of cases:</p>
<pre><code>kubectl logs &lt;pod&gt; --previous
kubectl describe pod &lt;pod&gt;</code></pre>
<p>The <code>--previous</code> flag is the part people skip, and it is the part that matters. Without it you get the logs of the container currently starting, which is typically a few hundred milliseconds old and has not reached the failure yet. With it you get the complete output of the attempt that actually died.</p>
<p><code>kubectl describe</code> then gives you the exit code, under <strong>Last State: Terminated</strong>. That number narrows the cause faster than anything else available.</p>

<h2 id="exit-codes">Reading the exit code</h2>
<table>
  <thead><tr><th>Exit code</th><th>Meaning</th><th>Where to look</th></tr></thead>
  <tbody>
    <tr><td>0</td><td>Clean exit — the process finished and had nothing more to do</td><td>Wrong workload type; this should probably be a Job</td></tr>
    <tr><td>1</td><td>Generic application error</td><td>Application logs — config, missing env var, failed dependency</td></tr>
    <tr><td>2</td><td>Shell misuse, or an application convention for bad arguments</td><td>Entrypoint and command arguments</td></tr>
    <tr><td>126</td><td>Command found but not executable</td><td>File permissions in the image</td></tr>
    <tr><td>127</td><td>Command not found</td><td>Entrypoint path, or a binary missing from a slim base image</td></tr>
    <tr><td>137</td><td>SIGKILL — almost always the OOM killer</td><td>Memory limits, or a leak</td></tr>
    <tr><td>143</td><td>SIGTERM — terminated normally</td><td>Usually a liveness probe killing the container</td></tr>
  </tbody>
</table>

<h2 id="the-six-causes">The six causes, in the order I see them</h2>

<h3>1. The application cannot find its configuration</h3>
<p>By far the most common. A ConfigMap key was renamed, a Secret was not created in this namespace, or an environment variable is absent. The application starts, fails to read what it needs, logs one line, and exits 1.</p>
<p>This is worth catching earlier than runtime. An init container that checks for required keys and exits non-zero when they are absent converts a confusing crash loop into an explicit, named failure.</p>

<h3>2. The container was OOMKilled</h3>
<p>Exit code 137 with <code>Reason: OOMKilled</code> in the describe output. The container exceeded its memory limit and the kernel killed it with SIGKILL — no grace period, no shutdown, no final log line.</p>
<p>The trap here is JVM and Node.js workloads whose default heap sizing reads the host's total memory rather than the cgroup limit. A JVM on a 64 GB node with a 512 Mi container limit will happily size its heap for the node and die immediately. Set <code>-XX:MaxRAMPercentage</code> explicitly rather than trusting the default.</p>

<h3>3. An over-aggressive liveness probe</h3>
<p>This one produces the most confusing symptom: the application works, and Kubernetes kills it anyway. If <code>initialDelaySeconds</code> is shorter than real startup time, the liveness probe fails during boot, the kubelet kills the container, and the cycle repeats forever. Exit code 143 with restarts climbing is the signature.</p>
<p>The fix is a <code>startupProbe</code>. It suspends the liveness probe until startup genuinely completes, which lets you keep the liveness check tight afterwards instead of padding <code>initialDelaySeconds</code> with a guess.</p>

<h3>4. A dependency is unreachable at startup</h3>
<p>The application tries to connect to a database or message broker on boot, the connection fails, and it exits rather than retrying. Common with frameworks that treat a failed startup connection as fatal.</p>
<p>Two fixes, and the second is better. The quick one is an init container that waits for the dependency. The durable one is making the application retry with backoff and report unready until the dependency is available — which also means a mid-life database restart no longer takes down every replica.</p>

<h3>5. The image entrypoint is wrong</h3>
<p>Exit code 127 with something like <code>exec: "./server": no such file or directory</code>. Usually a multi-stage build that did not copy the binary to the path the entrypoint expects, or a statically-assumed binary running on a distroless base without the dynamic libraries it needs.</p>

<h3>6. The process is not designed to stay running</h3>
<p>Exit code 0, no error anywhere, restart count climbing. A migration script or batch task deployed as a Deployment does exactly this: it succeeds, exits, and Kubernetes — whose Deployment restart policy is always <code>Always</code> — dutifully restarts it. This should be a Job.</p>

<h2 id="when-there-are-no-logs">When there are no logs at all</h2>
<p>If <code>--previous</code> returns nothing, the container died before writing anything. Two things to try:</p>
<pre><code># Check whether an init container is the one failing
kubectl describe pod &lt;pod&gt; | grep -A5 "Init Containers"

# Bypass the entrypoint entirely and inspect the image
kubectl debug &lt;pod&gt; -it --image=busybox --target=&lt;container&gt;</code></pre>
<p><code>kubectl debug</code> attaches an ephemeral container sharing the target's namespaces, which lets you look at the filesystem and environment of a pod that will not stay up long enough to exec into.</p>

<h2 id="prevention">Preventing the next one</h2>
<p>Most crash loops in production are configuration failures that a check in CI would have caught. Three habits remove most of them:</p>
<ul>
  <li>Validate required configuration at startup and fail with a specific message naming what is missing.</li>
  <li>Set the memory request equal to the memory limit, sized from observed usage rather than estimated.</li>
  <li>Use a <code>startupProbe</code> for anything that takes more than a few seconds to boot, and keep the liveness probe checking only the process itself.</li>
</ul>
<p>None of that is exotic. It is the difference between a deploy that fails visibly in staging and one that fails mysteriously at 3 a.m.</p>
`,
		category: "Kubernetes",
		tags: ["Kubernetes", "Troubleshooting", "Containers"],
		keywords: [
			"crashloopbackoff",
			"fix crashloopbackoff kubernetes",
			"kubernetes pod crashloopbackoff",
			"kubectl logs previous",
			"kubernetes exit code 137",
			"kubernetes exit code 127",
		],
		date: "2026-08-18",
		lastUpdated: "2026-08-18",
		readTime: "9 min",
		coverImage: "/img/hero/ashiwani.png",
		faqs: [
			{
				question: "How do I fix CrashLoopBackOff in Kubernetes?",
				answer:
					"Run kubectl logs <pod> --previous to see why the last attempt died, then kubectl describe pod <pod> to read the exit code. Exit code 137 means the container was OOMKilled and needs a higher memory limit or a leak fixed; 1 or 2 means an application startup failure, usually missing configuration; 127 means the entrypoint binary does not exist in the image.",
			},
			{
				question: "Why does my pod keep restarting even though the application works?",
				answer:
					"Almost always an over-aggressive liveness probe. If initialDelaySeconds is shorter than the application's real startup time, the kubelet kills the container before it finishes booting. Add a startupProbe so the liveness probe only begins once startup has genuinely completed.",
			},
			{
				question: "How long does Kubernetes wait between CrashLoopBackOff restarts?",
				answer:
					"The backoff starts at 10 seconds and doubles — 10, 20, 40, 80 — up to a ceiling of 5 minutes. The timer resets once the container stays running for 10 minutes.",
			},
			{
				question: "What does exit code 137 mean in Kubernetes?",
				answer:
					"137 is 128 plus signal 9, meaning the process received SIGKILL. In a container that is nearly always the kernel's OOM killer acting because the container exceeded its memory limit. Check for Reason: OOMKilled in kubectl describe pod to confirm.",
			},
		],
		relatedSlugs: ["kubernetes-cpu-limits-considered-harmful", "openshift-vs-kubernetes-production"],
		relatedTerms: ["crashloopbackoff", "oomkilled", "liveness-probe", "resource-requests-and-limits", "init-container"],
		relatedGuides: ["kubernetes-production-readiness-checklist"],
	},

	{
		slug: "kubernetes-cpu-limits-considered-harmful",
		title: "Why I Stopped Setting CPU Limits in Kubernetes",
		seoTitle: "Should You Set CPU Limits in Kubernetes?",
		seoDescription:
			"CPU limits throttle containers even when the node is idle, adding invisible tail latency. Here is when to set them, when to drop them, and how to measure it.",
		excerpt:
			"CPU limits look like good hygiene and behave like a latency bug. The reason is CFS quota, and once you have seen a throttling graph next to a p99 graph you cannot unsee it.",
		quickAnswer:
			"CPU limits are enforced by the Linux CFS quota, which stops every thread in the container once its quota for the current 100 ms period is spent — even if the node has idle cores. For latency-sensitive services this adds tail latency with no errors and no obvious cause, so set accurate CPU requests and leave the limit off. Memory limits, which prevent a leak from taking down the node, should always be set.",
		keyTakeaways: [
			"CPU limits are enforced per 100 ms period; spend the quota early and every thread stops until the next period.",
			"Throttling is silent — no errors, no logs, just latency. It shows only in container_cpu_cfs_throttled_seconds_total.",
			"Requests, not limits, are what the scheduler uses for placement and fair sharing. Accurate requests do most of the work.",
			"Multi-threaded runtimes sized from host core count are the worst affected — a 32-core-aware JVM on a 2-core quota stalls constantly.",
			"Keep CPU limits for untrusted or noisy-neighbour workloads. Always keep memory limits.",
		],
		content: `
<h2 id="the-symptom">The symptom that started this</h2>
<p>A service with comfortable CPU graphs — averaging around 40% of its limit — and a p99 latency that would not come down. No errors. No saturation anywhere obvious. Scaling out helped a little, which pointed at load, but the per-pod CPU numbers said there was headroom.</p>
<p>The metric that explained it was <code>container_cpu_cfs_throttled_seconds_total</code>. The container was being throttled roughly 30% of periods, while its average utilisation looked fine.</p>

<h2 id="how-cfs-quota-works">How the limit is actually enforced</h2>
<p>A CPU limit is not a speed governor. The kernel divides time into periods — 100 ms by default — and grants the container a quota of CPU time per period. A limit of <code>500m</code> means 50 ms of CPU time per 100 ms period.</p>
<p>The critical part is what happens when the quota runs out. Every thread in the cgroup is stopped until the next period begins. Not slowed. Stopped. If the container burns its 50 ms in the first 20 ms of the period, it sits frozen for the remaining 80 ms, even if the node has fourteen completely idle cores.</p>
<p>Average utilisation over a minute smooths that stop-start pattern into a comfortable-looking number. That is why the CPU graph lies.</p>

<h2 id="multithreaded">Why multi-threaded runtimes make it worse</h2>
<p>Quota is consumed by the whole cgroup, across all threads. Eight threads running in parallel spend the quota eight times faster than one.</p>
<p>This is the trap for JVM, Go, and Node.js workloads that size their thread pools from the visible core count. A JVM that sees 32 host cores creates thread pools for 32 cores, then hits a 2-core quota in the first few milliseconds of every period and spends the rest of it suspended. The application is not slow because it lacks CPU; it is slow because it was allowed to ask for more parallelism than its quota can sustain.</p>
<p>Modern JVMs are container-aware and read the cgroup limit, which helps — but only if the limit is set, and Go's <code>GOMAXPROCS</code> still defaults to host cores unless something like <code>automaxprocs</code> is in play.</p>

<h2 id="what-requests-do">What requests do that limits do not</h2>
<p>The argument for CPU limits is usually fairness: without one, a busy pod could starve its neighbours. That is what requests already handle.</p>
<p>The CPU request is translated into a CFS <em>share</em> weight. Under contention, the kernel divides CPU time in proportion to those shares — so a pod requesting 1000m gets twice the CPU of one requesting 500m when both want more than is available. When there is no contention, both can use whatever is idle.</p>
<p>That is the behaviour you actually want: guaranteed proportional share under pressure, free use of spare capacity otherwise. A limit throws away the second half for no gain in the first.</p>

<h2 id="when-to-keep-them">When CPU limits are still right</h2>
<p>This is not an argument for removing every limit everywhere.</p>
<ul>
  <li><strong>Untrusted or multi-tenant workloads.</strong> If you cannot reason about what the code does, a hard ceiling is a reasonable guardrail.</li>
  <li><strong>Batch work sharing nodes with latency-sensitive services.</strong> A limit stops a batch job from consuming every idle cycle and inflating a neighbour's tail latency.</li>
  <li><strong>Chargeback models that bill on limits.</strong> An organisational reason, not a technical one, but a real constraint.</li>
  <li><strong>Establishing a known-good baseline.</strong> A generous limit — well above observed peak — bounds the blast radius of a runaway loop without throttling normal operation.</li>
</ul>

<h2 id="memory-is-different">Memory limits are a different question entirely</h2>
<p>None of this transfers to memory. CPU is compressible: exceed the limit and you are throttled, which is bad but survivable. Memory is not: exceed the limit and the container is killed immediately with SIGKILL.</p>
<p>That asymmetry is exactly why memory limits should always be set. A container without one can consume the node's memory and trigger evictions across every other pod on it, turning one leaking application into a node-wide incident. Set the memory request equal to the memory limit and take the Guaranteed QoS class that comes with it.</p>

<h2 id="how-to-check">Checking whether this affects you</h2>
<p>The PromQL for throttled fraction:</p>
<pre><code>sum by (pod) (
  rate(container_cpu_cfs_throttled_periods_total[5m])
)
/
sum by (pod) (
  rate(container_cpu_cfs_periods_total[5m])
)</code></pre>
<p>Anything sustained above roughly 5% is worth investigating on a latency-sensitive service. Above 25% and it is almost certainly your p99 problem.</p>
<p>The change I ended up making was narrow: drop CPU limits on request-serving services, set the CPU request from observed p95 usage, keep memory request equal to memory limit, and keep CPU limits on batch workloads sharing the same nodes. Throttling went to zero on the services that mattered and p99 came down by about a third — not because they got more CPU on average, but because they stopped being suspended mid-request.</p>
`,
		category: "Kubernetes",
		tags: ["Kubernetes", "Performance", "SRE"],
		keywords: [
			"kubernetes cpu limits",
			"cpu throttling kubernetes",
			"should i set cpu limits kubernetes",
			"cfs quota throttling",
			"container_cpu_cfs_throttled_seconds_total",
			"kubernetes resource limits best practices",
		],
		date: "2026-08-04",
		lastUpdated: "2026-08-04",
		readTime: "8 min",
		coverImage: "/img/hero/ashiwani.png",
		faqs: [
			{
				question: "Should I set CPU limits in Kubernetes?",
				answer:
					"For latency-sensitive request-serving workloads, usually not — CFS quota throttling stops the container even when the node has idle cores, adding tail latency for no benefit. Set an accurate CPU request instead, which gives proportional share under contention. Keep CPU limits for untrusted, multi-tenant, or batch workloads.",
			},
			{
				question: "What is CPU throttling in Kubernetes?",
				answer:
					"When a container exhausts its CFS quota for the current 100 ms period, the kernel suspends every thread in it until the next period. Nothing errors and nothing is logged — requests simply take longer, which is why it presents as unexplained p99 latency.",
			},
			{
				question: "Should I remove memory limits too?",
				answer:
					"No. Memory is not compressible: a container without a limit can consume the node's memory and trigger evictions across every pod on it. Set the memory request equal to the memory limit, sized from observed peak usage.",
			},
		],
		relatedSlugs: ["fix-crashloopbackoff-kubernetes", "openshift-vs-kubernetes-production"],
		relatedTerms: ["cpu-throttling", "resource-requests-and-limits", "quality-of-service-class", "oomkilled", "horizontal-pod-autoscaler"],
		relatedGuides: ["kubernetes-production-readiness-checklist"],
	},

	{
		slug: "openshift-vs-kubernetes-production",
		title: "OpenShift vs Kubernetes: What Actually Differs in Production",
		seoTitle: "OpenShift vs Kubernetes: Production Differences",
		seoDescription:
			"OpenShift is Kubernetes plus opinions. The differences that matter operationally: SCCs, Routes vs Ingress, image streams, and the upgrade model.",
		excerpt:
			"Every comparison lists the same feature table. Here is what actually changes day to day when you operate both, and the migration surprises worth knowing in advance.",
		quickAnswer:
			"OpenShift is a Kubernetes distribution with security, build, and lifecycle opinions layered on. The operational differences that matter are Security Context Constraints blocking root containers by default, Routes instead of Ingress, integrated image streams and builds, and an operator-driven upgrade model that manages the whole platform rather than just the control plane.",
		keyTakeaways: [
			"Every OpenShift cluster is a certified Kubernetes cluster; kubectl works unchanged and oc is a superset.",
			"Security Context Constraints are the biggest migration surprise — containers that assume root fail immediately.",
			"Routes predate Ingress and are still the native path; Ingress objects are translated to Routes behind the scenes.",
			"The upgrade model is the strongest operational argument for OpenShift: one command upgrades the whole platform.",
			"Choose plain Kubernetes for flexibility and cost, OpenShift for regulated environments needing secure defaults and vendor support.",
		],
		content: `
<h2 id="the-honest-summary">The honest summary</h2>
<p>OpenShift is Kubernetes. Not Kubernetes-like, not Kubernetes-compatible — it is a CNCF-certified distribution, and your manifests, your <code>kubectl</code>, and your operators all work. What Red Hat adds is a set of opinions about security, builds, networking, and lifecycle, plus the integration work to make them behave as one product.</p>
<p>Whether those opinions are worth the licence cost depends almost entirely on your environment. In the regulated infrastructure I work on, secure-by-default and a supportable upgrade path carry real weight. For a startup on EKS, the same opinions read mostly as friction.</p>

<h2 id="sccs">Security Context Constraints: the migration wall</h2>
<p>This is where most migrations stall, and it is worth understanding before you start rather than during.</p>
<p>Plain Kubernetes runs containers as whatever user the image specifies, which for a large fraction of public images is root. OpenShift refuses. The default <code>restricted-v2</code> SCC assigns each namespace a randomised high-numbered UID and runs containers as that, dropping most capabilities along the way.</p>
<p>The result is that a Docker Hub image which runs fine anywhere else fails immediately on OpenShift, usually with a permission error writing to a directory it created at build time as root. That is not a bug — it is the platform enforcing something the rest of us are supposed to be doing voluntarily.</p>
<p>The correct fix is to make the image work with an arbitrary UID: give group 0 write access to the directories the application needs and do not hardcode a user. The tempting fix is to grant the <code>anyuid</code> SCC, which works instantly and discards the entire benefit. I have seen more clusters weakened by blanket <code>anyuid</code> grants than by any actual attack.</p>

<h2 id="routes">Routes and Ingress</h2>
<p>OpenShift shipped Routes before Kubernetes had Ingress, and they remain the native object. A Route handles TLS termination modes — edge, passthrough, and re-encrypt — as first-class fields, and re-encrypt in particular is more awkward to express through Ingress annotations.</p>
<p>Ingress objects still work; OpenShift's ingress operator translates them into Routes automatically. In practice that means portable manifests can use Ingress, while anything needing OpenShift-specific TLS behaviour uses a Route directly. Gateway API is gradually making this distinction less important on both sides.</p>

<h2 id="builds">Image streams and builds</h2>
<p>OpenShift includes a build system. BuildConfigs can compile source into images inside the cluster — Source-to-Image detects the language, injects the code into a builder image, and produces a runnable artifact without a Dockerfile.</p>
<p>Image streams sit alongside it as an indirection layer over registry tags, letting you trigger a redeploy when a tag moves without the Deployment referencing the registry directly.</p>
<p>Both were genuinely useful in 2016. Today most teams already have a CI system producing images, and building in-cluster mostly means your platform and your pipeline are now two places where builds can break. I use external CI and treat OpenShift as a runtime, and I would suggest most teams do the same.</p>

<h2 id="upgrades">The upgrade model — the strongest argument</h2>
<p>This is the difference that has saved me the most time, and it is the one comparison tables underweight.</p>
<p>Upgrading a self-managed Kubernetes cluster means sequencing the control plane, the kubelets, the CNI, the CSI drivers, the ingress controller, the metrics stack, and every operator — each with its own version matrix and its own compatibility notes. It is a project.</p>
<p>OpenShift treats the platform as one versioned unit. The Cluster Version Operator upgrades the control plane, the nodes, and every core component in a coordinated sequence, with the compatibility work already done by Red Hat. It is one command and a wait, and it either succeeds or it rolls back.</p>
<p>Managed Kubernetes services close much of this gap for the control plane, but they do not manage your ingress controller, your service mesh, or your monitoring stack. OpenShift does.</p>

<h2 id="operational-differences">Smaller differences worth knowing</h2>
<ul>
  <li><strong>Projects, not namespaces.</strong> A Project is a namespace plus annotations and default role bindings. <code>oc new-project</code> does what creating a namespace plus three RBAC objects would.</li>
  <li><strong>Monitoring is included and opinionated.</strong> Prometheus, Alertmanager, and Grafana ship as managed components. Convenient, but customising them means working within the operator's supported surface.</li>
  <li><strong>OVN-Kubernetes is the default CNI.</strong> Reasonable, but not everyone's preference, and swapping it is not the casual choice it is elsewhere.</li>
  <li><strong>Node access is deliberately restricted.</strong> RHCOS nodes are managed by the Machine Config Operator, and manual changes get reverted — immutable infrastructure enforced by the platform.</li>
</ul>

<h2 id="choosing">How I would choose</h2>
<p>Take OpenShift when you are in a regulated or air-gapped environment, when secure defaults you cannot casually disable are a feature rather than an obstacle, when you need a single vendor to call at 2 a.m., or when platform upgrades are consuming engineering time you would rather spend elsewhere.</p>
<p>Take plain Kubernetes — managed, ideally — when you want to choose your own ingress, mesh, and observability stack, when licence cost matters, when your team already has the operational depth to sequence upgrades, or when your workloads genuinely need capabilities that SCCs would fight.</p>
<p>What I would not do is choose based on the feature table. Almost everything in OpenShift's column is installable on plain Kubernetes. What you are actually buying is the integration and the support contract, and those are worth exactly as much as your environment says they are.</p>
`,
		category: "Platform Engineering",
		tags: ["OpenShift", "Kubernetes", "Platform"],
		keywords: [
			"openshift vs kubernetes",
			"openshift kubernetes difference",
			"security context constraints openshift",
			"openshift routes vs ingress",
			"openshift migration",
		],
		date: "2026-07-21",
		lastUpdated: "2026-07-21",
		readTime: "10 min",
		coverImage: "/img/hero/ashiwani.png",
		faqs: [
			{
				question: "Is OpenShift the same as Kubernetes?",
				answer:
					"OpenShift is a CNCF-certified Kubernetes distribution, so the Kubernetes API, kubectl, and standard manifests all work. Red Hat adds security defaults (Security Context Constraints), Routes, an integrated build system, a managed monitoring stack, and an operator-driven platform upgrade model on top.",
			},
			{
				question: "Why do my containers fail on OpenShift but work on Kubernetes?",
				answer:
					"Almost always Security Context Constraints. OpenShift's default restricted-v2 SCC runs containers as a random high-numbered UID rather than root, so images that write to directories owned by root at build time fail on permissions. Fix the image by giving group 0 write access to those paths rather than granting the anyuid SCC.",
			},
			{
				question: "Should I use Routes or Ingress on OpenShift?",
				answer:
					"Use Ingress for portable manifests — OpenShift translates them into Routes automatically. Use a Route directly when you need OpenShift-specific TLS behaviour, particularly re-encrypt termination, which is awkward to express through Ingress annotations.",
			},
		],
		relatedSlugs: ["fix-crashloopbackoff-kubernetes", "kubernetes-cpu-limits-considered-harmful"],
		relatedTerms: ["least-privilege", "immutable-infrastructure", "rolling-update", "zero-trust", "devsecops"],
		relatedGuides: ["kubernetes-production-readiness-checklist"],
	},

	{
		slug: "terraform-vs-ansible",
		title: "Terraform vs Ansible: They Solve Different Problems",
		seoTitle: "Terraform vs Ansible: Which Should You Use?",
		seoDescription:
			"Terraform provisions infrastructure declaratively; Ansible configures and orchestrates. Where each one wins, where each breaks, and how to run both together.",
		excerpt:
			"The comparison is usually framed as a choice. In every environment I have run, the answer was both — with a clear line between them.",
		quickAnswer:
			"Terraform is a declarative provisioning tool that maintains state and computes a diff between desired and actual infrastructure, so it can create, modify, and destroy cloud resources. Ansible is an agentless configuration and orchestration tool that runs tasks against existing hosts without tracking state. Use Terraform to create infrastructure and Ansible to configure and operate what runs on it.",
		keyTakeaways: [
			"Terraform tracks state, so it knows what to destroy. Ansible does not, so it cannot clean up what it no longer manages.",
			"Ansible's ordered task execution makes it far better at multi-step orchestration like rolling restarts.",
			"Using Ansible to provision cloud resources works but gives up drift detection and deletion.",
			"Using Terraform for configuration via remote-exec is fragile and breaks the declarative model.",
			"The standard split: Terraform creates the infrastructure, Ansible configures it, and immutable images shrink Ansible's role over time.",
		],
		content: `
<h2 id="the-real-distinction">The distinction that matters</h2>
<p>Both tools are described as "infrastructure as code", which obscures the difference. The useful distinction is state.</p>
<p>Terraform maintains a state file mapping resources in your configuration to real infrastructure IDs. Because it knows what it created, it can compute a three-way diff between your code, its state, and reality — and act on all three outcomes: create what is missing, modify what has changed, and <em>destroy what you removed from the code</em>.</p>
<p>Ansible has no state. It connects to hosts and executes tasks, each of which should be idempotent, and then it forgets. Delete a task from a playbook and nothing happens on the next run; whatever it created stays exactly where it is.</p>
<p>That single property drives almost every practical difference between them.</p>

<h2 id="where-terraform-wins">Where Terraform wins</h2>
<p><strong>Provisioning cloud infrastructure.</strong> VPCs, subnets, load balancers, managed databases, IAM roles, Kubernetes clusters. The state file means Terraform can tell you, before you apply, exactly what will change — and <code>terraform plan</code> in a pull request is one of the highest-value review artifacts in infrastructure work.</p>
<p><strong>Teardown.</strong> <code>terraform destroy</code> removes everything a configuration created, in dependency order. Doing that with Ansible means writing the deletion tasks by hand and remembering everything you ever created.</p>
<p><strong>Dependency resolution.</strong> Terraform builds a dependency graph from resource references and parallelises everything independent. You do not order the operations; you describe the relationships.</p>
<p><strong>Drift detection.</strong> A scheduled <code>plan</code> that reports a non-empty diff tells you someone changed something in the console. Ansible has no equivalent, because it has no record of what it intended.</p>

<h2 id="where-ansible-wins">Where Ansible wins</h2>
<p><strong>Configuring what is already running.</strong> Installing packages, templating config files, managing services, applying kernel parameters, rotating credentials. Terraform can do this through provisioners, but they run only at creation time and break the declarative model in ways that are hard to reason about.</p>
<p><strong>Orchestration with ordering.</strong> This is Ansible's genuine advantage and it is underrated. A rolling restart across a cluster — take one node out of the load balancer, drain it, restart, health-check, put it back, then move to the next — is a sequence with conditionals and checks. Ansible expresses that naturally with <code>serial</code> and <code>max_fail_percentage</code>. Terraform has no vocabulary for it at all.</p>
<p><strong>Ad-hoc operations.</strong> Checking a setting across 400 hosts, or applying an emergency patch fleet-wide, is one <code>ansible</code> command. Nothing in the Terraform model corresponds.</p>
<p><strong>Anything not cloud-shaped.</strong> Network appliances, bare-metal servers, legacy systems with an SSH port and nothing else. Ansible's agentless SSH model reaches things that have no API to speak of.</p>

<h2 id="using-both">Running both together</h2>
<p>The split I use on every environment:</p>
<ol>
  <li><strong>Terraform provisions.</strong> Networks, security groups, instances, managed services, cluster control planes. It outputs the inventory — instance IPs, tags, roles.</li>
  <li><strong>Ansible configures.</strong> Dynamic inventory reads directly from the cloud provider, so hosts Terraform created appear automatically without anyone maintaining a hosts file.</li>
  <li><strong>Ansible operates.</strong> Rolling restarts, patch cycles, credential rotation, incident response — the ongoing work that is a sequence rather than a state.</li>
</ol>
<p>The one anti-pattern worth naming: calling Ansible from a Terraform <code>local-exec</code> provisioner. It runs only on resource creation, gives you no feedback if it fails halfway, and makes the Terraform apply non-idempotent. Run them as separate pipeline stages, with Terraform's outputs feeding Ansible's inventory.</p>

<h2 id="what-changed">What immutable infrastructure changed</h2>
<p>Ansible's original job was configuring long-lived servers, and containers took most of that work away. If a server is replaced rather than patched, there is less to configure at runtime — the configuration is baked into the image.</p>
<p>That has not removed Ansible so much as moved it. It now shows up in three places on my systems: building golden images (often invoked from Packer), configuring the things that genuinely cannot be immutable — network gear, bare metal, hypervisors — and orchestrating operational sequences that no declarative tool models well.</p>
<p>Terraform's footprint went the other way, expanding from cloud resources into Kubernetes objects, DNS, SaaS configuration, and identity providers. The declarative-with-state model turned out to fit far more than the servers it was built for.</p>

<h2 id="if-you-only-learn-one">If you are only going to learn one</h2>
<p>Terraform, for most people, most of the time. Infrastructure gets created before it gets configured, the state model teaches a way of thinking that transfers to Kubernetes and GitOps, and the ecosystem now covers far more surface than cloud compute.</p>
<p>Learn Ansible second — it takes days rather than weeks, and the day you need to safely restart 40 services in a specific order across a cluster, nothing else will do the job.</p>
`,
		category: "Infrastructure as Code",
		tags: ["Terraform", "Ansible", "IaC"],
		keywords: [
			"terraform vs ansible",
			"ansible vs terraform difference",
			"terraform ansible together",
			"configuration management vs provisioning",
			"infrastructure as code tools",
		],
		date: "2026-07-07",
		lastUpdated: "2026-07-07",
		readTime: "9 min",
		coverImage: "/img/hero/ashiwani.png",
		faqs: [
			{
				question: "What is the difference between Terraform and Ansible?",
				answer:
					"Terraform is declarative and stateful: it tracks what it created, computes a diff against your configuration, and can create, modify, or destroy resources accordingly. Ansible is procedural and stateless: it runs ordered, idempotent tasks against existing hosts and keeps no record afterwards, so it cannot detect drift or clean up what it no longer manages.",
			},
			{
				question: "Can Ansible replace Terraform?",
				answer:
					"It can provision cloud resources through its cloud modules, but without state it cannot detect drift, cannot destroy what you removed from the playbook, and cannot show you a plan before applying. For anything beyond a handful of resources those absences matter more than the convenience of using one tool.",
			},
			{
				question: "Should I run Ansible from a Terraform provisioner?",
				answer:
					"No. local-exec and remote-exec provisioners run only at resource creation, offer no useful failure handling, and make the apply non-idempotent. Run them as separate pipeline stages, with Terraform outputs feeding an Ansible dynamic inventory.",
			},
		],
		relatedSlugs: ["openshift-vs-kubernetes-production", "linux-server-hardening-that-survives-audit"],
		relatedTerms: ["infrastructure-as-code", "terraform-state", "idempotency", "configuration-drift", "immutable-infrastructure"],
		relatedGuides: ["terraform-remote-state-s3-setup"],
	},

	{
		slug: "linux-server-hardening-that-survives-audit",
		title: "Linux Server Hardening That Survives an Audit",
		seoTitle: "Linux Server Hardening Checklist for Production",
		seoDescription:
			"A practical Linux hardening checklist: SSH, kernel parameters, auditd, filesystem mounts, and the controls auditors actually ask you to evidence.",
		excerpt:
			"Most hardening guides are a list of settings. Auditors ask a different question — can you prove this was true last Tuesday? Here is what I apply, and what I keep evidence for.",
		quickAnswer:
			"Practical Linux hardening starts with SSH key-only authentication and no root login, a default-deny firewall, automatic security updates, auditd rules covering privileged commands and credential file access, and separate mounts for /tmp and /var with noexec and nosuid. What turns hardening into audit evidence is applying it through configuration management and shipping logs off the host.",
		keyTakeaways: [
			"Disable password and root SSH login first — it removes the most-attacked path on any internet-facing host.",
			"noexec and nosuid on /tmp, /var/tmp, and /dev/shm block the most common privilege-escalation staging ground.",
			"auditd rules are what let you answer 'who ran that, and when' months later.",
			"Apply everything through Ansible or an image build, never by hand — evidence needs to be reproducible.",
			"Ship logs off the host immediately; local logs are worthless once a host is compromised.",
		],
		content: `
<h2 id="the-audit-question">The question auditors actually ask</h2>
<p>Hardening guides list settings. Audits ask something harder: <em>how do you know this was true on every host, last month?</em></p>
<p>That reframing changes what matters. A hand-applied setting that is correct today is worth much less than a slightly weaker one applied by configuration management, verified on a schedule, and logged off-host. Reproducibility is the control; the setting is just the content.</p>
<p>So everything below assumes it is applied through Ansible or baked into an image, never typed into a shell on a live host.</p>

<h2 id="ssh">SSH: the first and largest win</h2>
<p>Every internet-reachable host is being probed for SSH credentials continuously. Three settings remove essentially all of that risk:</p>
<pre><code># /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes

AllowGroups ssh-users
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2</code></pre>
<p><code>AllowGroups</code> is the one most often skipped and it is worth having: access becomes group membership rather than the existence of an account, so revoking someone is a single group change rather than an audit of every host.</p>
<p>Restrict the algorithms too. Defaults keep older ciphers for compatibility with clients you almost certainly do not have:</p>
<pre><code>KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com</code></pre>
<p>Always validate before reloading. <code>sshd -t</code> catches a syntax error while you still have a working session; without it, a typo locks you out of a remote host permanently.</p>

<h2 id="mounts">Filesystem mounts</h2>
<p>Separate mounts for the world-writable directories, with execution disabled, remove the standard staging ground for a downloaded payload:</p>
<pre><code># /etc/fstab
/dev/mapper/vg-tmp  /tmp      ext4  defaults,nodev,nosuid,noexec  0 2
/dev/mapper/vg-var  /var      ext4  defaults,nodev               0 2
tmpfs               /dev/shm  tmpfs defaults,nodev,nosuid,noexec  0 0</code></pre>
<p>Bind-mount <code>/var/tmp</code> to <code>/tmp</code> so it inherits the same options. Test <code>noexec</code> on <code>/tmp</code> in staging first — a small number of installers legitimately extract and execute there, and you would rather find that out before a production change window.</p>

<h2 id="kernel">Kernel parameters</h2>
<p>The sysctl settings worth applying, and the reason for each:</p>
<pre><code># /etc/sysctl.d/99-hardening.conf
kernel.kptr_restrict = 2              # hide kernel pointers from unprivileged users
kernel.dmesg_restrict = 1             # non-root cannot read the kernel ring buffer
kernel.yama.ptrace_scope = 1          # restrict process tracing to direct children
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
fs.suid_dumpable = 0                  # no core dumps from setuid binaries

net.ipv4.conf.all.rp_filter = 1       # reverse-path filtering
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.tcp_syncookies = 1</code></pre>
<p>Note that <code>ptrace_scope = 1</code> will break debuggers attaching to unrelated processes. That is the intent, but it surprises developers, so it belongs in the change notes.</p>

<h2 id="auditd">auditd: the part that produces evidence</h2>
<p>This is what separates a hardened host from an auditable one. Without auditd you cannot answer who ran a privileged command three months ago.</p>
<pre><code># /etc/audit/rules.d/hardening.rules
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k privilege
-w /etc/sudoers.d/ -p wa -k privilege
-w /etc/ssh/sshd_config -p wa -k sshd

-a always,exit -F arch=b64 -S execve -F euid=0 -F auid&gt;=1000 -F auid!=-1 -k rootcmd
-a always,exit -F arch=b64 -S mount -k mounts

-e 2</code></pre>
<p>The <code>rootcmd</code> rule captures every command executed as root by a user who logged in as themselves — which is precisely the "who did what" trail an incident review needs. <code>-e 2</code> makes the ruleset immutable until reboot, so an attacker who gains root cannot quietly disable auditing.</p>
<p>Watch the volume. The execve rule is high-cardinality on busy hosts, so size the audit partition deliberately and ship the records off-host promptly.</p>

<h2 id="updates">Automatic security updates</h2>
<p>Unattended security patching is one of the highest-value controls available and one of the most frequently deferred. On Debian and Ubuntu:</p>
<pre><code>apt-get install -y unattended-upgrades
# /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
};
Unattended-Upgrade::Automatic-Reboot "false";</code></pre>
<p>Keep automatic reboot off and handle restarts through your own orchestration, so they happen in a controlled order with health checks between hosts rather than simultaneously across the fleet at 6 a.m.</p>

<h2 id="logging">Ship logs off the host immediately</h2>
<p>Local logs describe what happened up until the moment someone with root decided they should not. Forward to a collector the host cannot write back to:</p>
<pre><code># /etc/rsyslog.d/10-forward.conf
*.* action(type="omfwd" target="logs.internal" port="6514"
           protocol="tcp" StreamDriverMode="1"
           queue.type="LinkedList" queue.filename="fwdq"
           action.resumeRetryCount="-1" queue.saveOnShutdown="on")</code></pre>
<p>The disk-assisted queue matters more than it looks. Without it, a collector outage silently drops the records covering exactly the period you will later want to examine.</p>

<h2 id="verify">Verify continuously, not once</h2>
<p>Configuration drifts. Someone re-enables password authentication during an incident and forgets to revert it; a new host is built from a stale image. A weekly scheduled scan turns hardening from a one-time project into a control:</p>
<pre><code>oscap xccdf eval --profile cis_server_l1 \\
  --results /var/log/oscap-\$(date +%F).xml \\
  /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml</code></pre>
<p>Alert on the delta rather than the absolute score. A host that was compliant last week and is not now is far more interesting than one that has always sat at 94%.</p>

<h2 id="what-i-skip">What I deliberately skip</h2>
<p>Not every item in a benchmark earns its cost. I do not disable USB storage on cloud instances that have no USB. I do not enforce password complexity on hosts where password authentication is disabled entirely. I do not apply <code>noexec</code> to <code>/var</code> without testing, because package managers legitimately execute from there.</p>
<p>Applying controls that do not apply produces a long list of exceptions, and a long exception list is how genuine gaps get lost. Fewer controls, applied consistently and evidenced properly, survive an audit better than a full benchmark half-applied.</p>
`,
		category: "Security",
		tags: ["Linux", "Security", "DevSecOps"],
		keywords: [
			"linux server hardening",
			"linux hardening checklist",
			"ssh hardening",
			"auditd rules",
			"cis benchmark linux",
			"linux security production",
		],
		date: "2026-06-16",
		lastUpdated: "2026-06-16",
		readTime: "11 min",
		coverImage: "/img/hero/ashiwani.png",
		faqs: [
			{
				question: "What is the most important Linux hardening step?",
				answer:
					"Disabling SSH password authentication and root login. Internet-facing hosts are probed for SSH credentials continuously, and key-only authentication removes that entire attack path in a single configuration change.",
			},
			{
				question: "Should I apply the full CIS benchmark?",
				answer:
					"Rarely as-is. Many controls do not apply to cloud instances or containerised workloads, and applying them anyway produces a long exception list that hides real gaps. Select the controls relevant to your platform, apply them through configuration management, and evidence them properly.",
			},
			{
				question: "Why does auditd matter for compliance?",
				answer:
					"It produces the trail that answers 'who ran this privileged command, and when' months after the fact. Rules watching credential files, sudoers, and root-executed commands are what let you reconstruct events during an incident review or an audit.",
			},
		],
		relatedSlugs: ["terraform-vs-ansible", "openshift-vs-kubernetes-production"],
		relatedTerms: ["devsecops", "least-privilege", "zero-trust", "immutable-infrastructure", "configuration-drift"],
	},

	{
		slug: "error-budgets-that-teams-actually-use",
		title: "Error Budgets That Teams Actually Use",
		seoTitle: "Error Budgets: Making SLOs Work in Practice",
		seoDescription:
			"Most error budget policies are ignored within a quarter. What makes them stick: honest SLOs, burn-rate alerting, and a freeze rule agreed in advance.",
		excerpt:
			"Every team I have introduced error budgets to has agreed they are a good idea, and about half have quietly stopped using them within a quarter. The difference is not enthusiasm.",
		quickAnswer:
			"An error budget is the unreliability an SLO permits — 100% minus the target — treated as a resource to spend on shipping. It works when the SLO reflects what users actually notice, when burn-rate alerting catches problems early, and when the freeze rule is agreed in advance and applied without negotiation. Budgets fail when the SLO is aspirational or the freeze is waived under deadline pressure.",
		keyTakeaways: [
			"Set the first SLO from a month of measured data, slightly below observed performance — never from an aspiration.",
			"A budget with no agreed consequence is a dashboard, not a policy.",
			"Burn-rate alerting replaces static thresholds and catches sustained problems without paging on blips.",
			"The freeze rule must be agreed before it is needed; negotiating it during a deadline guarantees it never applies.",
			"Measure the SLI as close to the user as possible — server-side metrics miss requests that never arrived.",
		],
		content: `
<h2 id="why-they-fail">Why error budget policies get abandoned</h2>
<p>The idea is unarguable. Reliability has a target, the gap between the target and perfection is a budget, and you spend that budget on shipping changes. When it runs out, you stop shipping and fix things.</p>
<p>Almost everyone agrees with that in the meeting. What kills it afterwards is one of three things: the SLO was set aspirationally so the budget was exhausted permanently, nobody agreed what exhaustion actually triggers, or the freeze was waived the first time it collided with a launch date — which taught the whole team the number was decorative.</p>
<p>All three are avoidable, and none of them are technical.</p>

<h2 id="setting-the-slo">Set the first SLO from data, not ambition</h2>
<p>The most common failure is starting at 99.99% because it sounds appropriately serious. If the service currently delivers 99.5%, the budget is exhausted on day one and every subsequent day, and the policy becomes noise before anyone has used it.</p>
<p>Measure for a month first. Then set the objective slightly <em>below</em> observed performance. If you are running 99.7%, set 99.5%. That gives real budget to work with, and it makes the first exhaustion event meaningful — it will mean something genuinely got worse, not that the target was always out of reach.</p>
<p>Tighten later, and only when you have evidence users care about the difference. Every additional nine costs roughly an order of magnitude more engineering effort, and beyond a point users cannot distinguish your reliability from their own network's.</p>

<h2 id="measure-at-the-edge">Measure where the user is</h2>
<p>An SLI measured inside the application misses everything that never reached it. A pod that is <code>CrashLoopBackOff</code> serves no requests and therefore records no errors — the application-side error rate looks perfect throughout the outage.</p>
<p>Measure at the load balancer, the ingress, or the CDN. Better still, supplement with client-side reporting, which is the only place you see DNS failures, TLS handshake problems, and timeouts on the user's own network. The gap between what the server thinks it served and what the client actually received is often larger than the entire error budget.</p>

<h2 id="burn-rate">Burn rate is what makes the budget operational</h2>
<p>A budget-remaining dashboard tells you where you stand. It does not tell you to do anything, which is why teams stop looking at it.</p>
<p>Burn rate does. It expresses how fast you are consuming the budget relative to how fast the window replenishes it. A burn rate of 1 exhausts the budget exactly at the end of the window; 14.4 exhausts a 30-day budget in about two days.</p>
<p>That gives you two alerts instead of a chart:</p>
<ul>
  <li><strong>Fast burn</strong> — burn rate above 14.4, confirmed over both a 1-hour and a 5-minute window. This pages. It means a real incident is consuming the month's budget in days.</li>
  <li><strong>Slow burn</strong> — burn rate above 6, confirmed over 6-hour and 30-minute windows. This files a ticket. Too slow to wake anyone, too fast to ignore.</li>
</ul>
<p>The two-window requirement is what makes these usable. The long window establishes that the problem is sustained; the short one confirms it is still happening right now. Either alone produces alerts nobody trusts.</p>

<h2 id="the-freeze">The freeze rule, written down in advance</h2>
<p>This is the part that determines whether any of the rest matters. Write it before the first exhaustion, when nothing is at stake:</p>
<blockquote>
<p>When the 30-day error budget is exhausted, feature deployments pause. Bug fixes, reliability work, and security patches continue. The pause lifts when the rolling window brings the budget above 20% remaining. Exceptions require sign-off from the service owner and the engineering lead, and are recorded with a reason.</p>
</blockquote>
<p>Note that exceptions exist. A policy with no escape valve gets bypassed silently the first time it is genuinely inconvenient, which is worse than one that is bypassed openly and recorded. What you want is friction and a paper trail, not an absolute rule that quietly stops applying.</p>

<h2 id="what-changes">What actually changes when it works</h2>
<p>The clearest signal that a budget policy has taken hold is that the arguments change shape. "Is it safe to deploy on Friday?" stops being a matter of temperament and becomes a question with an answer: there is 60% of the budget left, so yes.</p>
<p>Two other things follow. Reliability work gets prioritised without anyone having to campaign for it, because budget exhaustion schedules it automatically. And risky-but-valuable changes — a migration, a rewrite, a dependency upgrade — become easier to justify when there is visible budget to spend, rather than being deferred indefinitely on vague caution.</p>

<h2 id="starting">A realistic starting point</h2>
<p>One service. The most important one, ideally the one people already argue about.</p>
<p>Measure availability at the ingress for a month. Set the SLO just below what you observed. Add the two burn-rate alerts and delete the static error-rate alerts they replace. Write the freeze rule and get it agreed by whoever would have to enforce it.</p>
<p>Then leave it alone for a quarter before expanding. A single SLO that the team genuinely acts on is worth more than a dashboard covering forty services that nobody reads.</p>
`,
		category: "SRE",
		tags: ["SRE", "Reliability", "Observability"],
		keywords: [
			"error budget",
			"error budget policy",
			"slo error budget",
			"burn rate alerting",
			"sre error budget explained",
			"how to set slo",
		],
		date: "2026-05-26",
		lastUpdated: "2026-05-26",
		readTime: "8 min",
		coverImage: "/img/hero/ashiwani.png",
		faqs: [
			{
				question: "What is an error budget?",
				answer:
					"The amount of unreliability an SLO permits, calculated as 100% minus the objective. A 99.9% SLO over 30 days gives roughly 43 minutes of budget. Treating it as a resource to spend — on releases, migrations, and deliberate risk — is what turns an SLO from a report into a decision-making tool.",
			},
			{
				question: "What happens when the error budget runs out?",
				answer:
					"Feature deployments pause while reliability work continues, until the rolling window replenishes the budget. The rule must be agreed in advance and applied consistently; a freeze that gets waived under deadline pressure teaches everyone the budget is decorative.",
			},
			{
				question: "What burn rate should trigger a page?",
				answer:
					"14.4 is the standard fast-burn threshold — it exhausts a 30-day budget in about two days. Confirm it over both a 1-hour and a 5-minute window so a single bad scrape does not page anyone. A burn rate of 6, over 6-hour and 30-minute windows, is the usual slow-burn threshold and should open a ticket rather than page.",
			},
		],
		relatedSlugs: ["kubernetes-cpu-limits-considered-harmful", "fix-crashloopbackoff-kubernetes"],
		relatedTerms: ["error-budget", "service-level-objective", "service-level-indicator", "service-level-agreement", "golden-signals", "toil"],
		relatedGuides: ["prometheus-slo-alerting-setup"],
	},
];
