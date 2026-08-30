# Gmail CV Outreach

Indexes every CV/resume you send from your own Gmail, tracks whether the recipient
replied, and renders it in the dashboard as a Gmail-styled mailbox at
`/dashboard/cv-outreach`.

## How it works

```
Gmail API (read-only)  ──sync──▶  MongoDB (CvOutreach)  ──REST──▶  Next.js dashboard
      ▲                              ▲
   refresh token                 cron every 30 min + "Sync now"
```

1. The sync queries `in:sent has:attachment filename:(pdf OR doc OR docx)` since the
   last watermark.
2. Each new message is fetched once and kept only if an attachment filename matches
   `GMAIL_CV_FILENAME_REGEX` (default `cv|resume|curriculum vitae|profile`).
3. A second pass walks the thread of every email still awaiting a reply inside the
   reply window and records the first reply, time-to-reply, and bounces.

Only the owner's mailbox is ever read, only with `gmail.readonly`, and every route is
behind `authCheck` + `superAdminCheck`.

## Setup

1. Create a **Desktop app** OAuth client in Google Cloud Console and enable the Gmail
   API for the project.
2. Put the credentials in `.env` (repo root — `app.js` loads it):

   ```
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   ```

3. Authorize once and copy the printed token into `.env`:

   ```bash
   cd apps/api-server
   npm run gmail:auth      # opens a consent URL, captures the code on localhost:5599
   ```

   ```
   GMAIL_REFRESH_TOKEN=...
   ```

4. Restart the API server. The cron registers itself on boot; the dashboard's
   **Sync now** button runs it on demand.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `GMAIL_CLIENT_ID` | — | OAuth client id (required) |
| `GMAIL_CLIENT_SECRET` | — | OAuth client secret (required) |
| `GMAIL_REFRESH_TOKEN` | — | From `npm run gmail:auth` (required) |
| `GMAIL_REDIRECT_URI` | `http://localhost` | Registered redirect |
| `GMAIL_AUTH_PORT` | `5599` | Loopback port used by the authorize script |
| `GMAIL_CV_FILENAME_REGEX` | `cv\|resume\|curriculum[ _-]?vitae\|profile` | What makes an attachment a CV |
| `GMAIL_CV_ATTACHMENT_TYPES` | `pdf,doc,docx` | Allowed extensions |
| `GMAIL_CV_FILENAME_EXCLUDE_REGEX` | `salary\|certificate\|payslip\|…` | Subtracted from the match — paperwork that carries your name but is not a CV |
| `GMAIL_CV_EXTRA_QUERY` | — | Extra Gmail search terms, e.g. `-label:personal` |
| `GMAIL_SYNC_CRON` | `*/30 * * * *` | Sync schedule |
| `GMAIL_SYNC_LOOKBACK_DAYS` | `365` | How far back the first sync reaches |
| `GMAIL_SYNC_MAX_MESSAGES` | `500` | New messages fetched per run |
| `GMAIL_REPLY_WINDOW_DAYS` | `60` | How long an email keeps getting reply checks |
| `GMAIL_REPLY_CHECK_LIMIT` | `80` | Threads re-checked per run |
| `GMAIL_SYNC_LOCK_STALE_MINUTES` | `15` | When a crashed run's lock is considered dead |

## Endpoints

All under `/api/v1/gmail-cv`, all super-admin only.

| Method | Path | Purpose |
|---|---|---|
| GET | `/status` | Connection state, mailbox, last sync result |
| GET | `/analytics?days=30` | Volume, reply rate, top companies, CV file performance |
| GET | `/messages?page=&perPage=&folder=&q=&domain=` | Paginated list + folder counts |
| GET | `/messages/:id` | One email plus others sent to the same company |
| GET | `/messages/:id/body` | Live body fetch from Gmail (sanitized HTML) |
| GET | `/messages/:id/attachments/:attachmentId` | Streams the CV exactly as sent |
| PATCH | `/messages/:id` | Toggle `starred` |
| POST | `/sync` | Start a sync; `{ "full": true }` re-scans the whole lookback |

`folder` is one of `all`, `awaiting`, `replied`, `starred`, `bounced`.

`POST /sync` returns **202 immediately** and runs in the background — a full
re-scan takes minutes, longer than the frontend ingress's 60s
`proxy-read-timeout`. Poll `GET /status` for `sync.running` and, once it clears,
`sync.lastRun` for the result. Pass `?probe=0` while polling so each call skips
the live Gmail round-trip. A second start while one is running returns 409,
unless the existing lock is older than `GMAIL_SYNC_LOCK_STALE_MINUTES`.

## Data model

`CvOutreach` — one document per sent CV email, keyed by `gmailMessageId`:
recipient and derived company/domain, attachment list with the matched
`cvFileName`, `sentAt`, and reply fields (`replied`, `replyCount`, `firstReplyAt`,
`hoursToReply`, `daysToReply`, `bounced`).

`GmailSyncState` — a single `cv_outreach` document holding the run lock, the
`lastMessageDate` watermark, last-run counters and the last error.

## Notes

- Message bodies are **not** stored — only Gmail's snippet. The reading pane fetches
  the body live and strips scripts, styles, frames and event handlers before render.
- A bounce (mailer-daemon/postmaster, or a delivery-failure subject) is recorded as
  `bounced`, not as a reply, so it never inflates the reply rate.
- Concurrent runs are prevented by a lock in `GmailSyncState`; a lock older than
  `GMAIL_SYNC_LOCK_STALE_MINUTES` is reclaimed.
- Parsing is covered by `tests/__test__/gmailCvOutreach.test.js`.
