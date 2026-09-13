# Versioning

SPDX-License-Identifier: Apache-2.0

## This is a suggestion, not a standard.

Everything here — the component register, the identifiers, the envelope, the
licence boundaries, this version policy — is one worked proposal for how a
residential property pack in England could be described. It is an indication of
a possible trajectory, published early and openly so that it can be argued
with, adopted in part, or replaced by something better. **No government
department, regulator, accreditation body or trade association has endorsed
it.** Nothing here is required of anyone.

**Version discipline exists so that a proposal can be cited and disagreed with
precisely.** If someone wants to say that component 17 is wrong, or that a
particular enum value should not exist, they need to be able to name the exact
artefact they are objecting to and be sure it will still say the same thing
tomorrow. That is what versioning buys. It is not a claim that anything has
been adopted.

---

## Current state

**No version is tagged.** `v1.0.0` does not exist yet.

What is published today is the component register, the envelope, the bundle,
question, rule result, notification and hook schemas, the reference validator,
the conformance fixtures, the licence boundary and the governance files. Every
item `v1.0.0` requires now exists; the tag itself has not been cut. Until it is,
**conformance is not claimable**, because a claim of conformance has to name
the version it is a claim about.

The published artefacts should be treated as **subject to change without a
version bump** until `v1.0.0` is tagged. After that, the rules below apply.

---

## What `v1.0.0` will mean

The tag is what gets cited, so it is gated. `v1.0.0` requires all of:

- the schemas — in `schema/v1/`;
- the reference validator — in `schema/validator/`;
- the conformance fixtures — in `schema/fixtures/v1/`;
- a one-paragraph conformance statement — below;
- public CI running the fixtures on every commit — the `Conformance fixtures`
  job.

### The conformance statement

> An implementation conforms to a version of `ukpp.pack.v1` if the bundles it
> emits validate against that version's published schemas, and it passes that
> version's published conformance fixtures. The reference validator in
> `schema/validator/` is one way to check both; any conformant JSON Schema
> 2020-12 validator should reach the same verdict on the schemas. Conformance
> is a statement about interoperating with this proposal. It is not a mark of
> quality, an endorsement, a certification, or evidence that anything is
> compliant with any legal requirement.

Semantic versioning and the deprecation policy below apply **from `v1.0.0`**,
not from the first breaking change. Deciding the policy after something breaks
is deciding it under pressure, which is how interchange formats acquire the
exceptions that make them unusable.

---

## Semantic versioning, as it applies here

The version applies to the published artefacts as a set.

**MAJOR** — a change that could stop a previously valid document from
validating, or change what a previously valid document means:

- removing or renaming a published component id;
- removing or renaming an enum token;
- changing the meaning of an existing field;
- making an optional field required;
- removing a field.

**MINOR** — a change that existing valid documents survive:

- adding a component;
- adding an optional field;
- adding an enum token **where consumers are specified to tolerate unknown
  tokens**, and MAJOR where they are not;
- adding a new schema.

**PATCH** — no change to the shape or meaning of anything:

- correcting a `sourceUrl` that has moved;
- updating `lastCheckedAt` or `sourceUrlsResolvedAt`;
- a `status` change on a register row, which is a data edit;
- documentation, typographical and editorial corrections.

**A `status` change is a data edit, never a code change.** If a regulatory
status change requires anything more than editing a row, the design is wrong.

---

## Closed and open vocabularies

Whether adding a token is MINOR or MAJOR depends on whether consumers are
required to tolerate tokens they do not recognise. This section is that
requirement, written down.

**Closed — adding a token is MAJOR.** A consumer may reject a value it does not
recognise, because these vocabularies carry claims about evidence and law, and
guessing at an unknown one is exactly the error they exist to prevent:

| Vocabulary | Defined in |
| --- | --- |
| `VerificationLevel` | `envelope.schema.json`, `envelope.ts` |
| `LegalStatus` | `envelope.schema.json`, `envelope.ts` |
| Component status in a bundle | `bundle.schema.json` |
| Readiness band | `bundle.schema.json` |
| `RuleStatus` | `rule-result.schema.json`, `rule-result.ts` |
| `AnswerType` | `question.schema.json` |
| Notification state | `notification.schema.json` |

