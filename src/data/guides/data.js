/**
 * Step-by-step operational guides.
 *
 * Each becomes a page at /guides/<slug> and emits HowTo schema, so `steps` must
 * carry a real title and a self-contained description — Google renders those
 * directly in the SERP.
 *
 * @typedef {Object} Guide
 * @property {string}   slug
 * @property {string}   title
 * @property {string}   seoTitle
 * @property {string}   seoDescription
 * @property {string[]} keywords
 * @property {string}   shortDescription  Card blurb on the index page.
 * @property {string}   quickAnswer       40–60 words, self-contained, for AEO.
 * @property {"beginner"|"intermediate"|"advanced"} difficulty
 * @property {string}   estimatedReadTime
 * @property {string}   totalTime         ISO 8601 duration, for HowTo schema.
 * @property {string}   lastUpdated
 * @property {string[]} prerequisites
 * @property {{value:string,label:string}[]} heroStats
 * @property {{step:number,title:string,description:string,code?:string,tips?:string[],warnings?:string[]}[]} steps
 * @property {{name:string,description:string}[]} tools
 * @property {{mistake:string,consequence:string,solution:string}[]} commonMistakes
 * @property {{question:string,answer:string}[]} faqs
 * @property {string[]} relatedGuides
 * @property {string[]} relatedTerms  Glossary slugs to link out to.
 */

