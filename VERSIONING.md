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

What is published today is the component register, the envelope vocabulary, the
licence boundary and the governance files. The reference validator, the
conformance fixtures and the remaining schemas are not written. Until they are,
there is nothing to validate against and **conformance is not claimable**.

The published artefacts should be treated as **subject to change without a
version bump** until `v1.0.0` is tagged. After that, the rules below apply.

---

## What `v1.0.0` will mean

The tag is what gets cited, so it is gated. `v1.0.0` requires all of:

- the schemas;
- the reference validator;
- the conformance fixtures;
- a one-paragraph conformance statement — *an implementation conforms if it
  emits bundles that validate against the published schemas and passes the
  published fixtures*;
- public CI running the fixtures on every commit.

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
