#!/usr/bin/env node
/**
 * Submits URLs to IndexNow, which pushes them to Bing, Yandex, Seznam and Naver in one
 * call. Google does not participate — Google discovery still comes from the sitemap and
 * Search Console.
 *
 *   node scripts/indexnow-submit.js                       # every URL in the sitemap
 *   node scripts/indexnow-submit.js /blog /guides         # just these paths
 *   node scripts/indexnow-submit.js --since 2026-08-01    # sitemap URLs modified since
 *   node scripts/indexnow-submit.js --dry-run             # print the payload, send nothing
 *
 * Requires the key file to be live at https://ashiwanikumar.com/<key>.txt, so this only
 * works after a deploy. IndexNow fetches that file to verify ownership; if the site has
 * not shipped the key yet the API returns 403.
 *
 * Create the key once:
 *   KEY=$(openssl rand -hex 16); printf %s "$KEY" > public/$KEY.txt
 */

const fs = require("fs");
const path = require("path");

const HOST = "ashiwanikumar.com";
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10000; // IndexNow's documented per-request ceiling

function resolveKey() {
	const dir = path.join(__dirname, "..", "public");
	const keyFile = fs.readdirSync(dir).find((f) => /^[a-f0-9]{8,128}\.txt$/i.test(f));
	if (!keyFile) {
		console.error(
			"No IndexNow key file found in public/.\n" +
				"Create one:  KEY=$(openssl rand -hex 16); printf %s \"$KEY\" > public/$KEY.txt"
		);
		process.exit(1);
	}
	const key = keyFile.replace(/\.txt$/i, "");
	const contents = fs.readFileSync(path.join(dir, keyFile), "utf8").trim();
	if (contents !== key) {
		console.error(`public/${keyFile} must contain exactly "${key}" and nothing else.`);
		process.exit(1);
	}
	return key;
}

async function sitemapUrls(since) {
	const res = await fetch(SITEMAP, { headers: { "user-agent": "ashiwanikumar-indexnow/1.0" } });
	if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
	const xml = await res.text();

	return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
		.map((m) => ({
			loc: (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1],
			lastmod: (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1],
		}))
		.filter((e) => e.loc)
		.filter((e) => !since || (e.lastmod && e.lastmod.slice(0, 10) >= since))
		.map((e) => e.loc);
}

async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes("--dry-run");
	const sinceIdx = args.indexOf("--since");
	const since = sinceIdx !== -1 ? args[sinceIdx + 1] : null;

	const paths = args.filter(
		(a, i) => a.startsWith("/") && i !== sinceIdx + 1
	);

	const key = resolveKey();
	const urlList = paths.length
		? paths.map((p) => `https://${HOST}${p}`)
		: await sitemapUrls(since);

	if (!urlList.length) {
		console.log("Nothing to submit.");
		return;
	}

	console.log(`${urlList.length} URL(s) to submit as ${HOST} (key ${key.slice(0, 8)}…)`);

	if (dryRun) {
		urlList.forEach((u) => console.log("  " + u));
		return;
	}

	for (let i = 0; i < urlList.length; i += BATCH) {
		const urlBatch = urlList.slice(i, i + BATCH);
		const res = await fetch(ENDPOINT, {
			method: "POST",
			headers: { "content-type": "application/json; charset=utf-8" },
			body: JSON.stringify({
				host: HOST,
				key,
				keyLocation: `https://${HOST}/${key}.txt`,
				urlList: urlBatch,
			}),
		});

		// 200 and 202 both mean accepted; 403 means the key file is not live yet.
		if (res.ok) {
			console.log(`Submitted ${urlBatch.length} URL(s) — ${res.status}`);
		} else {
			console.error(`Failed — ${res.status} ${await res.text()}`);
			process.exitCode = 1;
		}
	}
}

main().catch((err) => {
	console.error(err.message);
	process.exit(1);
});
