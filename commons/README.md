# `commons/`

SPDX-License-Identifier: CC-BY-SA-4.0

## This is a suggestion, not a standard.

Everything here — the component register, the identifiers, the envelope, the
licence boundaries, the version policy — is one worked proposal for how a
residential property pack in England could be described. It is an indication of
a possible trajectory, published early and openly so that it can be argued
with, adopted in part, or replaced by something better. **No government
department, regulator, accreditation body or trade association has endorsed
it.** Nothing here is required of anyone.

---

## Open source is not open data

**This directory contains no property records and no personal data, and it
never will.**

"Open source" and "open data" are routinely read as the same thing, and they
are not. **No user record, no uploaded document, no access log and no identity
evidence is ever published here.** What is published is editorial content that
describes what a pack is: questions, watched legislation, gaps, a scoring
model, a language rulebook. Any service built on these artefacts holds a user's
own material privately.

---

## This directory holds no editorial content yet

It carries its own licence and its own CI gate **from the commit that created
it**, before any content exists. The only file published here so far is an
index page saying so.

That is the point. A directory that is licensed and gated from the beginning
cannot later be argued to have inherited the root Apache-2.0 licence, and no
row can ever land here ungated and need grandfathering in afterwards. The
editorial gate runs on `commons/**` on every commit; on an empty directory it
reports that it is in place ahead of the content, and passes.

## What lands here

| File | What it will contain |
| --- | --- |
| `v1/question-bank/` | Modules of questions, authored from scratch, each carrying who asks for it and why |
| `v1/legislation-watch.json` | Watched rows: what is being watched, on what cadence, which components a change would move, and what to do when a status changes |
| `v1/gap-catalogue.json` | For every component: who holds it, and what the next step is |
| `v1/readiness-model.json` | The completeness formula, the credit bands, the applicability rules, and the initial weights published as the guesses they are |
| `v1/language-rulebook.json` | Never-say and say-instead pairs, as data rather than as prose |
| `v1/leasehold-request.md` | An information request template a managing agent would recognise |

The question bank is authored, not converted, and is the one genuinely slow
item. The hard constraint on it does not move: **author your own field set.**
Never reproduce TA6, TA7, TA10, LPE1 or any other third-party form. Copyright
exposure with no upside — and an openly licensed bank that becomes the free
alternative to those forms is worth more than any of them.

---

## The editorial gate

Every row here carries all five of these, and CI enforces them mechanically:

| Field | Requirement |
| --- | --- |
| `sourceUrl` | An `https` **primary** source. Never a link back into this repository |
| `status` | One of `in-force`, `enacted-not-commenced`, `announced-policy`, `consultation-stage`, `locally-discretionary`. **No free text** |
| `checkedBy` | Who checked it |
| `lastCheckedAt` | ISO `YYYY-MM-DD` |
| `jurisdiction` | A non-empty array. An unlabelled regulatory claim is unmergeable |

A status may not advance without a diff citing the primary source that moved
it, and maintainer approval. **A status change is a data edit, never a code
change** — if changing one requires a deploy, the design is wrong.

**Welsh contributions are welcome here.** A row labelled `["wales"]` with a
primary source is mergeable and makes the shared artefact better. Merging one
creates no obligation on any product to serve a Welsh address; the artefacts
are not scope-limited even where a product is. See `CONTRIBUTING.md`.

---

## Why share-alike here, and not in `schema/`

This is editorial work, where improvements should flow back and forks should
stay open. Commercial use is permitted. That is the opposite of the reasoning
in `schema/`, where the vocabulary is CC-BY-4.0 precisely so that identifiers
carry no friction at all — the intended outcome there is that a competitor
emits the component ids.

Two different jobs, two different licences, one repository, because the
published namespace has to be a single address. `/NOTICE` is the authoritative
map.

---

*This project is a suggestion — one possible trajectory for property packs in
England, endorsed by nobody. Not legal advice. The pack requirements this work
anticipates are `announced-policy`, not law.*