/** @type {Guide[]} */
export const guides = [
	{
		slug: "kubernetes-production-readiness-checklist",
		title: "Kubernetes Production Readiness Checklist",
		seoTitle: "Kubernetes Production Readiness Checklist | 12 Steps",
		seoDescription:
			"A 12-point checklist for taking a Kubernetes workload to production: probes, resource limits, PDBs, graceful shutdown, RBAC, and rollout safety.",
		keywords: [
			"kubernetes production readiness",
			"kubernetes production checklist",
			"kubernetes best practices production",
			"production ready kubernetes deployment",
			"kubernetes deployment checklist",
		],
		shortDescription:
			"The 12 things that separate a Deployment that survives a node drain from one that pages you at 3 a.m.",
		quickAnswer:
			"A Kubernetes workload is production-ready when it sets resource requests and limits, defines readiness and startup probes, handles SIGTERM gracefully, declares a PodDisruptionBudget, spreads replicas across zones, runs as non-root with a read-only filesystem, and has a rehearsed rollback path.",
		difficulty: "intermediate",
		estimatedReadTime: "12 min",
		totalTime: "PT3H",
		lastUpdated: "2026-08-20",
		prerequisites: [
			"A running Kubernetes cluster (1.29 or later)",
			"kubectl configured against the target namespace",
			"An application already packaged as a container image",
		],
		heroStats: [
			{ value: "12", label: "Checks" },
			{ value: "1.29+", label: "Kubernetes" },
			{ value: "~3h", label: "To apply" },
		],
		steps: [
			{
				step: 1,
				title: "Set memory requests equal to memory limits",
				description:
					"Set the memory request and limit to the same measured value so the pod gets Guaranteed QoS and is evicted last under node pressure. Take the value from observed peak usage plus roughly 25% headroom, not from a guess.",
				code: "resources:\n  requests:\n    memory: 512Mi\n    cpu: 250m\n  limits:\n    memory: 512Mi",
				tips: [
					"Leave the CPU limit unset for latency-sensitive services — CFS throttling adds tail latency even when the node has idle cores.",
					"Run the Vertical Pod Autoscaler in Off mode for a week first; its recommendations are far better than an estimate.",
				],
			},
			{
				step: 2,
				title: "Add a readiness probe that reflects real serving capability",
				description:
					"Without a readiness probe Kubernetes considers a pod ready the moment its process starts, so a rolling update can replace every healthy replica with broken ones. The probe should return success only when the application can genuinely serve a request.",
				code: "readinessProbe:\n  httpGet:\n    path: /healthz/ready\n    port: 8080\n  periodSeconds: 5\n  failureThreshold: 3",
				warnings: [
					"Do not check downstream databases in a readiness probe unless failing means this replica truly cannot serve — a shared dependency blip will otherwise take every replica out of rotation at once.",
				],
			},
			{
				step: 3,
				title: "Use a startup probe instead of a long liveness delay",
				description:
					"Slow-booting applications get killed by liveness probes before they finish starting. A startup probe suspends the liveness probe until startup completes, letting you keep liveness checks tight afterwards.",
				code: "startupProbe:\n  httpGet:\n    path: /healthz/live\n    port: 8080\n  failureThreshold: 30\n  periodSeconds: 10",
				tips: ["failureThreshold × periodSeconds is the total startup budget — 30 × 10s allows five minutes."],
			},
			{
				step: 4,
				title: "Handle SIGTERM and add a preStop delay",
				description:
					"Endpoint removal propagates asynchronously, so traffic can still arrive after termination begins. A preStop sleep holds the pod open while that change reaches every proxy, and the application must then drain in-flight requests before exiting.",
				code: "lifecycle:\n  preStop:\n    exec:\n      command: [\"sleep\", \"10\"]\nterminationGracePeriodSeconds: 45",
				warnings: [
					"If your Dockerfile uses shell-form CMD, the shell is PID 1 and swallows SIGTERM. Use exec-form CMD or an init such as tini.",
				],
			},
			{
				step: 5,
				title: "Declare a PodDisruptionBudget with real headroom",
				description:
					"A PDB stops node drains and cluster upgrades from taking down too many replicas at once. Set maxUnavailable rather than minAvailable so the budget stays satisfiable as the replica count changes.",
				code: "apiVersion: policy/v1\nkind: PodDisruptionBudget\nspec:\n  maxUnavailable: 1\n  selector:\n    matchLabels:\n      app: checkin-api",
				warnings: [
					"minAvailable equal to the replica count makes the budget unsatisfiable and hangs every node drain forever.",
				],
			},
			{
				step: 6,
				title: "Spread replicas across zones and nodes",
				description:
					"Three replicas on one node is one node failure away from a full outage. Topology spread constraints distribute replicas across failure domains and express how strictly you want that enforced.",
				code: "topologySpreadConstraints:\n  - maxSkew: 1\n    topologyKey: topology.kubernetes.io/zone\n    whenUnsatisfiable: ScheduleAnyway\n    labelSelector:\n      matchLabels:\n        app: checkin-api",
				tips: [
					"Use ScheduleAnyway rather than DoNotSchedule unless you would genuinely rather have a Pending pod than an unevenly spread one.",
				],
			},
			{
				step: 7,
				title: "Pin an immutable image tag and set a pull policy",
				description:
					"Deploy a specific version or, better, a digest. A mutable tag such as latest means two pods of the same Deployment can be running different code, and a rollback returns you to something you cannot identify.",
				code: "image: registry.internal/checkin-api@sha256:9f2c...\nimagePullPolicy: IfNotPresent",
			},
			{
				step: 8,
				title: "Run as non-root with a read-only root filesystem",
				description:
					"Drop every Linux capability, disallow privilege escalation, and mount the root filesystem read-only. Anything the application needs to write goes to an explicit emptyDir volume, which makes writable paths visible in review.",
				code: "securityContext:\n  runAsNonRoot: true\n  runAsUser: 10001\n  allowPrivilegeEscalation: false\n  readOnlyRootFilesystem: true\n  capabilities:\n    drop: [\"ALL\"]\n  seccompProfile:\n    type: RuntimeDefault",
			},
			{
				step: 9,
				title: "Give the workload its own least-privilege ServiceAccount",
				description:
					"The default ServiceAccount is shared across the namespace, so any RBAC granted to it is granted to everything. Create a dedicated account per workload and disable token mounting unless the application actually calls the Kubernetes API.",
				code: "serviceAccountName: checkin-api\nautomountServiceAccountToken: false",
			},
			{
				step: 10,
				title: "Set a conservative rollout strategy",
				description:
					"maxUnavailable: 0 with maxSurge: 1 means capacity never drops below the desired replica count during a rollout. It costs one extra pod's resources and some rollout time, which is a good trade for anything user-facing.",
				code: "strategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxUnavailable: 0\n    maxSurge: 1",
			},
			{
				step: 11,
				title: "Restrict network traffic with a NetworkPolicy",
				description:
					"Kubernetes networking is flat and fully open by default — any pod can reach any other pod. Apply a default-deny ingress policy in the namespace, then allow only the specific sources each workload needs.",
				code: "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes: [\"Ingress\"]",
				warnings: [
					"A NetworkPolicy does nothing unless the CNI plugin enforces them. Flannel does not; Calico, Cilium, and most managed CNIs do.",
				],
			},
			{
				step: 12,
				title: "Rehearse the rollback before you need it",
				description:
					"Deploy a deliberately broken image to staging and time a full `kubectl rollout undo`. A rollback path that has never been exercised has an unknown success rate, and an incident is the wrong moment to find its gaps.",
				code: "kubectl rollout undo deployment/checkin-api\nkubectl rollout status deployment/checkin-api --timeout=120s",
				tips: [
					"Record the elapsed time. That number is a direct input to your MTTR and is worth tracking as it changes.",
				],
			},
		],
		tools: [
			{ name: "kubectl", description: "Applying manifests and driving rollouts and rollbacks." },
			{ name: "Vertical Pod Autoscaler (Off mode)", description: "Produces evidence-based resource request recommendations." },
			{ name: "kube-score / Polaris", description: "Static analysis of manifests against production-readiness rules." },
			{ name: "Goldilocks", description: "Dashboards the VPA recommendations across a whole namespace." },
		],
		commonMistakes: [
			{
				mistake: "Using a liveness probe that checks a downstream database",
				consequence:
					"A brief database blip fails the probe on every replica at once, restarting the whole fleet and converting a dependency hiccup into a full outage.",
				solution:
					"Liveness checks the process only. Put dependency checks in readiness, and only when being unable to reach the dependency genuinely means this replica cannot serve.",
			},
			{
				mistake: "Setting minAvailable equal to the replica count in a PDB",
				consequence: "No pod may ever be evicted, so node drains hang indefinitely and cluster upgrades stall.",
				solution: "Use maxUnavailable: 1, which stays satisfiable regardless of how the replica count changes.",
			},
			{
				mistake: "Setting an aggressive CPU limit on a latency-sensitive service",
				consequence:
					"The container is throttled by the CFS quota even when the node has idle cores, adding p99 latency with no errors and no obvious cause.",
				solution:
					"Set the CPU request accurately and leave the limit unset, or set it well above peak. Watch container_cpu_cfs_throttled_seconds_total.",
			},
			{
				mistake: "Deploying the latest tag",
				consequence:
					"Different replicas can run different code, and a rollback returns to an image you cannot identify or reproduce.",
				solution: "Deploy an immutable version tag or, better, a digest, and configure the registry to reject tag overwrites.",
			},
		],
		faqs: [
			{
				question: "What is the minimum viable production-readiness set?",
				answer:
					"If you can only do four things: set memory request equal to limit, add a readiness probe, handle SIGTERM with a preStop delay, and add a PodDisruptionBudget with maxUnavailable: 1. Those four cover the majority of self-inflicted Kubernetes outages.",
			},
			{
				question: "Do I need all 12 checks for an internal tool?",
				answer:
					"No. Steps 1–5 are worth doing for anything that runs continuously. The security hardening in steps 8, 9, and 11 matters most for anything internet-facing or handling regulated data.",
			},
			{
				question: "How do I verify a manifest before applying it?",
				answer:
					"Run kube-score or Polaris against it in CI. Both check for missing probes, absent resource limits, root containers, and mutable image tags, and both fail the build on violations, so the checklist is enforced rather than remembered.",
			},
		],
		relatedGuides: ["zero-downtime-deployments-kubernetes", "prometheus-slo-alerting-setup"],
		relatedTerms: [
			"readiness-probe",
			"liveness-probe",
			"pod-disruption-budget",
			"resource-requests-and-limits",
			"quality-of-service-class",
			"graceful-shutdown",
			"rolling-update",
		],
	},

	{
		slug: "zero-downtime-deployments-kubernetes",
		title: "Zero-Downtime Deployments on Kubernetes",
		seoTitle: "Zero-Downtime Deployments on Kubernetes | Step by Step",
		seoDescription:
			"Why rolling updates still drop requests, and the seven changes — preStop hooks, readiness gates, surge settings — that make Kubernetes deploys truly seamless.",
		keywords: [
			"zero downtime deployment kubernetes",
			"kubernetes rolling update 502",
			"kubernetes deployment dropped connections",
			"kubernetes graceful shutdown",
			"kubernetes preStop hook",
		],
		shortDescription:
			"Rolling updates are not automatically zero-downtime. Here is the race condition that causes 502s, and how to close it.",
		quickAnswer:
			"Kubernetes rolling updates drop requests because endpoint removal and pod termination happen in parallel, not in sequence. Closing the gap needs a preStop sleep longer than endpoint propagation, an application that drains on SIGTERM, maxUnavailable set to 0, and a readiness probe that genuinely reflects serving capability.",
		difficulty: "intermediate",
		estimatedReadTime: "10 min",
		totalTime: "PT2H",
		lastUpdated: "2026-08-12",
		prerequisites: [
			"A Deployment already running with more than one replica",
			"Access to the ingress controller or load balancer logs",
			"A way to generate steady load — hey, vegeta, or k6",
		],
		heroStats: [
			{ value: "7", label: "Steps" },
			{ value: "0", label: "Dropped requests" },
			{ value: "~2h", label: "To apply" },
		],
		steps: [
			{
				step: 1,
				title: "Reproduce the problem before changing anything",
				description:
					"Run steady load against the service and trigger a rollout. Without a baseline you cannot tell which of the later changes actually helped, and many teams discover their deploys were already clean.",
				code: "hey -z 120s -c 50 https://api.internal/healthz &\nkubectl rollout restart deployment/checkin-api",
				tips: ["Count non-200 responses specifically. A dip in throughput without errors is a different problem."],
			},
			{
				step: 2,
				title: "Understand the race you are fixing",
				description:
					"When a pod is deleted, two things happen simultaneously: the endpoint controller begins removing it from Service endpoints, and the kubelet sends SIGTERM. Endpoint removal has to propagate through kube-proxy and every ingress controller, which takes time. If the application exits before that propagation finishes, traffic is still being routed to a socket that is already closed.",
				warnings: [
					"This is a race, not a bug. Kubernetes makes no ordering guarantee between endpoint removal and SIGTERM, so the fix has to come from the pod spec.",
				],
			},
			{
				step: 3,
				title: "Add a preStop sleep longer than endpoint propagation",
				description:
					"The preStop hook runs before SIGTERM is sent. Sleeping there keeps the pod serving normally while endpoint removal propagates. Five to fifteen seconds covers most clusters; measure yours by timing how long the ingress keeps sending traffic after a pod is deleted.",
				code: "lifecycle:\n  preStop:\n    exec:\n      command: [\"sleep\", \"10\"]",
				tips: [
					"terminationGracePeriodSeconds must exceed preStop sleep plus your longest request, or SIGKILL arrives mid-drain.",
				],
			},
			{
				step: 4,
				title: "Make the application drain on SIGTERM",
				description:
					"On SIGTERM the application should stop accepting new connections, finish in-flight requests, then exit. Most HTTP frameworks provide this directly — Go's http.Server.Shutdown, Node's server.close, Spring Boot's graceful shutdown property.",
				code: "// Go\nsig := make(chan os.Signal, 1)\nsignal.Notify(sig, syscall.SIGTERM)\n<-sig\nctx, cancel := context.WithTimeout(context.Background(), 25*time.Second)\ndefer cancel()\nsrv.Shutdown(ctx)",
				warnings: [
					"Confirm the process actually receives the signal. Shell-form CMD makes the shell PID 1, and it will not forward SIGTERM to your application.",
				],
			},
			{
				step: 5,
				title: "Set maxUnavailable to 0",
				description:
					"The default allows 25% of replicas to be missing mid-rollout, so capacity dips exactly when the remaining pods are absorbing the extra load. maxUnavailable: 0 with maxSurge: 1 adds a pod before removing one, keeping capacity constant.",
				code: "strategy:\n  rollingUpdate:\n    maxUnavailable: 0\n    maxSurge: 1",
			},
			{
				step: 6,
				title: "Make the readiness probe honest",
				description:
					"With maxUnavailable: 0, the rollout only proceeds as new pods report Ready — so readiness is now the gate protecting the rollout. If the probe returns success before caches are warm or connection pools are established, you have moved the outage rather than removed it.",
				code: "readinessProbe:\n  httpGet:\n    path: /healthz/ready\n    port: 8080\n  periodSeconds: 3\n  successThreshold: 2",
				tips: [
					"successThreshold: 2 avoids promoting a pod on a single lucky probe response.",
				],
			},
			{
				step: 7,
				title: "Verify with load, then keep the test",
				description:
					"Re-run step 1's load test and confirm zero non-200 responses across a full rollout. Then move that test into the pipeline as a periodic check, because this property regresses quietly whenever someone edits the pod spec.",
				code: "hey -z 120s -c 50 https://api.internal/healthz &\nkubectl rollout restart deployment/checkin-api\nkubectl rollout status deployment/checkin-api",
			},
		],
		tools: [
			{ name: "hey / vegeta / k6", description: "Generating the steady load that exposes dropped connections." },
			{ name: "kubectl rollout", description: "Triggering and monitoring the rollout under test." },
			{ name: "Argo Rollouts", description: "Replaces the built-in strategy with canary or blue-green when rolling updates are not enough." },
		],
		commonMistakes: [
			{
				mistake: "Adding a preStop hook but leaving terminationGracePeriodSeconds at 30",
				consequence:
					"A 20-second preStop sleep leaves only 10 seconds for draining, so long requests are cut off by SIGKILL.",
				solution: "Set the grace period to preStop sleep plus the longest expected request, plus a margin.",
			},
			{
				mistake: "Assuming the ingress controller respects endpoint changes instantly",
				consequence:
					"Some ingress controllers and cloud load balancers take 10–30 seconds to converge, far longer than a default grace period allows.",
				solution:
					"Measure it. Delete a pod under load and time how long traffic keeps arriving; set the preStop sleep above that number.",
			},
			{
				mistake: "Treating a readiness probe that returns 200 as sufficient",
				consequence:
					"Pods are promoted before connection pools and caches are ready, so the first requests to each new pod are slow or fail.",
				solution:
					"Have the readiness endpoint check the things the first request will need, and use successThreshold above 1.",
			},
		],
		faqs: [
			{
				question: "Why do I get 502s during a Kubernetes rolling update?",
				answer:
					"Because endpoint removal and pod termination happen in parallel. The pod stops accepting connections while the ingress controller still has its IP in the backend pool. A preStop sleep of 5–15 seconds holds the pod open until the endpoint change has propagated everywhere.",
			},
			{
				question: "Is preStop sleep a hack?",
				answer:
					"It is the officially recommended pattern, and it exists because endpoint propagation is inherently asynchronous across kube-proxy and every ingress data plane. Kubernetes cannot know when every proxy has converged, so the pod waits instead.",
			},
			{
				question: "Do I need a service mesh for zero-downtime deploys?",
				answer:
					"No. A mesh adds retries that can mask the race, but the pod-spec fixes here solve it directly and without the operational cost of a mesh. Adopt a mesh for mTLS, traffic splitting, or per-hop telemetry — not for this.",
			},
		],
		relatedGuides: ["kubernetes-production-readiness-checklist", "prometheus-slo-alerting-setup"],
		relatedTerms: [
			"graceful-shutdown",
			"readiness-probe",
			"rolling-update",
			"canary-deployment",
			"blue-green-deployment",
			"pod-disruption-budget",
		],
	},

	{
		slug: "terraform-remote-state-s3-setup",
		title: "Setting Up Terraform Remote State on S3",
		seoTitle: "Terraform Remote State on S3 | Locking & Encryption",
		seoDescription:
			"Configure an S3 backend for Terraform with native state locking, versioning, and KMS encryption — including why DynamoDB is no longer required.",
		keywords: [
			"terraform remote state s3",
			"terraform state locking",
			"terraform s3 backend",
			"terraform use_lockfile",
			"terraform state encryption",
		],
		shortDescription:
			"Remote state with locking, versioning, and encryption — and why the DynamoDB table most tutorials tell you to create is now optional.",
		quickAnswer:
			"Terraform remote state on S3 needs a versioned, encrypted bucket with public access blocked, plus locking so two applies cannot corrupt the ledger. Since Terraform 1.10 the S3 backend supports native lockfiles via use_lockfile, so a separate DynamoDB table is no longer required.",
		difficulty: "beginner",
		estimatedReadTime: "8 min",
		totalTime: "PT45M",
		lastUpdated: "2026-08-05",
		prerequisites: [
			"Terraform 1.10+ or OpenTofu 1.8+",
			"AWS credentials with permission to create S3 buckets and KMS keys",
			"An existing Terraform configuration, even a trivial one",
		],
		heroStats: [
			{ value: "6", label: "Steps" },
			{ value: "1.10+", label: "Terraform" },
			{ value: "~45m", label: "To apply" },
		],
		steps: [
			{
				step: 1,
				title: "Create the state bucket with versioning enabled",
				description:
					"Versioning is the single most important setting. State corruption and accidental deletion are both recoverable from a previous object version and unrecoverable without one.",
				code: "resource \"aws_s3_bucket\" \"tfstate\" {\n  bucket = \"acme-tfstate-prod\"\n}\n\nresource \"aws_s3_bucket_versioning\" \"tfstate\" {\n  bucket = aws_s3_bucket.tfstate.id\n  versioning_configuration { status = \"Enabled\" }\n}",
				warnings: [
					"This bootstrap configuration necessarily uses local state. Keep it in its own small root module and commit its state file deliberately, or import the bucket afterwards.",
				],
			},
			{
				step: 2,
				title: "Block all public access",
				description:
					"State files contain every attribute Terraform read, including database passwords and generated private keys, in plain text. A publicly readable state bucket is a full credential disclosure.",
				code: "resource \"aws_s3_bucket_public_access_block\" \"tfstate\" {\n  bucket                  = aws_s3_bucket.tfstate.id\n  block_public_acls       = true\n  block_public_policy     = true\n  ignore_public_acls      = true\n  restrict_public_buckets = true\n}",
			},
			{
				step: 3,
				title: "Encrypt with a customer-managed KMS key",
				description:
					"SSE-S3 is encryption at rest but gives you no access control of your own. A customer-managed KMS key lets you restrict decryption by IAM principal and gives you a CloudTrail record of every decrypt call against the state.",
				code: "resource \"aws_s3_bucket_server_side_encryption_configuration\" \"tfstate\" {\n  bucket = aws_s3_bucket.tfstate.id\n  rule {\n    apply_server_side_encryption_by_default {\n      sse_algorithm     = \"aws:kms\"\n      kms_master_key_id = aws_kms_key.tfstate.arn\n    }\n    bucket_key_enabled = true\n  }\n}",
				tips: ["bucket_key_enabled cuts KMS request costs substantially on frequently accessed state."],
			},
			{
				step: 4,
				title: "Configure the backend with native locking",
				description:
					"Set use_lockfile to enable the S3 backend's native locking, which uses a conditional-write lock object beside the state. Terraform 1.10 and later support this, and it removes the need for a separate DynamoDB table.",
				code: "terraform {\n  backend \"s3\" {\n    bucket       = \"acme-tfstate-prod\"\n    key          = \"platform/network/terraform.tfstate\"\n    region       = \"me-central-1\"\n    encrypt      = true\n    kms_key_id   = \"arn:aws:kms:me-central-1:1234:key/abcd\"\n    use_lockfile = true\n  }\n}",
				tips: [
					"Give every root module a distinct key. Sharing one key across modules means one lock for unrelated work and needlessly serialised applies.",
				],
			},
			{
				step: 5,
				title: "Migrate existing local state",
				description:
					"terraform init detects the backend change and offers to copy local state into S3. Confirm the resource count afterwards — a migration that silently produced empty state will try to recreate your entire infrastructure on the next apply.",
				code: "terraform init -migrate-state\nterraform state list | wc -l",
				warnings: [
					"Keep the local terraform.tfstate file until you have confirmed the resource count in the new backend. Do not delete it on the same day.",
				],
			},
			{
				step: 6,
				title: "Restrict who can read the state",
				description:
					"Grant the state bucket and its KMS key only to the roles that run Terraform. Read access to state is equivalent to read access to every secret any managed resource has ever exposed.",
				code: "data \"aws_iam_policy_document\" \"tfstate_access\" {\n  statement {\n    actions   = [\"s3:GetObject\", \"s3:PutObject\", \"s3:DeleteObject\"]\n    resources = [\"${aws_s3_bucket.tfstate.arn}/*\"]\n  }\n  statement {\n    actions   = [\"kms:Decrypt\", \"kms:GenerateDataKey\"]\n    resources = [aws_kms_key.tfstate.arn]\n  }\n}",
			},
		],
		tools: [
			{ name: "Terraform 1.10+ / OpenTofu 1.8+", description: "Required for native S3 lockfile support." },
			{ name: "AWS KMS", description: "Customer-managed key for state encryption and access control." },
			{ name: "tflint / checkov", description: "Catches unencrypted or public state buckets before they are applied." },
		],
		commonMistakes: [
			{
				mistake: "Skipping bucket versioning",
				consequence:
					"A corrupted or truncated state write is unrecoverable, and Terraform will attempt to recreate every managed resource.",
				solution: "Enable versioning before the first apply, and add a lifecycle rule to expire noncurrent versions after 90 days.",
			},
			{
				mistake: "Sharing one state key across every module",
				consequence:
					"All applies serialise on a single lock, and one large state file becomes slow to plan and risky to corrupt.",
				solution: "One state key per root module, organised by environment and component.",
			},
			{
				mistake: "Committing state to Git as a backup",
				consequence: "Every secret in the state is now in Git history, on every clone, permanently.",
				solution: "Rely on S3 versioning and cross-region replication instead. Add *.tfstate* to .gitignore on day one.",
			},
		],
		faqs: [
			{
				question: "Do I still need DynamoDB for Terraform state locking?",
				answer:
					"Not for new setups. Terraform 1.10 introduced native S3 locking via the use_lockfile argument, and OpenTofu has equivalent support. Existing DynamoDB-based configurations keep working, and you can run both during a transition, but a separate table is no longer required.",
			},
			{
				question: "What happens if a lock is left behind after a crash?",
				answer:
					"The next apply fails reporting the held lock and its ID. Once you have confirmed no other apply is genuinely running, terraform force-unlock <ID> clears it. Never force-unlock on suspicion alone — a concurrent apply is exactly what the lock is protecting you from.",
			},
			{
				question: "Should each environment have its own bucket?",
				answer:
					"Separate buckets in separate AWS accounts is the stronger pattern, because it makes a production state leak impossible from a development role. A single bucket with per-environment key prefixes is acceptable if IAM policies genuinely enforce the prefix boundaries.",
			},
		],
		relatedGuides: ["kubernetes-production-readiness-checklist"],
		relatedTerms: [
			"terraform-state",
			"infrastructure-as-code",
			"configuration-drift",
			"least-privilege",
			"immutable-infrastructure",
		],
	},

	{
		slug: "prometheus-slo-alerting-setup",
		title: "SLO Alerting with Prometheus Burn Rates",
		seoTitle: "Prometheus SLO Alerting | Multi-Window Burn Rate",
		seoDescription:
			"Replace threshold alerts with multi-window burn-rate alerting: define an SLI recording rule, compute error budget burn, and page only on real problems.",
		keywords: [
			"prometheus slo alerting",
			"error budget burn rate alert",
			"multi window burn rate",
			"prometheus recording rules slo",
			"slo alerting best practices",
		],
		shortDescription:
			"Threshold alerts page you at 3 a.m. for a blip and stay silent through a slow bleed. Burn-rate alerting fixes both.",
		quickAnswer:
			"Burn-rate alerting compares how fast you are consuming the error budget against how fast the SLO window replenishes it. A multi-window, multi-burn-rate setup pages on a fast burn confirmed over a short window and opens a ticket on a slow burn, which catches real incidents early without paging on noise.",
		difficulty: "advanced",
		estimatedReadTime: "11 min",
		totalTime: "PT2H30M",
		lastUpdated: "2026-07-28",
		prerequisites: [
			"Prometheus scraping request metrics with a status-code label",
			"An agreed SLO — this guide uses 99.9% availability over 30 days",
			"Alertmanager configured with at least two severity routes",
		],
		heroStats: [
			{ value: "4", label: "Alert windows" },
			{ value: "99.9%", label: "Example SLO" },
			{ value: "~2.5h", label: "To apply" },
		],
		steps: [
			{
				step: 1,
				title: "Define the SLI as a ratio recording rule",
				description:
					"Precompute the good-event and total-event rates as recording rules. Burn-rate queries evaluate over several windows at once, and computing them from raw counters at alert time is slow enough to cause evaluation delays.",
				code: "groups:\n  - name: sli\n    rules:\n      - record: job:http_requests:rate5m\n        expr: sum(rate(http_requests_total{job=\"checkin-api\"}[5m]))\n      - record: job:http_errors:rate5m\n        expr: sum(rate(http_requests_total{job=\"checkin-api\",code=~\"5..\"}[5m]))",
				tips: ["Repeat the pair for each window you alert on — 5m, 30m, 1h, 6h."],
			},
			{
				step: 2,
				title: "Express the error ratio",
				description:
					"The burn rate is the observed error ratio divided by the budget. With a 99.9% SLO the budget is 0.001, so an error ratio of 0.014 is a burn rate of 14.",
				code: "- record: job:http_error_ratio:rate5m\n  expr: job:http_errors:rate5m / job:http_requests:rate5m",
				warnings: [
					"Guard against division by zero on low-traffic services — a service with no requests produces NaN, which never fires and hides genuine outages.",
				],
			},
			{
				step: 3,
				title: "Page on a fast burn, confirmed by a short window",
				description:
					"A burn rate of 14.4 exhausts a 30-day budget in about two days. Requiring both a 1-hour and a 5-minute window to exceed it means you page quickly on a real incident but not on a single bad scrape.",
				code: "- alert: CheckinApiFastBurn\n  expr: |\n    job:http_error_ratio:rate1h > 14.4 * 0.001\n    and\n    job:http_error_ratio:rate5m > 14.4 * 0.001\n  for: 2m\n  labels: { severity: page }",
			},
			{
				step: 4,
				title: "Ticket on a slow burn",
				description:
					"A burn rate of 6 consumes the whole budget in five days — too slow to justify waking someone, too fast to ignore. Pair a 6-hour window with a 30-minute confirmation window and route it to a ticket rather than a page.",
				code: "- alert: CheckinApiSlowBurn\n  expr: |\n    job:http_error_ratio:rate6h > 6 * 0.001\n    and\n    job:http_error_ratio:rate30m > 6 * 0.001\n  for: 15m\n  labels: { severity: ticket }",
			},
			{
				step: 5,
				title: "Delete the threshold alerts this replaces",
				description:
					"Burn-rate alerts subsume static error-rate alerts, and leaving both means double-paging on every incident. Remove the old rules in the same change so the new ones are demonstrably sufficient rather than merely additional.",
				warnings: [
					"Keep genuinely orthogonal alerts — certificate expiry, disk fill, backup failure. Those do not show up in an availability SLI at all.",
				],
			},
			{
				step: 6,
				title: "Publish the remaining budget on a dashboard",
				description:
					"The alerts tell you when the budget is burning fast. The dashboard tells the team how much is left, which is what makes the error-budget policy actionable rather than theoretical.",
				code: "1 - (\n  sum(increase(http_requests_total{job=\"checkin-api\",code=~\"5..\"}[30d]))\n  /\n  sum(increase(http_requests_total{job=\"checkin-api\"}[30d]))\n) / 0.001",
				tips: ["Show it as a percentage of budget remaining. Everyone understands \"we have 40% left\" immediately."],
			},
		],
		tools: [
			{ name: "Prometheus", description: "Recording rules and alert evaluation." },
			{ name: "Alertmanager", description: "Routing page-severity and ticket-severity alerts differently." },
			{ name: "Sloth / Pyrra", description: "Generates the full multi-window rule set from a short SLO definition." },
			{ name: "Grafana", description: "Budget-remaining and burn-rate dashboards." },
		],
		commonMistakes: [
			{
				mistake: "Alerting on a single long window only",
				consequence:
					"A 6-hour window means a total outage takes hours to page. The alert is accurate and far too late to matter.",
				solution: "Always pair a long window with a short confirmation window so severe incidents page within minutes.",
			},
			{
				mistake: "Alerting on a single short window only",
				consequence:
					"Every transient blip pages someone, the team learns to ignore the alert, and a real incident gets the same reaction.",
				solution: "The long window is what establishes that the burn is sustained. Both windows are required.",
			},
			{
				mistake: "Leaving NaN unguarded on low-traffic services",
				consequence:
					"A service receiving no requests produces a NaN ratio, which never crosses a threshold — so a completely dead service alerts on nothing.",
				solution:
					"Add a separate absent-or-zero-traffic alert, or clamp the denominator, so the absence of traffic is itself a signal.",
			},
		],
		faqs: [
			{
				question: "What burn rate should page?",
				answer:
					"14.4 is the widely used fast-burn threshold: it exhausts a 30-day budget in two days and corresponds to consuming 2% of the budget in one hour. 6 is the usual slow-burn threshold, exhausting the budget in five days. Both come from the SRE workbook's multi-window recommendations.",
			},
			{
				question: "How is this better than alerting on error rate above 1%?",
				answer:
					"A static threshold has no relationship to the reliability you actually promised. 1% errors might be entirely within budget for a service with a 99% SLO and a severe incident for one at 99.99%. Burn-rate alerting is expressed in terms of the objective itself, so the same rule shape works for every service.",
			},
			{
				question: "Do I need a separate tool to generate these rules?",
				answer:
					"Not required, but Sloth and Pyrra both generate the full multi-window rule set from a short SLO spec, which removes a lot of repetitive YAML and the arithmetic errors that come with it.",
			},
		],
		relatedGuides: ["kubernetes-production-readiness-checklist", "zero-downtime-deployments-kubernetes"],
		relatedTerms: [
			"error-budget",
			"service-level-objective",
			"service-level-indicator",
			"golden-signals",
			"observability",
			"cardinality",
		],
	},
];
