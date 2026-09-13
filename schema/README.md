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
  LICENSE-VOCABULARY          the CC-BY-4.0 licence for the vocabulary in v1/
  README.md                   this file
  v1/                         every versioned artefact that carries an $id
    components.json           the component register: 27 rows
    envelope.ts               Envelope<T>, VerificationLevel, LegalStatus
    envelope.schema.json        ... and its JSON twin
    rule-result.ts            RuleResult and its evidence trail
    rule-result.schema.json     ... and its JSON twin
    bundle.schema.json        the ukpp.pack.v1 handoff bundle, and answers
    question.schema.json      the shape of a question definition
    notification.schema.json  a reminder about a record
    hook.schema.json          an event sent to a subscribed partner
  validator/                  the reference validator -- a tool, spans versions
  fixtures/v1/                the conformance fixtures for v1
```

The validator and the fixtures are code, and are Apache-2.0. Everything in
`v1/` is vocabulary, and is CC-BY-4.0.

---

## Addresses

```
https://propertycommons.github.io/property-pack/schema/v1/components.json
https://propertycommons.github.io/property-pack/schema/v1/envelope.ts
https://propertycommons.github.io/property-pack/schema/v1/envelope.schema.json
https://propertycommons.github.io/property-pack/schema/v1/rule-result.ts
https://propertycommons.github.io/property-pack/schema/v1/rule-result.schema.json
https://propertycommons.github.io/property-pack/schema/v1/bundle.schema.json
https://propertycommons.github.io/property-pack/schema/v1/question.schema.json
https://propertycommons.github.io/property-pack/schema/v1/notification.schema.json
https://propertycommons.github.io/property-pack/schema/v1/hook.schema.json
```

Each `$id` is the literal path the file is served from, and CI fails if one is
not. The version sits in the directory rather than only in the identifier, so
no build step exists that could let the two drift apart, and a future `v2` is a
sibling directory rather than a rewrite.

GitHub Pages serves `.ts` as `video/mp2t`, so a browser will offer to download
`envelope.ts` or `rule-result.ts` rather than display it. For reading, use the
blob view
([`envelope.ts`](https://github.com/propertycommons/property-pack/blob/main/schema/v1/envelope.ts),
[`rule-result.ts`](https://github.com/propertycommons/property-pack/blob/main/schema/v1/rule-result.ts)).

Each `.ts` file has a JSON Schema twin, served as JSON at its own address. The
other schemas reference `envelope.schema.json` rather than restating the enum
values, and CI fails if the TypeScript, the JSON Schema and the register ever
disagree about a token.

## The schemas in one paragraph each

**`bundle.schema.json`** is `ukpp.pack.v1`: the machine-readable handoff of a
pack. It carries `$schema` alongside `schemaVersion`, so a bundle names the
thing it claims to conform to by an address anyone can dereference. It always
carries `jurisdiction`, even from a product that only ever emits one value,
and it always carries a `disclaimer`. It holds document references, never
document contents. Answers inside it are `ownerDeclared` by construction.

**`question.schema.json`** is the shape of a question, not the content of any
bank. `jurisdiction` is a required array, and every question must say who asks
for it and why.

**`rule-result.schema.json`** is an explainable determination. Its evidence
trail may never be empty, and `uncertain` is a first-class status.

**`notification.schema.json`** and **`hook.schema.json`** fix the shape of a
reminder and of an outbound partner event before any partner exists. A
notification must state where its fact came from. A hook payload has no
extension point at all, so that it cannot carry a document.

Objects are closed apart from `x-` extension properties, and dates are
patterns rather than formats, so every conformant validator gives the same
answer. `VERSIONING.md` says which vocabularies are closed and which are open.

---

## Two licences meet in this directory

| What | Licence | Why |
| --- | --- | --- |
| The **vocabulary** — everything in `v1/`: the component register, the type definitions, the JSON Schemas, the identifiers and enum tokens | **CC-BY-4.0** (`LICENSE-VOCABULARY`) | Identifiers have to be maximally reusable. Share-alike on an identifier vocabulary is friction with no corresponding benefit — the intended outcome is that a competitor emits these component ids |
| The **code** around it — the reference validator in `validator/`, the fixtures in `fixtures/`, any future adapters | **Apache-2.0** (`/LICENSE`) | The explicit patent grant matters the moment a standards or accreditation process touches the work |

`envelope.ts` and `rule-result.ts` sit on that line: each is a vocabulary
expressed in TypeScript, and each carries `SPDX-License-Identifier: CC-BY-4.0`
in its header. **The identifier in a file wins over any inference from its
directory.** `/NOTICE` is the authoritative map.

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