**Open — adding a value is MINOR.** A consumer **must** tolerate a value it does
not recognise, and display or pass it through rather than reject the document:

- component ids (the register grows by MINOR releases);
- `source`, `heldBy`, `audience`, `jurisdiction` and the other kebab-case
  tokens described as open in the schemas;
- notification triggers and hook event names.

Emitting and consuming are held to different standards here. A conforming
**emitter** uses only component ids that are in the register it conforms to,
or ids beginning `x-`, and the reference validator checks exactly that against
the register in its own checkout. A **consumer** that meets an id it does not
know — most often one added by a later MINOR release — tolerates it. An older
validator reporting a newer id as unknown is a statement about the older
register, not a reason to reject the bundle.

Where a vocabulary is written down in more than one file, CI fails if the
copies disagree.

### Extensions

Objects in the published schemas are closed: a property that is not defined is
an error, so that a misspelt field fails loudly rather than being silently
ignored. Two things are always permitted:

- **properties whose names begin `x-`**, for implementation-specific data, on
  every object that has an extension point;
- **component ids beginning `x-`**, for components an implementation tracks
  that the register does not. They are never registered, and the reference
  validator does not check them against the register.

The one deliberate exception is the hook `payload`, which has no extension
point at all: a hook carries references and summaries, never document
contents, and a closed payload is how that is enforced rather than hoped for.

### Within a major version

Versioned artefacts evolve **in place** within their major version directory:
a MINOR or PATCH release of `v1` changes the files under `schema/v1/`, at the
same addresses. That is what the semver guarantee is for — every document
valid under `1.x` remains valid under every later `1.y`. The tag, not the
directory, is what pins an exact release.

---

## The version lives in the directory

Versioned artefacts live under `schema/v1/` and `commons/v1/`, and each `$id`
is the literal path the file is served from. There is no build step that could
let an identifier and its address drift apart.

A future `v2` is a **sibling directory**, not a rewrite. `schema/v1/` continues
to be served, unchanged, for as long as the deprecation policy says it is. An
identifier that stops resolving has broken every document that cited it.

The two root licence files sit **above** the version directories, because they
govern the whole subtree. A licence that has to be re-copied into each new
version directory is a licence that eventually will not be.

---

## Identifiers, and what governs them

**A published `$id`, component id or enum token is not changed by pull-request
review. It is changed here, by this policy, or not at all.**

That is a deliberate removal of discretion. Ordinary review asks whether a
change is an improvement. For an identifier, the question is different: someone
may already have written it into their data, and an improvement that breaks
them is not an improvement. Naming a better id for an existing component is not
grounds to rename it.

One published enum value already illustrates the rule.
`statutoryRegisterVerified` is reachable by no row in the register today.
Nothing populates it. It is retained anyway, because the enum describes **kinds
of evidence, not currently available feeds** — it remains the correct label for
the private rented sector database the day that register becomes operational.
An unused enum value costs nothing. An absent one costs a MAJOR version and a
migration.

---

## Deprecation policy

Nothing published is removed without passing through deprecation first.

1. **Mark.** The artefact is marked deprecated in place, with the version it
   was deprecated in, what replaces it, and why.
2. **Wait.** It keeps working, and keeps resolving at its published address,
   for **at least one MAJOR version and no fewer than 12 months** from the
   release that marked it.
3. **Remove.** Removal happens only in a MAJOR release, and only after the
   wait. The address of a removed versioned artefact continues to be served
   from its version directory.

Deprecation is announced in the release notes for the version that marks it.
There is no separate mailing list and no notification mechanism, and none is
promised.

---

## What is not promised

- **No support commitment.** This is maintained as time allows.
- **No published roadmap.** Open-source maintenance has a real running cost in
  triage, releases and version discipline, and an unfunded roadmap is a
  liability rather than a service.
- **No feature requests.** Contributions arrive as pull requests. See
  `CONTRIBUTING.md`.

---

*This project is a suggestion — one possible trajectory for property packs in
England, endorsed by nobody. Not legal advice. Every regulatory statement here
carries a status label and the date it was last checked, and the pack
requirements this work anticipates are `announced-policy`, not law.*
