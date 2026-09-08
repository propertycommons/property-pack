# `schema/`

SPDX-License-Identifier: CC-BY-4.0

## This is a suggestion, not a standard.

Everything here — the component register, the identifiers, the envelope, the
licence boundaries, the version policy — is one worked proposal for how a
residential property pack in England could be described. It is an indication of
a possible trajectory, published early and openly so that it can be argued
with, adopted in part, or replaced by something better. **No government
department, regulator, accreditation body or trade association has endorsed
it.** Nothing here is required of anyone, and nothing here describes what a
property pack *will* contain — only what one *could* contain.

---

## What is in this directory

```
schema/
  LICENSE-VOCABULARY   the CC-BY-4.0 licence governing this subtree
  README.md            this file
  v1/                  every versioned artefact that carries an $id
    components.json    the component register: 27 rows
    envelope.ts        Envelope<T>, VerificationLevel, LegalStatus
```

Not written yet, and named so their absence is visible rather than implied:
`rule-result.ts`, the question, bundle, notification and hook schemas, the
reference validator (`schema/validator/` — a tool, spanning versions) and the
conformance fixtures (`schema/fixtures/v1/` — per version).

---

## Addresses

```
https://propertycommons.github.io/property-pack/schema/v1/components.json
https://propertycommons.github.io/property-pack/schema/v1/envelope.ts
```

Each `$id` is the literal path the file is served from. The version sits in the
directory rather than only in the identifier, so no build step exists that
could let the two drift apart, and a future `v2` is a sibling directory rather
than a rewrite.

GitHub Pages serves `.ts` as `video/mp2t`, so a browser will offer to download
`envelope.ts` rather than display it. For reading, use
[the blob view](https://github.com/propertycommons/property-pack/blob/main/schema/v1/envelope.ts).

`envelope.ts` has no JSON twin yet. When one is written it will be authored
alongside the bundle schema, so that the bundle can reference it rather than
restate the five enum values in a second place.

---

## Two licences meet in this directory

| What | Licence | Why |
| --- | --- | --- |
| The **vocabulary** — the component register, the identifiers, the enum tokens | **CC-BY-4.0** (`LICENSE-VOCABULARY`) | Identifiers have to be maximally reusable. Share-alike on an identifier vocabulary is friction with no corresponding benefit — the intended outcome is that a competitor emits these component ids |
| The **code** around it — the reference validator, the fixtures, the adapters, the types as code | **Apache-2.0** (`/LICENSE`) | The explicit patent grant matters the moment a standards or accreditation process touches the work |

`envelope.ts` sits on that line: it is a vocabulary expressed in TypeScript, and
it carries `SPDX-License-Identifier: CC-BY-4.0` in its header. **The identifier
in a file wins over any inference from its directory.** `/NOTICE` is the
authoritative map.

---

## The component register in one paragraph

27 components, each with a permanent kebab-case id, an ordinal, a supply code
(`PUB`, `OWN`, `PRO`, `3P`), the best verification level reachable for it today,
expiry semantics, whether it can be pre-filled from public data, which side of
the pack it belongs to, and the editorial five: a primary `sourceUrl`, a
`status` from the five-value taxonomy, `checkedBy`, `lastCheckedAt` and
`jurisdiction`. Rows 1–21 are sales-side and rows 22–27 rental-side; CI asserts
both counts, the total, and that the ids are unique and the ordinals sequential.

The maintainer's own 27 rows pass the same editorial gate contributors are
asked to pass. A gate retrofitted onto rows that never passed it is not a gate.

---

## Three readings that are easy to get wrong

**`status` describes the source, not packs.** It is the legal status of the
instrument or dataset at that row's `sourceUrl`, as it bears on that component
— not a claim about the status of pack requirements, which are announced policy
throughout.

**`bestVerificationToday` is a ceiling, evaluated today**, not the level a
particular record will carry. `verificationNote` records the condition wherever
the ceiling is conditional. `statutoryRegisterVerified` is reachable by no row
at all today and is retained deliberately: the enum describes kinds of
evidence, not currently available feeds.

**`uncertain` is not a verification level.** It belongs to rule results, not to
envelopes. Where an answer is genuinely address-specific and unknowable from
open data — `licensing-status` is the clear case — the honest output is
`uncertain` plus a route to the authoritative source, and the envelope's
verification level is `unknown`.

---

*This project is a suggestion — one possible trajectory for property packs in
England, endorsed by nobody. Not legal advice. The pack requirements this work
anticipates are `announced-policy`, not law.*
