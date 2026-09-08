# property-pack

[![CI](https://github.com/propertycommons/property-pack/actions/workflows/ci.yml/badge.svg)](https://github.com/propertycommons/property-pack/actions/workflows/ci.yml)

Open schemas, vocabularies and registers describing one suggested shape for an
English residential property pack. Interchange format: `ukpp.pack.v1`.

---

## This is a suggestion, not a standard.

Everything here — the component register, the identifiers, the envelope, the
licence boundaries, the version policy — is **one worked proposal** for how a
residential property pack in England could be described. It is an indication of
a possible trajectory, published early and openly so that it can be argued
with, adopted in part, or replaced by something better.

**No government department, regulator, accreditation body or trade association
has endorsed it.** Nothing here is required of anyone, and nothing here
describes what a property pack *will* contain — only what one *could* contain,
for the reasons set out alongside it.

This repository is deliberately built to look like something you could rely on:
a versioned namespace, a component register with permanent identifiers, a
continuous integration badge, a deprecation policy. Those exist so that the
proposal can be **argued with on concrete terms** — so that someone who thinks
component 17 is wrong can say precisely which row they mean. They are not
evidence that anyone has adopted it. Read the whole repository in that light.

---

## Why it exists

The government has said it intends to require sales packs before listing in
England, and to legislate on what data those packs must contain. That is
**announced policy, not law**. No seller is required to produce a pack today.

There is therefore a window in which assembling one is voluntary, useful and
unclaimed — and in which a published, versioned, dated decomposition of what a
pack contains may be one of very few in existence. This repository is an
attempt to put one into the open early, where it can be criticised, rather than
to keep one private until it is too late to change.

---

## What is here today

| Path | What it is |
| --- | --- |
| [`schema/v1/components.json`](schema/v1/components.json) | The component register: 27 named components, each with a permanent id, a supply code, the best verification level reachable for it today, expiry semantics, a primary source, and a status |
| [`schema/v1/envelope.ts`](schema/v1/envelope.ts) | The provenance envelope: `Envelope<T>`, `VerificationLevel` (five states), `LegalStatus` (five states) |
| [`commons/`](commons/) | Licensed and gated, and intentionally empty. The editorial content lands here |
| `NOTICE`, `LICENSE`, `schema/LICENSE-VOCABULARY`, `commons/LICENSE` | The licence boundary, scoped by directory |
| `VERSIONING.md`, `CONTRIBUTING.md`, `SECURITY.md` | How this is versioned, how to contribute, how to report a vulnerability |

## What is not here yet

The reference validator, the conformance fixtures, the remaining schemas
(`rule-result.ts`, and the question, bundle, notification and hook schemas),
and everything under `commons/v1/`.

**No version is tagged, and conformance is not yet claimable.** See
[Conformance](#conformance) below. `commons/` is empty on purpose: it carries
its own licence and its own CI gate from the commit that created it, so that
nothing can ever land there ungated and nothing can later be argued to have
inherited the root licence.

---

## The published namespace

`ukpp.pack.v1` is a version string, not an address. The addresses are:

```
https://propertycommons.github.io/property-pack/schema/v1/
https://propertycommons.github.io/property-pack/commons/v1/
```

Every artefact that carries an `$id` is served from the literal path that `$id`
names. The version sits in the **directory**, not only in the identifier, so
there is no build step that could let the two drift apart, and a future `v2`
would be a sibling directory rather than a rewrite. A format nobody can
dereference is a file, not a reference.

One caveat on fetching: GitHub Pages serves `.ts` as `video/mp2t`, so a browser
will offer to download `envelope.ts` rather than display it. For reading, use
[the blob view](https://github.com/propertycommons/property-pack/blob/main/schema/v1/envelope.ts).

---

## What the component ids are for

The 27 ids in the register — `epc`, `leasehold-terms`, `standard-searches` and
the rest — are **permanent identifiers**, and they are the part of this project
most worth copying. Two products cannot exchange a pack without agreeing on
what the pieces are called. The vocabulary is licensed CC-BY-4.0 rather than
share-alike precisely so that anyone, including a direct competitor, can emit
these ids without friction. That is the intended outcome, not a concession.

Because other people may come to depend on them, `VERSIONING.md` governs
changes to a published id rather than ordinary pull-request review. **Stability
is a courtesy to anyone who adopts them. It is not a claim that this
decomposition is correct.**

---

## Reading the register

Three things in `components.json` are easy to misread.

**`status` is about the source, not about packs.** It records the legal status
of the instrument or dataset at that row's `sourceUrl`, as it bears on that
component. It is not a claim about the status of pack requirements, which are
announced policy throughout. Where a row's source is an operative public
dataset rather than a statute, `in-force` reads as *this source is operative
today*.

**`bestVerificationToday` is a ceiling.** It is the highest verification level
reachable for that component now — not the level any particular record will
carry. Where the ceiling is conditional, `verificationNote` records the
condition. One consequence worth stating: `statutoryRegisterVerified` is
reachable by **no row at all** today. It is retained deliberately, because the
enum describes kinds of evidence rather than currently available feeds, and
removing it would mean a breaking change to a published interchange format the
day the private rented sector database becomes operational.

**`lastCheckedAt` and `sourceUrlsResolvedAt` are different facts.** The first
is when the regulatory position was last checked. The second is when the links
were last confirmed to resolve. They are separate fields and they hold
different dates. Conflating them is the error this project most wants to avoid,
because it is the one that quietly turns a maintained document into a stale one
that still looks maintained.

---

## The provenance envelope

Every field in a record is wrapped in an envelope carrying its source, when it
was collected, when it was last verified, when it goes stale, and how well it
is evidenced. Five verification states, never collapsed into a single
"verified" tick — a reader shown one tick learns nothing, and whoever showed it
has taken on responsibility for a claim they did not make.

`unknown` is a first-class state, not a null. A tool that says *I cannot
determine this — here is your council's page* is more useful than one that
guesses.

---

## Conformance

**Conformance is not claimable yet.** The reference validator and the
conformance fixtures do not exist, so there is nothing to conform to and no
version has been tagged.

When they do exist, conformance will mean exactly one thing: *an implementation
conforms if it emits bundles that validate against these published schemas and
passes these published fixtures.* That is a statement about interoperating with
this proposal. It is **not** a mark of quality, an endorsement, a certification,
or evidence that anything is compliant with any legal requirement.

---

## Licensing

Licences here are scoped by **directory**, not by repository, because the
published namespace has to be a single address. `NOTICE` is the authoritative
map; it is repeated here and in each of the two Creative Commons licence files.

| Path | Licence | Covers |
| --- | --- | --- |
| [`/LICENSE`](LICENSE) | **Apache-2.0** | All code: the reference validator, the conformance fixtures, the adapters, the types as code |
| [`/NOTICE`](NOTICE) | *not a licence* | The map of which licence governs which path |
| [`schema/LICENSE-VOCABULARY`](schema/LICENSE-VOCABULARY) | **CC-BY-4.0** | The component register and the envelope vocabulary — the identifiers, not the code around them |
| [`commons/LICENSE`](commons/LICENSE) | **CC-BY-SA-4.0** | The question bank, the registers, the language rulebook — editorial content |

The root `LICENSE` is a verbatim copy of the Apache License 2.0 and carries no
scope header of its own, so that automated licence detection reads it
correctly. Every source file carries an `SPDX-License-Identifier` header, so a
single file stays self-describing once it leaves this tree. JSON has no comment
syntax, so SPDX rides in a `$comment` field.

A repository boundary would have enforced all of this for free. A directory
boundary has to be written down — which is what `NOTICE` is for.

---

## Open source is not open data

**This repository contains no property records and no personal data, and it
never will.**

"Open source" and "open data" are not the same thing, and they are routinely
read as though they were. What is published here describes what a pack *is*. No
user record, no uploaded document, no access log and no identity evidence is
ever published here. Any service built on these artefacts holds that material
privately; the artefacts describe its shape, never its contents.

---

## Contributing

Contributions arrive as pull requests. **We do not take feature requests.**
Passing CI and the editorial gate makes a pull request *eligible* to merge, not
merged. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the rules and for the
grounds on which a pull request is declined.

A pull request arguing that a component, an identifier or an enum value is
**wrong** is exactly the kind this project wants. That is what publishing a
proposal early is for.

To report a security vulnerability, see [`SECURITY.md`](SECURITY.md). It uses
GitHub private vulnerability reporting and carries no email address.

---

## Two caveats, which are not the same caveat

**This project is a suggestion.** One possible trajectory for property packs in
England, one worked proposal among the several that could be written, endorsed
by nobody. Nothing here has been adopted.

**Not legal advice.** Every regulatory statement in this repository carries a
status label and the date it was last checked. The pack requirements this work
anticipates are `announced-policy` — they are not law, and no seller is
required to produce a pack today. Statuses change; the dates in the register
are there so you can see how old the position is rather than assume it is
current.
