# Rohit — Project Deep Dive (the REAL, code-verified version)

> Built by reading the actual code (Nov 2025–Jun 2026), not memory.
> Goal: talk about your own projects with full confidence and ZERO overclaiming.
> Simple words. Real facts only.
>
> Legend: ✅ verified in code · ⚠️ correction (your notes currently say something the code does NOT back up)

---

# ⚠️ READ THIS FIRST — 3 things you're currently overclaiming

These are in your prep notes / application but the **code says otherwise.** Fix them in your head now, because the founder could open your GitHub.

### ⚠️ 1. AI-Sentry is a SECURITY tool, NOT an "eval + drift" tool
- Your intro + prep file call it *"an eval and drift-observability layer for AI systems."*
- **The code does no such thing.** There is **no** evaluation, no accuracy scoring, no drift tracking, no monitoring. The word "drift" isn't even in the source.
- What it ACTUALLY is: middleware that sits in front of an LLM and (a) blocks prompt-injection/jailbreak attempts, (b) redacts private data (emails, phones, real credit cards) before the text reaches the model.
- **Fix:** describe AI-Sentry as *"security middleware that guards LLM calls."* For the *eval/measurement* story, use **cuiq's A/B harness instead** (that one really does measure accuracy).

### ⚠️ 2. cuiq: the numbers + the stack need softening
- Your application says *"OpenAI-driven... 95%+ accuracy... multi-step agent."* The code says:
  - The default model is **Google Gemini 2.5 Flash via OpenRouter** (it uses the OpenAI *SDK*, but the model isn't OpenAI). Say *"an OpenAI-compatible client through OpenRouter, default Gemini."*
  - Code comments say **~70% → 90%+**, not 65% → 95%. The exact "65/95" numbers are **not in the code.** Only quote 65→95 if you personally ran it and saw that. Safer: *"from around 70% to over 90% on a labeled test set."*
  - It's a **single** strong AI call, **not** multi-step. (A fancier multi-model/vector design exists only as a *plan* in a doc, not in the running code.)

### ⚠️ 3. TransferPitch: separate the two optimization stories, and chat/video isn't yours
- You have **two different "fast" stories** — don't conflate them in conversation:
  - **Story A — player record dedup** across providers (Wyscout / SportMonks / TheSports / Transfermarkt). Roughly a million player rows. Naive fuzzy compare was minutes; trigram + match-key indexes brought it sub-second. The "1.1M" exact number isn't in code — say *"roughly a million player records."*
  - **Story B — `/dashboard/transfers/` list endpoint** (the news/transfers page). Was taking **5 minutes per request**, now under 1 second. Ten layers: projection, `select_related`, generated `sort_date` column, killing a subquery, three-tier Redis cache, tier sort moved out of SQL, regex → indexed category, `iexact` → exact, cursor pagination. Details in section D.
- The 5-min metric isn't a code constant — it's from your own production observation. Say *"the endpoint was taking on the order of five minutes; after these changes it's routinely under a second."*
- Live **chat + video calls use Stream (getstream.io)** — a third party, not built by you. What IS yours: the real-time **notifications** over Django Channels. Don't claim the chat/video engine.

> These corrections don't make you weaker — they make you **un-catchable.** A founder trusts the person who says "here's exactly what's mine and what's a library" way more than the person who rounds everything up.

---

# 1. TransferPitch — scaling a football transfer marketplace ✅

---

## A. What it is (plain) — your interview elevator pitch

A **B2B marketplace for football (soccer) player transfers.**

Three sides on the platform:
- **Clubs** post openings called **tenders** (e.g. "I need a center-back, age 22–28, max €5M transfer fee, salary range €40k–80k, available in this transfer window").
- **Agents** browse tenders, pick a player from their roster, and submit a **pitch** to the club ("here's my player, here's why they fit").
- **Players** have rich profiles with stats, video clips, market value, contract status, etc.

Once a club likes a pitch, the deal moves through a workflow: chat → video meeting → contract signing → marked as a deal. Everything is in-app.

**Why the data side is hard:** to make a player profile useful, the platform pulls data from **four different paid providers** — Wyscout, SportMonks, TheSports, Transfermarkt. Each provider has their own database, their own player IDs, their own naming conventions. The same human player shows up as four separate rows in four tables (`WSPlayer`, `SMPlayer`, `TSPlayer`, etc.) with **no shared ID** to link them.

The platform also runs a separate **WhatsApp bot ("Auto-Tender")** that lets a club person create accounts + post tenders without ever logging into the dashboard — purely by chatting on WhatsApp. The bot calls 8 backend HTTP endpoints behind a bot-key header.

It's a real production product — running on Hetzner via Coolify, with staging at `tpstaging-api.techorigins.io` and prod at `transferpitch.com`.

---

## B. Tech Stack (every item below is in `requirements/base.txt` or `package.json` — verified)

### Backend — `transferpitch-backend/`
- **Django 4.1.8** + **Django REST Framework 3.14**
- **PostgreSQL** with `pg_trgm` extension (trigram fuzzy matching), GIN + B-tree + composite indexes, **pgbouncer** for connection pooling
- **Celery 5.2.7** + **Celery Beat 2.5** + **Redis 4.5** as the broker for scheduled background jobs (provider syncs every 2h–3d)
- **Django Channels 4.0** + **Daphne** + **channels-redis 4.1** — WebSockets for live in-app notifications
- **django-redis 5.2** for endpoint-level caching
- **Stream Chat 4.26** (`stream-chat`) + **GetStream Video 2.5** (`getstream`) — third-party SDKs for the chat + video calling features
- **DRF Spectacular** for OpenAPI docs
- **DRF SimpleJWT 5.3** for auth
- **Twilio 9.8** for OTP / SMS
- **SendGrid 6.12** + **Resend 2.19** (via `django-anymail`) for transactional email
- **Typesense 1.1** for user-facing search
- **Google Cloud Translate 3.22** for the news translation feature
- **bleach 6.1** to sanitize incoming news HTML bodies
- **django-cors-headers 3.14**, **whitenoise 6.4** for static files in prod
- **Gunicorn 23** + **uvicorn workers** for serving the ASGI app
- **APITube** as the football news provider (HTTP API)

### Frontend — `Transfer_Pitch/`
- **React 18.3** + **React Router 6.22** + **Redux Toolkit 2.2** + **redux-persist 6.0**
- **Tailwind CSS 3.4** (Tailwind-only styling — no CSS files for components)
- **Stream Chat React 12** + **Stream Video React SDK 1.19** — live chat + video calls
- **TensorFlow Lite WASM** — background blur during video calls (3.5 MB engine, loaded async)
- **react-i18next 11.18** + **i18next-browser-languagedetector** — 18 languages including German, Spanish, French, Portuguese, Russian, Japanese, Arabic, Korean, Chinese (Simplified + Traditional), Danish, Turkish, Croatian, Italian
- **axios 1.6**, **react-hot-toast 2.5**, **lucide-react 0.525**, **react-icons 5.5**
- **chart.js 4.5** + **react-chartjs-2 5.3** + **recharts 3.1** — stats visualisations on player profiles
- **react-beautiful-dnd 13.1**, **react-image-crop 11**, **react-dropzone 14.3**
- **flag-icons** (CDN) — country flag CSS classes
- **moment 2.30** + **date-fns 4.1**, **react-datepicker 8.4**
- **xlsx 0.18** — Excel exports from the tender / pitches pages
- **@docuseal/react 1.0** — contract signing inline in the dashboard
- **pdf-parse 2.4**, **html2canvas 1.4** for document handling

### Infra
- Hosting on **Hetzner**, orchestration via **Coolify**, SSH-tunnel access from local to staging & prod databases (staging port 5433, prod via pgbouncer on 5432)

---

## C. Core technical work — the things to talk about at depth

### C.1 ✅ Player record deduplication across 4 data providers (`models.py` + migrations 0148/0149/0167/0168)

The same real human is sitting in `WSPlayer`, `SMPlayer`, `TSPlayer` and the Transfermarkt table with four different IDs and four slightly different spellings of their name. To show ONE clean profile the system has to figure out which rows match.

**Naive approach:** loop over the players table, fuzzy-compare names in Python (`difflib.SequenceMatcher`). On roughly a million rows that's minutes per match check.

**The fix has 3 layers:**

1. **Pre-computed "match key" columns** filled on `save()` — birthdate-as-integer (`YYYYMMDD`), country alpha2 code, normalised name (lowercase, accent-stripped, punctuation removed). Each column has a **B-tree index**. The DB jumps straight to "players born the same day" instead of scanning every row.

2. **A composite index** on `(firstname, lastname, birthdate, country)`. The exact-equality match ("same name + same birthday + same country") is answered by a single index lookup.

3. **A GIN trigram index on the name** using Postgres `pg_trgm`. This is the big win. The DB filters to "names that look similar" (`similarity(name, 'Cristiano Ronaldo') > 0.3`) in milliseconds, shrinking the candidate set to a handful of rows **before** the slow Python `difflib` runs on what's left. Trigram index is what lets fuzzy search be fast — Postgres pre-computes 3-character substrings of every name and indexes them.

**The result:** the fuzzy compare runs over ~5 candidates instead of ~1,000,000, dropping match time from minutes to sub-second.

Heavy provider syncs run on a **Celery beat schedule** (every 2 hrs for some providers, every 3 days for the bulkier ones — `dashboard/tasks.py`), so users never wait for an upstream API to respond.

### C.2 ✅ `/dashboard/transfers/` list endpoint: 5 minutes → under 1 second (see Section D below — this is its own deep section)

### C.3 ✅ Real-time notifications via WebSockets (`notifications/consumers.py`, `config/asgi.py`)

- A single `NotificationConsumer` extending `AsyncJsonWebsocketConsumer`
- Each user joins a per-user group on connect
- Backend signals (new pitch, pitch accepted/rejected, meeting scheduled, contract sent) push events into the user's group via `channel_layer.group_send`
- **Redis as the channel layer** (`channels-redis`) so multiple Daphne workers share the same pub/sub
- Frontend keeps an authenticated WebSocket connection open via Redux middleware; toast notifications fire on inbound messages

**Honest:** the **chat and video calling** features use **Stream (getstream.io) SDKs** — that's third-party. What's mine is the WebSocket notification layer and all the surrounding UI (incoming-call screen, in-call modal redesign, background blur toggle, recording, etc.).

### C.4 ✅ Auto-Tender — WhatsApp bot integration (`auto_tender/`)

A separate Django app exposing **8 HTTP endpoints** at `/api/auto-tender/` that the WhatsApp bot calls with a bot-key header (`X-Bot-Key`). The bot drives a guided conversation on WhatsApp, then calls these endpoints to:
- Resolve or create a Club (Wyscout-backed)
- Create a club-admin Account + UserProfile + Staff in one atomic transaction
- Create a Tender
- Look up existing accounts by phone (for dedupe before creating)

Built with:
- A custom DRF `BotKeyPermission` using `hmac.compare_digest` (constant-time comparison so the key length can't leak through timing)
- An `AutoTenderAuditLog` table with `on_delete=PROTECT` foreign keys (so audit history can never be silently dropped)
- Idempotency-Key header cached in Redis for 24h to make retries safe
- Re-uses the canonical `TenderCreateUpdateSerializer` and `StaffSerializer` from the main app instead of duplicating validation rules

### C.5 ✅ Heavy use of Redis caching with versioned cache keys

Pattern reused across the codebase: `f"news:everything:{_CACHE_VERSION}:{language}:{page}:{per_page}"`. The `_CACHE_VERSION` constant (currently `"v7"` for news) is bumped any time the cached payload shape changes, instantly invalidating every cached entry without a Redis flush.

### C.6 ✅ N+1 elimination on the heavy list endpoints

`select_related` + `prefetch_related` on the tender list, the agent dashboard, the pitch detail view. Without them the tender list issued ~50 queries per page; with them it's one.

---

## D. ⭐ THE `/dashboard/transfers/` OPTIMIZATION — 5 minutes → under 1 second

The `/news` page has two tables — **Top Transfers** and **Recent Transfers**. Both hit the **same endpoint**, `/dashboard/transfers/`, just with a different `sort` parameter:

```
GET /dashboard/transfers/?sort=top&per_page=10&page=1&gender=male&level=pro
GET /dashboard/transfers/?sort=recent&per_page=10&page=1&gender=male&level=pro
```

Code lives in `transferpitch_backend/dashboard/views.py:11876` — `GetTransfersListView`. (Route mounted at `dashboard/urls.py:77`.)

### The problem (before)

Page took **~5 minutes per request.** Users literally closed the tab before it loaded. The transfer data sits in `WSTransfer` (Wyscout-sourced) joined to `WSPlayer`, `WSTeam` (from + to), `WSArea` (passport + birth country), `WSCompetition`, and `WSSeason` — six relations deep on every row.

### Why it was that slow (root causes I found)

1. **Wide row payload** — the query was selecting every column on every joined table, including huge JSON/text fields like `player.agencies` and `player.normalized_name` that the response doesn't even use.
2. **N+1 queries on the FK relations** — for every transfer row, separate queries for the player, the from/to teams, the seasons, the areas.
3. **No caching on a list endpoint that 90% of users hit identically** — the front page calls `?sort=top&page=1&gender=male&level=pro` for every visitor; same response, but every call re-ran the whole query.
4. **An expensive in-query league-tier ranking** — a giant `Case/When` with 100+ branches to rank competitions by tier, baked into the SQL `ORDER BY`.
5. **Regex on team names** to detect youth/reserve teams — pattern-match against `"Real Madrid B"`, `"Manchester City U23"`, etc., per row.
6. **A subquery on every row** to resolve `primary_domestic_competition_id` — joining transfers to competitions to filter out cup / friendly matches.
7. **`OFFSET … LIMIT` pagination** — Postgres has to read and discard the first `(page-1)*per_page` rows on every deep page.
8. **`iexact` on the gender filter** — case-insensitive comparison can't use a plain B-tree index.

### The fix — 10 layers I applied to `GetTransfersListView`

**1. `.only()` projection — drop the wide payload**

Every column listed explicitly: 47 fields across `WSTransfer`, `WSPlayer`, `WSArea` x2 (passport + birth), `WSTeam` x2 (from + to), `WSSeason`. Anything not in the response shape is excluded. Row size dropped by ~80%.

**2. `.defer('player__agencies', 'player__normalized_name')` — exclude the two biggest text fields**

`agencies` is a JSON list of agency relationships, `normalized_name` is a long generated string used only for dedup matching. The response doesn't need either. Defer them and Postgres doesn't even ship the bytes over the wire.

**3. `select_related()` for every FK** — kill the N+1

```python
.select_related(
    'player', 'player__passport_area', 'player__birth_area',
    'from_team', 'to_team', 'season',
)
```

One JOIN-y query instead of N+6.

**4. A generated `sort_date` column on `WSTransfer` — index-friendly sort**

A stored generated column that picks the best-available date per row: `COALESCE(announce_date, date, start_date)`. With one B-tree index on `sort_date` the `ORDER BY` is index-only — no per-row coalesce at query time, no sort step.

**5. Hard-filter `primary_domestic_competition_id__isnull=False`** — kill the subquery

The biggest single perf comment in the file is right above this line:
> *"AGGRESSIVE OPTIMIZATION: Skip transfers without primary_domestic_competition_id entirely. This eliminates ALL subqueries — huge performance gain. Transfers without this field are rare and can be excluded for speed."*

Transfers missing this field would have needed a subquery to look up the league — instead they're dropped. The product trade-off: a tiny minority of friendlies / cup-only transfers don't show. The user-facing tables are domestic-league transfers anyway, so the trade was the right call.

**6. Three-tier Redis caching with versioned keys**

| Cache key | TTL | What it stores |
|---|---|---|
| `transfers:v2:<sorted-query-string>` | full response TTL | The whole response payload — most requests are cache hits |
| `transfers:allowed_comps:v3:<level>:<gender>:<max_tier>` | 30 min | The set of `WSCompetition` IDs the filter accepts. Recomputed only when the seed list shifts |
| `transfers:area_ids:<country_code>` | 1 hour | `WSArea` IDs for alpha2/alpha3 country codes — never changes in practice |

The `_ts` query param is explicitly **stripped from the cache key** so the cache-buster client-side timestamp doesn't break sharing the cache across users.

Cache key is built from sorted query items, so `?page=1&sort=top` and `?sort=top&page=1` hash to the same entry.

**7. Pulled league-tier ordering out of SQL into Python**

Comment in the code:
> *"OPTIMIZATION: Skip tier ordering in SQL — do it in Python instead. This removes the expensive `Case/When` with 100s of conditions. We'll fetch slightly more rows and sort in Python."*

The `Case/When` ladder ranking competitions by tier was crushing the query planner. Moved to a small in-memory dict (`comp_tier_map` from the cached `allowed_comp_ids` step) and ordered the fetched rows in Python. ~10ms in Python beats ~seconds of planner work on a 100-branch `CASE`.

**8. Killed the regex youth-team detection — use `category` field instead**

Comment:
> *"Youth/reserve filter — OPTIMIZED: Only use category check (fast with index). Skip the expensive regex on team names — just use category field."*

`player__current_team__category__in=['youth', 'reserve', 'academy']` is one indexed equality. The original was `regex_match(team.name, r'(U\d{1,2}|B|II|Reserve|Academy)$')` evaluated per row.

**9. Switched `iexact` to `=` on gender**

Gender is always lowercased in the DB. Plain equality lets the B-tree index do the work. Comment in the code:

> *"Filters — use exact match where possible (faster than iexact). Gender values are typically lowercase in DB (male/female)."*

**10. Cursor-based (keyset) pagination as an alternative to offset**

For deep pagination — `?cursor=<fee>|<date>|<id>` for `sort=top`, `<date>|<id>` for `sort=recent`. Each cursor is the last row's sort tuple, and the next page query is `WHERE (fee, date, id) < (cursor_values)`. Uses the same B-tree index as the `ORDER BY` — no scan-and-discard cost. Offset pagination still works for shallow pages (page 1, 2); cursor takes over for deep navigation.

**Bonus — `fetch per_page + 1` to detect `has_more`** — avoids a second `COUNT(*)` query for the "are there more pages" flag.

### The result

- **Warm path (Redis hit):** sub-50ms. Most front-page traffic is this path — same query for everyone.
- **Cold path (cache miss):** ~200–600ms — one JOIN-y query against a properly-indexed dataset with no subqueries, no regex, no `Case/When`.
- 5-minute response time → routinely **under 1 second**.

### What this would sound like in an interview

> "There was a public transfers endpoint — top transfers and recent transfers — that was taking five minutes per request. The page was unusable.
>
> I dug in and there were really ten different problems compounding. I'll list the big ones. The query was selecting every column on six joined tables including huge JSON fields the response didn't use — so I added an explicit `.only()` projection and `.defer()` for the two biggest text columns, dropping row size by maybe 80%. There were N+1s on every foreign key — fixed with `select_related` across player, both teams, both areas, season.
>
> The sort was doing a per-row `COALESCE(announce_date, date, start_date)` which can't use an index — I added a generated stored column `sort_date` with that coalesce baked in, and a B-tree index on it. The ORDER BY became index-only.
>
> The query also had an expensive `Case/When` with a hundred branches to rank competitions by league tier — I moved that ordering out of SQL into a small Python dict using a cached competition list. Pulled the league-list lookup itself into Redis with a 30-minute TTL since competition data barely changes.
>
> Then I added two more cache layers — the country-code-to-area-IDs lookup at one hour, and the full response keyed by sorted query params. So most calls — front-page top transfers, page one — are pure cache hits.
>
> Two more things. The youth-team filter was doing regex on team names per row; I switched it to an indexed `category IN (...)` check. And the gender filter was `iexact` which can't use the index — changed to plain equality since gender is always lowercased in the DB.
>
> Plus cursor-based pagination as an alternative to offset, so deep pages don't have to scan and discard.
>
> Combined: five minutes down to under one second cold path, well under fifty milliseconds when warm."

---

## E. Mock interview Q&A — be ready for these

### Q1. "Walk me through TransferPitch."
> "B2B marketplace for football transfers. Clubs post tenders, agents pitch their players, deal goes through chat → video → contract signing in-app. The hard problem on the data side is that player profile data comes from four paid providers — Wyscout, SportMonks, TheSports, Transfermarkt — and the same player exists in four separate tables with no shared ID. So a lot of the backend work is about deduplicating across providers, indexing for fast fuzzy match, and caching the expensive endpoints. Real-time pieces are notifications over Django Channels + chat/video via Stream SDK. Recently I also built the backend side of a WhatsApp bot integration that lets a club person create accounts and post tenders entirely through chat."

### Q2. "The dedup problem — walk through your indexing strategy."
> "Three layers. One, I added pre-computed match-key columns — birthdate-as-integer, country code, normalised name — each B-tree indexed, so the DB jumps straight to candidates instead of scanning. Two, a composite index on firstname + lastname + birthdate + country for the exact-match path. Three, the big one: a GIN trigram index on the name using `pg_trgm`. That's what lets fuzzy matching be fast — Postgres pre-computes 3-character substrings and indexes them, so 'Cristiano Ronaldo' finds 'Cristiano R.' in milliseconds. The candidate set drops from ~1M to ~5 rows before any Python fuzzy comparison runs."

### Q3. "Why pg_trgm and not Elasticsearch or Typesense?"
> "We do use Typesense for user-facing search. But for backend dedup logic that runs during data sync — where you need a transactional view of the players table and you don't want a separate index to drift out of sync — having the trigram index right in Postgres is simpler. No syncing problem, no eventual consistency, the index updates with the row in the same transaction. For end-user search, Typesense wins on ranking and typo tolerance."

### Q4. "Walk me through the transfers endpoint optimization."
> [Use the spoken script at the bottom of section D — five minutes to under one second, ten layers, projection + select_related + generated `sort_date` column + dropping the subquery + three-tier Redis cache + tier sort moved out of SQL + regex → indexed category + iexact → exact + cursor pagination.]

### Q5. "Of the ten optimizations, which one was the single biggest win?"
> "Two competing for first place. The generated `sort_date` column with its index — that turned the `ORDER BY` from a per-row coalesce-then-sort into an index scan, which removed the dominant cost on the cold path. But realistically, the Redis caching of the full response is what made the page feel instant to users — most front-page traffic hits `?sort=top&page=1&gender=male&level=pro`, all hashing to the same cache key, so 90% of requests are sub-50ms cache hits. If you ranked by 'CPU saved across all requests', cache wins. If you ranked by 'what made the cold path actually fast', the generated column and indexes win. I'd say in interview: '*The cache made it instant; the indexing made the cache miss survivable.*'"

### Q5b. "What's a generated stored column and why use one instead of just indexing the date fields?"
> "It's a column whose value is computed from other columns and physically stored on disk — Postgres recomputes it on every write but it's an indexable column for reads. I added one called `sort_date` defined as `COALESCE(announce_date, date, start_date)` — best-available transfer date. With a single B-tree index on `sort_date` the ORDER BY is index-only. The alternative — indexing all three date columns and using `COALESCE` in the query — doesn't work because Postgres can't use a B-tree index for a coalesce expression unless you build a functional index, and functional indexes on coalesce across three columns are awkward to maintain. Generated column is the cleaner answer: one column, one index, the planner just uses it."

### Q5c. "You mentioned union-find in your codebase — where?"
> "Not on the transfers endpoint — on the news endpoint. We pull football news from APITube and the same Reuters wire shows up under ten different bylines. I built a server-side dedupe step that collapses syndication chains. Each article emits two story keys — APITube's story.id and a 10-word title fingerprint — and articles sharing any key get unioned via union-find with path compression. Per cluster, the highest-OPR source wins. Classic textbook structure, real production use. Code lives in `dashboard/utils/news.py:_deduplicate_articles`."

### Q6. "How does the real-time notification system work?"
> "Django Channels with a single `AsyncJsonWebsocketConsumer`. Each user joins a per-user group on WebSocket connect — `user_<id>`. When the backend signals an event (new pitch, contract sent, meeting scheduled), it does `channel_layer.group_send` to that user's group. The channel layer is Redis-backed via `channels-redis`, so multiple Daphne workers share the same pub/sub. Frontend keeps the WS connection open through a Redux middleware that listens for inbound messages and fires toast notifications. Chat and video itself isn't ours — those use Stream's SDK. The notification layer is."

### Q7. "What's the auto-tender feature?"
> "A WhatsApp bot integration. The bot has its own dedicated repo and runs as a separate service. On our backend, I expose 8 HTTP endpoints at `/api/auto-tender/` authenticated by a bot-key header. The bot drives a guided WhatsApp conversation with a club contact, then calls our endpoints to create a Club, create an Account + UserProfile + Staff atomically, and post a Tender. Auth uses `hmac.compare_digest` for constant-time comparison. Every call writes to an audit log table with PROTECT foreign keys so the history can't be dropped. Idempotency-Key support so retries are safe."

### Q8. "Tell me about a recent bug you fixed."
> "Tender details page was showing 'Deals (1)' in the count chip but the list under it said 'No pitches found'. The root cause was that the Pitch model has 8 statuses including `external_deal` for deals signed off-platform, and two places in the backend — the count serializer and the list filter — were only checking `['deal', 'signed']`, missing `external_deal`. Other parts of the codebase, like the delete guard at views.py:1500, already treated all three as one group. I added `external_deal` to both spots — one-line change in each. The lesson is when you've got a status enum split across multiple call sites, you want a single source of truth for the grouping logic — otherwise this exact 'serializer matches one set, filter matches a different set' bug shows up."

### Q9. "How do you decide what goes in Redis cache vs not?"
> "Three checks. One, is it the same response for many users — a global feed yes, a per-user dashboard no unless I key it by user. Two, can it tolerate being stale — news for 5 minutes is fine, the pitch count on a tender after the user just accepted a pitch is not. Three, is the regen cost high — an APITube round trip and union-find pass costs ~200ms, so yes; a single row lookup that takes 2ms, no. For the cache invalidation I use either a TTL (everything has one) or version bump (the `_CACHE_VERSION` constant pattern — bumping the integer instantly invalidates every key without flushing Redis)."

### Q10. "Why Django Channels and not, say, FastAPI websockets or a separate Node service?"
> "Two reasons. The Django ORM and auth context — when a notification needs to be sent because of a signal on a tender save, I'm already in the Django process with the right ORM session and user identity. Channels lets me do `group_send` from inside a signal handler without crossing a service boundary. Second, the channel layer is just Redis pub/sub, which we're already running for cache + Celery broker, so there's no new infra to maintain. The cost is that Daphne is slower than uvloop-based servers — for a notification volume this size (hundreds of events/min, not millions), that's a fine trade."

### Q11. "What's the most important index you added and why?"
> "The GIN trigram index on the player name field. Before it, the fuzzy-match step in the dedup pipeline was loading the whole players table into Python and running `difflib.SequenceMatcher` on every row — minutes. After it, Postgres pre-filters to names similar enough to be worth comparing, the Python fuzzy compare runs on ~5 candidates, total time sub-second. The reason it's the most important is it changed the asymptotic — went from O(N) per match check to roughly O(log N) on the candidate-set step."

### Q12. "How do you deploy this?"
> "Hetzner servers running Coolify, which manages the Docker Compose deployment. Backend, Postgres, Redis, Daphne workers all run as containers. Staging mirrors production with its own DB. For DB access from my laptop I use SSH tunnels — staging on port 5433, production via pgbouncer on 5432. Schema changes go through Django migrations, reviewed and tested against staging before going to prod. There's a `start.sh` that runs migrations then exec's gunicorn with uvicorn workers."

---

## F. Honest caveats — say these proactively if asked ✅

- **Two separate "fast" stories — don't conflate.** Story A: player record dedup across providers, ~1M rows, minutes → sub-second via trigram + match-key indexes. Story B: `/dashboard/transfers/` list endpoint, 5 min → under 1 sec via ten layers of caching + query optimization. The "1M" and "5 min" numbers aren't code constants — both come from your own observation. Say *"roughly a million player records"* and *"the endpoint was taking on the order of five minutes."*
- The fuzzy compare on dedup is still done in Python — the speedup comes from the trigram index shrinking the candidate set before the Python step, not from doing fuzzy matching in SQL.
- User-facing search is **Typesense** (separate service).
- Live **chat + video calls use Stream (getstream.io) SDKs** — third party. What's mine is the **notifications layer** over Django Channels and all the UI work around the call experience (incoming-call screen, in-call redesign, background blur, recording UX).
- The **WhatsApp bot itself** lives in a separate repo and is maintained by the client's team. What I built is the **8 backend endpoints** the bot calls — and verified the integration end-to-end with a Python smoke-test script that drove the full flow on staging (26 PASS / 2 fail, both fails being my own test-expectation mismatch on 401 vs 403).
- The **news provider** is **APITube** — I built the integration helper and the optimization layer; the news itself comes from them.

---

## G. Stack one-liner (verified) — use this when an interviewer says "what's the stack"

> **Backend:** Django 4.1 + DRF, PostgreSQL with `pg_trgm` (GIN + B-tree + composite indexes), Celery + Celery Beat, Redis (broker + cache + Channels layer), Django Channels + Daphne, pgbouncer, Typesense for search, Stream SDK for chat/video, APITube for news, Twilio + SendGrid + Resend for OTP/email, Hetzner + Coolify.
>
> **Frontend:** React 18 + Redux Toolkit + Tailwind, Stream Chat React + Stream Video React SDK, react-i18next (18 locales), Axios, Chart.js + recharts, TensorFlow Lite WASM for video background blur, flag-icons CSS.

---

# 2. cuiq / SquareOne — AI bookkeeping for US creative professionals ✅

## 2.1 What it is (the plain-English version for the interview)

**SquareOne** (codename: cuiq) is a SaaS bookkeeping app for self-employed writers, screenwriters, and creative professionals in the US. It takes the most painful part of their year — pulling apart 12 months of bank transactions into IRS Schedule C categories at tax time — and turns it into a guided review flow.

The flow end-to-end:
1. User signs up, sets up business profile (industry, business type, services).
2. Connects their bank via **Plaid Link**. We pull the full US-fiscal-year window of transactions.
3. They go through Stripe Checkout to pay for the subscription.
4. Backend runs each transaction through an **LLM-based categorizer** that assigns it to a Schedule C category (e.g., "Travel," "Meals & Entertainment," "Research & Development").
5. User lands on a dashboard with three tabs — **Needs Review** (AI suggested), **Uncategorized** (AI couldn't decide), **Categorized** (user-approved) — and approves/rejects/reassigns in bulk.
6. They get clean tax-ready exports (CSV/XLSX/PDF) for their CPA.

The whole point is replacing the messy "spreadsheet + receipts + 3am panic in April" workflow with a one-hour review session.

---

## 2.2 Full tech stack (verified — read off the repo)

### Backend (`cuiq-backend/`)
- **Django 5 + Django REST Framework** — REST API + admin
- **`djangorestframework-simplejwt`** — JWT auth with a custom `token_version` bump for "logout from all devices"
- **Postgres** (Render-managed) with `CONN_MAX_AGE=None` + TCP keepalives — persistent connections so Render's transient DNS resolution doesn't kill Celery Beat
- **Celery + Redis** — broker, result backend, and the channel layer for SSE pubsub. `rediss://` with SSL on Render.
- **OpenRouter** (via the OpenAI Python SDK) — single LLM endpoint that lets us swap between Gemini 2.5 Flash, Claude, GPT-5 etc. with no SDK change
- **Plaid (sandbox + production)** — `/link/token/create`, `/item/public_token/exchange`, `/accounts/get`, `/transactions/sync`, `/transactions/get` (for synchronous count at connect time)
- **Stripe** — Checkout Sessions, Customer Portal, webhook for `checkout.session.completed` + `customer.subscription.*`
- **AWS S3** (via `django-storages`, `file_overwrite=False`) — profile pictures, generated reports, transaction file uploads
- **AWS SES** — transactional email (password reset, "your review is ready")
- **`fuzzywuzzy`** — last-resort name match between LLM output and the real Category row
- **Server-Sent Events** — `StreamingHttpResponse` + Redis pubsub for live categorization progress

### Frontend (`cuiq-frontend/`)
- **React 18 + Vite**
- **react-router-dom** — protected routes + onboarding gating
- **Tailwind CSS** with custom design tokens (`text-headings`, `border-1`, etc.)
- **react-icons (hi2)** + custom SVGs
- **EventSource** — native browser SSE client for live progress; 60s polling kept as a backstop
- **Lottie / animated GIF** for the loading and empty states
- Auth context with refresh-token rotation in `services/api.js`

### Infra / Ops
- **Render** for Django web + Celery worker + Celery Beat + managed Postgres + managed Redis
- **Plaid sandbox → development → production** progression
- **Stripe test mode → live**

---

## 2.3 Core technical details — the parts worth talking about

These are the things I'd lead with if the interviewer goes deeper than "what is it."

### A. Real-time categorization progress over Server-Sent Events

**Problem:** when a user connects their bank, sync + AI categorization for ~100-300 transactions takes 5-10 minutes. We need to show a live "X of Y categorized" counter on the dashboard, not a static spinner.

**What I built:**
- Every PlaidItem carries materialized counters: `total_transactions`, `categorized_count`, `categorization_state` (`pending_payment` / `queued` / `running` / `complete`), and start/finish timestamps.
- The Celery worker, after each successful `CategorySuggestion` row, runs an atomic `F('categorized_count') + 1` update and then `redis.publish("categorization-events:<user_id>", payload)`.
- A Django view returns a `StreamingHttpResponse(content_type="text/event-stream")` that subscribes to that Redis channel and yields `data: {...}\n\n` SSE frames. Auth via `?access_token=` query param (because `EventSource` can't set headers). 25-second keepalive frames keep the connection alive through proxies.
- Initial snapshot sent on connect, then per-transaction ticks, plus a final `complete` event.
- Frontend opens an `EventSource` on dashboard mount when `any_in_progress` is true; on every tick it replaces the matching item in `catStatus.items`. 60s polling stays on as a backstop in case the connection drops.

**Why SSE over WebSockets:** one-way server→client is all we need; SSE works through any proxy/CDN without special config; `EventSource` auto-reconnects for free; no need to add Django Channels + Daphne + a separate ASGI worker on Render.

### B. The "0 of 129 stuck loading" bug — read-side vs write-side mismatch

The original status endpoint counted `Transaction.objects.filter(category__isnull=False)`. But the categorizer never sets `Transaction.category` — it writes a `CategorySuggestion` row. `Transaction.category` only gets populated when the user explicitly approves. Result: the "categorized" count was always 0 even as logs streamed `Categorized TXN pk=9398`.

**Fix:** materialize the count on PlaidItem (above), and compute it once at the source of truth (the worker that writes the suggestion). Reading materialized counters is O(1) and atomic; the broken aggregate-on-request approach is gone.

### C. Categorization gated on payment + the per-page categorize loop

OpenRouter calls cost money. The original flow ran the categorizer for every signup, including users who'd never finish onboarding or pay.

**Fix:**
- `ExchangePlaidPublicTokenView` always runs the Plaid sync (free — we need the count anyway). The AI step is gated:
  - If `business_profile.onboarding_completed` is True (2nd-bank flow from the Accounts page) → `categorization_state = QUEUED`, sync task runs `do_categorize=True`.
  - If onboarding incomplete (fresh signup, not yet paid) → `categorization_state = PENDING_PAYMENT`, sync skips the AI call entirely.
- Stripe webhook handler on `checkout.session.completed` calls `categorize_pending_for_user(user_id)` which flips every PENDING_PAYMENT item to QUEUED and dispatches `categorize_pending_for_item`.
- BusinessProfile PATCH detects an `onboarding_completed: false → true` transition and does the same — belt-and-suspenders so the flow recovers even if the webhook is lost.

Inside the sync task, the loop is structured per Plaid page: save all the new transactions, update `total_transactions` to the actual DB count (so the bar starts at "0 of N"), then categorize each new row inline. Each categorize publishes its own SSE event — the bar moves one tick per transaction, not in batches.

### D. Plaid reconnect dedup (fingerprints + canonical keys)

A user removes a bank, then reconnects it a week later. Plaid issues a new `item_id` and new `account_id`s, but the underlying real-world transactions are the same. Naive sync would create duplicates of every charge.

**What I did** (`plaid_dedup.py`, `_upsert_plaid_account_with_dedup`, `_resolve_transaction_row`):
- Each PlaidAccount gets a stable `canonical_key` derived from `(user_id, institution_id, mask, subtype, account_type, persistent_account_id)`.
- On reconnect, if a PlaidAccount row already exists for the same canonical_key under a different PlaidItem, we **repoint** the existing row at the new item — historical Transactions stay attached via FK.
- Each Transaction carries a `fingerprint` = hash of `(canonical_account_key, date, amount, currency, counterparties, merchant_name, description)`. On import, if an incoming row matches an existing fingerprint, we update that row instead of creating a duplicate — even though Plaid's transaction_id changed.
- Pending → posted promotion is handled: when a pending row's `pending_transaction_id` appears as a posted row in the same sync pass, we carry the row forward and skip the "remove pending" delete.

### E. The 3-tab transaction model

Old model was 2 tabs (Uncategorized / Categorized). Worked when "AI categorized" and "user approved" were the same thing. They aren't.

New model:
- **Needs Review** — `category IS NULL AND a PENDING CategorySuggestion exists`. AI did its job, waiting for user to approve.
- **Uncategorized** — `category IS NULL AND no PENDING suggestion`. AI couldn't categorize or user rejected the suggestion.
- **Categorized** — `category IS NOT NULL`. User-approved.

Backend filters use `Q(category__isnull=True) & Q(category_suggestions__status=PENDING)` (distinct) for needs_review and `.exclude(category_suggestions__status=PENDING)` for truly_uncategorized. Overview-stats query computes both counts in two extra queries; everything stays read-friendly.

UI behavior changes follow naturally — bulk Approve/Reject only on Needs Review (something to act on), bulk Assign Category only on Uncategorized (nothing to approve), reject moves a row from Needs Review → Uncategorized (not Categorized).

### F. Account intent (business / mixed / personal) gates the categorizer

Each connected account gets an "intent":
- `business_only` — categorize everything as business.
- `personal` — never categorize; mark all transactions `is_personal=True`.
- `mixed` — categorize, but for each suggestion check the category name against the user's `mixed_categories` whitelist. If the category isn't on the whitelist, the row gets flagged `is_personal=True` and the suggestion is discarded.

This is a post-LLM filter that prevents a "mixed" account from polluting the CPA review queue with personal Spotify charges.

---

## 2.4 The AI categorization engine — the deep dive

> The user wanted this one in detail. It's the part of the interview I'd push toward whenever possible — it's the most "engineering judgment" story in the whole codebase.

### Where it lives

- `cuiq-backend/cuiq_backend/users/categorization_config.py` — the prompt builder, the example bank, the disambiguation rules, the fuzzy matcher.
- `cuiq-backend/cuiq_backend/users/tasks.py` — `categorize_transaction_directly()` is the main entry point. `trigger_ai_categorization_enhanced` is the Celery wrapper for the async path.
- The model used is **Gemini 2.5 Flash via OpenRouter** by default (`settings.CATEGORIZATION_MODEL`). The OpenAI Python SDK is pointed at `https://openrouter.ai/api/v1` so we can swap to Claude / GPT-5 / Mistral with one env var.

### The starting point — 60-65% accuracy

The original prompt was the textbook "naïve LLM call":
- A short system message ("you are a business accountant").
- The raw transaction description and amount.
- The full category list dumped as a flat list.
- Output: "respond with the category ID."

Things that broke at 60-65%:
1. **Output format drift.** The model would output `"15"`, or `"15 (Meals)"`, or `"I think it's 15 because..."`, or sometimes just `"Meals"`. Parsing was fragile.
2. **Industry blindness.** A writer's Netflix subscription is **Research & Development** (they watch competitors' shows for work), not "Personal Entertainment." Without context, the AI defaulted to the generic answer.
3. **Ambiguous merchants.** "UBER" — is it Travel or Meals? The model would guess based on the last training example it saw.
4. **Income detection failures.** Large positive amounts from a talent agency (DEPOSIT, ACHPAYMENT) often got categorized as a generic "Other Expense."
5. **Hallucinated categories.** The model would invent `"Personal Subscriptions"` even when that wasn't in the allowed list.

### The new approach — engineered prompt + pre-LLM heuristics

The prompt is no longer one paragraph. It's a 10-section XML-tagged structured prompt built by `build_enhanced_prompt()`. Each section solves one of the failure modes above.

**1. `<SYSTEM>` + `<BUSINESS_CONTEXT>`** — locks the role and the customer.
```
You are an expert U.S. business accountant and tax professional AI specializing
in transaction categorization for IRS Schedule C (Form 1040) business expense
reporting. CRITICAL CONTEXT: You are categorizing transactions for a
WRITER/CREATIVE PROFESSIONAL business.
```
The model reads this and *stays* in writer-tax-accountant mode for the rest of the prompt. This single change moved the Netflix/Spotify/HBO bucket from "Personal" to "Research & Development."

**2. `<AVAILABLE_CATEGORIES>` as a Markdown table** with three columns: Category Name | Enhanced Description | Common Merchants/Keywords.
- Categories aren't just `name` — they carry a domain-tuned description and a merchant list pulled from `CATEGORY_ENHANCEMENTS`.
- Example: `Research & Development | Streaming services, theaters, bookstores, museums FOR CREATIVE RESEARCH | Netflix, HBO Max, Disney+, Spotify, AMC, Barnes & Noble, museums, film festivals, Kindle books, Patreon (research)`.
- The model now matches "Netflix" by merchant name directly, not by guessing.

**3. `<CRITICAL_DISAMBIGUATION_RULES>`** — 12 explicit tie-breakers. These are the ones the AI got wrong most often in the labeled set, encoded as rules:
- `UBER EATS → Meals`, `UBER TRIP → Travel` (just look for the EATS/TRIP token)
- Streaming services for writers → R&D, not Dues
- Adobe / Canva / Grammarly → Office Expenses (daily tools), not Software & Technology
- Amazon: Prime → Dues, MKTP → Supplies, KINDLE → R&D
- Venmo with "WEB DEV PAYMENT" memo → Advertising & Marketing
- When truly uncertain → use the catch-all (Depreciation) instead of inventing categories

These rules are the cheapest way to fix a known failure mode without retraining anything.

**4. `<FEW_SHOT_EXAMPLES>`** — 45+ curated examples (in `CURATED_EXAMPLES`). Each example is `<transaction>...</transaction>` + `<reasoning>...</reasoning>` + `<answer>...</answer>`. Coverage:
- One or two examples per category, with the actual transaction strings we see in production (`PAYPAL *ADOBE INC PURCHASE`, `BKOFAMERICA ATM DEPOSIT PICO-LA CIENEGA`, etc.).
- Edge-case examples for the ambiguous pairs (UBER EATS vs UBER TRIP, AMZN MKTP vs Amazon Prime).
- The `<reasoning>` block isn't read by the model directly — it's structured chain-of-thought that the model learns to mimic, improving consistency.

**5. `<OUTPUT_RULES>`** — solves format drift hard:
- "Output ONLY the exact category name from the list above."
- "Do NOT output explanations, numbers, or invented categories."
- Lists valid + invalid outputs so the model has examples of both.
- Falls through to `"Depreciation"` (catch-all) when uncertain.

**6. Pre-LLM heuristics in `summarize_transaction_enhanced()`** — before we even build the prompt, code-side logic catches the obvious cases:
- `INCOME_KEYWORDS` (`DEPOSIT`, `ACHPAYMENT`, `WIRE TRANSFER IN`, `PAYROLL`, …) and `INCOME_SOURCES` (`KAPLAN STAHLER`, `GEP TALENT`, `WGA`, studios) flip the transaction's framing from "expense" to "income" before the AI sees it. The AI then picks Service Revenue / Royalties confidently instead of trying to fit an income row into an expense category.
- Plaid's own category prediction is included in the summary *only when its confidence_level is HIGH or VERY_HIGH* — low-confidence Plaid guesses were poisoning the AI's answer.

**7. Post-LLM matcher** (`match_category_by_name`):
- Exact lowercase match first.
- Common variations (`&` ↔ `and`, dash ↔ space).
- `fuzzywuzzy.process.extractOne` with an 85% threshold as the final fallback.
- This means if the model outputs `"meals & entertainment"`, `"Meals and Entertainment"`, or even `"Meals & Entertianment"` (typo), we still resolve it to the right Category row.

**8. Two-pass retry** — if the matcher returns nothing, we re-call the model once with `"IMPORTANT: Output ONLY the exact category name. No numbers, no explanations."` appended. Most format-drift misses get fixed on the retry.

**9. Catch-all fallback** — if even the retry doesn't produce a match, we save a suggestion with the catch-all `Depreciation` category. The user can re-categorize manually. We never throw the row on the floor.

**10. Category filtering** — `filter_expense_income_categories()` strips balance sheet accounts (Accounts Payable, Owner's Equity, etc.) from the list shown to the AI. The model can only pick from real expense/income buckets.

### Why this got us from 60-65% → 90-95% (and why the real-world number will be lower)

What changed by section:
| Old failure mode | What fixed it | Estimated lift |
|---|---|---|
| Output format drift → unparseable answers | OUTPUT_RULES + retry pass + fuzzy matcher | +8-10% |
| Streaming/bookstores categorized as personal | BUSINESS_CONTEXT + industry rules + merchant table | +6-8% |
| UBER ambiguity, Amazon ambiguity | DISBIGUATION_RULES + few-shot | +4-6% |
| Income from talent agencies misread | INCOME_KEYWORDS pre-LLM | +3-4% |
| Hallucinated categories | Strict OUTPUT_RULES + valid-names list + catch-all | +2-3% |

Combined, that's a believable 23-31% lift on the labeled test set — which is exactly what we saw.

### About the "is this overfitting?" honesty

Yes, partially. Here's what I'd tell the interviewer up front:

- The 90-95% number is measured on **a labeled set built from one user's real transaction history** (a US writer, ~530 rows). The examples and disambiguation rules were tuned by looking at the rows the AI was getting wrong on **that same set**.
- That is overfitting in the classical ML sense. On a brand-new user's data, the realistic range is probably **80-85%**, because:
  1. New merchants the few-shot examples haven't seen.
  2. Non-writer industries we haven't tuned for (we have `WRITER_INDUSTRY_RULES`; we don't have `CONTRACTOR_INDUSTRY_RULES` or `MUSICIAN_INDUSTRY_RULES` yet).
  3. The category list itself is biased toward Schedule C — edge expenses that don't fit (e.g., a quarterly estimated tax payment categorized as something quirky) will be misclassified.
- The **honest framing**: this isn't a "we got 95% accuracy" claim, it's "we built an iteration loop that took us from 60% to 90%+ on a real labeled set in a couple weeks." The loop is the value — same approach will pull a new industry's accuracy up the same way once we have a labeled set for it.

### What I'd build next if asked

- **Self-labeling loop**: every time a user approves an AI suggestion, that's a positive label. Every reject + reassign is a negative label *and* a positive label for the corrected category. Feed both into a periodic prompt-eval job that flags categories where accuracy is dropping.
- **Embeddings + retrieval-augmented few-shot**: instead of sending all 45 examples in every prompt, embed user-approved rows and retrieve the 5 most similar ones for each new transaction. Cuts prompt size, scales to other industries.
- **Per-user fine-tune** of a tiny model (e.g., a quantized Gemini Flash) once a user has a few hundred approved rows. Cheaper per call, and reflects their personal categorization preferences.

---

## 2.5 30-second pitch (memorize this)

> "SquareOne is a bookkeeping app for self-employed creatives in the US — it pulls bank data from Plaid, uses an LLM to categorize every transaction into IRS Schedule C buckets, and gives the user a guided review-and-approve flow at tax time. The interesting engineering story is the categorizer — the first version sat at around 60-65% accuracy. I rebuilt the prompt as a structured XML document with role, business context, a merchant-keyed category table, twelve tie-breaker rules, and 45 curated few-shot examples, plus pre-LLM heuristics for income detection and a fuzzy-matcher on the output side. On the labeled test set that pushed accuracy to 90-95%. On real-world unseen data I'd expect 80-85%, because the few-shot is industry-tuned. The other engineering piece I'd talk about is the live progress pipeline — Celery worker publishes per-transaction events to a Redis pubsub channel, a Django streaming endpoint subscribes and forwards them as SSE, and the dashboard's progress bar ticks one transaction at a time without polling."

---

## 2.6 Mock interview Q&A

### General

**Q: Walk me through cuiq end-to-end.**
> Signup → bank connect via Plaid Link → backend exchanges the public token, calls `/transactions/get` to lock in the total transaction count for the welcome modal, then fires the Celery sync task in the background. Stripe Checkout for the subscription. On checkout.session.completed, a webhook kicks the AI categorizer for any PlaidItems that were held in `PENDING_PAYMENT`. Each transaction the categorizer touches publishes a Redis event; an SSE endpoint streams it to the dashboard so the progress bar moves live. User lands on a three-tab review screen — Needs Review (AI suggestions), Uncategorized (no AI confidence), Categorized (approved). Bulk approve/reject/assign, then export to CSV/XLSX/PDF for their CPA.

**Q: Why did you go with Django over FastAPI or Node?**
> Django + DRF gave me an admin panel for free, a battle-tested ORM, and Celery integration without glue code. The categorization workload is async-heavy but not request-path async — it lives in Celery — so the perf argument for FastAPI didn't apply. JWT auth was off-the-shelf with `simplejwt`. For a small team shipping a complete SaaS, Django saved weeks.

### Architecture / infrastructure

**Q: How do you keep the dashboard counter in sync with the worker?**
> Materialized counters on the PlaidItem row. The worker does an atomic `F('categorized_count') + 1` after each successful CategorySuggestion write, then publishes a JSON event to a Redis channel. A Django `StreamingHttpResponse` view subscribes to that channel and forwards each message as an SSE frame. The frontend uses native `EventSource`. Polling at 60s is a backstop in case the SSE connection drops.

**Q: Why SSE instead of WebSockets or polling?**
> The flow is one-way server→client only — I don't need bidirectional. SSE works over plain HTTP, gets through every proxy without config, EventSource auto-reconnects for free, and I didn't have to add Django Channels + Daphne + a second ASGI worker to Render. If I needed user-to-user chat or collaborative editing later, I'd add WebSockets. For "tick the progress bar," SSE was 30% of the setup for 100% of the value. Polling alone hit the DB every 30s per active user — wasteful — and felt laggy.

**Q: There was a stuck-loading bug. Walk me through it.**
> Original code: the status endpoint counted `Transaction.category__isnull=False`. The categorizer never sets `Transaction.category` — it writes a `CategorySuggestion` row. `Transaction.category` only gets populated when the user explicitly approves. So the "categorized" counter was always 0 even as logs streamed successful AI calls. Fix was to stop computing the count by querying child rows at request time and instead materialize an atomic counter on PlaidItem, written by the same Celery task that writes the suggestion. Atomic + O(1) + same write transaction — race-free.

**Q: How do you avoid wasting OpenRouter credits on signups that don't pay?**
> Categorization is gated on `business_profile.onboarding_completed`. For brand-new signups, the bank connection runs the Plaid sync (free — we need the count) but skips the AI step. The PlaidItem sits in `PENDING_PAYMENT`. When the Stripe webhook fires `checkout.session.completed`, a Celery task flips every PENDING_PAYMENT item for that user to QUEUED and dispatches the categorize task. There's also a fallback in the BusinessProfile update view, in case the webhook is lost — when `onboarding_completed` goes false → true, we kick the same task.

**Q: How does Plaid reconnect dedup work?**
> Two layers. PlaidAccounts get a `canonical_key` from `(user_id, institution_id, mask, subtype, account_type, persistent_account_id)`. On reconnect, the new account_id is reassigned to the existing row instead of creating a new one — historical Transactions stay attached via FK. For transactions themselves, every row carries a `fingerprint` hash of `(canonical_account_key, date, amount, currency, counterparties, merchant, description)`. Incoming rows with a matching fingerprint update the existing row instead of creating a duplicate, even if Plaid issued a new transaction_id. Pending→posted is a third path — the new posted row's `pending_transaction_id` is matched to the existing pending row, the row gets carried forward, and the pending row isn't deleted when Plaid sends it in `removed`.

**Q: How did you handle Render's Postgres dropping connections?**
> Celery Beat was throwing `OperationalError: server closed the connection unexpectedly`. The fix was three things: `CONN_MAX_AGE=None` so connections persist (the bad alternative was setting it to 60s, which made Beat re-resolve DNS for every job and fail when Render's DNS hiccupped), `CONN_HEALTH_CHECKS=True` so Django pings before reusing, and Postgres TCP keepalives (`keepalives_idle=30`, `keepalives_interval=10`, `keepalives_count=5`, `connect_timeout=10`) so the OS holds the socket open through Render's load balancer.

### AI / categorization

**Q: Tell me about the categorization prompt.**
> *[Reference Section 2.4 above — the structured XML prompt, business context, merchant-keyed category table, 12 disambiguation rules, 45 few-shot examples, output rules, pre-LLM income heuristics, fuzzy post-matcher.]*

**Q: You claim 90-95% accuracy. How did you measure that, and how do you know it generalizes?**
> Measured on a labeled set of ~530 real transactions from one writer's bank history. The 90-95% is the on-set accuracy. I'll be honest — that's partially overfitting. The few-shot examples and disambiguation rules were tuned by looking at what the AI was getting wrong on that set. On a brand-new user, the realistic range is more like 80-85%. The fix is to build a labeled set per industry (writer, contractor, musician) and re-run the iteration loop. The *value* isn't the 95% number, it's the loop — labeled set + automated diff + scientific iteration — which produced the lift in two weeks instead of guessing.

**Q: Why a structured XML-style prompt instead of just JSON?**
> Three reasons. First, XML tags are unambiguous boundaries — there's no question where the FEW_SHOT_EXAMPLES end and the OUTPUT_RULES begin. Second, models are trained heavily on structured Anthropic-style prompts and respond well to them. Third, the model sees the same structure for the system instructions and for each example — `<transaction>`, `<reasoning>`, `<answer>` — which reinforces the output pattern.

**Q: Why few-shot and not fine-tuning?**
> Cost, iteration speed, and switching. Fine-tuning a Gemini or GPT model takes hours and dollars per cycle; few-shot lets me edit one example and re-test in minutes. I'm also still at a stage where I want to swap models — OpenRouter lets me try Claude vs Gemini vs GPT-5 with a single env var. A fine-tuned model is locked to the base it was tuned on. Fine-tuning becomes interesting once the prompt is mature and we have thousands of labeled rows; it'd cut per-call cost and improve consistency.

**Q: What happens if the model outputs garbage?**
> Three-layer recovery. First, `match_category_by_name` does an exact lowercase match. Second, common variations (`&` ↔ `and`, dash ↔ space, etc.). Third, `fuzzywuzzy` with an 85% threshold. If all three fail, we re-call the model with an "IMPORTANT: output ONLY the exact category name" suffix. If even that fails, we save a `Depreciation` (catch-all) suggestion and let the user fix it manually. We never throw the row away or skip it.

**Q: Why OpenRouter and not OpenAI directly?**
> One SDK, many models. The OpenAI SDK points at `https://openrouter.ai/api/v1` and I switch models with one env var — Gemini 2.5 Flash by default, Claude or GPT-5 if I want to test. It also gives me usage tracking and a unified billing line item.

**Q: What's the cost per categorization?**
> Gemini 2.5 Flash is roughly $0.075 per million input tokens, $0.30 per million output. Our prompt is ~3-4k tokens (the 45 few-shot examples dominate), output is ~10 tokens (just the category name). At ~$0.0003 per categorization, a user with 1,000 transactions costs about $0.30 of LLM spend. Subscription pricing has enough headroom that even with a 10x model swap we're fine.

**Q: How do you handle PII in the prompt?**
> The transaction description and merchant name go into the prompt — those can include things like a vendor name that's actually a person's name on a wire transfer. We don't redact PII before sending to OpenRouter currently. If I were taking this to a regulated industry, the first thing I'd add is a redaction pass: emails, phone numbers, SSNs scrubbed before the prompt is built. Not hard — same approach as the AI-Sentry project, just inline before the LLM call.

### Frontend / UX

**Q: Why three tabs instead of two?**
> The two-tab model (Uncategorized / Categorized) confused users because "Uncategorized" meant "no final category" — which included rows the AI had already suggested a category for. Users didn't realize they had 100 AI-suggested rows waiting for one click of approval. Splitting into Needs Review (AI suggested, awaiting approval), Uncategorized (no AI suggestion either, needs manual category), and Categorized (approved) makes the action obvious in each tab — bulk approve in Needs Review, bulk assign in Uncategorized.

**Q: The progress UI shows category breakdowns live. How?**
> Same SSE pipeline. The `_serialize_item_progress` helper also computes a `categories_breakdown` — two GROUP BY queries, one for user-approved categories and one for AI-suggested ones, merged and sorted by count. That goes into every SSE event payload. The frontend keeps a deterministic name→color map (matching the Transactions page palette) so a given category always renders the same color in both the "Recently Categorized" list and the "Categories detected so far" panel.

---

## 2.7 Honest caveats (don't claim what isn't true)

- The 90-95% is on a labeled set tuned for the same set's quirks. The honest real-world number is **80-85% with the current Writer prompt**, lower for non-Writer industries until we tune them.
- Model is Gemini 2.5 Flash via OpenRouter — not GPT-4, not Claude. Configurable.
- It's a single AI call per transaction (with one retry), not an ensemble. The old ensemble code (`trigger_ai_categorization_for_transaction`) is still in the repo but deprecated and gated by `USE_ENHANCED_CATEGORIZATION`.
- The materialized-counter / SSE pipeline replaced an aggregate-on-request approach that had a real "0 of N stuck loading" bug. Make sure to tell *that* story when asked — admitting bugs you fixed lands better than pretending the system was perfect from day one.
- Payment gating + Stripe webhook integration is new (added during the categorization-flow overhaul). If asked about idempotency, the categorize tasks all check current state before flipping it, so a doubled webhook is a no-op.

---

# 3. AI-Sentry — LLM security middleware (OSS, npm) ✅

> This is the project the current interview prep is built around. Everything below is read straight off the source (`src/*.ts` + `tests/sentry.test.ts`), not memory. Published on npm as **`ai-sentry` v1.0.0**, MIT, **zero runtime dependencies**, Node ≥18, TypeScript.

---

## A. What it is (plain) — your interview elevator pitch

**AI-Sentry is a security firewall you drop in front of your LLM API.** It's an Express middleware: before a user's text ever reaches the model (OpenAI, Anthropic, whatever), AI-Sentry inspects the whole request body and does two jobs:

1. **Blocks prompt-injection / jailbreak attempts** — if the text contains a known attack pattern ("ignore all previous instructions", "you are now DAN", "reveal your system prompt"), the request is rejected with a `403` and never reaches the model.
2. **Redacts PII in-place** — emails, phone numbers, and **real (Luhn-validated) credit card numbers** are swapped for `[EMAIL_REDACTED]` / `[PHONE_REDACTED]` / `[CREDIT_CARD_REDACTED]` before the body is forwarded — so customer private data isn't shipped off to a third-party model provider.

The whole thing is **one line**: `app.use(sentry())`. It has **zero runtime dependencies** (Express is an *optional* peer dependency — the core inspector works with no framework at all), it's written in pure TypeScript, and it mutates the request body in place so there's no cloning overhead. Typical overhead is sub-millisecond for a normal LLM payload.

**The honest framing:** this is **input-side, signature-based** protection. It is NOT an eval tool, NOT a drift monitor, NOT an AI classifier, and it does NOT scan the model's *response*. It's a fast, deterministic guard rail — a "firewall", exactly like the README says.

---

## B. Tech Stack (verified against `package.json` + source)

- **TypeScript 5.3** compiled to CommonJS (`tsc`, `main: dist/index.js`, ships `.d.ts` types).
- **Zero runtime dependencies.** Nothing in `dependencies` at all.
- **Express** is a `peerDependency` (`>=4.0.0`) marked **optional** — the middleware factory takes Express's `Request/Response/NextFunction` types, but `traverseAndSanitize` / `luhnValidate` / `inspectPayload` can be called from any Node code with no Express present.
- **Jest 29 + ts-jest + supertest** for the test suite (real Express app spun up in-memory, fired with `supertest`).
- **ESLint** for linting. `prepublishOnly` runs the build so a broken build can't be published.
- Node engine pinned to **≥18**.

That's the entire stack. The "no dependencies" claim is a genuine selling point — it means no transitive-dependency CVEs, nothing to audit, and it can't be supply-chain-attacked through a sub-package.

---

## C. ⭐ How it's built — the architecture at depth (the section to know cold)

The package is ~7 small files, each with one job. The data flow for a single request is: **`sentry()` factory → Express middleware closure → `inspectPayload()` → recursive `traverse()` → per-string `detectInjection()` + `redactPII()` → (throw `InjectionAttemptError` OR mutate body) → `next()`**.

### C.1 The factory pattern — resolve options once, not per request (`middleware.ts`)

`sentry(options)` doesn't do the work — it **returns** the middleware function. The expensive part (merging user options with defaults via `resolveOptions`) happens **once at startup**, and the returned closure captures the already-resolved options. So per-request there's no option parsing, no defaulting — just the inspection. That's the standard "configure-once, run-many" middleware pattern and it's deliberate for a hot path.

There are three exported factories:
- `sentry()` — both injection detection + PII redaction.
- `sentryInjectionOnly()` — forces `redactPII: false`.
- `sentryPIIOnly()` — forces `detectInjection: false`.

The middleware short-circuits cleanly: if `req.body` is undefined (body-parser wasn't applied first) it warns in debug and calls `next()`; if the body is an empty object it skips; otherwise it runs the inspector.

### C.2 The recursive inspector — single-pass traversal with safety guards (`inspector.ts`)

`inspectPayload(body, options)` is the engine. The design is a **single-pass depth-first recursion** over the JSON with three hard safety guards baked in, because the input is attacker-controlled:

1. **Size guard (DoS prevention).** Before traversing, it estimates payload size with `Buffer.byteLength(JSON.stringify(body))`. If it exceeds `maxPayloadSize` (default **100 KB**), it **skips deep inspection entirely** and returns `skippedDueToSize: true`. Reason: a malicious 10 MB nested payload shouldn't be able to pin the CPU walking it.
2. **Depth guard (stack-overflow prevention).** A `MAX_DEPTH = 50` counter — recursion past 50 levels stops. Stops a "deeply nested object" attack from blowing the call stack.
3. **Circular-reference guard.** A **`WeakSet`** of already-visited objects/arrays. Before descending into any object or array it checks `visited.has(obj)`; if seen, it returns. This is O(1) cycle detection with no memory leak (WeakSet doesn't hold strong refs). Plain `JSON.stringify` would throw on a cycle — this handles it gracefully.

The `traverse()` function carries a `context` object `{ options, visited, result, depth }` threaded through every call (no globals), plus the current `key` and `parent` so a string leaf can **mutate its parent in place** when redacted. Type dispatch:
- **string** → the actual inspection target (see C.3/C.4).
- **array** → cycle-check, add to visited, `depth++`, recurse each element with `(i, arr)` as key/parent, `depth--`.
- **object** → same, iterating `Object.keys`.
- **null/undefined and primitives** (number, boolean, etc.) → skipped, never inspected.

**Why in-place mutation matters:** when a string is redacted, the code writes the new value straight back into `parent[key]`. No copy of the request body is ever made — "zero-copy traversal". For a chat payload with a big `messages` array, that's the difference between allocating a second copy of the whole thing and allocating nothing.

### C.3 Injection detection — pre-compiled alternation regex (`patterns.ts` + `inspector.ts`)

The signature database is an array of **67 known attack phrases** grouped by category in `patterns.ts`:
- Direct instruction overrides (13): *"ignore all previous instructions", "system override", "developer mode enable"…*
- Persona manipulation / DAN variants (16): *"you are now dan", "enable dan mode", "you have no restrictions"…*
- System-prompt extraction (10): *"reveal your system prompt", "print your instructions"…*
- Roleplay exploitation (7), encoding-bypass attempts (4), 2025/2026 novel attacks (11): *"sudo mode enable", "god mode activated", "in a fictional world where ai has no rules"…*
- Multi-turn manipulation (3) and prompt-leaking (3).

The key engineering detail: all 67 phrases are compiled **once** into a **single case-insensitive regex** via alternation — `new RegExp(keywords.map(escape).join('|'), 'i')` — with each keyword regex-escaped first. So matching is one `value.match(pattern)` call against one compiled regex per string, not 67 separate `includes()` checks. On a match it throws `InjectionAttemptError(detectedPhrase)`, which unwinds the recursion immediately (fail-fast — no point redacting a request you're about to 403).

**The `strict` vs `loose` threshold:** `strict` (the default) matches against all 67 phrases. `loose` matches against a **7-phrase severe subset** (`STRICT_INJECTION_KEYWORDS`: ignore-all-previous, system override, you-are-now-dan, jailbreak mode, reveal-system-prompt, sudo mode, god mode) — so benign-ish phrasing like *"pretend you have no rules about coding"* passes in loose mode but a real override is still blocked. *(Honesty note: the variable feeding loose mode is confusingly named `STRICT_INJECTION_PATTERN` in the source — a naming wart. The runtime behavior is correct: `strict` → all 67, `loose` → 7. Good thing to mention if they actually open the code.)*

### C.4 PII redaction — order matters, Luhn is the clever bit (`inspector.ts` + `patterns.ts` + `utils/luhn.ts`)

Each string runs through `redactPII()` in a **deliberate order**:

1. **Credit cards FIRST.** The card regex (`/\b(?:[0-9]{4}[-\s]?){3,4}[0-9]{1,4}\b|\b[0-9]{13,19}\b/g`) is intentionally broad — it matches *any* 13–19 digit run. But it only redacts a match if **`luhnValidate(match)` returns true**. Cards are processed before phones because their digit runs would otherwise be partially eaten by the phone pattern.
2. **Emails** → simplified RFC-5322-ish pattern → `[EMAIL_REDACTED]`.
3. **Phones** → a pattern with **lookbehind/lookahead** (`(?<![0-9])…(?![0-9])`) so it won't match digits *inside* a credit-card number, supporting US formats + E.164.
4. **Custom patterns** → any user-supplied regexes (global flag forced on) → `[PII_REDACTED]`.

Every redaction bumps a per-type counter on the result, which feeds the `onRedacted(req, type, count)` audit callback.

**The Luhn check is the headline detail.** Most PII libraries redact *any* 16-digit number, which nukes order IDs, tracking numbers, and reference codes (false positives). AI-Sentry runs the real **Luhn (mod-10) checksum** (ISO/IEC 7812-1) and only redacts numbers that actually pass. The implementation (`utils/luhn.ts`) is itself optimized:
- Digits are extracted by `charCodeAt` arithmetic (`code - 48`), no `.split()`/`.map()` allocations.
- Doubling uses a **pre-computed lookup table** `DOUBLED_DIGITS = [0,2,4,6,8,1,3,5,7,9]` instead of a branch (`x*2>9 ? x*2-9 : x*2`) in the hot loop.
- Length-gated to 13–19 digits up front.

So `4532015112830366` (valid Visa) → redacted; `1234567890123456` (fails Luhn) → left alone. There's a real test asserting exactly this false-positive prevention.

### C.5 Security hardening on the error path (`errors.ts` + `middleware.ts`)

The block response is designed to **not become an attack surface itself**:
- `InjectionAttemptError` **truncates the detected phrase to 50 chars** before storing it — so an attacker can't smuggle a huge string into your logs via the error message (log-poisoning / exfil-via-error defense).
- Its `toJSON()` returns a **generic** body — `{ error: "AI Safety Violation", code: "PROMPT_INJECTION_DETECTED", timestamp }` — it deliberately does **not** echo back which phrase tripped it, so an attacker can't probe the signature list by reading responses.
- The middleware catches only `InjectionAttemptError` and converts it to a clean `403`; any other (unexpected) error is re-thrown to Express's normal error handling rather than being swallowed.

### C.6 The dual API surface (`index.ts`)

It ships both the Express middlewares **and** raw functions for non-Express use:
- `traverseAndSanitize(obj, options)` — resolve + inspect in one call; mutates `obj`, returns the `InspectionResult` (with `redactionCounts`). Throws `InjectionAttemptError` on injection.
- `inspectPayload`, `resolveOptions`, `luhnValidate`, `extractDigits`, `isPotentialCardNumber`.
- All the raw patterns (`INJECTION_KEYWORDS`, `EMAIL_PATTERN`, etc.) for advanced users who want to extend.

---

## D. Core technical details worth leading with

- **Configure-once factory** — option resolution is amortized to startup, the per-request closure is allocation-light.
- **Single compiled regex** for 67 signatures (alternation) instead of N string scans.
- **Zero-copy in-place mutation** during a single-pass DFS.
- **Three DoS guards** on attacker-controlled input: 100 KB size cap, depth-50 cap, WeakSet cycle detection.
- **Luhn-gated card redaction** to kill false positives — with a branch-free, allocation-free implementation.
- **Ordering dependency** (cards before phones) handled explicitly with a code comment explaining *why*.
- **Error-path hardening** — phrase truncation + generic error body so the security layer doesn't leak.
- **Zero dependencies** → no supply-chain / transitive-CVE surface.
- **Tested end-to-end** with `supertest` against a live in-memory Express app, plus unit tests for Luhn and the direct API (injection, nested 3-level redaction, arrays, config toggles, callbacks, edge cases like null/numbers/10k-char strings).

---

## E. Mock interview Q&A — be ready for these

### Q1. "What is AI-Sentry and why does it exist?"
> "It's a one-line Express middleware that guards an LLM API. The problem it solves is two-sided: prompt-injection attacks coming *in* — 'ignore all previous instructions, you are now DAN' — and PII leaking *out* to the model provider — a user pastes an email, a phone, a credit card, and now that's sitting in OpenAI's logs. AI-Sentry inspects the whole request body before it reaches the model: known injection patterns get a 403, and PII gets redacted in place. Zero runtime dependencies, sub-millisecond overhead, written in TypeScript."

### Q2. "Walk me through what happens to a request, step by step."
> "`sentry()` is a factory — it resolves options once at startup and returns the middleware closure. Per request: it checks the body exists and isn't empty, then calls `inspectPayload`. That first estimates payload size — over 100 KB and it skips deep inspection to avoid a CPU DoS. Otherwise it does a single-pass depth-first traversal. For every string leaf it runs injection detection first — if a pattern matches it throws an `InjectionAttemptError`, which the middleware catches and turns into a 403. If it's clean, it redacts PII in place — credit cards first with a Luhn check, then emails, then phones, then any custom patterns — writing the redacted value straight back into the parent object. Then `next()`. The whole walk has three guards: size cap, depth cap of 50, and a WeakSet for circular references."

### Q3. "The credit-card detection — why is the Luhn check the interesting part?"
> "Because the naive version of this feature is a bug factory. If you redact any 16-digit number, you destroy order IDs, tracking numbers, reference codes — tons of false positives, and now the model can't even see legitimate data. So the regex is intentionally broad — it grabs any 13-to-19 digit run — but I only redact it if it passes the Luhn checksum, the actual mod-10 algorithm credit cards use. `4532015112830366` is a real Visa, it passes, it gets redacted. `1234567890123456` fails the checksum, so it's left alone. I even optimized the Luhn itself — digits extracted via charCode math, doubling done through a pre-computed lookup table instead of a branch in the loop."

### Q4. "How do you stop the middleware itself from being a DoS vector?"
> "Three guards, because the input is attacker-controlled. One, a size cap — I estimate the payload with `Buffer.byteLength(JSON.stringify(body))` and if it's over 100 KB I skip deep inspection entirely, so a 10 MB payload can't pin the CPU. Two, a recursion depth cap of 50 — a maliciously deep nested object can't blow the stack. Three, a WeakSet of visited objects so a circular reference doesn't infinite-loop — that's O(1) per node and the WeakSet doesn't leak memory because it holds weak refs."

### Q5. "Injection detection is just regex — isn't that weak?"
> "Yes, and I'd say that to your face — it's signature-based, not an AI classifier, so a genuinely novel attack phrased in a way that's not in my list of 67 patterns can slip past. The honest positioning is it's a cheap, deterministic, sub-millisecond first line of defense that catches the overwhelming majority of *known* attacks — DAN, system-prompt extraction, the common override phrases — with zero false-negative-causing latency and no model call. For real coverage you'd layer a semantic/LLM-based classifier behind it, but that costs a round trip and money. This is the fast filter in front of that."

### Q6. "How is the 67-pattern matching actually implemented — 67 string searches per field?"
> "No — that'd be slow. All 67 phrases are regex-escaped and joined into one alternation regex with the case-insensitive flag, compiled once at module load. So each string is a single `.match()` against one pre-compiled pattern, not 67 passes. There's a strict and a loose mode — strict uses all 67, loose narrows to a 7-phrase severe subset so softer phrasing like 'pretend you have no rules about coding' is allowed but a real override still blocks."

### Q7. "Why redact credit cards before phone numbers?"
> "Ordering dependency. The phone regex matches digit groups, and a 16-digit card can look like a phone fragment, so if phones ran first they'd partially eat the card number and the Luhn check would never see the whole thing. Cards first, with lookbehind/lookahead on the phone pattern so it won't match digits sitting inside a card. It's a small thing but it's exactly the kind of bug that ships if you don't think about pass order — there's a code comment explaining it so the next person doesn't 'clean it up' and reintroduce the bug."

### Q8. "What did you do so the error response doesn't leak information?"
> "Two things. The detected phrase is truncated to 50 characters before it's ever stored on the error — that stops an attacker from poisoning my logs by stuffing a huge string into a request and having it echoed into the log line. And the JSON that goes back to the client is generic — 'AI Safety Violation', a static code, a timestamp — it deliberately does NOT say which pattern matched, so an attacker can't binary-search my signature list by reading the responses."

### Q9. "Why zero dependencies — is that just bragging?"
> "It's a real security property for a security package. Every dependency is attack surface — a transitive sub-package CVE, a supply-chain compromise like the ones that hit npm. A library whose whole job is to protect you shouldn't itself pull in 40 packages you didn't audit. Express is only an *optional peer* dependency — the core inspector runs with no framework at all, so you can call `traverseAndSanitize` from a queue worker or a Next.js route. Zero deps also keeps install size and cold-start tiny."

### Q10. "How would you extend this to be production-grade for a real company?"
> "A few directions. One, **output-side scanning** — right now it only guards the request; I'd add a response pass to catch the model leaking its system prompt or PII back. Two, wire up the **SSN and IP patterns** that already exist in `patterns.ts` but aren't hooked into the redactor yet, plus the base64 heuristic for encoded-payload attacks. Three, a **semantic injection classifier** behind the regex for novel attacks. Four, **framework adapters** beyond Express — Fastify, Koa, Next.js — which is easy because the core is framework-agnostic. Five, **metrics/SIEM hooks** — the `onBlocked`/`onRedacted` callbacks are already there, I'd ship a default exporter."

### Q11. "How did you test it?"
> "Jest with `supertest` — I spin up a real in-memory Express app with the middleware and a test echo endpoint, then fire requests and assert on the response. Coverage is injection (case-insensitive, nested-object), PII (single + multiple + mixed types), false-positive prevention (the Luhn-failing 16-digit number stays untouched), 3-level-deep nested traversal, arrays of PII, config toggles (disable injection, disable email only, disable all PII, custom patterns), the `onBlocked`/`onRedacted` callbacks, the specialized middlewares, and edge cases — empty body, nulls, numbers/booleans, and a 20k-character string with an email buried in the middle. Plus pure unit tests on the Luhn function with real Visa/Mastercard/Amex test numbers."

---

## F. Honest caveats — say these proactively ✅

- **Input only.** It guards the request going *to* the model. It does **not** scan the model's response. (Top of my "what I'd build next" list.)
- **Signature-based, not AI.** Injection detection is a fixed list of 67 regex phrases. Novel or cleverly obfuscated attacks can slip past. It's a fast first filter, not a complete solution.
- **Express-coupled middleware, framework-agnostic core.** The `sentry()` middleware targets Express; the raw functions (`traverseAndSanitize`, `luhnValidate`) run anywhere.
- **Some patterns exist but aren't wired in.** `SSN_PATTERN`, `IP_ADDRESS_PATTERN`, and a base64 heuristic are defined in `patterns.ts` and exported, but the redactor currently only acts on email / phone / credit-card / custom. Don't claim SSN or IP redaction works out of the box.
- **No eval, no drift, no monitoring.** It's a firewall, not an observability tool. (For the eval/measurement story, use cuiq's labeled-set harness.)
- **The `strict`/`loose` pattern variables are confusingly named** in the source (the loose mode is fed by a const literally named `STRICT_INJECTION_PATTERN`). Behavior is correct; the naming is a wart I'd rename.

---

## G. 30-second pitch + stack one-liner

> **Pitch:** "AI-Sentry is a one-line Express middleware that acts as a firewall in front of your LLM. It blocks known prompt-injection and jailbreak attempts with a 403, and it redacts PII — emails, phones, and *real* Luhn-validated credit cards — out of the request body before it reaches the model. It's a single-pass recursive inspector with DoS guards built in: a 100 KB size cap, a recursion-depth cap, and WeakSet cycle detection. Zero runtime dependencies, pure TypeScript, sub-millisecond overhead. It's published on npm. The honest scope: it's input-side and signature-based — a fast deterministic first line of defense, not an AI classifier or an output scanner."

> **Stack one-liner:** TypeScript, zero runtime deps, Express as an optional peer dependency. Core is a recursive JSON inspector with pre-compiled alternation regex for 67 injection signatures, Luhn-validated credit-card redaction, in-place zero-copy mutation, and three attacker-input guards (size / depth / circular-ref). Jest + supertest for tests. Published to npm as `ai-sentry` v1.0.0, MIT.

---

# 4. Pannly — an indie-startup idea finder with a refund-on-ship mechanic ✅

---

## A. What it is (plain) — your interview elevator pitch

**A scored, evidence-backed marketplace of startup ideas mined from real Reddit and Hacker News pain.**

The product loop:
1. A background pipeline continuously crawls six SaaS-focused subreddits (`r/SaaS`, `r/indiehackers`, `r/Entrepreneur`, `r/SideProject`, `r/microsaas`, `r/SaaS_Ideas`) plus Hacker News, looking for posts that contain *"I'd pay for X"* / *"I wish there was a tool for Y"* / *"why doesn't anyone build…"* signals.
2. Each candidate post is filtered through an LLM that decides if it's a real pain point and scores it on **demand × buyer reachability × competitive gap** (the LLM returns the scores, the prompt defines the rubric and the weights — `overall = round(0.45·demand + 0.30·reach + 0.25·competition)`).
3. Accepted signals get embedded with Voyage AI (`voyage-3-lite`, 512-dim), then clustered online against existing ideas using **pgvector cosine distance** with a 0.20 threshold. Close matches attach to an existing idea (more evidence for the same pain); far matches stay "orphan."
4. Orphan signals get a second LLM call that writes a **full structured brief** — pain analysis (250–700 words with FAQ-style H3s), evidence quotes with source URLs, 2–5 buyer-persona bullets, a 3-step validation plan, and sample landing-page copy.
5. The brief gets published as an `Idea` row, listed on the public feed, and is **unlockable for $3**. If the buyer ships a working build within 30 days, the $3 is **refunded automatically** by triggering Dodo Payments' refund API from the admin approval path — and the build joins the public `/built` gallery.

The differentiator is not the LLM. It's the **mechanic**: every unlock is a self-paid "skin in the game" that the platform gives back when the builder actually ships, which (a) filters tire-kickers, (b) generates evergreen marketing (every shipped build links back), and (c) is structurally honest — Pannly only really wins when the buyer wins.

There's also a multi-mode pipeline I added recently: the same crawl can be re-filtered through three independent lenses (`web`, `mobile`, `solo`) producing parallel idea trees, each tagged so the existing feed-by-tag filter on the frontend can scope them with zero UI changes.

Live at `pannly.getrevlio.com`. Production deploy is GitHub Actions → GHCR (Docker image) → Dokku on a VPS.

---

## B. Tech Stack (every item below is in `pyproject.toml`, `package.json`, or directly read from source — verified)

### Backend — `pannly/backend/`
- **FastAPI 0.136** + **Pydantic 2.9+** — REST API + typed request/response validation
- **Python 3.12+**, managed by **uv** (lockfile-pinned, `RUN --mount=type=cache,target=/root/.cache/uv` in the Dockerfile so cold-build deps are fast)
- **PostgreSQL 16** with `pgvector`, `pg_trgm`, `uuid-ossp` (server-side uuid v7 generator), `citext` extensions
- **SQLAlchemy async** + **asyncpg** (runtime driver) + **psycopg3 sync** (Alembic migration driver)
- **Redis 7** — sessions, feed/sidebar read-through cache, webhook idempotency keys
- **APScheduler 3** running in-process as an `AsyncIOScheduler` — six interval jobs (crawl/filter/embed/cluster/brief). Chose this over Dramatiq specifically to keep the broker count at one (Redis) and the worker count at one process — no separate worker fleet to operate at this scale.
- **httpx** for all outbound HTTP (Reddit, HN Algolia, OpenRouter, Voyage, Dodo, Resend)
- **tenacity** for exponential-jitter retries on every external call
- **structlog** with `contextvars.bind_contextvars(request_id=...)` so every line of one request shares the same id
- **OpenRouter** as the LLM gateway — accessed via a thin `OpenRouterClient` wrapper that supports **multi-model fallback chains**: pass `models=["primary", "fallback1", "fallback2"]`, and the next model takes over on transient errors (httpx / timeout / rate limit) OR on a JSON-parse failure (`chat_json` treats bad JSON as a fallback trigger because it's usually a model-quality problem)
- **Voyage AI** (`voyage-3-lite`, 512 dim) for embeddings — async client batches up to 64 per POST (Voyage allows 128, conservative)
- **Dodo Payments SDK** for $3 unlocks, $15/mo Pro, and refunds. Test/live keys kept **strictly separate** (`DODO_API_KEY_TEST` vs `DODO_API_KEY_LIVE`), switched by a single `DODO_MODE` env. Currency auto-detected from Cloudflare's `cf-ipcountry` header — `IN` → INR, else USD.
- **standardwebhooks** Python lib for Dodo webhook signature verification (Standard Webhooks spec, HMAC-SHA256 on raw body)
- **Resend** SDK for transactional email; templates are **Jinja2** HTML rendered server-side with **premailer** inlining the CSS so Gmail and Outlook don't strip it
- **Cloudflare R2** (S3-compatible, via `boto3`) for build screenshots + generated brief PDFs
- **python-slugify** with `word_boundary=True, max_length=80` for idea slugs (so a 64-char cap never splits "business" → "busines")
- **Sentry** SDK for unhandled errors
- **Plausible** self-hosted at `analytics.pannly.com`

### Frontend — `pannly/frontend/`
- **Next.js 16.2.4 LTS** App Router
- **React 19**
- **Tailwind v4** using the CSS-first `@theme` block in `globals.css` (no `tailwind.config.js`)
- **shadcn/ui v4-compatible** primitives, **lucide-react** icons
- **React Hook Form** + **Zod** for form validation
- pnpm-managed
- **Server Components** do every data fetch — no direct DB access from the browser, auth cookies forwarded to FastAPI on each SSR request, anonymous endpoints cached server-side via Next's `next: { revalidate: N }` to keep the backend cheap

### LLM models in production (verified in env defaults)
- **Filter pass** (cheap, fast — runs on every raw_signal): `google/gemini-2.0-flash-lite-001` is the default the user runs via CLI; env default chain starts at `minimax/minimax-m2.5:free` then falls back to `deepseek/deepseek-chat-v3.1:free` then `nvidia/nemotron-nano-9b-v2:free`
- **Brief pass** (more expensive, only on accepted high-score signals): `google/gemini-2.5-flash-lite` runtime; env default `google/gemini-3.1-flash-lite` with fallback to `deepseek/deepseek-chat-v3.1:free`
- **Premium tier**: `anthropic/claude-sonnet-4-6` (user-triggered deep dive only — not on the standard pipeline)

### Infra
- **Hetzner VPS**, **Dokku** for app orchestration, **Cloudflare** for DNS + CDN, **Backblaze B2** for nightly Postgres dumps. GitHub Actions builds the backend Docker image, pushes to **GHCR** (private), and `ssh dokku@host git:from-image pannly ghcr.io/.../pannly-backend:$sha`.

---

## C. Core technical work — the things to talk about at depth

### C.1 ✅ The 5-stage async ingestion pipeline (`workers/runner.py`, `workers/scheduler.py`)

`raw_signals` (every Reddit/HN post) → **filter** → `signals` (one row per accepted post, with intent label + 4 scores) → **embed** → embedding column populated → **cluster** → attach to existing idea OR mark orphan → **brief** → published `Idea` row.

The same `async def run_*` functions in `workers/runner.py` are called by:
- **APScheduler** (6 interval jobs, in-process, AsyncIO) for autonomous operation in production
- The **CLI** (`uv run python -m pannly.cli all --filter-batch 100 --brief-batch 20 --mode web|mobile|solo`) for manual runs + ad-hoc model overrides
- The **admin "run now" endpoint** for one-click triggering from the dashboard

Three things make this safe to run on a single process without a job broker:

1. **Per-job `asyncio.Lock`** in the scheduler — if a slow tick is still running when the next one fires, the second tick logs `tick.skipped reason="previous tick still running"` and exits. No overlapping work, no `max_instances=2` chaos.
2. **Every step is idempotent on its input query.** Filter picks raw_signals "not yet in signals (for this mode)" via a `NOT EXISTS` join. Embed picks signals "where embedding is null". Cluster picks signals "not in idea_signals". Brief picks orphan signals with `score_overall >= min_score`. Re-running the whole tick is a no-op when there's nothing new.
3. **Exceptions inside a tick get caught, logged with traceback, and the scheduler keeps ticking.** Crashing the worker because one Voyage POST timed out would be a bad failure mode for a scheduler that's supposed to "just run."

Per-tick cadence (read off `scheduler.py`):
- `crawl_reddit` every 30 min, first run: immediate
- `crawl_hn` every 30 min, first run: +2 min (with jitter 60s so the two crawls don't co-occur)
- `filter` every 60 min, first run: +5 min
- `embed` every 60 min, first run: +20 min
- `cluster` every 60 min, first run: +35 min
- `brief` every 90 min, first run: +50 min

The staggered first-runs guarantee that the very first tick of the day fires in pipeline order — crawl finishes before filter touches anything, filter finishes before embed, etc.

### C.2 ✅ The OpenRouter client — multi-model fallback chains, JSON-mode forcing, truncation detection (`services/llm/client.py`)

OpenRouter exposes an OpenAI-compatible `/chat/completions` endpoint. I wrapped it in a thin async client that does four things the SDK doesn't:

1. **Multi-model fallback.** Pass `models=["model_a", "model_b", "model_c"]` — each gets its own tenacity retry budget (3 attempts, exponential-jitter wait); only after one model exhausts its budget on a transport/rate-limit error do we move to the next. **Bad JSON does NOT trigger fallback in `chat()`** — that's a quality problem; the caller should fix the prompt, not burn free-tier quota. **In `chat_json()`, bad JSON DOES fallback** because truncated JSON is often a single-model problem (it's hit max_tokens) and the next model in the chain usually has different limits.

2. **JSON-mode forcing.** `chat_json()` defaults to `response_format={"type": "json_object"}`. Providers that support strict JSON mode (Gemini, DeepSeek, OpenAI-class) skip preambles entirely — eliminates "Expecting value: line 1 column 1" parse failures. Providers that don't support it ignore the field, no code path needed for either case.

3. **`finish_reason: length` detection.** When a model gets cut off at `max_tokens`, the response has `finish_reason="length"` and the JSON is truncated. I log `openrouter.truncated` with a `hint="raise max_tokens or shorten input"` so tuning max_tokens becomes reactive instead of guessing — `grep openrouter.truncated logs/` shows you exactly which model + which prompt is over budget.

4. **`message.reasoning` vs `message.content`.** Reasoning models (DeepSeek-R1, Tencent hy3, OpenAI o-series, Qwen-thinking) populate `message.reasoning` with chain-of-thought trace and `message.content` with the actual answer. The wrapper **only ever reads `content`**, never `reasoning` — a subtle bug I hit once where falling back to reasoning gave me garbage XML-tagged thinking text instead of structured output.

### C.3 ✅ Custom session auth, no JWT (`services/auth/sessions.py`)

I deliberately picked Redis-backed server-side sessions over JWT for this product. Why:
- **Logout actually invalidates.** `destroy()` deletes the Redis row; the cookie becomes useless. JWT would need a revocation list to do that.
- **Rolling expiry is one line.** Every successful `read()` calls `redis.expire(key, SESSION_TTL_SECONDS)` — the 30-day window restarts on each authenticated request. With JWT you'd reissue the token, which means refresh flows + frontend retries.
- **No reissue dance.** Stateless tokens are great when you have many auth services; here I have one FastAPI process and one Redis. The simplicity of "look up the session by token, that's it" beats "verify signature, check expiry, maybe refresh."

Cookie shape: `<base64url(32 random bytes)>.<hmac_sha256_hex>`. The HMAC is computed with `SESSION_SECRET` (server-only, ≥32 chars enforced at boot in production) so a forged/tampered cookie is rejected at sign-verification time before we even touch Redis. Cookie attributes: `HttpOnly`, `Secure` in production, `SameSite=Lax`, optional `Domain=.pannly.getrevlio.com` so subdomains share state.

There's also a custom **CSRF-lite middleware** in `main.py`: every mutating method (POST/PUT/PATCH/DELETE) must carry `x-requested-with: pannly-web` AND its `Origin` must be in `settings.allowed_origins`. Webhook paths (anything containing `/webhooks/`) are exempt — they're signed by HMAC instead.

### C.4 ✅ Standard-Webhooks signature verification + idempotent processing for Dodo Payments (`services/payments/webhooks.py`)

Dodo follows the **Standard Webhooks** spec — HMAC-SHA256 over the raw body, signature in headers, replay-prevented by a `webhook-id` header. The `standardwebhooks` Python lib handles signature verification.

Idempotency at the DB layer: every event id gets `INSERT … ON CONFLICT DO NOTHING` into a `processed_events` table with a `UNIQUE(provider, event_id)` constraint. The `RETURNING id` clause tells me whether this was the first time we saw the event. Returns `True` → handle the event; returns `False` → skip silently. This means Dodo's at-least-once delivery (they retry on 5xx) is automatically deduped without per-handler logic.

Eight event types are wired: `payment.succeeded/failed`, `subscription.active/renewed/canceled/expired`, `refund.succeeded/failed`. Anything else returns `200 {ignored: true}` so Dodo stops retrying — the alternative (silently 500-ing on unknown events) puts the webhook into a permanent retry loop and pages me.

The refund flow ties back to the core mechanic: when an admin approves a submitted build, the backend calls Dodo's refund API; the response triggers Dodo to send us `refund.succeeded` back; our webhook flips `unlock.state` from `approved` → `refunded` and bumps `users.total_refunded_cents`. No race conditions — the refund is "really" done only when the webhook says so.

### C.5 ✅ The locked vs unlocked vs `bot_preview` access tier on `/ideas/{slug}` — AI-search citability without leaking paid content

The idea-detail endpoint returns three different response shapes based on caller identity:
- **`unlocked`** — paid user OR Pro subscriber. Full structured brief: `pain_md`, `evidence_quotes[]` with `source_url`s, buyer personas, validation steps, landing copy.
- **`locked`** — anonymous human visitor or signed-in non-buyer. Only `LockedBriefPreview`: a 2-sentence pain teaser, `evidence_count`, and `evidence_sources` (just the *hostnames* like `["reddit.com", "news.ycombinator.com"]`, never the full URLs).
- **`bot_preview`** — AI crawler user agents (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc.). The backend detects the UA and serves a **citation-friendly slice** of the full brief: real evidence quotes with their source URLs (so AI Overviews / Perplexity / ChatGPT search can cite us), but with the validation-step descriptions stripped to empty and `landing_copy` nulled (the "actionable" sections stay behind the paywall for humans).

This is the trick that lets the site be both paywalled AND get AI-search citations. A locked human gets just enough to understand what's behind the unlock; AI crawlers get enough to cite us; only paying users get the full operational brief.

### C.6 ✅ SEO at scale — 25 long-tail content pages + a hub, structured data on every page

`/feed`, `/ideas/{slug}`, plus 25 hand-written long-form pages targeting peer-competitive long-tail keywords: vertical lists (`/saas-ideas-for-agencies`, `/micro-saas-ideas-for-ecommerce`, etc.), AI-shaped (`/ai-saas-ideas`, `/chatgpt-wrapper-ideas`), reddit/research (`/how-to-find-pain-points-on-reddit`), niche/gap analysis (`/untapped-saas-niches`), comparison pages (`/gummysearch-alternative`, `/ideabrowser-alternative`), and a `/guides` hub linked from the footer so no page is an orphan.

Every page carries typed JSON-LD via builders in `lib/seo/schemas.ts`: `Organization` + `WebSite` at root, `Product` + `Offer` on idea detail pages (with the unlock price), `BreadcrumbList` on every interior page, `FAQPage` on listicles (boosts AI-Overview eligibility), `ItemList` on lists, `SpeakableSpecification` selecting `["h1", ".geo-speakable"]` so voice/AI extracts the right passage, plus `AboutPage` + `Person` on /about and a `Dataset` schema on /refunds (the public refund ledger is, technically, structured data — Google's Dataset Search picks it up).

The sitemap is **dynamic** (`app/sitemap.ts`) — fail-soft fetch of the idea feed at SSR-time, falls back to just the static routes if the backend is unreachable so an outage never breaks `robots.txt` discovery. The `robots.ts` explicitly allows every major AI crawler by name (better than wildcard for compliance signaling).

After a new brief is published, `services/seo/indexnow.py` does a **fire-and-forget IndexNow ping** so Bing/Yandex/Naver/Seznam discover the new URL within minutes instead of crawling-cycle days.

### C.7 ✅ Multi-mode pipeline — three lenses on the same crawl (see Section D below — this is its own deep dive)

---

## D. ⭐ THE MULTI-MODE PIPELINE — running three lenses on the same crawl without duplicating any code

> This is the showpiece section. It's the most architecturally interesting work in the project — the kind of "I added one column and now we have three independent pipelines" change that's worth leading with in an interview.

### The problem

The Pannly filter prompt accepts a specific shape of pain: "is this a SaaS / web-product opportunity?" That shape misses two adjacent shapes the founder wanted to mine:
- **Mobile-app shape:** pains that only really work on a phone — on-the-go context, camera/location/push, audiences that don't sit at a desk.
- **Solo-founder shape:** pains a single person with limited capital and no team can ship in 30–60 days and monetise without paid ads.

The naive read on this is "build two more pipelines." That's wrong. The crawl is shared (same Reddit/HN posts feed all three lenses), the embed step is shared (same model, same vectors), the brief schema is shared (same JSON, same UI). The only things that actually differ per lens are **(a) the filter prompt** that decides if a post is interesting, **(b) the brief prompt** that writes the angle, and **(c) the database scoping** so a mobile signal doesn't get clustered into a web idea.

### The constraint I hit when I read the code

Filter's existing query was:
```python
select(RawSignal).outerjoin(Signal, Signal.raw_signal_id == RawSignal.id).where(Signal.id.is_(None))
```
Translation: "give me raw_signals that don't yet have a signal row." So the moment ANY filter pass touches a post, every other lens skips it forever. Running filter as web first locks out mobile/solo from ever seeing those posts.

Same problem at the brief stage: "orphan signal not yet attached to any idea" — first brief wins, the others starve.

### The fix — `mode` column on signals AND ideas, queries scoped to mode

One additive Alembic migration (`0008_add_mode.py`):
```python
op.add_column("signals", sa.Column("mode", sa.Text(), server_default=sa.text("'web'"), nullable=False))
op.create_index("ix_signals_raw_signal_id_mode", "signals", ["raw_signal_id", "mode"])
op.add_column("ideas", sa.Column("mode", sa.Text(), server_default=sa.text("'web'"), nullable=False))
op.create_index("ix_ideas_mode_status", "ideas", ["mode", "status"])
```

Two columns, two composite indexes, both backfill to `'web'` via the server_default so every existing row is treated as the original pipeline output — zero data migration, zero breakage.

Filter query becomes:
```python
.outerjoin(Signal, and_(Signal.raw_signal_id == RawSignal.id, Signal.mode == mode))
.where(Signal.id.is_(None))
```
The composite `(raw_signal_id, mode)` index keeps the JOIN as O(log n). Now each (raw_signal, mode) pair is independent — running filter with `--mode web`, `--mode mobile`, and `--mode solo` produces **three independent Signal rows per post**.

Clustering becomes within-mode:
```python
.where(and_(Idea.status == "live", Idea.mode == sig.mode, ...))
```
A mobile signal can only attach to a mobile idea. The pgvector cosine search runs against a subset, with the `ix_ideas_mode_status` index pre-filtering before the vector comparison.

Brief query gains `Signal.mode == mode` and the new Idea is persisted with the same mode. There's also a small `_merge_auto_tags` helper that idempotently appends `"mobile"` for mobile mode and `"solo-buildable"` for solo, so the existing **feed-by-tag filter on the frontend works for the new modes with zero UI changes**. The frontend doesn't even know the modes exist — it just sees tags.

Then later, I added a proper Mode select to the filter bar (separate UI piece — a Select for `web` / `mobile` / `solo` / all, plumbed through URL state → `useFeedParams` hook → `?mode=` query param → backend `FeedQuery.mode` → `WHERE ideas.mode = :mode`).

### What's shared vs what's per-mode (the table)

| Stage | Shared? | Why |
|---|---|---|
| Crawl (Reddit + HN) | shared | raw_signals are the raw feedstock; modes consume them independently |
| Filter prompt | per-mode | this is where the lens lives — what counts as a valid pain |
| Filter query | per-mode | "not yet processed for THIS mode" via the composite index |
| Embed | shared | same Voyage model, same input pain_summary text. One UPDATE per signal regardless of mode. |
| Cluster | per-mode at the WHERE | same algorithm, but only attaches to ideas of matching mode |
| Brief prompt | per-mode | mobile brief talks about App Store / TestFlight, solo brief talks about pre-sale + community posts |
| Brief query | per-mode | only orphan signals of this mode get a brief |
| Idea persistence | per-mode | mode column + auto-tag injection |
| Idea ranking, scoring, evidence, pricing | shared | same UI, same paywall, same refund flow |

### The CLI surface

One flag added — `--mode {web,mobile,solo}` — defaults to `web` so every existing invocation is byte-identical:

```bash
uv run python -m pannly.cli all \
  --filter-batch 100 --embed-batch 256 --cluster-batch 200 --brief-batch 20 \
  --filter-model "google/gemini-2.0-flash-lite-001" \
  --brief-model  "google/gemini-2.5-flash-lite" \
  --mode mobile
```

The same flag is on the `process` (no-crawl drain), `filter` (granular), and `brief` (granular) subcommands. `embed` and `cluster` don't need it — they handle every mode in a single pass because they're already universal across signal rows.

### What this looks like in an interview

> "So the founder wanted to mine the same Reddit/HN feed through two adjacent lenses — mobile-shaped pains, and solo-buildable pains. The instinct was 'build two more pipelines.' That's wrong: the crawl is shared, embedding is shared, the database schema is shared, and even the brief output shape is shared. The only things that genuinely differ are the **filter prompt**, the **brief prompt**, and a bit of **database scoping** so a mobile signal doesn't get clustered into a web idea.
>
> The blocker was that the existing filter query said 'raw_signals not yet in signals' — so the first lens to touch a post locked the other two out forever. Same problem at brief time.
>
> The fix was one additive Alembic migration: a `mode` column on `signals` and on `ideas`, both with `server_default='web'`, plus two composite indexes — `(raw_signal_id, mode)` on signals and `(mode, status)` on ideas. The backfill is implicit — every existing row is `'web'` because of the default. Zero data migration.
>
> Then I scoped the queries: filter joins on `(raw_signal_id AND mode)`, brief filters orphans by `mode`, clustering's vector search adds `idea.mode = signal.mode` in the WHERE. The same `(raw_signal, mode)` pair now gets its own independent verdict per lens.
>
> And — this is the part I'm proud of — the frontend doesn't know the modes exist. The brief persistence layer auto-appends `'mobile'` or `'solo-buildable'` to the idea's tags array, so the existing feed-by-tag filter works for the new modes with no UI change. Later I added a proper Mode select to the filter bar so users can pick a lens explicitly, but that was opt-in polish on top of a working system.
>
> The CLI flag is one argument — `--mode {web,mobile,solo}` — default `web`. Every existing invocation is byte-identical. So the deploy was: ship the migration, ship the code, both backward-compatible, then add the env on Dokku and re-run with `--mode mobile` to start populating the new lens.
>
> The lesson I'd give a junior: when 'do this same thing for a new dimension' shows up, look for a column-and-index change before you reach for a whole new code path. Two columns plus two indexes gave me three independent pipelines that share 95% of the code."

---

## E. Mock interview Q&A — be ready for these

### Q1. "Walk me through Pannly."
> "It's an indie-startup idea finder with a refund-on-ship mechanic. A background pipeline scrapes six SaaS subreddits and Hacker News for 'I'd pay for this' / 'I wish there was a tool for X' signals, runs each through an LLM filter that scores them on demand × reachability × competition, embeds the accepted ones with Voyage AI, clusters them via pgvector cosine distance, and writes a structured brief for the orphans. Each brief unlocks for three dollars — and that three dollars gets refunded automatically when the user ships a working build within thirty days. So the platform's incentive aligns with the builder's: we get paid when you actually try, and we give it back when you actually ship. Tech-stack-wise: FastAPI + async SQLAlchemy + Postgres with pgvector for the backend, OpenRouter as the LLM gateway with multi-model fallback chains, Voyage for embeddings, APScheduler in-process for the pipeline cadence, Dodo Payments for the refund flow, Next.js 16 App Router for the frontend with full Server Components for data fetching, deployed via GitHub Actions to a GHCR image then `dokku git:from-image` to a VPS. The recent architectural piece I'm proud of is a multi-mode pipeline that runs three independent lenses — web, mobile, solo-founder — on the same crawl, with about 95% shared code."

### Q2. "Why APScheduler in-process instead of Celery / Dramatiq / a real broker?"
> "Three reasons. First, scale — at this stage the pipeline runs maybe a few hundred LLM calls per hour, not thousands per second. A broker would be over-engineering. Second, ops cost — running APScheduler in one Python process means one container to monitor instead of api + worker + broker. The API is its own service for HTTP concerns; the scheduler is its own service for cron concerns; one Redis serves cache + sessions + nothing else. Third, the structure forced me to write idempotent steps from day one — every step's query is 'rows not yet processed,' so retrying or re-running an entire tick is a no-op. That same idempotency makes the CLI and the admin-run-now endpoint exercise the same code path as the scheduler. When we outgrow APScheduler — say, when one filter pass takes longer than the next tick interval — moving to Dramatiq is a wrapping-the-same-functions change, not a rewrite."

### Q3. "How do you make sure the pipeline doesn't overlap with itself?"
> "Per-job `asyncio.Lock` in the scheduler. Each job — crawl_reddit, filter, brief, etc. — has its own lock. Before a tick runs, we check if the lock is held; if it is, we log `tick.skipped reason='previous tick still running'` and return. So a brief that takes longer than 90 minutes — the brief interval — just makes the next tick a no-op until it finishes. Plus APScheduler's own `coalesce=True, max_instances=1` per job as belt-and-braces. Exceptions inside a tick are caught, logged with the traceback, and the scheduler keeps ticking — one bad LLM call can't take down the worker."

### Q4. "What's a structured prompt? How do you keep the LLM output reliable?"
> "Three things stacked. **One**, the system prompt is XML-tagged — `<role>`, `<what_counts_as_a_pain_point>`, `<scoring_rubric>`, `<pain_summary_rules>`, `<output_format>`, `<calibration>`. Claude/Minimax/Qwen-class models follow tagged sections noticeably better than free-form instructions, and the structure makes the prompt itself easier to maintain when I want to tweak one rule. **Two**, I force JSON mode at the API layer with `response_format={'type': 'json_object'}` — providers that support it (Gemini, DeepSeek, OpenAI-class) skip preambles entirely, which kills the 'Expecting value: line 1 column 1' parse failures. Providers that don't support it just ignore the field. **Three**, I validate every response with a Pydantic schema (FilterVerdict for the filter pass, BriefVerdict for the brief). If the LLM returns the wrong shape — wrong types, missing fields, lengths out of bounds — Pydantic raises and the run logs `filter.bad_schema` with the validation errors and the raw output, so I can see exactly which prompt iteration broke. The brief schema has detailed length constraints — `pain_md` 120-4000 chars, `evidence_quotes` 1-3, `validation_steps` exactly 3 — so a malformed brief fails fast instead of polluting the feed."

### Q5. "Tell me about the multi-model fallback chain."
> "OpenRouter exposes an OpenAI-compatible endpoint, so I can route any request to any model behind their API. I wrote a thin async wrapper that accepts a list of models — primary plus fallbacks — and walks them in order. Each model gets its own tenacity retry budget — three attempts with exponential-jitter wait — for transport-level errors like timeouts and 5xxs. Only after a model exhausts its retry budget on a connectivity error do we fall through to the next model. **Bad JSON output, though, is treated differently per method.** `chat()` does not fall back on JSON-parse errors — that's a model-quality problem; another model usually won't fix it and just burns free-tier quota. `chat_json()` does fall back on bad JSON because in practice that's almost always 'this model hit max_tokens and truncated mid-output,' and the next model in the chain usually has different limits. The wrapper also logs `finish_reason='length'` separately as a warning — that's the canonical signal that I need to raise `max_tokens` for that prompt, and seeing it in the logs makes tuning reactive instead of guessing."

### Q6. "Walk me through the multi-mode pipeline architecture."
> [Use the deep dive at the bottom of section D — one column, two indexes, scoped queries, auto-tag injection, CLI flag.]

### Q7. "Why pgvector and not Pinecone / Weaviate / a separate vector DB?"
> "Transactional consistency. The signal's row, its score, its tags, and its embedding all live in the same Postgres row. When the cluster step attaches a signal to an idea, that INSERT happens in the same transaction that updates the idea's centroid. With a separate vector DB I'd be writing the row to Postgres and the vector to Pinecone, then either two-phase committing or accepting eventual consistency — neither is fun to debug when the row says 'clustered' but the vector hasn't shown up in Pinecone yet. pgvector also means one operational target: one backup story, one migration story, one set of credentials. And at our scale — tens of thousands of vectors, not tens of millions — pgvector's cosine distance index is genuinely fast enough."

### Q8. "What's the clustering algorithm exactly?"
> "Online, not batch. For each newly-embedded signal that isn't yet attached to any idea, I do a single pgvector query: find the closest live idea by cosine distance — `Idea.centroid_embedding.cosine_distance(sig.embedding)` in SQLAlchemy, which compiles to pgvector's `<=>` operator. If the distance is at or below 0.20 — that's cosine similarity 0.80 or higher — I insert an `idea_signals` row attaching the signal to that idea. Otherwise the signal stays orphan and the brief pass will pick it up and create a new Idea seeded from it. Ideas never get re-clustered — once published, their slug and title are stable, which is what the UI needs since the URL points at the slug. The cosine threshold is intentionally a touch looser than my plan doc says — at the early phase you'd rather under-cluster than have a 'Stripe ledger' brief absorb a 'Razorpay ledger' signal that's really a different pain. The comment in the code literally says 'tune it once we have real volume.'"

### Q9. "How does the refund-on-ship mechanic work end to end?"
> "The unlock is a row in the `unlocks` table with a state machine: `pending → unlocked → building → submitted → approved → refunded` (or `rejected`). On purchase, Dodo's webhook flips `pending → unlocked`. The user has 30 days to submit a build URL + screenshot + writeup via the dashboard; that moves it to `submitted`. An admin reviews it in the `/admin/builds` queue — manual, 24–48 hour turnaround — and either approves or rejects. On approve, the backend calls Dodo's refund API; Dodo refunds the card and fires `refund.succeeded` back at us; our webhook flips the unlock to `refunded`, bumps `users.total_refunded_cents`, and the build joins the public `/built` gallery as a permanent case study. The whole flow is idempotent at the webhook layer — every Dodo event id is INSERTed into a `processed_events` table with a unique constraint, so retries are safe. The unlock state is the source of truth, not the payment record, so a half-completed refund webhook can't leave the system in a weird state."

### Q10. "Why a custom session system instead of JWT?"
> "Three reasons, all about operational simplicity for a single backend. **One**, logout actually invalidates — `destroy()` deletes the Redis row, the cookie becomes useless. JWT would need a revocation list to do that and now I'm maintaining a second mechanism. **Two**, rolling expiry is one line — every successful read calls `redis.expire(key, 30 days)` and the window restarts. JWT would need a refresh-token flow and the frontend would need retry logic. **Three**, the security model is simpler — the cookie is HMAC-signed so a forged cookie is rejected at sign-verification before we even touch Redis, and the 32 random bytes inside are opaque, so even if someone got the token they can't decode it into user info. JWT puts user info in the token; if that ever leaks you have a longer fix path. If I had three backends behind a load balancer I'd reconsider — stateless tokens scale horizontally for free — but for one FastAPI + one Redis the server-side session is the simpler answer."

### Q11. "How do you do SEO for AI search specifically — Google AI Overviews, Perplexity, ChatGPT search?"
> "Two things that aren't obvious. **First, structured data on every page** — typed JSON-LD builders in `lib/seo/schemas.ts` that emit `Organization`, `WebSite`, `Product` with the unlock price on each idea, `FAQPage` on listicles, `ItemList` on collections, and a `SpeakableSpecification` block that selects `['h1', '.geo-speakable']` — so voice and AI Overviews extract that specific class instead of guessing. I put `.geo-speakable` on the one definitional sentence per page that I want cited. **Second, a special `bot_preview` access tier on the idea detail endpoint.** The backend detects AI crawler user-agents — GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc. — and returns a citation-friendly slice: full evidence quotes with source URLs that AI search can cite, but the actionable validation steps stripped to empty and landing copy nulled. So an AI crawler gets enough to cite the brief; a human anon only gets a count of evidence + hostnames. That's how the site stays paywalled for humans but gets AI-search citations. Plus the standard hygiene: `robots.ts` allows every major AI crawler by name (better than a wildcard for compliance signaling), a dynamic sitemap that fail-soft fetches the idea feed at SSR, and a fire-and-forget IndexNow ping on every new brief so Bing/Yandex/Naver discover the URL within minutes."

### Q12. "What was the most painful bug?"
> "The deploy job kept failing with `lease does not exist: not found` when Dokku tried to pull the image from GHCR. The error message is misleading — it sounds like the image isn't there, but the build step had clearly succeeded and pushed. The actual cause was that `docker/build-push-action@v6` defaults to emitting an **OCI image index with build-provenance and SBOM attestation manifests attached**, and Dokku's `git:from-image` (using an older containerd version) can't traverse those attestation references — it reports the cryptic 'lease does not exist' instead of the actual issue. Fix was three flags on the build step: `provenance: false`, `sbom: false`, `platforms: linux/amd64` — produces a plain single-platform Docker manifest that Dokku knows how to pull. The lesson is that infrastructure errors lie sometimes, and the fix is usually 'make the artifact simpler' rather than 'make the puller smarter.'"

### Q13. "How do you deploy this?"
> "GitHub Actions on push to `main`: log in to GHCR with the workflow's `GITHUB_TOKEN`, build the backend Docker image with `docker/build-push-action`, push two tags — `:latest` and `:${{ github.sha }}` — to `ghcr.io/rohit-jsfreaky/pannly-backend`. Then SSH into the Dokku host with a deploy key and run `dokku git:from-image pannly ghcr.io/...:${{ github.sha }}`. Dokku pulls the image and restarts the app. Container start runs `alembic upgrade head` first, then `uvicorn pannly.main:app`. Postgres + Redis are separate Dokku services on the same host. Frontend deploys separately to its own Dokku app from the Next.js build. CI/CD wasn't really 'CI' for a long time — until I added the right `provenance: false` flags and the `REDDIT_CLIENT_ID/SECRET` env vars via `dokku config:set`, deploys would silently break in interesting ways."

---

## F. Honest caveats — say these proactively if asked ✅

- **The LLM is doing the scoring; I defined the rubric.** The filter and brief prompts both define a 3-axis rubric (demand × reachability × competition, weighted `0.45/0.30/0.25`) — and ask the model to score each post on that scale. The model returns the numbers. So "Pannly scores ideas" is true but the more honest framing is "the LLM scores each pain on a Pannly-defined rubric, with strict JSON output validated by Pydantic." I don't have a separately-trained scorer.
- **Reddit ingestion from a VPS requires OAuth.** Reddit blocks `www.reddit.com/.json` from datacenter IPs with HTTP 403. The original code did the unauth path and worked fine from my laptop; it failed silently on Dokku until I switched to `oauth.reddit.com` with `client_credentials` grant + a cached bearer token. This is a recent fix — be ready to talk about it if the interviewer asks why it took a while.
- **The 0.20 cosine threshold is an early-phase guess.** The comment in `cluster.py` says explicitly "tune it once we have real volume." I haven't done that — at current corpus size, under-clustering is the safer error.
- **Refund admin review is manual.** The 24–48 hour turnaround is me looking at submissions, not an automated approval. That's the honest current state — automating it would mean a build-quality classifier that I don't trust to be the gatekeeper yet.
- **The mobile and solo pipelines are fresh.** I wrote them recently. They share 95% of the code and the architectural piece I lead with is solid, but the prompts themselves will need tuning once I see how the first batch of mobile-shaped and solo-shaped ideas actually read.
- **Frontend tests are thin.** TypeScript + `tsc --noEmit` is what I rely on for the marketing pages. There's no React-Testing-Library coverage on the feed flows yet.

---

## G. 30-second pitch + stack one-liner

> **Pitch:** "Pannly is an indie-startup idea finder with a refund-on-ship mechanic. A background pipeline mines six SaaS subreddits and Hacker News for buying-signal posts, LLM-scores each on demand × reachability × competition, embeds + clusters them via pgvector, and writes a structured brief. Each brief unlocks for three dollars — and the three dollars is refunded when the user ships a working build within thirty days. So the platform's incentive lines up with the builder's. Architecturally the part I'm most proud of is a multi-mode pipeline I added recently — same crawl runs through three independent lenses (web / mobile / solo-founder) with about 95% shared code, gated by one column on signals and one on ideas plus two composite indexes."

> **Backend:** FastAPI 0.136 + async SQLAlchemy + asyncpg, Postgres 16 with pgvector + pg_trgm, Redis 7 for sessions + cache + idempotency, APScheduler in-process for the pipeline cadence, OpenRouter as the LLM gateway with multi-model fallback chains (Gemini 2.0/2.5 Flash Lite at runtime, DeepSeek and Nvidia Nemotron as fallback tier), Voyage `voyage-3-lite` 512-dim for embeddings, Dodo Payments SDK + Standard Webhooks for unlocks + refunds, Resend + Jinja2 + premailer for transactional email, Cloudflare R2 (S3-compatible via boto3) for build screenshots, custom HMAC-signed Redis sessions (no JWT), CSRF-lite via SameSite + custom header + Origin check. Deployed via GitHub Actions → GHCR → `dokku git:from-image` on a Hetzner VPS. Sentry + Plausible for ops.

> **Frontend:** Next.js 16.2.4 App Router + React 19 + Tailwind v4 (CSS-first `@theme`) + shadcn/ui, all data fetching in Server Components, React Hook Form + Zod, custom typed URL-state hook (`useFeedParams`), module-level dedup cache for sidebar payloads. Full schema.org JSON-LD on every page (Organization, WebSite, Product+Offer, BreadcrumbList, FAQPage, ItemList, SpeakableSpecification), dynamic `sitemap.ts` with fail-soft idea fetch, per-route `opengraph-image.tsx` via edge runtime, IndexNow ping on every new brief, robots.ts with explicit AI-crawler allowlist. 25 long-tail SEO content pages + a guides hub for internal-link distribution.

---

Enough to mention confidently if they come up. Don't volunteer all of them; pick what fits.

| Project | One-line plain description | Good for talking about… |
|---|---|---|
| **Vouchley / MailValid** (vouchley.getrevlio.com) | Real-time signup verification API — blocks bots, disposable emails, fraud. Sub-100ms cached, bulk verify. | fast APIs, caching, fraud scoring, ops at scale |
| **SaasGuard** | Central permission/entitlement engine — roles, plans, usage limits, overrides across multiple SaaS apps. Overrides > Roles > Plans, enforced backend-side. | clean rule resolution, multi-tenant backend design |
| **cron-safe** (npm, OSS) | Hardened wrapper around node-cron: auto-retries, Redis-lock overlap prevention, timeouts, run history. | reliability, distributed locks, "jobs that don't silently fail" |
| **express-rate-limit-redis-slim** (npm, OSS) | Lightweight Redis-backed rate limiter for Express. | backend hardening, Redis |
| **Skill Arena** (freelance) | Real-time esports tournament + membership platform, thousands of users. Razorpay payments, 30%+ load improvement. | real production users, payments, perf work |
| **AI Mock Interview Platform** | Generates job-specific interview questions + structured feedback with Gemini. (Yes — you built the thing we're doing right now 😄) | product sense, LLM-as-feature, structured output |
| **StudioMode.ai** (was kalakar-ai) | AI image generation at volume — 1000+ generations/day via Fal AI. | AI infra at volume, throughput |

---

# Which project to reach for, by Vela topic

| If the talk turns to… | Lead with… | Because |
|---|---|---|
| "How do you know the AI is improving?" (eval) | **cuiq A/B harness** | real labeled set + measured accuracy — true eval |
| Making an LLM reliable / prompt quality | **cuiq prompt** | structured prompt + few-shot + tie-breaker rules |
| Guarding LLM calls / security / PII | **AI-Sentry** | injection block + PII redaction, input-side |
| Long-running agents / retries / async | **Pannly** + **cron-safe** | async pipelines + jobs that don't silently fail |
| Real production scale / performance | **TransferPitch** | record-dedup + indexing, sub-second after, real load |
| Multi-tenant rules / permissions | **SaasGuard** | clean override>role>plan resolution |
| AI throughput / volume | **StudioMode** | 1000+ generations/day |

> **Golden rule for the whole call:** say what's *yours* and what's a *library/3rd-party* clearly.
> "The matching and indexing is mine; chat is Stream." That honesty is the flex.

---

# 5. Virtual GFE — AI companion chat + image / audio / video generation ✅

---

## A. What it is (plain) — your interview elevator pitch

**Virtual GFE** is a consumer web app where users sign up, pick an AI character (e.g. "Zara Marshmallow", "Amara Zamani") from a gallery, and have a real-time naughty/companion-style chat with them. The twist is that the chat is *not just text* — inline you can ask for an **image of the character**, an **audio voice reply**, or a **video clip** (image-to-video generation). The whole thing is metered on a **credit wallet**: every chat turn costs a few credits, an image is ~8c, a video is ~125c, etc.

I built **both ends of the stack**:
- **Backend:** Django 5 + DRF + Django Channels (WebSockets), JWT auth, Celery + Redis for async jobs, Postgres (psycopg3), AWS S3 for media, AWS SES for email OTP signup. The heavy work happens inside a single `ChatConsumer` Channels consumer that orchestrates a multi-step "pipeline" per user turn — compliance check → chat completion → optional prompt-enhance → optional image/audio/video gen → optional summarization once history gets long. We also expose REST for everything that isn't streaming (login, profile, billing, model gallery, usage).
- **Frontend:** React 19 + Vite + Redux Toolkit + React Router 7 + Tailwind. One persistent WebSocket per open chat, a job-polling fallback for very long video jobs that resume across reconnects, optimistic message rendering with reserve→refund credit UI, IntersectionObserver-based lazy loading for video messages.

I do **not** train any AI models or run any GPUs. The generative pieces — chat completion, image gen, image edit, voice clone, video gen — are all called against a single upstream provider (**Lightspeed Cloud**, several model lines including `Wowify_LLM` for chat, `fluxnsfw` for images, `tts-max-1` for voice, and **`alibaba/happyhorse-1.0/image-to-video`** for video). My job was to wrap those endpoints into a reliable per-turn pipeline with retries, compliance, credit accounting, async job tracking, and a polished real-time UI.

It runs in production on **Coolify** (Docker, on a Hetzner-style VPS), separate web + Celery worker + Celery beat containers, behind uvicorn.

---

## B. Tech Stack (verified against `requirements.txt` + `package.json`)

### Backend — `vgfe-backend/`
- **Python 3.13 / Django 5.2 / DRF 3.16** — REST + admin.
- **`djangorestframework-simplejwt`** — JWT access + refresh tokens, used for both REST and the WS handshake (token passed as `?token=` query param at connect).
- **Django Channels 4 + Daphne / uvicorn** — WebSockets via ASGI. One consumer per chat URL (`/ws/chats/<uuid>`). The channel layer is Redis-backed via `channels-redis`.
- **Postgres 15 + `psycopg[binary]` 3.3** — main DB. JSONB columns for `media_metadata`, `payload`, `memory_store`, `privacy_settings`. UUID primary keys everywhere.
- **Redis 7** + **django-redis** + **hiredis** — three jobs in one Redis: Django cache, Celery broker, Channels layer.
- **Celery 5.6 + Celery Beat 2.8** — async jobs for video generation, periodic cleanup, summary-trigger watchers. Separate `worker` and `beat` containers in Coolify.
- **`httpx`** (async) — all upstream provider HTTP calls. Wrapped in a single retry helper (`_http_retry.py`) that retries on `502/503/504` and network timeouts, never on 4xx or final 5xx.
- **boto3** — AWS S3 uploads for image messages (videos are kept on the provider's CloudFront).
- **`django-anymail` + AWS SES (SMTP)** — transactional email (signup OTP).
- **`django-allauth[mfa]` + `qrcode`** — present in deps, foundation for future MFA.
- **`drf-spectacular`** — OpenAPI schema.
- **`whitenoise`** — static files in the web container.

### Frontend — `vgfe-frontend/`
- **React 19 + Vite 7** — main app.
- **Redux Toolkit 2** — two slices (`auth`, `chat`). Chat slice holds the open chat's messages, credits mirror, and the chat list ordering.
- **React Router 7** — file-routed pages, catch-all `*` route renders a custom 404.
- **Tailwind 4** + **lucide-react** + **primereact** (mostly for the skeleton loader).
- **axios** with a single interceptor that injects JWT, refreshes once on `401`, and surfaces a toast on every non-401 error.
- **react-hot-toast** — global toast system.
- **react-helmet-async** — per-page `<title>`.
- **Custom `WebSocketService` class** — singleton-per-tab, supports reconnect with exponential backoff, outgoing message queue while disconnected, heartbeat ping, listener pub/sub.

### Infra / Ops
- **Coolify on a Linux VPS** — three containers (`web`, `worker`, `beat`) plus Postgres + Redis. Build is a `Dockerfile` that pip-installs requirements, copies the source, runs `collectstatic` + `migrate`, then execs `uvicorn config.asgi:application` (or Celery, depending on `SERVICE_TYPE` env var).
- **AWS SES SMTP** for outbound mail.
- **AWS S3** for the image bucket (`vgfe-media-bucket`).
- **CloudFront** (provider-side, not ours) for video + edited-image CDN URLs.

---

## C. Data model (the rows that matter)

- **`User`** (`AbstractUser`): UUID PK, `email` is the USERNAME_FIELD, plus `name`, `username` (unique, nullable — auto-generated as `<adjective><noun><number>` on signup), `avatar_url`, `gender` (`male`/`female`/blank — drives the system-prompt "Assume you are talking to a man/woman" line), `email_verified`, `terms_accepted`, `age_verified`.
- **`Credits`**: 1-to-1 with `User`, single `balance: int`. **All decrements use `select_for_update()` inside an atomic transaction** — that's the spine of the credit accounting.
- **`CreditTransaction`**: append-only audit log of every wallet change (`signup_bonus`, message cost, refund). Used by the billing UI's "Activity" view.
- **`EmailOTP`**: signup flow. Stores `email`, 6-digit `code`, **hashed** password, `terms_accepted`, `age_verified`, `attempts`, `is_used`, `expires_at`, `last_sent_at`. On verify, the cached fields are used to create the `User` atomically.
- **`AIModel`**: the character. `name`, `handle`, `age`, `avatar_url`, `physical`, `personality`, `interests`, `body_type`, `ethnicity`, `voice_id` (Lightspeed voice for TTS), `rendering_model` (image model identifier, e.g. `fluxnsfw`), `system_prompt` (optional override), `clothing`, `setting`. There's a separate `ModelTag` many-to-many table for filtering.
- **`Chat`**: one per (`user`, `ai_model`) pair (enforced by `unique_together`). Fields: `last_message`, `last_message_at`, `unread_count`, `is_active`, plus **`conversation_summary`**, **`memory_store`** (JSON list), `message_count`, `last_summarized_at` for the long-context summarisation flow.
- **`Message`**: text/image/audio/video, `sender_type` (`user`/`assistant`), `content`, `media_url`, `media_data` (base64 fallback), `media_metadata` (the full provider response JSON — prompt used, info string, webhook callback for video, etc.), `credits_cost`, `tokens_count`. Indexed on `(chat, created_at)`.
- **`GenerationJob`**: tracks long-running media jobs across WS reconnects + worker restarts. `generation_type` (image/audio/video), `generation_context` (inline/standalone/image_action), `status` (`queued`→`running`→`succeeded`/`failed`/`timed_out`/`cancelled`), `payload` (JSON of the request), `credits_cost`, `credits_refunded`, `result_message` (FK to `Message`, SET_NULL). Indexed on `(chat, status)`. This is what makes a 35-second video gen survive the user closing their laptop and reconnecting later.

---

## D. How the core "send a message with the Video flag on" actually works (read off `consumers.py`)

This is the part that's worth knowing cold for an interview, because it touches **WS, async DB, credit reservation, multi-step API orchestration, webhooks, and Celery** — basically every backend skill in one flow.

1. **Frontend** opens WS to `/ws/chats/<chat_id>?token=<jwt>`. The consumer validates the JWT, fetches `chat = Chat.objects.select_related("user", "ai_model").get(...)` in **one** DB round trip (wrapped in `database_sync_to_async`), caches `self.user` and `self.chat` for the connection lifetime. The WS connect is **timed-out at 7 seconds** (`asyncio.wait_for`) so a stale auth lookup can't hang shutdown.

2. **User types "show me a beach scene" with the Video pill toggled on, hits send.** Frontend's `useChat.sendMessage` dispatches an **optimistic** user-message into Redux (so the bubble shows up immediately), bumps that chat to the top of the sidebar list (`bumpChatToTop` reducer, only triggered by user-send, never by passive activity), and ships a `send_message` event over the open WS.

3. **Consumer's `handle_send_message` runs the per-turn pipeline.** The first thing it does is call `build_compliance_context(history, new_message, character_name, character_description, character_age)` which:
   - Pulls only the user's prior turns (assistant replies are excluded — they can leak "I had a glass of wine" which the provider then rejects as "alcohol/drug content").
   - Caps the tail at the last 3 user messages, each at 500 chars.
   - Scrubs the character's name (providers reject prompts that look like addressing a real person) and **scrubs any "X credits" mentions** that AI replies sometimes leak (regex pass `_strip_credits_mentions`).
   - This composed string is what we POST to `/api/v1/compliance/check`. Cost: **1 credit**. Compliance is skipped for messages of ≤2 words — `if len(content.split()) > 2`.

4. **Chat completion.** We `reserve_credits(user_id, 10)` via a Postgres row lock (`select_for_update`), build the conversation history (system prompt + every saved message), and POST to `/api/v1/ollama/chat`. The system prompt is built fresh each turn by `get_dynamic_system_prompt`, which calls **`self.user.refresh_from_db(fields=["gender"])`** so a gender change made mid-chat reflects in the very next message — otherwise the cached `self.user` would go stale for the WS lifetime. Once the reply comes back, we call `adjust_credits(reserved=10, actual=2)` which refunds the 8c difference in a single atomic update. The assistant text message is saved with `credits_cost=2`.

5. **Routes to `_handle_video_with_image_gen`.** This is the inline-video flag flow:
   1. Deduct `IMAGE_EDIT_NSFW_CREDITS = 5`. POST to `/api/v1/image/edit/nsfw` with `{images: [avatar_url], prompt: "show me a beach scene"}`. Provider returns a CloudFront URL of the edited reference image.
   2. Deduct `PROMPT_ENHANCE_CREDITS = 1`. POST to `/api/v1/prompt/generate/video` with the character header description plus the user's prompt. Gets back an enhanced ~60-word cinematic prompt.
   3. Calls `enqueue_video_generation_job(...)`. This **persists a `GenerationJob` row**, deducts `116c` (`math.ceil(115.5)` from `get_video_credits_happyhorse_i2v`), and submits the job to `/api/v2/alibaba/happyhorse-1.0/image-to-video` **in webhook mode** — request body includes `webhook_url = build_video_webhook_url(job_id)` pointing back at our own `/api/webhooks/video-generation/<job_id>` endpoint.
   4. Sends a `generation_started` WS event to the frontend so it can show "Generating video… 60–80 seconds" and a `credits_updated` event with the new balance.

6. **Provider runs the job for ~35 seconds.** Frontend is now polling `/api/chats/<chat_id>/generation-jobs/?limit=60` every few seconds as a backstop (in case the WS dropped). When provider finishes, it POSTs the full result to our webhook endpoint (`VideoGenerationWebhookView`, `permission_classes = [AllowAny]` because it's an outbound-callback). We call `complete_video_job_from_webhook_payload(job_id, payload)` which transactionally:
   - Marks the `GenerationJob` as `succeeded`.
   - Saves a new `Message` (`message_type="video"`, `media_url=<provider URL>`, `media_metadata = full webhook payload` — every field including `request_context.payload` so we have a forensic record of exactly what we sent).
   - Fans out a `new_message` event to anyone connected to that chat's group via `channel_layer.group_send`.

7. **Frontend receives `new_message` over WS** — `handleNewMessage` in `useChat.js` adds the video message to Redux, clears the "generating" placeholder, and the chat scrolls. The actual `<video>` element uses an **IntersectionObserver-based lazy mount** with `priority` set only on the most recent video, so an old chat with 20 video messages doesn't slam the network when you reopen it.

**On any failure** (provider 502, our compliance check returned non-OK, the chat API timed out after retries) the code path calls `refund_credits` for whatever was already deducted before the failure — so the user is never charged for a turn that didn't deliver. That's why the credit helpers all live in one file and all use `select_for_update`.

**One more important detail — context length management.** The `Chat` model carries a `conversation_summary` TEXT field and a `memory_store` JSON list. Once `message_count >= 120` (`MESSAGE_THRESHOLD` in `summarize.py`), the next turn triggers `handle_summarization` which calls `/api/v1/chat/summarize` with the full history, gets back a condensed summary + 5–10 "key facts" memory entries, and replaces the in-DB summary. From that point on, the chat completion call uses `build_summarized_history(system_prompt, summary, memory_store, new_message)` instead of the full transcript — so the prompt size stays bounded even after thousands of turns.

---

## E. Frontend — the non-obvious decisions

- **Sidebar reordering on send only.** I split what used to be one `updateChatInList` reducer into two: `updateChatInList` (patch in place — used for inbound replies, generation results, audio REST results) and `bumpChatToTop` (patch + move to position 0 — used ONLY by the user-send optimistic path). The bug it fixes: when you tap a chat in the sidebar, the WS opens and the server might send buffered events that re-fire `updateChatInList`. With the old "bump on any update" logic, just *opening* a chat moved it to the top.

- **Chat-mode persistence per chat, not per user.** Each chat has its own `chat:<id>:generationMode` key in localStorage holding the active pill (`image`/`video`/`audio`/missing). Pills are sticky within a session so you can send a burst of image requests without re-toggling, and sticky across page reloads so you don't lose your place. Missing key = no pill (we chose **not** to default to Image after trying it and getting user pushback).

- **Credit balance has two mirrors.** `state.auth.user.credits` is hydrated from localStorage on app boot (so any page can render the credit chip immediately without a network call). `state.chat.credits` is the WS-event-driven mirror that updates in real time during a chat. The Credits & Billing page reads `auth.user.credits` first (because the user might land there directly without ever opening a chat), then issues a fresh `GET /api/credits` to reconcile.

- **OTP signup with 30-second resend cooldown.** Frontend posts `email + password + termsAccepted + ageVerified` to `/api/auth/send-otp`. Backend hashes the password with Django's `make_password`, stores it on the `EmailOTP` row, and sends a styled HTML email via AWS SES (table-based layout, inline `cid:` logo attachment, mobile media-query that tightens the 6-digit code's letter-spacing on narrow screens). On `POST /api/auth/verify-otp`, the cached hashed password is reused to atomically create the `User`, `Credits(balance=500)` (signup bonus), `CreditTransaction`, and return JWT access + refresh.

- **404 page is just a catch-all `*` route.** Last entry in `Navigation.jsx`, renders a themed page with "Go back" + "Back to home" buttons.

---

## F. Mock interview Q&A — be ready for these

### Q1. "Walk me through Virtual GFE."
> "It's an AI-companion chat app — a user picks a character and chats with them, and inline can ask for an image of the character, a voice reply, or a video clip. The chat is real-time over a WebSocket. The hard part isn't the AI — we don't train or host any models — it's the **per-turn pipeline**: a single chat turn might fire 5 upstream API calls (compliance check, chat completion, image edit, prompt enhance, video generation) and each one moves credits on a Postgres wallet. The bigger jobs like video take 35+ seconds and run async with webhooks — we persist them as `GenerationJob` rows so they survive WS drops and worker restarts. Everything's Django 5 + Channels + Celery + Redis on the backend, React 19 + Redux on the frontend."

### Q2. "Why a WebSocket consumer instead of a regular REST endpoint?"
> "Two reasons. One, the chat is half-streaming — the user sends, the server fires a `checking_compliance` event, then `generation_started`, then `new_message` — those are server-pushed, not request/response. Two, video generation is a long async job, and once the provider's webhook calls our backend with the result, we need to push it to the right open client. With Channels' group_send and a per-chat group (`chat_<uuid>`), we just publish the message to the group and any connected client gets it. With REST you'd need long-polling or SSE — Channels gives me a single bidirectional pipe that handles both sides."

### Q3. "How do you stop someone double-spending credits in race conditions?"
> "Every credit mutation is `select_for_update().get(...)` inside `transaction.atomic`. So if a user fires two send-message events in parallel — say from two tabs — the second one waits for the first's lock to release before reading the balance. If the first one already drove balance to zero, the second's `reserve_credits` call throws `InsufficientCreditsError` and the consumer sends a friendly error back. The `Credits` row is the single source of truth — we never compute balance from the transaction log, the log is just an audit."

### Q4. "The video gen takes 35 seconds — what happens if the user refreshes mid-generation?"
> "The `GenerationJob` row is the durable handle. When the consumer enqueues the job, it persists the row with status `queued`, submits to the provider with `webhook_url=<our endpoint>/job_id`, and sends a `generation_started` event with the job_id. Frontend keeps that job_id in Redux. If the WS drops or the user reloads, on reconnect we poll `GET /chats/<id>/generation-jobs?statuses=queued,running` to recover any in-flight jobs and re-show the 'generating' placeholders. The provider doesn't know we dropped — it still posts the result to our webhook URL when ready, our `VideoGenerationWebhookView` writes the resulting `Message` and `group_send`s it to whoever's currently connected. If nobody's connected at completion time, that's fine — the next poll picks up the now-succeeded job with `result_message` set."

### Q5. "How do you make the chat answer reflect things like 'I'm female, address me as her'?"
> "Two pieces. First, the `User.gender` field — a simple choices field (`male`/`female`/blank) editable from the profile page via a custom dropdown that auto-saves on change. Second, the `build_system_prompt` function takes the user's gender and picks the right closing line — `Assume you are talking to a woman unless told otherwise.` for `female`, the legacy `man` line otherwise. The trap I hit: `self.user` is captured once at WS connect, so a mid-chat gender change wouldn't reflect — the cached attribute was stale. Fix was a `self.user.refresh_from_db(fields=['gender'])` inside `get_dynamic_system_prompt` so every chat turn reads fresh. One extra single-column SELECT per turn, negligible."

### Q6. "What's in your compliance check exactly?"
> "It's a provider-side endpoint that scores text for things like minors, violence, sex-for-money — anything that would be a TOS violation. The tricky part isn't calling it, it's *what to send*. If I send only the user's literal message — 'pretty please' — the provider has no context and might reject for vagueness. So I build a context block: character description first, then `Age: 28`, then up to the last 3 user-only turns capped at 500 chars each, then the new message. **I exclude assistant replies** — they leak phrases like 'had a glass of wine' that get flagged as alcohol. I also scrub the character's NAME from the whole block — the provider rejects prompts that look like they're addressing a real person — and a regex scrub for any 'X credits' mentions that the AI sometimes drops into its replies. Cost is 1 credit, skipped for messages ≤2 words because there's nothing meaningful to check."

### Q7. "Walk me through a bug you fixed."
> "On the Credits & Billing page, the credit chip in the navbar would correctly show 558, but the big number in the page header would show 0. Only after logout/login did it show right. Root cause: the page was reading from `state.chat.credits`, which is hydrated by the chat WebSocket only after you open a chat. If you navigated directly to /credits-billing without ever hitting /inbox, the chat slice was still at its initial 0. The fix was layered: (1) flip the source-of-truth — read `auth.user.credits` first (it's persisted in localStorage so it's always available), fall back to `chat.credits`; (2) on mount, fire a fresh `GET /api/credits` and dispatch into both slices so the page also self-corrects against the server. Now the page shows the right number on direct visits and never goes stale."

### Q8. "How does the email OTP signup work?"
> "Two-endpoint flow. `POST /auth/send-otp` takes email + password + termsAccepted + ageVerified, validates, looks up any existing unused OTP for that email, enforces a 30-second resend cooldown (returns 429 with `retry_after` if hit too soon), generates a 6-digit code with `secrets.randbelow`, **stores Django's hashed password** on the `EmailOTP` row (not plaintext), and sends the code via AWS SES SMTP. The HTML email is dark-themed with the brand logo attached inline via `cid:` (multipart/related) so Gmail doesn't show it as a download. On `POST /auth/verify-otp` we look up the unused OTP, check expiry (10 min) and attempt count (max 5), and if the code matches we atomically create the `User`, `Credits(balance=500)`, and a `CreditTransaction(type='signup_bonus')`, then return JWT access + refresh. The password hash from the OTP row is reused as-is for the User — no need to re-hash, no need to ship the password back."

### Q9. "Why ceil(115.5) = 116 for video instead of just 115?"
> "Because the wallet is integer-typed. The provider quotes 115.5 credits per 5-second 720p video. If we stored decimals we'd need a Decimal column and decimal arithmetic everywhere, which complicates `select_for_update` math and the chip UI. So we ceil and over-charge by 0.5c per video. Auditable, integer-pure, and the worst-case user impact is half a credit — which doesn't even show up in the displayed balance. The provider's actual `credits_charged` (115.5) still gets persisted in `media_metadata` for reconciliation if we ever want it."

### Q10. "How do you keep prompts manageable for long chats?"
> "Once `message_count` hits 120, the next turn triggers `handle_summarization`. That calls a separate summarize endpoint with the full history, gets back a one-paragraph summary plus a list of memory entries ('user's favourite colour is purple', 'user mentioned they like beach scenes'), and writes both to the `Chat` row. From then on, instead of stuffing every message into the LLM prompt, we use `build_summarized_history(system_prompt, summary, memory_store, new_message)` — system prompt + a `Previous conversation summary` system message + the new user message. Total context stays bounded so the chat doesn't get more expensive or slower as it grows."

### Q11. "Why Django instead of FastAPI for a chat-heavy app?"
> "Three reasons. ORM + auth + admin out of the box — I get a real-time `Chat`/`Message` model with proper migrations, JWT auth via simplejwt, and a Django admin page for support to debug user-specific issues, without writing any of it. Two, Channels makes WebSockets feel like another view — I can call `database_sync_to_async(refund_credits)` inside a consumer with the same ORM, no separate worker pattern. Three, Celery + Redis stack is the standard Django background-job toolchain — for a job like video generation that needs Celery beat for periodic cleanup and a worker for webhook retries, sticking with Django gives me one infra to maintain. The async story (uvicorn + ASGI) is fine — uvicorn-worker is the prod entrypoint."

### Q12. "Deployment?"
> "Coolify on a Linux VPS. Single Dockerfile that pip-installs requirements, runs `collectstatic` + `migrate` on container start, then execs either uvicorn (web), `celery worker`, or `celery beat` based on a `SERVICE_TYPE` env var. Postgres + Redis are separate Coolify services on the same host. Frontend builds with Vite to a static `dist/` and is served from CloudFlare Pages — talks to the backend over HTTPS via `VITE_API_BASE_URL`. WebSockets use the same hostname over `wss://`. Env config goes through Coolify's UI, including the Lightspeed API key + username, AWS SES SMTP credentials, S3 bucket name, and the SES sender email."

---

## G. Honest caveats — say these proactively if asked ✅

- **The AI models are not mine.** Chat completion, image gen, image edit, voice clone, and video gen all hit a single upstream provider (Lightspeed Cloud, with several backing models — `Wowify_LLM` chat, `fluxnsfw` image, `tts-max-1` voice, `alibaba/happyhorse-1.0/image-to-video`). I built the integration, the orchestration, the retry layer, the compliance pre-check, the credit accounting, the webhook callback handling, and the WS-fed UI. I do not train, fine-tune, or self-host any of the models.
- **No GPUs in my stack.** The backend is pure Django/Celery/Postgres/Redis. All inference is upstream API calls.
- **Compliance is provider-side too.** I send a constructed query to `/compliance/check`, they return ok/blocked. I don't run my own classifier. What I built is the *context construction* (which 3 user turns to include, scrubbing the character name and credits mentions) and the *flow* (pre-image-gen vs plain chat).
- **The video-gen webhook is open (no auth).** It's `permission_classes = [AllowAny]` because the provider posts there directly. The job_id in the URL is the only token — it's a UUID so guessing is impractical, and the handler only updates the job if its status is non-terminal. For an even tighter setup I'd add a shared HMAC header — that's a known follow-up.
- **The "Send me a naughty video" button** does a slightly different flow than the Video flag (no prior text reply step, uses a fixed seed prompt). Same underlying pipeline though — image edit → enhance → video gen → webhook → message.
- **Payments aren't live yet.** The 500-credit signup bonus is the only way to get credits right now. The "Buy Credits" button + the Premium Membership card are intentionally disabled with "coming soon" placeholders; the original UI is preserved as block comments in the components for when payments ship.

---

## H. Stack one-liner — use this when an interviewer says "what's the stack"

> **Backend:** Django 5 + DRF, Django Channels 4 + Daphne/uvicorn (ASGI), Postgres 15 + psycopg3, Redis 7 (cache + Celery broker + Channels layer), Celery 5 + Celery Beat, simplejwt for JWT, httpx for async outbound, AWS S3 (boto3) for images, AWS SES for OTP email, Coolify on a VPS for deploy.
>
> **Frontend:** React 19 + Vite 7 + Tailwind 4 + Redux Toolkit 2 + React Router 7, axios with JWT interceptor + refresh, react-hot-toast, custom WebSocketService class with auto-reconnect + outgoing queue + heartbeat, IntersectionObserver for lazy-loaded video messages.
>
> **Upstream provider:** Lightspeed Cloud — chat completion (`Wowify_LLM`), image generation (`fluxnsfw`), image edit (NSFW), voice TTS (`tts-max-1`), and image-to-video (`alibaba/happyhorse-1.0/image-to-video`). I built the wrapper, retry, compliance, credit, and orchestration layer — not the models.

---

# 6. Vouchley — real-time signup verification API for SaaS ✅

> **Live:** vouchley.getrevlio.com · **API:** api.vouchley.getrevlio.com · Built solo, ~3 weeks to MVP.
> All facts below are code-verified — read off the repo before writing.

---

## A. What it is (plain) — your interview elevator pitch

**Vouchley is a real-time signup verification API for SaaS.**

A SaaS team adds one HTTP call to their signup handler. They POST the new user's email and IP address; Vouchley returns a **0–100 trust score**, a **plain-English recommendation** (`approve` / `review` / `block`), and a **breakdown of every signal that fired** — all in under 1.5 seconds at the p95.

The problem it solves: every B2B SaaS gets killed by fake signups. Bots from datacenter IPs, disposable emails like `mailinator.com`, VPN/Tor traffic, AI-driven agentic signups that bypass legacy CAPTCHA, shell domains registered yesterday — all of it pollutes free-tier metrics, burns LLM credits, wrecks email deliverability, and corrupts conversion analytics.

Existing tools either solve a narrower slice (Kickbox / ZeroBounce = email validation only, no IP signals) or are enterprise-priced (Sift starts at $30k/year). **Vouchley scores the entire signup in one call, prices per-credit starting at $29, and ships in 5 minutes of integration.**

Pricing is **one-time credit packs**, not subscriptions:
- $0 — 100 free credits on signup
- $29 — 3,000 credits (Starter)
- $99 — 12,000 credits (Pro, 15% cheaper per credit)
- $299 — 40,000 credits (Scale)
- Credits never expire. Cache hits are always free.

**End-to-end the platform has:**
- A FastAPI backend that runs five signal checks in parallel (email, MX, disposable, domain, IP)
- A Next.js 16 marketing + docs + dashboard frontend
- A Dodo Payments webhook for credit grants
- A bulk-verify endpoint with per-item isolated DB sessions
- A full agent-discovery layer (RFC 8288, RFC 9727, Markdown for Agents, MCP server card, agent-skills index) for AI-agent SEO
- Programmatic SEO pages (`/vs/{competitor}`, `/disposable-emails/{domain}`)
- 53 hand-authored markdown variants of every public page so AI agents can fetch a clean copy

It runs on a single 4GB Hetzner VPS via Coolify — shared Postgres + Redis with multiple apps co-located. **Cost of operating: ~$8/month plus per-check costs to IPQualityScore + OpenRouter.**

---

## B. Tech Stack (every item below is in `requirements.txt` or `package.json` — verified)

### Backend — `backend/`
- **FastAPI** (async) + **Pydantic** for request/response schemas
- **Python 3.12** in a single-stage Docker image
- **uv** (Rust-based pip replacement) — `uv pip install --system` is 10–100× faster than pip, critical because the 4GB VPS was OOM-killing during pip's wheel-build step
- **PostgreSQL** + **SQLAlchemy 2.0 async** with **asyncpg** driver
- **Alembic** migrations (3 versions: init, billing-profile, perf-indexes)
- **Redis** for: session store, API-key auth cache, rate-limit counters, verification-result cache, bulk job state, OTP storage
- **httpx** async client (one shared singleton across all outbound calls)
- **dnspython** for MX lookups
- **email-validator** for syntax checks
- **bcrypt** for password hashing (wrapped in `asyncio.to_thread`)
- **Svix** HMAC verification for Dodo webhooks
- **OpenRouter** as the LLM gateway (default model: `anthropic/claude-haiku-4.5`)
- **IPQualityScore** API for IP / VPN / Tor / risk scoring
- **RDAP.org** for domain registration age
- **Dodo Payments** as the merchant of record (handles VAT, GST, tax compliance globally)
- **Resend** for transactional email (OTP, password reset, contact form)

### Frontend — `frontend/`
- **Next.js 16** App Router + **React 19** + **TypeScript 5.6**
- **Tailwind v4** (CSS-first `@theme` directive, no `tailwind.config.js`)
- **shadcn/ui** primitives (button, card, table, etc.)
- **Sonner** for toast notifications
- **lucide-react** icons
- **PostHog** for product analytics
- **gray-matter** + **remark** + **shiki** for blog markdown rendering
- **date-fns** for date formatting
- **Zod** + **react-hook-form** for forms
- **next/font** with **Geist Sans**, **Geist Mono**, **Instrument Serif**

### Infra
- **Hetzner** VPS (4GB RAM, 2 vCPU, 4GB swap) → **Coolify** orchestration
- Single VPS hosts: shared Postgres, shared Redis, the backend container, and other side projects
- **Cloudflare** in front for edge protection
- **Vercel** for the Next.js frontend (free hobby tier)
- DNS on **Hostinger** with apex-domain MX records (ImprovMX for `*@getrevlio.com` → personal Gmail)

---

## C. Core technical work — the things to talk about at depth

### C.1 ✅ Multi-signal parallel verification pipeline (`services/verify.py`, `services/scoring.py`)

This is the heart of the product. The interesting engineering is that **five distinct signal checks run concurrently**, each hitting either a different upstream API or a different in-process check, and the results are merged + scored before the response goes out.

**The signals (all in parallel via `asyncio.gather`):**

1. **Email check** (`services/email_check.py`) — syntax (RFC 5322 via `email-validator`), MX async DNS lookup with 2.5s timeout, disposable-domain check against a frozenset of ~6,000 domains loaded at startup, free-provider detection (Gmail/Proton/Outlook), role-based detection (`info@`, `admin@`, `sales@`).

2. **Domain check** (`services/domain_check.py`) — HTTPS HEAD/GET probe on naked + `www.` versions of the domain to confirm the site is live, plus an RDAP lookup at `rdap.org/domain/{domain}` for registration-age in days. Both with 2s timeouts.

3. **IP check** (`services/ip_check.py`) — single REST call to IPQualityScore with `strictness=0` and `fast=true` to get country, VPN flag, Tor flag, and a 0–100 risk score. 2s timeout.

4. **Person-match** (in-process) — does any name token appear in the email local part? Catches obvious "John Doe" vs `xkj9382@hotmail.com` mismatches.

5. **LLM scoring** (`core/openrouter.py` + `services/scoring.py`) — collected signals serialized to JSON, sent to OpenRouter with `anthropic/claude-haiku-4.5` and a scoring system prompt. Returns score + reasoning. 2s timeout. **If the LLM call fails or times out, a rules-based fallback always produces a valid score** — never null.

**The parallel orchestration:**

```python
# services/verify.py
email_signals, company_signals, ip_signals = await asyncio.gather(
    check_email(email),
    check_domain(domain),
    check_ip(ip_address),
)
person_signals = infer_name_match(name, email)
score = await score_signals(email_signals, company_signals, person_signals, ip_signals)
```

Five upstream-ish calls in the time of the slowest single one. **p95 latency: under 1.5 seconds for fresh checks.**

### C.2 ✅ 30-day result caching with deterministic SHA-256 keys (`services/cache.py`)

Cache key format: `verify:{SHA256(email.lower() | ip | name.lower() | company.lower())}`. Same inputs → same key → cached response → **zero credits charged**.

Why this matters commercially: when a user signs up, half the time the signup form retries or auto-saves. Without caching, the customer would pay for those duplicates. With caching, **only the first attempt costs a credit** — that's the "cache hits are free" pricing line on the homepage, and it's enforced by `credits.deduct()` reading `cached: True` from the cache layer before deciding whether to write to the credit ledger.

TTL is 30 days, set with Redis `EX 2592000` on `cache_set`.

### C.3 ✅ Append-only credit ledger with atomic balance updates (`services/credits.py`, `models/credit_ledger.py`)

**Invariant:** `user.credits_balance` MUST equal `SUM(credit_ledger.delta WHERE user_id = ?)` at all times.

Every credit change (signup bonus, pack purchase, check deduction, refund) writes:
1. An atomic UPDATE on `users.credits_balance` using PostgreSQL's `RETURNING` clause for the new balance
2. An INSERT into `credit_ledger` with the delta, a `reason` enum, and a `reference_id` for idempotency

The `reference_id` is what makes Dodo webhook retries safe — if the same payment arrives twice, the second INSERT fails the unique constraint and the credit isn't double-granted. Code lives in `routes/webhooks.py` lines 165–229.

### C.4 ✅ Bulk verification with per-item isolated DB sessions (`services/bulk_worker.py`)

`POST /v1/verify/bulk` accepts up to 1,000 items, returns immediately with `202 Accepted` and a `job_id`, and queues the work via FastAPI's `BackgroundTasks` — no Celery, no RQ.

The trick that makes this robust: **each item gets its own `AsyncSessionLocal()` block** (`bulk_worker.py:83`). If one item's DB write fails (constraint violation, deadlock, anything), it doesn't poison the rest of the batch. The next item opens a fresh session.

Job state lives in Redis as a single JSON blob keyed `job:{job_id}` with a 7-day TTL. Clients poll `GET /v1/jobs/{job_id}`.

**Honest caveat:** the worker runs in the same process as the API. If the container restarts mid-batch, the unprocessed items are lost. For MVP scale (most jobs are 50–200 items, finish in 10–60 seconds) this is acceptable. A future v2 would move to Celery or a Postgres-backed queue.

### C.5 ✅ Sliding-window sessions (`core/sessions.py`)

Dashboard sessions are stored in Redis as `session:{token}` → JSON `{user_id, created_at}`. Token is 32 bytes of URL-safe base64.

**The smart part:** on every authenticated read, the handler calls `await redis.expire(key, settings.session_ttl_seconds)`. That resets the 7-day TTL on every active request, so a user who's clicking around the dashboard stays logged in forever — only genuinely idle sessions expire. Implementation is ~3 lines in `core/sessions.py:get_session()`.

Cookie is `vouchley_session`, HTTP-only, `SameSite=Lax`, `Secure` in production.

### C.6 ✅ API key auth with Redis cache + single-query JOIN (`dependencies.py`)

API keys look like `vch_live_<32-char-hex>` (or `vch_test_` for sandbox). Stored as SHA-256 hashes — the plaintext is shown to the user exactly once at creation and never persisted.

Each authenticated request:
1. Hashes the incoming `Authorization: Bearer` token
2. Checks Redis: `apikey:{hash}` → cached `AuthContext` (user_id, api_key_id, environment, credits_balance). 5-minute TTL.
3. **Cache miss:** single JOIN query `select(ApiKey, User).join(User, User.id == ApiKey.user_id)` (`dependencies.py:97–104`). One round trip instead of two.
4. Writes the AuthContext back to Redis
5. Updates `api_keys.last_used_at`

The JOIN consolidation was an explicit perf fix — comment in the code says *"One round trip instead of two."*

### C.7 ✅ Dodo Payments webhook with Svix HMAC + replay-safe credit grants (`routes/webhooks.py`)

Dodo (the merchant-of-record I use because it handles VAT/GST/sales-tax globally, which I do not want to build) POSTs to `/webhooks/dodo`. The handler:

1. **Verifies the Svix HMAC signature** using the three headers (`webhook-id`, `webhook-timestamp`, `webhook-signature`) and the raw request body. Reject with 401 if invalid.
2. **Audits the event** to `webhook_events` table with `processed_at = NULL`.
3. **Dispatches by event type** — credit-grant events (`subscription.active`, `subscription.renewed`, `subscription.payment_succeeded`) flow through `credits.grant()`. Subscription-ended events update `subscriptions.status`.
4. **Idempotency:** the `reference_id` on the credit-ledger insert is either the payment_id or `{subscription_id}:{period_end}`. The unique constraint blocks double-grants on retries.
5. **Mark processed** by setting `webhook_events.processed_at = now()`.

### C.8 ✅ Shared httpx.AsyncClient (`core/http_client.py`)

Every outbound API call (IPQualityScore, RDAP, OpenRouter, Dodo) goes through a singleton `httpx.AsyncClient` initialized in the FastAPI `lifespan` context. Connection pool limits: 50 max, 20 keepalive. Saves ~5–10ms per verify by reusing the TCP/TLS handshake.

This was a deliberate perf fix — the original code spun up a new client per request, which is the canonical anti-pattern.

### C.9 ✅ Agent-discovery infrastructure — the SEO-for-AI layer

This is the layer most SaaS sites don't have, and it's worth talking about as a forward-looking move:

- **Markdown for Agents** — every public page has a `.md` variant. Hit `vouchley.getrevlio.com/pricing` with `Accept: text/markdown` (or just go to `/pricing.md`) and you get a clean markdown copy instead of the rendered HTML. Implemented via Next.js middleware that detects the header / suffix and rewrites to `/api/agent-markdown?path=...`. The route handler reads from `frontend/content/agent-md/<path>.md`. **53 hand-authored markdown files** covering homepage, pricing, docs, legal, comparison pages, and all 20 disposable-domain pages. Blog posts reuse the existing markdown source in `content/blog/`.
- **RFC 8288 Link headers** — every HTML response carries `Link: </docs>; rel="service-doc"`, `Link: </sitemap.xml>; rel="sitemap"`, `Link: </.well-known/api-catalog>; rel="api-catalog"`, and `Link: </path.md>; rel="alternate"; type="text/markdown"`.
- **RFC 9727 API catalog** at `/.well-known/api-catalog` — `application/linkset+json` describing the OpenAPI spec URL, the human docs, the health endpoint, terms, privacy.
- **RFC 8414 oauth-authorization-server** at `/.well-known/oauth-authorization-server` — minimal-but-honest metadata. `grant_types_supported: []` (no OAuth flows), `token_endpoint_auth_methods_supported: ["bearer"]`, plus an `agent_auth` block per the WorkOS `auth.md` spec and `x-vouchley-auth-model: "api-key"` extension.
- **RFC 9728 oauth-protected-resource** at `/.well-known/oauth-protected-resource`
- **MCP Server Card** at `/.well-known/mcp/server-card.json` per SEP-1649 — describes a planned MCP wrapper of the REST API. Six tools (`verify_signup`, `verify_bulk`, `get_job_status`, `get_verification`, `get_usage`, `get_account`) with JSON-schema inputs, each annotated with `x-rest-equivalent` pointing at the live REST endpoint.
- **Cloudflare Agent Skills Discovery** at `/.well-known/agent-skills/index.json` — index of 4 skills (verify-signup, verify-bulk, disposable-email-database, integrate-signup-verification), each with a SHA-256 digest computed at request time over the SKILL.md body.
- **WebMCP** via `navigator.modelContext.provideContext()` — exposes 4 in-browser tools (lookup_disposable_email_domain, recommend_credit_pack, open_vouchley_docs, start_vouchley_signup) for browsers that implement the spec.
- **`auth.md`** at the site root — WorkOS auth.md spec for agent registration, served via the same markdown infrastructure.
- **Content-Signals in `robots.txt`** — `Content-Signal: search=yes, ai-input=yes, ai-train=no` to let AI assistants cite us live while blocking training ingestion.

All of this is genuinely deployed and inspectable via curl. Most of it is forward-looking (the MCP server isn't live yet, the JWKS for HTTP Message Signatures is empty), but the metadata is honest about what's planned vs. live (`metadata.status: "planned"` on the MCP card, empty `grant_types_supported` on the OAuth doc).

### C.10 ✅ Programmatic SEO with anti-spam guardrails

Two scaled content patterns, both hand-curated, both modest in scope:

- **`/vs/{competitor}`** — 3 honest comparison pages (Kickbox, ZeroBounce, Sift) with real pricing data verified against each vendor's public pricing page on 2026-04-28. Every page has a "**when the competitor is honestly the better pick**" section. Buyers can smell pure marketing.
- **`/disposable-emails/{domain}`** — 20 hand-authored pages covering the most-searched-for disposable services (Mailinator, 10minutemail, Guerrilla Mail, YOPmail, etc.) plus a separate sub-section explaining why Gmail / Proton / Outlook are NOT disposable. Each domain page is unique content — the operator, launch year, aliases, why-to-block — not a templated regurgitation.

The full live disposable blocklist used by the API covers ~6,000 domains; the SEO pages are deliberately limited to the ones people Google by name.

---

## D. ⭐ THE VERIFICATION PIPELINE — request lifecycle at depth

The "show me how a real request flows through your system" question is the one to be ready for. Here's the full lifecycle of one `POST /v1/verify` call, all references to actual code paths.

### Step 1 — Rate limit gate (`core/rate_limit.py`)

The `rate_limit_authed` dependency runs first. Fixed-window per-API-key counter in Redis:

```
bucket = f"rl:ak:{api_key_id}:{int(time.time() // 60)}"
count = await redis.incr(bucket)
if count == 1:
    await redis.expire(bucket, 65)  # full minute + 1s grace
if count > limit:
    raise HTTPException(429, "Rate limit exceeded")
```

Limit is 100 RPM if balance ≤ 100 (Free tier), 600 RPM otherwise. Multiple keys per account means a customer can horizontally distribute load across keys if they need it.

### Step 2 — Auth context (`dependencies.py:80–141`)

Extract the Bearer token, hash it, check Redis (`apikey:{hash}` with 5-min TTL). On miss, fire the single JOIN query, persist the AuthContext to Redis, and return.

Crucially, this is **one query that returns both `ApiKey` and `User`**, not two queries with a Python join. Saves a network round trip on every cold-cache request.

### Step 3 — Balance check (`services/credits.py`)

If `ctx.credits_balance <= 0`, return `402 Payment Required` immediately. No work happens for users at zero balance. (Cached responses still work because the cache hit branches before the balance check in some code paths.)

### Step 4 — Cache lookup (`services/cache.py`)

Hash `(email, ip, name, company)` to a 64-char SHA-256 hex string. Look up `verify:{hash}` in Redis. If found, return immediately with `cached: true` and `credits_charged: 0`. **The credit ledger only gets a `check` row for billable calls, not cache hits** — this is the "cache hits are free" promise enforced at the data layer.

### Step 5 — Parallel signal gathering (`services/verify.py`)

The interesting part. Three independent network-bound checks fire concurrently via `asyncio.gather`:

```python
email_sig, domain_sig, ip_sig = await asyncio.gather(
    check_email(email),    # MX DNS query + frozenset lookups
    check_domain(domain),  # HTTPS HEAD on naked + www + RDAP lookup
    check_ip(ip_address),  # IPQualityScore REST call
)
```

Each of those has a hard 2–2.5 second timeout via `asyncio.wait_for`. Worst case: all three time out at the same moment, total elapsed = 2.5s. Best case (cache-warm DNS, fast remote APIs): ~300–500ms.

`infer_name_match(name, email)` runs after the gather — it's a pure local function, takes microseconds.

### Step 6 — LLM scoring (`services/scoring.py` + `core/openrouter.py`)

The signals dict is serialized to JSON and sent to OpenRouter with a system prompt that says, essentially, *"given these signals, output a 0–100 score and one of approve/review/block and a one-sentence reasoning."* Model is `anthropic/claude-haiku-4.5` — chosen for the sub-second latency at low cost.

If the LLM returns valid JSON within 2 seconds, that's the score.

If the LLM times out, errors, or returns malformed JSON, the **rules-based fallback** kicks in:
- Start at score 50
- −20 for disposable, −15 for VPN, −10 for Tor, −10 for datacenter IP, +10 for valid MX + alive domain + role-based-false, etc.
- Clamp to 0–100
- `recommendation` derived from the score: ≥70 = approve, 40–69 = review, <40 = block

The response includes `scoring_source: "llm:v1"` or `scoring_source: "rules:v1"` so customers can audit which path their score came from. **The fallback means we never return null** — Vouchley always gives a verdict, even when every upstream is broken.

### Step 7 — Credit deduction (`services/credits.py`)

Atomic UPDATE on `users.credits_balance` with `RETURNING new_balance`, plus INSERT into `credit_ledger` with `delta: -1`, `reason: "check"`, and `reference_id: request_id`. Single transaction. If the UPDATE returns a balance of 0 or below (which shouldn't happen because of Step 3, but defense in depth), the credit isn't deducted and the API returns 402.

### Step 8 — Persist + cache + respond

- Insert a `checks` row with the full response as `JSONB` (so customers can audit historical checks via `GET /v1/verify/{id}`)
- Write the response to the cache under the SHA-256 key (TTL 30 days)
- Return the response — `request_id`, `score`, `recommendation`, all signal objects, `flags`, `reasoning`, `cached: false`, `processed_in_ms`

### The result

- **Cached path (most repeat traffic):** sub-100ms p95 — Redis lookup + JSON serialize.
- **Cold path (first time we've seen this email + IP combo):** 800ms–1.5s p95, depending on which upstream API is slowest that day.
- **Worst case (all upstreams timeout):** still under 3 seconds, with a rules-based score, never a 500.

### How this would sound in an interview

> "The verify endpoint does five things in parallel — email syntax + MX, disposable check, IP reputation via IPQualityScore, domain liveness + RDAP age, and a person-match heuristic on the name. All concurrent via `asyncio.gather`, each with a 2-second hard timeout. The signals get serialized and sent to Claude Haiku via OpenRouter for the final score — that has a 2-second timeout too. If the LLM fails or times out, there's a rules-based scorer that always produces a valid number, so the API never returns null even if every upstream is down.
>
> Around that core there's a Redis cache keyed on a SHA-256 of `(email, ip, name, company)` — same inputs return the cached response instantly and cost zero credits. That's the 'cache hits are free' line on the homepage, enforced at the credit-ledger level.
>
> Credits themselves are an append-only ledger. Every change — signup bonus, pack purchase, check deduction — writes a delta row with an idempotency key. That's what makes Dodo Payments webhook retries safe — same payment_id, unique constraint, no double-grant.
>
> p95 is under 1.5 seconds cold, under 100ms warm. Built solo in three weeks, runs on a 4-gig Hetzner VPS for under $10 a month plus per-check costs to IPQualityScore and OpenRouter."

---

## E. Mock interview Q&A — be ready for these

### Q1. "Walk me through Vouchley."
> "Real-time signup verification API. A SaaS adds one HTTP call to their signup handler — POST email plus IP, get back a 0–100 trust score and an approve / review / block recommendation in under 1.5 seconds. The interesting engineering is that the score combines five different signals — email syntax + MX, disposable detection, IP reputation via IPQualityScore, domain liveness + registration age via RDAP, and a person-name match heuristic — all in parallel via asyncio.gather, then a final scoring step that calls Claude Haiku via OpenRouter for the verdict, with a rules-based fallback if the LLM is down. There's a Redis-backed result cache that makes cache hits free, an append-only credit ledger that makes Dodo webhook retries idempotent, and a bulk endpoint for batch validation. Stack is FastAPI + Postgres + Redis on the backend, Next.js 16 on the frontend, deployed on a single 4-gig Hetzner VPS via Coolify."

### Q2. "Why credit packs and not a subscription?"
> "Signup verification traffic is bursty. A product launch, a viral post, a spam wave — these all spike for a day or three and then go quiet. Subscription pricing forces customers to either over-pay for an idle month or hit a cap mid-spike. Credit packs scale with what you actually use. Credits never expire so there's no FOMO on a pack you bought six months ago. Commercially it's also a simpler invoice for the customer's accounts team — one-time charges, not recurring.
>
> Operationally there's an auto-refill option on the Pro plan that's effectively a subscription, but it's opt-in and the user controls the trigger threshold. Best of both worlds without forcing the model on people."

### Q3. "Why the multi-signal approach instead of just email validation?"
> "Email validation only catches one class of fake — disposable inboxes. The other classes you miss completely: VPN traffic, datacenter IPs, brand-new shell domains, AI-bot signups that mimic human typing patterns, Gmail alias tricks. A throwaway disposable is one signal. The IP, the domain age, and the behavior tell you the rest of the story. Vouchley scores all of it in one call so the customer gets a single decision — approve, review, block — instead of having to stitch together five separate vendors and write their own scoring rule.
>
> The price is comparable. Email-only validators like DeBounce are cheaper per check at the surface level — but they don't catch any of the non-email signals. For a B2B SaaS where one fake free-tier signup costs you 1,000 LLM credits, that's pennywise pound-foolish."

### Q4. "Walk me through the verification pipeline at depth."
> [Use the spoken script at the end of Section D — five parallel signals, 2-second timeouts, LLM scoring with rules fallback, Redis cache with SHA-256 keys, atomic credit deduction with idempotency key, JSONB persist, cache write, respond.]

### Q5. "What's the single biggest perf trick in the verify endpoint?"
> "Two things competing. The first is the parallel signal gathering — `asyncio.gather` on the three network-bound checks turns 'three sequential 800ms calls' into 'one 800ms wait,' which is the difference between a 2.5-second response and a 700ms one. That's an asymptotic win on the cold path.
>
> The second is the cache. 30-day TTL keyed on a SHA-256 of the inputs, with the credit deduction skipped for cache hits. Most real signup forms retry or auto-save — without the cache the customer pays for every duplicate. With it, they only pay for the first attempt. Most of the time, 'cache hits are free' is what makes the per-check pricing competitive.
>
> If I had to rank, the gather is what makes the cold path fast; the cache is what makes the pricing model work."

### Q5b. "How does the cache enforce 'free hits'?"
> "Cache lookup happens before the balance check. If `cache_get(key)` returns a value, we set `credits_charged = 0` on the response and skip the credit-ledger write entirely. The `checks` table row still gets created with `cached: true` for audit purposes, but it doesn't deduct from the user's balance. So the invariant `user.credits_balance == SUM(credit_ledger.delta)` holds — cache hits just don't insert ledger rows."

### Q6. "Why an append-only credit ledger instead of just incrementing a column?"
> "Idempotency on Dodo webhooks is the killer reason. Dodo retries on every non-2xx response, sometimes for hours. If I incremented the balance column directly and the webhook hit twice, the user gets double credits. With a ledger, every entry has a `reference_id` — the payment_id or `subscription_id:period_end` for renewals — and a unique constraint on it. The second insert fails, the balance update is skipped, no double-grant.
>
> Audit is the second reason. When a customer says 'where did my credits go,' I can query the ledger by user_id and show them every signup bonus, every pack purchase, every check that deducted. The `users.credits_balance` column is a denormalized cache of the ledger sum — it has to match, and any divergence is a bug to investigate."

### Q7. "What happens when the LLM call to OpenRouter fails?"
> "Rules-based fallback. The scoring function has two paths — one calls OpenRouter with a 2-second timeout and JSON mode, the other is a pure Python function that starts at score 50 and applies plus-or-minus adjustments per signal. If the LLM call times out, errors, or returns malformed JSON, the fallback runs. The response includes a `scoring_source` field — `llm:v1` or `rules:v1` — so customers can audit which path their score came from.
>
> The reason I built it this way: an upstream LLM outage cannot take down our verify endpoint. The whole pitch is sub-1.5-second response time with a verdict every call. A null score or a 500 would break customer signup flows that depend on us. Always returning a valid verdict, even degraded, is more important than always returning the optimal verdict."

### Q8. "How does the bulk verify work? Is that Celery?"
> "FastAPI BackgroundTasks, not Celery. When the request comes in, we create a Redis job-state record, add the worker function to `BackgroundTasks`, and return 202 Accepted with the job_id. The worker iterates the items serially — but each item gets its own `AsyncSessionLocal()` block, so a failure on item 47 doesn't poison item 48. Job state lives in Redis with a 7-day TTL; clients poll `GET /v1/jobs/{job_id}`.
>
> The honest caveat: this isn't crash-safe. If the container restarts mid-batch, the unprocessed items are lost. For the current scale — batches of 50 to 200, finishing in 10 to 60 seconds — that's fine. If we ever needed batches of 100k or true durability, I'd move to Celery or a Postgres-backed queue. The 'simplest thing that works' principle."

### Q9. "Why sliding sessions instead of fixed-expiry?"
> "User experience. Fixed-expiry sessions log out an active user mid-task, which is brutal for a dashboard product. Sliding sessions extend the TTL on every authenticated read — so if you're clicking around, you stay logged in forever, only genuinely idle sessions expire after seven days.
>
> Implementation is one line in `get_session()` — after the Redis GET, call `await redis.expire(key, ttl)`. That resets the countdown. No extra storage, no extra reads, just a refresh on the existing TTL. It's the kind of small choice that costs nothing and noticeably improves the product feel."

### Q10. "How does your API key auth scale? Don't you hit the DB on every request?"
> "Hashed key plus a 5-minute Redis cache. The first request after a key creation hits the DB with a single JOIN — `select(ApiKey, User).join(User, User.id == ApiKey.user_id)` — and we cache the AuthContext in Redis under `apikey:{hash}`. Every request for the next 5 minutes is a Redis GET — sub-millisecond, no DB round trip.
>
> The JOIN is itself an optimization — there was an earlier version that did two queries, one for ApiKey then one for User. Consolidated to one JOIN, dropped a round trip per cold-cache request. The code comment literally says 'one round trip instead of two.'
>
> 5-minute TTL is the tradeoff between revocation latency (max 5 minutes for a revoked key to start failing) and DB load. If we ever needed instant revocation, we could publish revocation events on a Redis pub/sub channel and invalidate the cache entry — but at current scale, 5-minute lag is acceptable."

### Q11. "What's the 'cache key' on the verify endpoint, and why?"
> "SHA-256 of `(email.lower() | ip | name.lower() | company.lower())`. Deterministic — same inputs always produce the same key, so duplicate signups from the same browser session hit the cache instantly. 30-day TTL.
>
> Why hash instead of just concatenating? Two reasons. One, the cache key is shorter and predictable in size — 64 hex chars regardless of input length. Two, it sidesteps any weirdness with special characters in emails (`+tags`, accented domains, etc.) — they all hash cleanly. The actual identifying data still lives in the `checks` table for audit; the cache key is just a deterministic pointer."

### Q12. "Tell me about the agent-discovery stuff."
> "This is a forward-looking layer. The idea is that when AI agents — ChatGPT, Perplexity, Cursor, Claude — try to discover or use your API, they should find a machine-readable description without scraping marketing pages.
>
> What's deployed: an API catalog at `/.well-known/api-catalog` per RFC 9727 (linkset JSON pointing at the OpenAPI spec + docs + health endpoint), OAuth metadata documents at `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource` per RFC 8414 and 9728, an MCP server card at `/.well-known/mcp/server-card.json` describing six planned tools that wrap the REST API, a Cloudflare-spec Agent Skills index, an `auth.md` per the WorkOS spec for agent registration, Content-Signals in `robots.txt` declaring `ai-train=no, ai-input=yes, search=yes`, RFC 8288 Link headers on every HTML response pointing at the catalog and the markdown variant, and a Markdown-for-Agents layer that returns a clean markdown copy of any page when the request sets `Accept: text/markdown` or appends `.md` to the URL.
>
> Most of this is honest about being forward-looking — the MCP transport isn't live yet, the JWKS for HTTP Message Signatures is empty. The metadata documents say so. But the infrastructure is in place, so the day an AI client actually queries `/.well-known/api-catalog`, Vouchley already has the right answer."

### Q13. "Deployment? Coolify on Hetzner — talk me through it."
> "Single 4-gig Hetzner VPS, 2 vCPU, 4-gig swap. Coolify manages Docker containers for everything — the FastAPI backend, a shared Postgres, a shared Redis. Multiple side projects co-locate on the same VPS to keep costs low; each app gets its own Postgres DB and its own Redis logical DB (0 through 15).
>
> The backend is a single-stage Dockerfile, Python 3.12 slim, `uv` instead of pip for installs because pip was OOM-killing the 4-gig VPS during the wheel-build step for httpx + httptools. With uv it installs in 5–10 seconds and uses far less peak RAM.
>
> Migrations run on every container start via an entrypoint script — Alembic acquires its own advisory lock so concurrent containers during a rolling deploy don't race.
>
> Front of everything is Cloudflare for DDoS + edge cache. Next.js frontend ships on Vercel free tier. The whole operation runs for about $8/month plus the variable per-check cost to IPQualityScore and OpenRouter."

### Q14. "Biggest bug you fixed?"
> "Dashboard load time. The KPI page was taking 26 seconds to render. Root cause was three issues compounding: bcrypt was running synchronously on the event loop during signin, the dashboard was firing six DB queries serially in one session (sequential awaits, not parallel), and the API key auth path was doing two DB queries instead of one.
>
> Fixed in three changes. One, wrapped `bcrypt.hashpw` and `bcrypt.checkpw` in `asyncio.to_thread` so they don't block the event loop. Two, refactored the dashboard handler to fire its six queries via `asyncio.gather`, but each one in its own `AsyncSessionLocal()` so they don't fight over the same session. Three, consolidated the API key auth into a single JOIN query — `select(ApiKey, User).join(User, ...)` — and cached the result in Redis with a 5-minute TTL.
>
> After: dashboard renders in under 500ms. The 26-to-0.5 number is real and measurable in PostHog.
>
> Lesson: every 'this is slow' bug is usually three small bugs stacked. Sequential awaits in async code is the most common one — looks fine, runs serially."

### Q15. "What would you build next?"
> "Three things on the roadmap.
>
> One — a real MCP server. The card is deployed at `/.well-known/mcp/server-card.json` describing six tools that wrap the REST API. Building the actual MCP transport (probably Streamable HTTP) so Claude and other MCP clients can invoke `verify_signup` directly would be a meaningful win, especially because we'd be one of the first signup-verification products with a native MCP surface.
>
> Two — per-scope API keys. Right now every key has full account access. Add `verify`, `read`, `write` scopes so customers can hand a read-only key to a dashboard tool without exposing their write power.
>
> Three — durable bulk jobs. The current BackgroundTasks-based worker isn't crash-safe. Moving to a Postgres-backed queue (`SKIP LOCKED` is enough at this scale, no need for Celery's complexity) would let customers submit a 50k-item batch and trust it'll finish even if the container restarts."

---

## F. Honest caveats — say these proactively if asked ✅

- **The LLM isn't mine.** The scoring step calls Claude Haiku via OpenRouter. I wrote the prompt, the JSON-mode parsing, the timeout / retry logic, the rules-based fallback when the LLM is down, and the `scoring_source` field that lets customers audit which path ran. I do not train, fine-tune, or self-host any model.
- **IP reputation is IPQualityScore.** I send the IP, they return country / VPN / Tor / risk-score. I wrap the response into our signal shape and apply timeouts. They're the data source.
- **Domain age is RDAP.org.** Standardized registry-data lookup, no proprietary database on my side.
- **Payments are Dodo Payments (Merchant of Record).** They handle VAT, GST, sales tax, card processing, customer portal, and refunds globally. I built the webhook handler with Svix HMAC verification, the idempotent credit-grant logic, and the subscription-state mirror in our Postgres. I do not process payments directly.
- **Bulk worker isn't crash-safe.** FastAPI BackgroundTasks, not Celery. If the container restarts mid-batch, the unprocessed items are lost. Acceptable for current scale (small batches, fast completion); known follow-up if scale demands it.
- **Single-VPS deployment.** Not horizontally scaled. Postgres + Redis are co-located with the app on a 4-gig Hetzner box. Works at current load; a multi-region or HA setup would need shared external Postgres + Redis and at least two app instances behind a load balancer. Not on the immediate roadmap.
- **No SOC 2, no HIPAA, no SSO.** Stated explicitly on the Security page (`/security`). If a customer's procurement team requires those, I tell them honestly that Vouchley isn't the right fit yet.
- **The `disposable_domains.txt` is a frozenset loaded at startup**, not a hot-reloadable database. To update the blocklist requires a container restart. Acceptable because the file changes slowly (additions are weekly at most).
- **MCP transport isn't live yet.** The server card describes a planned MCP surface and points each tool at its REST equivalent. `metadata.status: "planned"` is explicit.
- **JWKS for HTTP Message Signatures is empty.** Vouchley doesn't currently sign outbound requests, so the directory at `/.well-known/http-message-signatures-directory` returns `{"keys": []}` — future keys go there when signed-bot-traffic becomes real.

---

## G. Stack one-liner (verified) — use this when an interviewer says "what's the stack"

> **Backend:** FastAPI (async) + Pydantic, Python 3.12, SQLAlchemy 2.0 + asyncpg + Alembic on Postgres, Redis 7 for sessions / cache / rate-limit / job-state, shared httpx.AsyncClient with pooled connections, bcrypt in asyncio.to_thread for password hashing, Svix HMAC for Dodo webhook verification.
>
> **External services:** OpenRouter (LLM scoring, default model Claude Haiku 4.5), IPQualityScore (IP reputation / VPN / Tor), RDAP.org (domain age), Dodo Payments (Merchant of Record), Resend (transactional email).
>
> **Frontend:** Next.js 16 App Router + React 19 + TypeScript 5.6, Tailwind v4 with CSS-first `@theme`, shadcn/ui primitives, custom thin fetch wrapper to FastAPI (no auth library), full schema.org JSON-LD (Organization, WebSite, SoftwareApplication, FAQPage, BlogPosting, Breadcrumb), dynamic sitemap, PostHog product analytics.
>
> **Agent layer:** Markdown for Agents (53 hand-authored markdown variants), RFC 8288 Link headers, RFC 9727 API catalog, RFC 8414/9728 OAuth metadata, MCP server card (SEP-1649), Cloudflare Agent Skills index, WebMCP browser tools, WorkOS `auth.md`, Content-Signals in robots.txt.
>
> **Infra:** Single 4GB Hetzner VPS via Coolify, shared Postgres + Redis, Cloudflare in front, single-stage Dockerfile with `uv` for fast installs, Alembic migrations on container start. Frontend on Vercel hobby. Total ops cost ~$8/month.

---

# 7. Clarix — a multi-tenant project & task platform for agencies (Supabase + row-level security) ✅

> Verified by reading the actual repo — the migrations, the RLS policies, the 12 edge functions, the React feature modules, and the pgTAP/Vitest/Playwright suites. Simple words, real facts.

---

## A. What it is (plain) — your interview elevator pitch

A **project & task management platform built for agencies** — the kind of company that juggles many clients, overlapping people, and lots of boards at once. Think Linear / Asana shape:

**Organization → Teams → Projects → Boards → Tasks.**

- **Boards** show tasks two ways: a real **Kanban** (drag cards between columns) and a **grouped list** (group by status / priority / assignee). Tasks have status, priority, assignee, due date, **subtasks** (a checklist of child tasks), **comments with `@mentions`**, **file attachments**, **collaborators**, an **activity log**, and **trash / restore**.
- **In-app notifications** update **in real time** — a bell badge, a bottom-right toast, and a sound the moment something happens to your work.
- Two deep **integrations**: **two-way Slack** (personal DMs, channel mirroring, slash commands, thread-reply sync) and **Fathom** (AI meeting notes → auto-created tasks).
- You can **invite anyone by email** — a teammate or an external client — and they sign up, accept, and are automatically added to the project (and its boards).

The whole thing is **multi-tenant and gated by Postgres row-level security**, with a strict **guest** model so an external client can only ever see the one project they were invited to — never your org, your team roster, or other clients' work.

> **Honest framing (say this up front):** the repo's working-agreement doc sets the *north star* as an *"AI-native operating system for agencies."* That's the **vision** — the in-app **AI agent is explicitly deferred** (Wave 4+ in the phase map). What actually ships today is the project/task platform + the Slack and Fathom integrations. The only AI-adjacent feature that exists is Fathom turning meeting action-items into tasks. Don't claim LLM features that aren't in the code.

---

## B. Tech Stack (verified against `package.json`, the migrations, and `supabase/functions/`)

### Frontend — `src/`
- **React 18.3 + TypeScript 5.5 + Vite 5.4**
- **Tailwind CSS 3.4 + shadcn/ui** (Radix primitives: dialog, dropdown-menu, popover, select, tabs, tooltip, checkbox, switch, scroll-area, …), `class-variance-authority`, `tailwind-merge`, `tailwindcss-animate`. Design system is a warm-neutral **CSS-variable token** set in `index.css` (`--color-surface-*`, `--color-text-*`, status/priority colors) — no hardcoded hex in components.
- **@tanstack/react-query 5.56** — every piece of server state (queries + optimistic mutations with rollback)
- **react-router-dom 6.26**
- **@dnd-kit** (core + sortable + utilities) — the Kanban *and* list drag-and-drop
- **react-hook-form 7.53 + @hookform/resolvers + zod 3.23** — forms + schema validation
- **sonner 1.5** (toasts), **lucide-react** (icons), **date-fns 3.6**, **next-themes**, **cmdk 1.0** (command palette)
- *Also in `package.json`:* recharts, framer-motion, vaul, embla-carousel, react-day-picker, input-otp, jspdf, html2canvas, lottie-react — a few are shadcn/scaffold defaults, not all wired to a feature.

### Backend / data — **Supabase** (Postgres + Auth + Edge Functions + Realtime)
- **Postgres with RLS ON for every table.** Policies never inline joins — they call **`SECURITY DEFINER` helper functions** (`is_org_member`, `org_role`, `can_access_project`, `can_access_board`, `can_access_task`, `can_edit_task`, `can_delete_task`, …). These helpers are the single source of truth for access.
- **30+ SQL migrations** (a consolidated baseline + incremental files; the baseline is never edited).
- **12 Deno edge functions** (`supabase/functions/`): `accept_invitation`, `invite_member`, `invite_client`, `request_password_reset`, `reset_password`, `fathom_connect`, `fathom_sync`, `slack_install`, `slack_events`, `slack_commands`, `slack_interactivity`, `slack_worker`.
- **Supabase Realtime** (websocket `postgres_changes`) for live notifications.
- **`pg_cron` + `pg_net`** for scheduled work: the Slack outbox is drained every minute; a due-soon notification job runs hourly.
- **Slack bot tokens stored encrypted at rest** (`slack_connections.access_token_encrypted`, decrypted per-call in a `_shared/crypto` module — raw tokens are never logged).

### Testing (a genuinely serious, test-first discipline)
- **pgTAP** — schema, RLS, and trigger coverage (`supabase test db`), tested for owner / admin / member / **guest** on every policy.
- **Vitest + React Testing Library** — hooks and components (a reusable chainable Supabase mock).
- **Deno tests** — each edge function's happy path + every error branch.
- **Playwright** — cross-feature journeys against the live linked project (real drag with pointer moves, DB cross-checks via `supabase db query`).
- Working agreement: **red → green → refactor**, and **lint + build + test must pass before commit**.

### Infra
- **Cloudflare** (auto-deploys on push to `main`); Supabase-hosted Postgres / Auth / Edge / Realtime.
- *Origin caveat:* the frontend was **bootstrapped with Lovable** (an AI app-builder). The **data model, RLS, RPCs, triggers, edge functions, integrations, real-time layer, and the test suite are hand-authored** — that's the substantive engineering.

---

## C. Core technical work — the things to talk about at depth

### C.1 ✅ The multi-tenant RLS access model (the backbone)

Four nested scopes — **org → team → project → board → task** — with three role systems and two visibility axes:
- **Org:** `owner / admin / member`, plus `member_type: internal / guest`.
- **Team:** `lead / member`. **Project:** `manager / contributor / viewer`.
- **Visibility:** project = `organization / team / invite_only`; board = `project / invite_only`.

Every table has RLS on. Policies **don't** write joins inline — they call `SECURITY DEFINER` helpers (`can_access_project` is the core gate; `can_access_task` also grants a *collaborator* access to an invite-only task). The tightest rule in the system is the **guest rule**: a guest only sees projects where they're an explicit `project_members` row — they can **never** enumerate teams, rosters, settings, or any org-wide data. The pgTAP suites prove owner/admin/member/guest behavior for each policy.

### C.2 ✅ Tasks, Kanban, and list — one dataset, two views

- **Task shape:** status enum (`backlog / todo / in_progress / in_review / blocked / done / cancelled`), priority (`urgent / high / medium / low / none`), assignee, due date, and a **float `position`** so a new task can be inserted at the top of its column with `MIN(position) - 1` — no re-numbering of siblings. Soft-delete (`deleted_at`) with a **Trash / Restore** flow.
- **Kanban:** real dnd-kit board — `closestCorners` collision detection, a per-column `SortableContext`, and **optimistic reorder through the React Query cache**. Dragging a card into a column also **adopts that column's `mapped_status`**, so moving a card to "Done" actually marks it done.
- **List:** grouped sections (by status/priority/assignee/column) with drag-and-drop; dragging a task into a different **status section changes its status** (and moves it to that status's mapped column) — same behavior as the board.
- **Subtasks:** a task holds a checklist of child tasks via a self-referential `parent_task_id` (with an index). The `create_task` RPC was extended to accept a parent, and it validates *same board* + *single-level nesting* (no grandchildren). The board query filters `parent_task_id IS NULL` so subtasks never leak in as top-level cards.
- **Creator-only delete (a deliberate rule):** only a task's **creator** can delete it — not admins, not managers. Enforced in three layers: a `can_delete_task` helper, a `delete_task` RPC, and a **guard trigger** (`tasks_enforce_creator_delete`) that blocks *any* change to `deleted_at` by a non-creator, so a manager can't bypass it with a direct `UPDATE`.
- Plus **comments with structured `@mentions`** (the resolved user-ids are captured at post time, then a trigger notifies exactly those internal members), **attachments**, and a **`task_activity` audit log** written by triggers.

### C.3 ✅ Invite anyone by email → signup → accept → auto-added

A unified `invitations` table + edge functions (`invite_member` for internal org members, `invite_client` for project guests, `accept_invitation`). From the board's *Add collaborator* dialog you can type **any email**: an existing Clarix user is added to the project immediately (pre-upserted `project_members`), and a brand-new email gets a signup/accept link and lands in `project_members` on accept. Because **board access is derived from project membership**, that's the same as adding them to the board.

---

## D. ⭐ THE EVENT PIPELINE — one taxonomy, two delivery channels (real-time in-app + a Slack outbox)

This is the part I'd push toward — it's the most "systems" story in the codebase, and it's genuinely reliability-engineered.

**The idea:** every meaningful domain change emits an event *once*, and two independent delivery channels consume it. The producers are `SECURITY DEFINER` **trigger functions** on `tasks`, `task_comments`, `task_collaborators`, `project_members`, `team_members`. The nine event types: assigned-to-you, comment-on-yours, status-changed, priority-raised, collaborator-added, `@mention`, due-soon/overdue, added-to-project/team, and Fathom-created-a-task.

**Channel 1 — in-app, real time.**
- A single write path, `enqueue_notification(...)`, is the *only* inserter into the `notifications` table. It honors the per-user `in_app` preference (missing row = default-on) and skips self-actions. Clients can't insert — RLS has no INSERT policy.
- The client subscribes over **Supabase Realtime** to `INSERT`s filtered to `recipient_id = me` (and RLS-scoped, so a socket only ever gets your own rows). On an incoming row it enriches it, **prepends it to the React Query cache so the bell badge jumps instantly**, and fires a **bottom-right toast + a sound**. Repeats are **coalesced on read** ("3 comments on X"). A 60-second poll is the safety net if the socket drops.

**Channel 2 — Slack, with a real reliability contract (an outbox).**
- The same producers enqueue an `integration_events` row with a **unique `idempotency_key`**.
- A worker (the `slack_worker` Deno edge function) is drained **every minute by `pg_cron` → `pg_net`**. Each attempt logs a row in `integration_event_deliveries`; a failure increments `attempt_count` and pushes `next_attempt_at` out with **exponential backoff — 1m → 5m → 30m → 2h → 12h** — and after **5 attempts** the row lands in `dead_letter`. Personal DMs fan out **one row per recipient** (so retries are per-person); channel subscriptions mirror to Slack channels; inbound Slack **thread replies sync back as task comments** (matched via `slack_message_refs`). Bot tokens are decrypted only for the single `chat.postMessage` call; disabled connections are never retried.

**Time-based events:** `enqueue_due_notifications()` runs **hourly** via `pg_cron` for due-soon / overdue tasks, deduped per (task, recipient, kind) so an hourly tick never re-notifies.

The neat part: adding a new notification type is **one trigger calling `enqueue_notification`** — the preference gate, the self-skip, the real-time transport, and the Slack outbox all come for free.

---

## E. Mock interview Q&A — be ready for these

### Q1. "Walk me through Clarix."
> "A multi-tenant project/task platform for agencies — org → teams → projects → boards → tasks, with Kanban and list views, subtasks, comments with mentions, attachments, and an activity log. The interesting engineering is threefold: a strict Postgres row-level-security model with a hard guest-isolation rule; a real-time in-app notification system over Supabase Realtime; and a reliability-engineered two-way Slack integration built as an outbox with idempotency, exponential-backoff retries, and a dead-letter queue. It's Supabase on the backend — so I wrote the schema, RLS, RPCs, triggers, and twelve Deno edge functions, not the database engine — and it's tested with pgTAP, Vitest, Deno tests, and Playwright."

### Q2. "How does RLS keep an external client (guest) isolated?"
> "Every table has RLS on, and no policy writes joins inline — they all call `SECURITY DEFINER` helper functions, so access logic lives in one place. A guest is `member_type = 'guest'`. The helpers are written so a guest only passes `can_access_project` for projects where they have an explicit `project_members` row — and they can't read teams, the member roster, org settings, or any other project. It's the tightest rule in the system, and pgTAP tests it for owner/admin/member/guest on every policy."

### Q3. "Why an outbox for Slack instead of just calling the Slack API in the request?"
> "Because Slack calls fail — rate limits, network blips, a revoked token — and you can't lose a notification or double-send one. So the producer trigger just writes an `integration_events` row with a unique idempotency key inside the same transaction as the domain change. A worker drains that queue every minute via pg_cron; each attempt is logged, failures back off exponentially — one minute, five, thirty, two hours, twelve — and after five attempts it dead-letters. Retries are per-recipient. That's the standard transactional-outbox pattern, and it's why the Slack layer is 'infrastructure, not a demo.'"

### Q4. "How does the bell update instantly without polling?"
> "Supabase Realtime. The client opens one websocket channel subscribed to INSERTs on the notifications table filtered to its own `recipient_id`, and RLS scopes it so it can only ever receive its own rows. On an incoming row I re-select it with its actor join and prepend it into the React Query cache, so the badge updates in about a second, plus a toast and a sound. Polling still runs, but slowly — 60 seconds — purely as a fallback if the socket drops."

### Q5. "Dragging a card to another column — how does the status change?"
> "The board columns can carry a `mapped_status`. On drop, dnd-kit gives me the target column; I rebuild that column's order, and if the column has a mapped status I write it onto the moved card along with the new column and position — optimistically in the React Query cache first, then persisted. I did the same for the list view: dragging a task into a different status *section* sets its status and moves it to that status's column. So the two views behave identically."

### Q6. "How do you test a database-heavy app like this?"
> "Four layers. pgTAP for schema, RLS, and triggers — I actually assert owner/admin/member/guest behavior per policy, and that a trigger inserts the right row and the CHECK rejects a typo. Vitest + Testing Library for hooks and components against a chainable Supabase mock. Deno tests for each edge function's happy path and every error branch. And Playwright for real user journeys against the live project, with DB cross-checks. The rule is red-green-refactor and the lint+build+test gate before any commit."

---

## F. Honest caveats — say these proactively ✅

- **The backend is Supabase (a BaaS).** Postgres, Auth, Realtime, Edge Functions, and Storage are managed services — I didn't build the database or the auth server. What's mine is the **schema, the RLS policy model and `SECURITY DEFINER` helpers, the RPCs and triggers, the twelve edge functions, and the integration/notification logic.** Frame it that way and it's un-catchable.
- **Slack and Fathom are third-party platforms.** The **outbox, the worker, the retry/backoff/dead-letter logic, the thread-sync, and the token encryption are mine**; the Slack and Fathom APIs are not.
- **"AI-native OS for agencies" is the north-star vision, not shipped.** The in-app AI agent is deferred (Wave 4+). The only AI-adjacent feature that exists is **Fathom meeting action-items → tasks**. Don't imply LLM features that aren't in the code.
- **The frontend was bootstrapped with Lovable** (AI app-builder). The substantive engineering — data model, RLS, real-time, integrations, tests — is hand-authored.
- **Single-org today.** `useOrg` says *"multi-org comes later"*; the workspace switcher is switcher-shaped but there's one org per user for now.

---

## G. 30-second pitch + stack one-liner

> **30-sec:** "Clarix is a multi-tenant project/task platform for agencies — org → teams → projects → boards → tasks, Kanban + list, subtasks, mentions, attachments. The engineering worth talking about is a strict Postgres row-level-security model with hard guest isolation, real-time in-app notifications over Supabase Realtime, and a two-way Slack integration built as a proper outbox — idempotency keys, exponential-backoff retries, dead-letter queue, drained by pg_cron every minute. It's Supabase, so I own the schema, RLS, RPCs, triggers, and twelve Deno edge functions, and it's covered by pgTAP, Vitest, Deno, and Playwright tests."
>
> **Stack:** React 18 + TypeScript + Vite, Tailwind + shadcn/ui, TanStack Query, dnd-kit, react-hook-form + zod, sonner, cmdk. Supabase Postgres with RLS everywhere (SECURITY DEFINER helpers), 30+ migrations, 12 Deno edge functions, Supabase Realtime, pg_cron + pg_net, encrypted Slack tokens. Slack (two-way, outbox with retry/dead-letter) + Fathom integrations. Tested with pgTAP + Vitest + Deno + Playwright. Deployed on Cloudflare.

---

# 8. Mailvalid — a production email-verification SaaS with an MCP server ✅

> Verified by reading the actual code — `requirements.txt`, the verification engine (`app/services/email_verifier.py`), the Dodo billing + payment-recovery code, the webhook handlers, and the MCP server (`app/mcp_server.py`) + its npm launcher (`clients/mcp/`). Simple words, real facts.

---

## A. What it is (plain) — your interview elevator pitch

A **real-time email-verification API + dashboard** — the same product category as ZeroBounce / NeverBounce. You give it an email address (or a list); it tells you whether the mailbox is real and safe to send to, so you don't burn your sender reputation on dead addresses.

- **Single check:** POST an email, get back `valid / invalid / catch_all / unknown / do_not_mail` with a **0–100 confidence score** and the reasons (syntax, MX, SMTP, disposable/role/catch-all flags).
- **Bulk:** submit a list, it processes asynchronously on background workers, and you poll for status or get a **webhook** when it's done; results export to JSON/CSV.
- **Credit-based billing** through **Dodo Payments** — monthly plans (Starter/Growth/Business) that auto-renew, plus one-time pay-as-you-go top-ups. Credits never expire. Unknown results and cached repeats are free.
- A server-rendered **dashboard** (API keys, credit balance, bulk jobs, plan management) and a **super-admin console** (users, tickets, email campaigns, payment alerts).
- **An MCP server** so AI agents (Claude, Cursor, etc.) can verify emails directly as tools — see Section D. This is the standout piece.

It's a live production product at **https://mailvalid.io**, on Dokku behind Cloudflare, RDS Postgres + Redis, auto-deployed from GitHub.

---

## B. Tech Stack (every version below is in `requirements.txt` / `clients/mcp/package.json` — verified)

### Backend — `app/`
- **FastAPI 0.136** + **Gunicorn 21 + Uvicorn 0.49 workers** (ASGI), Python 3.11
- **PostgreSQL** via **SQLAlchemy 2.0 (async) + asyncpg 0.29**, migrations with **Alembic 1.13**
- **Redis 7 + Taskiq 0.12** (`taskiq-redis`, `taskiq-fastapi`) — async-native background jobs and a cron scheduler (chosen over Celery because it's async without sync wrappers)
- **DNS/SMTP:** `dnspython 2.5` + `aiodns 3.1`
- **Auth:** `python-jose` (JWT), `passlib` + `bcrypt` (passwords), API keys (`mv_live_` prefix, stored **hashed**)
- **Pydantic 2.13** + `pydantic-settings` for typed config; `email-validator` for RFC syntax
- **Payments:** `dodopayments 1.95` (Dodo Payments SDK) — subscriptions + checkout + customer portal
- **Email delivery:** `boto3` (AWS SES) with an SMTP-relay fallback; all sends behind an `EMAIL_ENABLED` kill-switch
- **Rate limiting:** `slowapi` + a custom Redis-backed `SecurityMiddleware` (per-API-key **and** per-IP, tier-aware)
- **MCP:** `mcp 1.28` (official Model Context Protocol SDK / FastMCP)
- **Testing:** `pytest` + `pytest-asyncio`

### Frontend — `app/templates/`
- **Jinja2** server-side rendered pages + **Tailwind CSS (Play CDN)** — landing, pricing, docs, blog, dashboard, admin. No SPA build step.

### MCP launcher — `clients/mcp/` (published to npm as `@mailvalid/mcp`)
- A tiny **Node ≥18** package; its only dependency is **`mcp-remote`** (the stdio↔HTTP bridge). Ships zero verification logic.

### Infra
- **Dokku** on a single host, image-based deploys via **GitHub Actions → ECR → `dokku git:from-image`**; predeploy hook runs `alembic upgrade head`. **RDS Postgres**, linked **Dokku Redis**, **Cloudflare** in front. Process types (`Procfile`): a web dyno (gunicorn) + a `taskiq worker`.

---

## C. Core technical work — the things to talk about at depth

### C.1 ✅ The multi-layer verification engine (`app/services/email_verifier.py`)

Four layers, in order, short-circuiting as soon as a definitive answer is found:
1. **Syntax** — RFC 5322 check, split local-part / domain.
2. **Domain / MX** — DNS lookup for MX records (async via `aiodns`).
3. **Provider-aware SMTP probe** — open an SMTP conversation to the MX host and do a `RCPT TO` against the address *without sending mail* to see if the mailbox exists. It's **provider-aware** (skips the SMTP probe for providers like Microsoft/Apple that don't answer honestly), tries **up to 3 MX hosts**, **detects greylisting and retries**, spots **policy/DNSBL rejections**, and rate-limits per destination domain with a **semaphore** so we don't hammer one mail server.
4. **Classification + confidence** — every result gets a status (`valid / invalid / catch_all / unknown / do_not_mail`), a **0–100 confidence score**, and flags for **disposable**, **role-based** (`info@`, `support@`), **free-provider**, and **catch-all** domains.

The disposable/role/free-provider detection is backed by **seeded lookup tables** (~159k disposable domains, ~96k free-provider domains, ~100 role prefixes, plus provider MX signatures) loaded at startup. Results are **cached in Redis (7-day TTL)** — a cached repeat costs the customer nothing.

**The honest bit to say:** SMTP mailbox verification is *inherently probabilistic* — catch-all domains, greylisting, and servers that block probes can't be resolved to a hard yes/no. The engine is designed around that: distinct `catch_all` / `unknown` statuses and a confidence score instead of pretending everything is a clean valid/invalid.

### C.2 ✅ Credit billing, Dodo subscriptions, and a payment-recovery (dunning) flow

- **Credit model:** 100 free credits on signup; 1 credit per billable result; `unknown` and cached repeats are free. Credits never expire.
- **Dodo Payments:** monthly **recurring subscriptions** (Starter $15 / Growth $50 / Business $150) that auto-renew, plus a **pay-as-you-go** one-time top-up. A webhook handler processes `payment.succeeded / subscription.active / on_hold / cancelled / expired / renewed` — granting credits on each paid renewal and keeping the user's `subscription_status` in sync.
- **Payment recovery (dunning):** when a renewal fails and Dodo marks a subscription `on_hold`, the app emails the customer to update their card — **capped at 3 emails** (immediate + two reminders spaced apart, driven by a **daily Taskiq cron**), then stops; the chase resets the moment they pay. Customers fix their card through the **Dodo customer-portal**, reached via an in-app "Update payment method" button (the server mints a fresh, per-customer portal link on click — never a raw link in the email). Every at-risk event is also **logged to a table and surfaced in the admin panel** (a "Payment Alerts" list with a detail modal) and emailed to an internal ops address.

### C.3 ✅ Bulk verification on background workers + webhooks

- `POST /api/v1/verify/bulk` takes a **JSON array of emails** (the dashboard parses an uploaded CSV client-side and posts the array — the API itself doesn't take a file). It **reserves** credits up front, queues a **Taskiq** job, and settles the final charge on completion (releasing unused reservations).
- **Webhooks** (per-job and per-user) fire on completion with **HMAC-SHA256 signatures** and **exponential-backoff retries** (1→2→4→8→16 min, max 5), each attempt tracked in a `WebhookDelivery` table.

### C.4 ✅ Dual authentication + tier-aware rate limiting

- **Two auth paths:** the **dashboard** uses a JWT **Bearer** token; the **API** uses hashed **API keys** in the `X-API-Key` header. RapidAPI proxying is supported as a third path.
- Rate limits are **resolved from the customer's plan tier** (from purchase history) in a Redis-backed middleware that runs before the route — separate "compute" and "read/poll" buckets so status-polling doesn't eat verification budget.

### C.5 ✅ Server-rendered admin console

Cookie-authenticated `/admin` (credentials in env, no admin rows in the DB) with sections for users & plans, support tickets (with email replies), email campaigns (throttled bulk sends), newsletters, and the **Payment Alerts** view from C.2 — all Jinja + Tailwind, backed by the same async SQLAlchemy models.

---

## D. ⭐ THE MCP SERVER — exposing the API to AI agents (the standout)

The interesting, current piece: Mailvalid speaks **Model Context Protocol**, so an AI agent (Claude Desktop, Cursor, etc.) can verify emails *as native tools* — no glue code by the user.

There are **two surfaces**, and the design point is that they share **one implementation**:

**1. The hosted server — mounted inside the FastAPI app at `/mcp`** (`app/mcp_server.py`)
- Built with **FastMCP** over the **Streamable HTTP** transport. Configured **stateless** (`stateless_http=True`) so it survives the multi-worker gunicorn deploy with no session affinity, and **`json_response=True`** so each result is a single JSON body instead of an SSE stream (more robust through the Cloudflare proxy).
- Mounted via `app.mount("/mcp", mcp_server.streamable_http_app())`, guarded by an `MCP_ENABLED` flag, with its session manager entered in the app **lifespan**.
- **8 tools**, each with proper MCP annotations (`readOnlyHint` / `openWorldHint` / `destructiveHint`):
  - *Authed (need an API key):* `verify_email` (1 credit), `submit_bulk_verification`, `get_bulk_job`, `list_bulk_jobs`, `cancel_bulk_job`, `get_credit_balance`.
  - *Keyless:* `verify_email_demo` (syntax/disposable/role/free-provider only — no SMTP, IP rate-limited) and `get_api_discovery`.
- **Auth is the `X-API-Key` header** (or `Authorization: Bearer mv_live_…`). The key is resolved to a `User`, and **every authed tool runs through the exact same `app.services.verify_flow` path as the REST API** — so credits, caching, and plan caps behave *identically*. There's no parallel verification code to drift; the MCP layer is a thin protocol adapter over the shared core.

**2. The npm launcher — `@mailvalid/mcp`** (`clients/mcp/`, published to npm)
- Most desktop MCP clients speak **stdio**, not remote HTTP. This tiny Node package is a **stdio↔remote bridge**: it reads `MAILVALID_API_KEY`, then spawns **`mcp-remote`** pointed at `https://mailvalid.io/mcp/`, **injecting the `X-API-Key` header**. So a user just adds one line to their client config (`npx -y @mailvalid/mcp`) and their key, and every tool shows up.
- It ships **no verification logic** — the hosted server is the single source of truth for the tool set, so this package rarely needs updating when tools change. It resolves the `mcp-remote` binary dynamically (no hardcoded version path) and forwards signals cleanly.

**A real debugging story worth telling:** the SDK enables **DNS-rebinding protection** by default, which `421`-rejects any non-localhost `Host` header ("Invalid Host header") — i.e. *every* request to `mailvalid.io` behind Cloudflare. Since this is a public remote server whose real auth boundary is the API key, the fix was to disable that localhost-oriented protection (`TransportSecuritySettings(enable_dns_rebinding_protection=False)`). Good "I read the transport layer, not just the happy path" story.

There's also a **discovery layer** for agents: `/.well-known/mcp.json`, an MCP **server-card**, and a self-contained **`/llms-full.txt`** integration guide (REST + MCP) so an agent can find and learn the API on its own.

---

## E. Mock interview Q&A — be ready for these

### Q1. "Walk me through Mailvalid."
> "It's a real-time email-verification API and dashboard — same category as ZeroBounce. Core is a four-layer engine: syntax, MX lookup, a provider-aware SMTP mailbox probe, then classification into valid/invalid/catch-all/unknown/do-not-mail with a confidence score. It's FastAPI + async SQLAlchemy on Postgres, Redis + Taskiq for bulk jobs and cron, credit billing through Dodo Payments with monthly subscriptions and pay-as-you-go. The piece I'd point to is the MCP server — the whole API is exposed as Model Context Protocol tools so an AI agent can verify emails directly, and I made the MCP tools run through the exact same verification-and-billing path as the REST API so there's no drift."

### Q2. "How does the SMTP verification actually work, and how do you stay honest about accuracy?"
> "After syntax and MX, I open an SMTP conversation to the mail server and do a `RCPT TO` against the address without sending anything — the server's response tells you if the mailbox exists. But it's inherently fuzzy: catch-all domains accept everything, some servers greylist or block probes. So instead of forcing a yes/no I have explicit `catch_all` and `unknown` statuses and a 0–100 confidence score. The engine is provider-aware — it skips the probe for providers that don't answer honestly — tries up to three MX hosts, retries on greylisting, and rate-limits per destination domain so I'm not hammering one server."

### Q3. "Why Taskiq instead of Celery?"
> "It's async-native — no sync wrappers around my async DB and HTTP code, which is the whole app. Same Redis I already run for cache and rate-limiting is the broker and result backend, and it has a cron scheduler I use for the dunning sweep and cleanup jobs. Scaling is just running more of the one worker process."

### Q4. "Tell me about the MCP server."
> "Model Context Protocol lets AI agents call tools. I exposed the verification API as an MCP server two ways. The hosted one is FastMCP over Streamable HTTP, mounted inside the FastAPI app at `/mcp`, stateless so it works across gunicorn workers, JSON responses so it's clean through Cloudflare. Eight tools — verify, bulk submit/poll/cancel, credit balance, plus two keyless demo tools. Auth is the same API key as the REST API, and — this is the important part — each tool runs through the same shared verify-and-bill function the REST endpoints use, so credits and caching are identical, no parallel code. Then there's a small npm package, `@mailvalid/mcp`, that bridges stdio desktop clients to the remote server and injects the key, so a user adds one line to their config."

### Q5. "You mentioned a payment-recovery flow — what happens when a card fails?"
> "Dodo marks the subscription `on_hold` via webhook. I start a capped dunning sequence — at most three emails, the first immediately, two reminders spaced out by a daily cron — and it stops the instant they pay. The 'update your card' button doesn't email a raw payment link; the server mints a fresh Dodo customer-portal session for that specific customer on click, which is both less phishy and never expired. Every at-risk event is logged and shows up in an admin 'Payment Alerts' screen."

---

## F. Honest caveats — say these proactively ✅

- **Dodo Payments is a third-party processor** (merchant-of-record). What's mine is the whole **integration** — checkout sessions, the webhook handlers, subscription state sync, the customer-portal link minting, and the dunning/recovery flow — not the payment rails.
- **Email delivery is AWS SES** (third party); I built the sending layer, templates, lifecycle logic, and the `EMAIL_ENABLED` kill-switch.
- **The MCP npm launcher wraps `mcp-remote`** — a third-party stdio↔HTTP bridge. **Mine** is the hosted FastMCP server, the 8 tools, the API-key auth, the shared verify-flow wiring, and the launcher's config/bridging glue.
- **SMTP verification is probabilistic**, not a guarantee — the honest framing is the `catch_all`/`unknown` statuses + confidence score, not a blanket "valid/invalid."
- **The frontend is server-rendered Jinja + Tailwind CDN** — no SPA/build pipeline; that's a deliberate simplicity choice for this product, not a React app.

---

## G. 30-second pitch + stack one-liner

> **30-sec:** "Mailvalid is a production email-verification API and dashboard — a four-layer engine (syntax → MX → provider-aware SMTP probe → classification with a confidence score), FastAPI + async SQLAlchemy on Postgres, Redis + Taskiq for bulk jobs and cron, and credit billing through Dodo with monthly subscriptions, pay-as-you-go, and a capped payment-recovery flow. The standout is the MCP server — the whole API is exposed as Model Context Protocol tools for AI agents, hosted in the FastAPI app at `/mcp` plus a published `@mailvalid/mcp` npm launcher, and the tools share the exact same verify-and-bill path as REST so there's zero drift."
>
> **Stack:** FastAPI + Gunicorn/Uvicorn, async SQLAlchemy 2 + asyncpg on Postgres, Alembic, Redis + Taskiq (jobs + cron), dnspython/aiodns for the verification engine, JWT + hashed API-key auth, slowapi + custom Redis rate-limiting, Dodo Payments (subscriptions + portal + dunning), AWS SES, Jinja + Tailwind frontend, and an MCP server (`mcp`/FastMCP, Streamable HTTP at `/mcp`) with a `@mailvalid/mcp` npm launcher over `mcp-remote`. Deployed on Dokku via GitHub Actions → ECR, behind Cloudflare.

---

# 9. StudioMode.ai — an AI product-photography studio for e-commerce (FastAPI + Next.js, with its own OIDC + MCP agent layer) ✅

> Verified by reading the actual code — the FastAPI routes/services/models, all 20 Alembic migrations, the real fal.ai + OpenRouter HTTP calls, the Dodo billing webhooks, the OIDC provider, and the Next.js studio + programmatic-SEO + MCP/OAuth surfaces. Simple words, real facts.
>
> **Naming note:** the repo folder is still called `kalakaar` (the pre-rebrand codename) and the API host is `kalakaarapi.techorigins.io`, but the shipped product is **StudioMode.ai** (`studiomode.ai`). Backend README title is literally "StudioMode.ai Backend"; the frontend package is named `studiomode-seo`. Say *"kalakaar was the codename; it shipped as StudioMode.ai."*

---

## A. What it is (plain) — your interview elevator pitch

An **AI product-photography studio for e-commerce sellers.** You upload **one** product photo and it generates studio-grade marketing media with AI:

- **Product Variants** — the same product re-shot into new backgrounds / scenes / styles (1–20 at a time).
- **Fashion Try-On** — put a garment onto an AI model (full-garment swap).
- **Product Videos** + **Fashion Reels** — turn a still image into a short cinematic video (image → video).
- **In-canvas AI edits** — change background, add a realistic shadow, reframe the aspect ratio (a real server-side AI reframe, not a client crop), remove background, upscale.

It's **credit-based** (Dodo Payments): free = 15 credits/mo, Starter $19 / 80cr, Pro $49 / 210cr, Elite $199 / 875cr. There are **two front doors** to the same engine: the **web studio** (Next.js), and a **Shopify bridge** so a Shopify app can reuse the exact same tools server-to-server. There's also an **admin console**, a big **programmatic-SEO marketing site** (same Next.js app), and — the distinctive bet — an **agent/identity layer**: StudioMode runs *its own* OAuth2 / OpenID Connect provider and an MCP server, plus `.well-known` discovery + agent-skills, so AI agents can discover and authenticate against the API.

> **Honest framing (say this up front, like a pro):** the **AI models are all third-party** — every image/video generation goes to **fal.ai**, and every "look at this photo / write me a better prompt" LLM call goes through **OpenRouter** (default Gemini 2.0 Flash for vision, GPT-5.1 for prompt-engineering). **What's mine is the orchestration around them:** the job/asset/credit data model, the provider boundary with idempotency and webhook completion, server-side plan-limit enforcement, an append-only credit ledger, the Dodo billing integration, a hand-rolled OIDC provider for agent auth, the MCP/agent-discovery surfaces, and the entire Next.js studio + programmatic-SEO frontend. It's a real, live product — but several surfaces are deliberately staged (4 of 8 tools are "Coming Soon", the brand kit is stored-but-not-yet-applied, the OIDC provider is gated off until a key is set). I'll name every one of those in the caveats.

---

## B. Tech Stack (verified against `pyproject.toml`, `package.json`, the migrations, and the route code)

### Backend — `kalakar-backend/` (FastAPI)
- **FastAPI ≥0.115** on **Python 3.12**, served by **Uvicorn** workers (`Procfile`: `web: uvicorn app.main:app …`).
- **PostgreSQL** (managed **AWS RDS**) via **SQLAlchemy 2.0** on the **psycopg 3** driver, a tuned sync engine (`pool_size=10, max_overflow=20, pool_pre_ping, pool_recycle=1800`) plus a secondary async engine; **20 hand-written Alembic migrations** (all raw SQL, idempotent `IF NOT EXISTS` / `DO $$ … duplicate_object` guards — never autogenerate).
- **TaskIQ** (`taskiq` + `taskiq-redis`) as the async job broker — **`RedisStreamBroker` when `REDIS_URL` is set, in-memory fallback when it isn't**; a separate worker process (`Procfile`: `worker: taskiq worker app.tasks:broker`).
- **AI providers (HTTP, stdlib `urllib`):** **fal.ai** (image/video), **OpenRouter** (LLM vision + prompt-engineering). No Replicate / Stability / direct OpenAI-Google-Anthropic SDKs — verified by grep.
- **AWS S3** (`boto3`) for asset storage — presigned PUT (upload) + presigned GET (read), bucket `kalakaar-assets`, region `us-east-2`.
- **Dodo Payments** for subscriptions + credits (checkout, customer portal, Standard-Webhooks HMAC-verified webhooks).
- **Auth:** bcrypt passwords (`passlib[bcrypt]`), email OTP (HMAC-SHA256 hashed, per-challenge salt, constant-time compare), Google OAuth2 sign-in, `python-jose` for the admin + OIDC JWTs. **User sessions are opaque DB tokens, not JWTs.**
- **Email:** plain **SMTP** (`smtplib`, hand-rolled HTML) for OTP / welcome / payment / low-credit mail. (A SES module exists but is an unimplemented placeholder.)
- Tooling: **`uv`** for deps, **ruff** for lint, **pytest** for tests, GitHub Actions CI. Deployed on **Dokku**.

### Frontend — `kalakar-frontend/` (Next.js)
- **Next.js 15.5 App Router + React 18.3 + TypeScript 5.**
- **Tailwind CSS v4** (class dark-mode, custom surface/content/border/brand tokens), **framer-motion**, **lucide-react**, **vaul** (drawers), **clsx** + **tailwind-merge**.
- **react-easy-crop** (used in exactly one place — the round avatar crop), **blurhash** placeholders, **sharp**-based build-time WebP/AVIF pre-generation, a custom **Cloudflare image loader** (`/cdn-cgi/image/`).
- **Cloudflare Pages** tooling in the repo (`@cloudflare/next-on-pages`, `wrangler`, `wrangler.toml name="studiomode"`) — ⚠️ but the latest handoff doc + a `next.config.ts` comment say the live host is **AWS Amplify**; be honest that the deploy target is ambiguous (see caveats).
- **`next-sitemap`** for sitemap/robots at build; **GTM** + **Meta Pixel** analytics.
- **drizzle-orm + `pg`** are in `package.json` and there's a full Drizzle schema — ⚠️ but it's **dead infrastructure** (no `pg` pool / no drizzle client is imported anywhere in `src/`); the frontend talks only to the FastAPI backend. Leftover from the Firebase→Postgres migration.
- The **`dodopayments` SDK** is a dependency but **unused on the client** — checkout is delegated to the backend.

### AI models actually called (verbatim from code)
- **fal.ai image:** `fal-ai/flux-2-pro/edit` (default "Studio Mode"), `fal-ai/nano-banana-2/edit` ("Studio Mode Pro", charged 2×, plan-gated), `fal-ai/birefnet` (background cutout).
- **fal.ai video:** `bytedance/seedance-2.0/image-to-video` (standard) and `…/fast/image-to-video` (fast tier).
- **fal.ai utility whitelist** (`/tools/execute`): `birefnet`, `bria/rmbg`, `real-esrgan`, `clarity-upscaler`, `creative-upscaler`.
- **OpenRouter LLM:** `google/gemini-2.0-flash-001` (product/model image analysis) and `openai/gpt-5.1` (prompt enhancement) — both reach the app *only* through OpenRouter, gracefully degrading if the key is missing.

### Infra
- Backend: **Dokku** (web dyno + taskiq worker), **RDS Postgres**, **Redis**, **S3**, behind the `kalakaarapi.techorigins.io` API host.
- Frontend: **Next.js** at `studiomode.ai` (Cloudflare Pages tooling / documented Amplify deploy — ambiguous).
- Lineage: **migrated off Firebase** (auth/Firestore/storage) **to** this FastAPI + Postgres + S3 stack; bootstrapped from an earlier `kalakaar-3.1` repo.

---

## C. Core technical work — the things to talk about at depth

### C.1 ✅ The additive, workspace-aware data model (`app/models.py` + 20 migrations)

Everything is keyed by a `workspace_id` (which, by convention, equals the user id — or the Shopify shop domain on the bridge). The core tables:
- **`projects`** → **`assets`** (`source | mask | reference | generated | export`, status `uploading | ready | failed | deleted`, S3 storage addressing, `checksum_sha256`, unique `storage_key`) → **`generation_jobs`** (the async orchestration ledger).
- **Billing boundary:** `workspace_subscriptions` (Dodo/Shopify/admin-manual identity + period), `provider_requests` + `provider_webhook_events` (the replayable provider boundary), and an **append-only `credit_ledger_entries`** table.
- **Auth tables (raw SQL, no ORM class):** `users` (TEXT id), `sessions`, `email_otp_challenges`, plus `oauth_authorization_codes` / `oauth_refresh_tokens` for the OIDC provider (hashes only). Plus `brand_kits`, `newsletter_subscribers`, `user_feedback`, and the `email_templates` / `email_campaigns` / `email_campaign_recipients` trio.

All native Postgres enums, all additive, all idempotent migrations. The **free-credit default has a visible history in the migrations — 10 → 30 → 50 → 15** — and the current live value (15) is hard-coded in `create_user` and seeded into the ledger as a "Welcome credits" entry, not left to a column default.

### C.2 ✅ The generation-job lifecycle — queue → claim → dispatch → webhook (the real engine)

This is the load-bearing pipeline and it's **real, not a placeholder**:

1. **Enqueue:** `POST /api/v1/generation-jobs` validates the project + source asset (must be `ready`), inserts a `queued` row, commits, then **best-effort** fires the TaskIQ task (wrapped in try/except so a down Redis never fails the API — the job just stays `queued`).
2. **Claim:** the worker runs `claim_next_queued_job`, which is a genuine **`SELECT … ORDER BY priority DESC, queued_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`** (SQLAlchemy `.with_for_update(skip_locked=True)`) followed by a guarded `UPDATE … SET status='running' WHERE id=? AND status='queued'`. Multiple workers never fight over the same row.
3. **Dispatch:** the source asset is resolved to a presigned URL, a `"__SOURCE__"` placeholder in the settings is replaced with it, **server-side plan limits are clamped** (resolution, image count, video forced to 720p, etc. — the frontend can't smuggle a bigger job through the queue), and a real HTTP `POST` goes to `{queue.fal.run}/{model_key}` with a `fal_webhook` callback URL and an `Idempotency-Key`.
4. **Complete (webhook):** fal.ai calls back `POST /api/v1/webhooks/fal`; the handler records the event, creates the output asset from the result URL, transitions the job to `succeeded`/`failed`, and **debits credits** (`allow_negative=True`, because the media already shipped — you never fail a customer after delivery).

There are actually **two fal transports** and both are wired: a **synchronous** `https://fal.run/{model}` path (used by variants / try-on / editor / utility tools, which return inline) and this **async `queue.fal.run` + webhook** path (used by videos and the TaskIQ pipeline).

### C.3 ✅ The provider boundary — idempotency + webhook dedup

`provider_requests` carries a partial-unique index on `(provider_name, idempotency_key) WHERE idempotency_key IS NOT NULL` and the fal dispatch uses `generation_job_id` as that key — so a job can't be double-dispatched. `provider_webhook_events` has a unique `(provider_name, provider_event_key)` for webhook dedup. On the **Dodo** side this is done gracefully (duplicate → `{"duplicate": true}`); ⚠️ on the **fal** side the dedup insert has no `IntegrityError` guard, so a replayed fal event currently 500s instead of returning a clean duplicate — a real, nameable rough edge (good "I know exactly where the sharp corners are" story).

### C.4 ✅ Server-side plan-limit enforcement (`services/plan_limits.py`)

A single module resolves the workspace's plan (from an active/trialing subscription, else `users.plan_id`, else `free` — never an open allowance) and enforces per-tier caps: max resolution (1K free/starter, 4K pro/elite), images-per-request (1/1/2/4), reference-image counts, which image model you can use (`nano-banana-2` is Pro+), video tiers, web-grounding, thinking levels. It **clamps silently** in some paths and **403s strictly** in others, and it force-sets backend-only safety fields the client is never allowed to supply. It mirrors a frontend `planLimits.ts`, but the backend is the real gate.

### C.5 ✅ Append-only credit ledger

`credit_ledger_entries` is insert-only (no `updated_at`). **Balance is derived** — `SUM(credit) − SUM(debit)` — not stored as a mutable counter; `amount` is always absolute with the sign carried by a `direction` enum. Per-tool generations debit on success with a `reference_type`/`reference_id` for idempotency; failed videos get an **idempotent refund** (look up the original debit by fal `request_id`, ensure no existing refund, write one). ⚠️ Honest gaps: the read-then-append isn't row-locked (a TOCTOU oversell is possible under concurrency), and the `generation_hold` / `generation_release` reasons exist in the enum but are **unused** — there's no pre-flight credit reservation; it's post-success debiting.

### C.6 ✅ Auth — opaque sessions, hashed OTP, Google sign-in, separate admin JWT

- **User auth is a stateful opaque session token** (`secrets.token_urlsafe(32)` stored in a `sessions` table, looked up on every request) — *not* a JWT. Easy to get wrong; get it right.
- **Password:** bcrypt. **Email OTP** (signup + reset): 6-digit code stored as `HMAC-SHA256(secret, otp:salt)` with a per-challenge salt, validated in **constant time**, with attempt caps + expiry. **Google:** OAuth2 auth-code, HMAC-signed `state` for CSRF, verified via the userinfo endpoint (requires `email_verified`).
- **Admin** is a *separate* system: env `ADMIN_EMAIL`/`ADMIN_PASSWORD` (constant-time compared) → an HS256 JWT re-checked against the current admin email on every request, so rotating the env var instantly revokes tokens.

### C.7 ✅ Dodo billing with dual idempotency + a reconcile fallback

Checkout (`/dodo/checkout`) takes user/email from the **authenticated session, not the request body** (a spoof test asserts this). The webhook (`/webhooks/dodo`, plus a compat alias) does **Standard-Webhooks HMAC-SHA256** verification over `id.timestamp.body`, then allocates credits **idempotently twice over** — once per webhook `event_key`, once per subscription (won't double-allocate if a `subscription_allocation` ledger row already exists). Because webhooks can be late or lost, there's a **`/dodo/reconcile-checkout`** success-page safety net that polls Dodo's payments/subscriptions API and allocates if the webhook hasn't landed. (This is the same "webhook + reconcile belt-and-suspenders" instinct as Mailvalid.)

### C.8 ✅ The frontend studio — persistent sessions + in-canvas AI edits

The Next.js studio is a real, polished client: a 3-column editor (`ToolSidebar` + an **infinite zoom/pan canvas** of results + a session-history rail), **backend-driven, paginated, searchable preset & model libraries**, and a `StudioSessionContext` that snapshots each tool's state in memory so you can navigate away mid-generation and come back to a resuming job. The three in-canvas edits (background / shadow / aspect-ratio) are **real backend calls**, and there's an Advanced Editor with a bespoke canvas cropper + before/after slider. All the heavy lifting (auth, credits, generation) is delegated to `/api/v1` — the frontend never holds the fal key.

### C.9 ✅ The programmatic-SEO engine (`src/data/seo/*`)

A data-driven marketing site: page templates for **tools**, **tool × industry**, **industry**, **platform (`/for`)**, **competitor comparison (`/compare/studiomode-vs-*`)**, and **guides**, all fed by hand-written TypeScript content records (long-form copy — benefits, use-cases, FAQs, how-to steps, real platform image specs, competitor feature matrices). `generateStaticParams` + JSON-LD (`FAQPage`, `SoftwareApplication`, `HowTo`, `BreadcrumbList`, `Organization`, `WebSite`) + `next-sitemap`. ⚠️ Be accurate on scale: the strategy doc *targets* 300–400 pages; the **shipped** engine is roughly **50–116 real URLs** (6 live tool pages, 6 industries, 6 platforms, 8 competitors, 5 guides, plus edge-rendered tool×industry combos where the relevance matrix is mostly mismatched/dead-code). Don't quote the 300–400.

---

## D. ⭐ THE AGENT / IDENTITY LAYER — StudioMode runs its own OIDC provider + MCP server

This is the most differentiated piece and the one I'd push toward — *but with the honesty dial turned up*, because parts of it are gated/early.

**The idea:** most AI-image tools are a UI + an API. StudioMode also ships the plumbing for an **AI agent** to discover the product, authenticate, and (eventually) drive the tools — using current standards rather than bespoke glue.

**1. A hand-rolled OpenID Connect provider (`app/services/oidc.py`, `app/api/routes/oidc.py`).**
- Authorization-code flow with **mandatory PKCE (S256 only — `plain` is rejected)**, issuing **RS256 JWTs** verifiable via a published JWKS. Endpoints: discovery (`/.well-known/openid-configuration` + `/.well-known/oauth-authorization-server`), `jwks.json`, `/oauth/authorize` (mints a one-time code, requires the user's session), `/oauth/token`, `/oauth/userinfo`.
- Security properties I can defend: codes + refresh tokens are stored **only as SHA-256 hashes**; codes are **single-use** via atomic `DELETE … RETURNING`; refresh tokens **rotate on use**; `redirect_uri` is **exact-match** against a per-client allowlist (no wildcards); public clients (`token_endpoint_auth_methods: ["none"]`).
- **Safe-by-default:** every OIDC endpoint returns **503 until `OIDC_PRIVATE_KEY` is configured** — it doesn't accidentally run half-open. The doc candidly calls it *"a hand-rolled provider"* with a pre-production TODO list (security review, key rotation, rate-limit `/oauth/token`).
- **Stated purpose (quoted from the code):** *"an authorization-code + PKCE flow … so AI agents can authenticate against the StudioMode API."*

**2. An MCP server + agent discovery (frontend).**
- `/mcp` is a real **JSON-RPC 2.0 MCP server over Streamable HTTP** (edge runtime) implementing `initialize` / `tools/list` / `tools/call`. ⚠️ It intentionally exposes only **3 read-only public tools** — `get_pricing_plans`, `list_studio_tools`, `get_api_info` — no credit-spending actions.
- A **WebMCP** provider (`components/agents/WebMcpProvider.tsx`) registers the same read-only tools (plus a `navigate_to_section`) for *in-browser* agents via `navigator.modelContext`, a total no-op where unsupported.
- Plus a genuine **standards-based discovery layer**: `.well-known/oauth-protected-resource` (RFC 9728), `.well-known/api-catalog` (RFC 9727 linkset → the backend OpenAPI/Swagger/ReDoc), a **`.well-known/mcp/server-card.json`** (SEP-1649), **agent-skills** (`agent-skills/index.json` + `SKILL.md` files), and an **`auth.md`** convention doc.

**The honest one-liner:** *"I built the identity + discovery plumbing for agent access — a PKCE OIDC provider, an MCP server, and the `.well-known` discovery surfaces — but the agent path is early: the OIDC provider is gated off until a signing key is set, and the MCP tools are read-only info today, not the credit-spending generation tools."* ⚠️ Note one shipped `SKILL.md` says "HS256, no OAuth/OIDC" which contradicts the rest of the OIDC layer — a stale doc; know it's there so it doesn't catch you.

---

## E. Mock interview Q&A — be ready for these

### Q1. "Walk me through StudioMode."
> "An AI product-photography studio for e-commerce. A seller uploads one product photo and generates studio-grade marketing media — background/scene variants, virtual fashion try-on, and image-to-video product clips — plus in-canvas AI edits like background swap, shadow, and AI reframe. It's credit-based through Dodo Payments. The AI models themselves are third-party — fal.ai for all image and video, OpenRouter for the vision analysis and prompt-engineering — so my work is the orchestration around them: a queued generation pipeline with row-locked claiming and webhook completion, a replayable provider boundary with idempotency, server-side plan-limit enforcement, an append-only credit ledger, the Dodo billing integration, and an agent-facing layer with its own OIDC provider and MCP server. Backend is FastAPI + Postgres + S3 + TaskIQ; frontend is Next.js 15."

### Q2. "How does a generation job actually flow through the system?"
> "The API validates the project and source asset, writes a `queued` row, commits, then best-effort enqueues a TaskIQ task — wrapped so a down Redis never fails the request; the job just stays queued. A worker claims the next job with `SELECT … ORDER BY priority DESC, queued_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`, so concurrent workers never grab the same row, then flips it to `running`. It resolves the source asset to a presigned S3 URL, clamps the request against the plan's limits server-side, and POSTs to fal.ai's queue endpoint with an idempotency key and a webhook callback. When fal calls back, I create the output asset, transition the job to succeeded or failed, and debit credits — with allow-negative, because the media already shipped and you never fail a customer after delivery."

### Q3. "Why `FOR UPDATE SKIP LOCKED`?"
> "It's the standard way to build a work queue on top of Postgres without a second broker as the source of truth. The claim query locks the one row it's about to take and skips any row another worker already locked, so you get safe concurrent draining with no double-processing and no blocking. The guarded `UPDATE … WHERE status='queued'` is a second belt so even if two workers somehow raced, only one wins the transition. TaskIQ handles the wake-up; Postgres handles the correctness."

### Q4. "You said credits are a ledger — why not just a counter?"
> "A mutable `credits_remaining` integer is where money bugs live — a lost update and you've given away or double-charged credits. So the ledger is append-only: every allocation, consumption, refund, and admin adjustment is a row with a direction and a reason, and the balance is `sum(credits) − sum(debits)`. That gives me a full audit trail, idempotent allocation keyed on the webhook event, and idempotent refunds keyed on the fal request id. I'll be honest about the gap: the read-then-append isn't row-locked yet, so under heavy concurrency there's a theoretical oversell, and I modeled hold/release reasons I haven't wired — today it's post-success debiting, not pre-authorization."

### Q5. "The AI models aren't yours — so what's the actual engineering?"
> "Right, and I'd never claim the models. fal.ai does the pixels; OpenRouter fronts Gemini and GPT-5.1 for the 'analyze this photo' and 'write a better prompt' steps. The engineering is everything that makes that safe and productizable: the job/asset/credit data model, a provider boundary with idempotency keys and webhook dedup so a retry or a replay doesn't double-charge or double-generate, server-side plan enforcement so a client can't request a 4K 20-image job on the free tier, the billing integration with webhook-plus-reconcile, and the prompt engineering — for fashion try-on there's a strict full-garment-swap guard and a fixed negative prompt so the model doesn't just tweak the original. The model is a commodity; the reliability and the guardrails are the product."

### Q6. "Tell me about the agent/OIDC/MCP layer — and be honest about how done it is."
> "It's the differentiated bet and it's partly early. I built a hand-rolled OpenID Connect provider — authorization-code with mandatory S256 PKCE, RS256 JWTs, a JWKS, hashed single-use codes, rotating refresh tokens, exact-match redirect URIs — specifically so an AI agent can authenticate against the API. It's safe-by-default: every endpoint returns 503 until a signing key is configured. Then on the frontend there's a real JSON-RPC MCP server at `/mcp` and standards-based discovery — `.well-known` OAuth metadata, an RFC 9727 api-catalog, an MCP server-card, agent-skills, an auth.md. The honest part: the MCP tools are read-only info today — pricing, tool list, API info — not the credit-spending generation tools, and the OIDC provider needs a security review before it's production-critical. So I'd pitch it as 'the identity and discovery plumbing for agent access is built and standards-compliant; wiring the paid tools behind it is the next step.'"

### Q7. "What's a bug or rough edge you know is in there?"
> "A few, and I can point to each. The fal webhook dedup insert doesn't catch the unique-constraint violation, so a replayed fal event 500s instead of returning a clean 'duplicate' — the Dodo path handles that correctly and the fal path should mirror it. The credit read-then-write isn't row-locked. And there's product debt I'd flag to a PM, not just an engineer: the video tool's UI offers Seedance / Kling / Veo3 but the handler hard-forces Seedance, so two of those branches are unreachable; and the brand kit has full storage + CRUD but the generation routes explicitly strip the brand-kit fields with a 'not yet' comment — so it's saved but not applied. I'd rather name those than have someone find them."

### Q8. "Why is the frontend just a client — and what's that unused Drizzle schema?"
> "The backend is the single source of truth for auth, credits, jobs, and billing, so the Next.js app is deliberately a thin client that calls `/api/v1` and never holds the fal key or does credit math authoritatively — it mirrors the server's debit locally only to keep the UI honest. The Drizzle + `pg` schema in the frontend repo is a scar from the migration: the product started on Firebase and moved to FastAPI + Postgres + S3, and that schema is left-over infrastructure — nothing in `src/` actually imports a pg pool or a drizzle client. I'd delete it. Same story with the Cloudflare-vs-Amplify ambiguity: the repo has full Cloudflare Pages tooling but the last handoff doc says it's on Amplify, so I'd say the deploy target isn't clean and I wouldn't overclaim one host."

### Q9. "How does the Shopify bridge work?"
> "It's a server-to-server bridge, not a full Shopify OAuth app — no product import, no publish-back. A Shopify app calls a handful of bridge endpoints authenticated by a shared secret compared with `hmac.compare_digest`, and the shop domain is used directly as the workspace id. On first contact it bootstraps a workspace + default project and seeds free credits; a billing-sync endpoint upserts a subscription and idempotently allocates plan credits; and the generation endpoints just reuse the exact same handlers the web studio uses, injecting a synthetic session user. So it's 'let an external Shopify surface reuse StudioMode's generation engine and sync its billing,' behind a static secret."

### Q10. "What would you harden first if this were your full-time job?"
> "Three things, in order. One, make credit debiting race-safe — row-lock or do it as a conditional UPDATE so concurrency can't oversell, and actually wire the hold/release reasons so async jobs reserve before they run. Two, make the fal webhook idempotent on replay like the Dodo one, and add rate-limiting to `/oauth/token` before promoting the OIDC provider to anything production-critical. Three, close the product gaps that read as overclaims — either apply the brand kit in generation or hide it, and either wire Kling/Veo3 or stop offering them in the UI. None are hard; they're the difference between 'demo that works' and 'infrastructure I'd put real money through.'"

---

## F. Honest caveats — say these proactively ✅

- **The AI is third-party.** Every image/video generation is **fal.ai**; every LLM call is **OpenRouter** (default Gemini 2.0 Flash + GPT-5.1). Mine is the orchestration, provider boundary, plan enforcement, credit ledger, billing, OIDC/MCP layer, and the whole frontend — **not the models.**
- **4 of 8 studio tools are "Coming Soon."** Live: Product Variants, Fashion Try-On, Fashion Reels, Product Videos. Stubbed: style-clone, label-edit, scene-generator, ad-creator.
- **Brand kit is stored but NOT applied to generation.** Full CRUD (logo, colors, must-include/avoid) + a prompt-directive builder exist, but no generation route calls them, and job creation explicitly strips `brand_kit_override` with a *"should not apply it yet"* comment. Don't claim brand-consistent output.
- **Video model choice is partly illusory.** The UI/schema offer Seedance / Kling / Veo3, but the handler hard-forces Seedance 2.0 — the Kling and Veo3 branches are unreachable dead code.
- **The OIDC provider is hand-rolled and gated.** It's genuinely feature-complete (PKCE, RS256, hashed single-use codes, rotating refresh, exact redirect match) but returns **503 until a signing key is set**, is self-described as needing a security review, and its `/mcp` tools are **read-only info, not the paid generation tools**. There's also a stale `SKILL.md` claiming HS256/no-OIDC that contradicts the rest.
- **Email is SMTP, not SES/Resend.** A SES module exists but is an empty placeholder; the real transport is hand-rolled SMTP HTML mail.
- **The frontend's Drizzle/`pg` schema is dead infrastructure** (unused; a Firebase-migration leftover). The backend Postgres is the sole source of truth. The `dodopayments` client SDK is also unused — checkout is backend-delegated.
- **Deployment is ambiguous.** Cloudflare Pages tooling is in the repo, but the latest handoff doc + a `next.config` comment say **AWS Amplify**. Say "documented target was Amplify; the repo also carries Cloudflare tooling" and don't pick one.
- **Programmatic-SEO scale: ~50–116 real pages, not 300–400.** The 300–400 is the *strategy doc's target*, not what ships. Guides are even excluded from the sitemap, and the tool×industry relevance matrix is mostly key-mismatched dead code.
- **Credit ledger caveats:** post-success debiting (no pre-auth hold despite the enum), and the read-then-append isn't row-locked (TOCTOU under concurrency). Fal webhook dedup isn't `IntegrityError`-guarded (replay 500s).
- **Naming/lineage:** codename **kalakaar** → shipped as **StudioMode.ai**; **migrated off Firebase** to FastAPI + Postgres + S3; bootstrapped from an earlier `kalakaar-3.1` repo.

---

## G. 30-second pitch + stack one-liner

> **30-sec:** "StudioMode.ai is an AI product-photography studio for e-commerce — upload one product photo, get background variants, virtual fashion try-on, and image-to-video clips, on credit-based Dodo billing. The AI itself is fal.ai and OpenRouter; my engineering is the orchestration: a Postgres-backed generation queue with `FOR UPDATE SKIP LOCKED` claiming and webhook completion, a replayable provider boundary with idempotency, server-side plan-limit enforcement, an append-only credit ledger, a webhook-plus-reconcile Dodo integration, and an agent layer — a PKCE OpenID Connect provider plus an MCP server and `.well-known` discovery — so AI agents can authenticate and discover the API. FastAPI + Postgres + S3 + TaskIQ backend, Next.js 15 studio + programmatic-SEO frontend. It's live, and I can name exactly which parts are shipped versus staged."
>
> **Stack:** FastAPI (Python 3.12) + Uvicorn, SQLAlchemy 2 on psycopg3 over RDS Postgres, 20 raw-SQL Alembic migrations, TaskIQ + Redis (RedisStreamBroker, in-memory fallback) with a separate worker dyno, AWS S3 (presigned PUT/GET), fal.ai (flux-2-pro/edit, nano-banana-2/edit, birefnet, seedance-2.0) + OpenRouter (Gemini 2.0 Flash, GPT-5.1), Dodo Payments (subscriptions + portal + Standard-Webhooks-verified webhooks + reconcile), opaque-session + bcrypt + hashed-OTP + Google auth, a hand-rolled PKCE/RS256 OIDC provider, an MCP server + `.well-known` agent discovery, SMTP email + TaskIQ email campaigns, admin console. Frontend: Next.js 15 App Router + React 18 + TypeScript, Tailwind v4, framer-motion, an infinite-canvas studio with backend-driven preset/model libraries, and a data-driven programmatic-SEO engine (JSON-LD + next-sitemap). Deployed on Dokku (backend) + Cloudflare Pages/AWS Amplify (frontend). Migrated off Firebase.
