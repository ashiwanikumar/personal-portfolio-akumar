#!/usr/bin/env node
/**
 * One-off backfill: decode HTML entities in snippets stored before the sync
 * started decoding them ("I&#39;m" -> "I'm").
 *
 *   node scripts/decode-cv-snippets.js          # report only
 *   node scripts/decode-cv-snippets.js --apply  # write the changes
 *
 * Safe to re-run: rows that are already clean are skipped.
 */
require("module-alias/register");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const { decodeEntities } = require("@services/gmail/cvOutreachSyncService");

const APPLY = process.argv.includes("--apply");

(async () => {
  const uri = process.env.ATLAS_URI;
  if (!uri) throw new Error("ATLAS_URI is not set");

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  const CvOutreach = require("@models/gmail-cv/cvOutreach");

  const docs = await CvOutreach.find({
    $or: [{ snippet: /&[a-z#0-9]+;/i }, { firstReplySnippet: /&[a-z#0-9]+;/i }],
  })
    .select("gmailMessageId snippet firstReplySnippet")
    .lean();

  console.log(`${docs.length} document(s) contain HTML entities`);

  let changed = 0;
  for (const doc of docs) {
    const snippet = decodeEntities(doc.snippet);
    const firstReplySnippet = decodeEntities(doc.firstReplySnippet);

    if (snippet === doc.snippet && firstReplySnippet === doc.firstReplySnippet) continue;
    changed += 1;

    if (changed <= 3) {
      console.log(`  before: ${String(doc.snippet).slice(0, 70)}`);
      console.log(`  after : ${snippet.slice(0, 70)}`);
    }

    if (APPLY) {
      await CvOutreach.updateOne(
        { gmailMessageId: doc.gmailMessageId },
        { $set: { snippet, firstReplySnippet } }
      );
    }
  }

  console.log(APPLY ? `\nUpdated ${changed} document(s)` : `\n${changed} would change — re-run with --apply`);

  await mongoose.connection.close();
  process.exit(0);
})().catch((error) => {
  console.error("FAILED:", error.message);
  process.exit(1);
});
