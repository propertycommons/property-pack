# Contributing

SPDX-License-Identifier: Apache-2.0

## This is a suggestion, not a standard.

Everything here — the component register, the identifiers, the envelope, the
licence boundaries, the version policy — is one worked proposal for how a
residential property pack in England could be described. It is an indication of
a possible trajectory, published early and openly so that it can be argued
with, adopted in part, or replaced by something better. **No government
department, regulator, accreditation body or trade association has endorsed
it.** Nothing here is required of anyone.

**A pull request arguing that a component, an identifier, an enum value or a
status is wrong is exactly the kind this project wants.** Publishing a proposal
early is only worth doing if it can be contradicted. Bring a primary source and
the argument is already halfway made.

---

## The two rules, stated plainly

> **Contributions arrive as pull requests. We do not take feature requests.**

> **Every pull request is reviewed against the rules below. Passing CI and the
> editorial gate makes a pull request *eligible* to merge — not merged. The
> maintainer decides, and may decline without appeal.**

"We accept pull requests" reads as an open door, and this is not one. Saying so
here is fairer than saying it for the first time on somebody's branch after
they have done the work.

---

## Grounds on which a pull request is declined

These are written down so that a decline is a rule being applied, rather than a
judgement about the contributor — and so that the rules survive contact with
someone who disagrees with them.

**1. Out of scope: any Welsh product surface.** Housing policy is devolved, and
this project's scope is England. Welsh *contributions to the commons* are
welcome and wanted — a register row, a question branch or an adapter labelled
`["wales"]` with a primary source is mergeable, and makes the shared artefact
better. What is out of scope is a *product* surface that implies this project
serves Welsh addresses. The distinction is real: the artefacts are not
scope-limited, the product is.

**2. Reproduces a third-party form.** Never reproduce TA6, TA7, TA10, LPE1 or
any other third-party form, in whole or in part, including a close paraphrase
of its field set. Copyright exposure with no upside. Author your own questions,
mapped to the components in the register, and the coverage is the same while
the artefact is ours to license openly.

**3. A register row missing any of the editorial five.** Every row, everywhere
under `commons/**` and in the component register, carries:

| Field | Requirement |
| --- | --- |
| `sourceUrl` | An `https` **primary** source — legislation, a government publication, a public dataset. Never a link back into this repository, and never a secondary commentary standing in for the thing itself |
| `status` | One of the five taxonomy values below. **No free text** |
| `checkedBy` | Who checked it |
| `lastCheckedAt` | ISO `YYYY-MM-DD` |
| `jurisdiction` | A non-empty array. An unlabelled regulatory claim is unmergeable, whichever jurisdiction it came from |

CI enforces all five mechanically, so that judgement is only ever spent on real
questions.

**4. Any change to an already-published `$id`, component id or enum token.**
`VERSIONING.md` governs these, not pull-request review. Naming a better
identifier for an existing component is not grounds to rename it — somebody may
already have written the old one into their data.

**5. A regulatory claim without a primary source, or legal advice of any
kind.** We do not accept regulatory claims without a primary source, and we do
not accept legal advice. This is the same discipline the project applies to its
own rows, applied to strangers.

---

## The five status values

`status` is not an editorial hedge. It is a field in the data model, and it
governs what an implementation is permitted to say.

| Value | Meaning |
| --- | --- |
| `in-force` | Law today, commenced, enforceable — or, for a dataset, operative today |
| `enacted-not-commenced` | On the statute book, awaiting commencement regulations |
| `announced-policy` | Government has stated an intent that requires future legislation |
| `consultation-stage` | Consultation announced or open; content not settled |
| `locally-discretionary` | Exists, but varies by local authority and date |

**Never pre-empt a status.** A consultation is not a policy; a policy is not a
bill; a bill is not an Act; an Act is not commenced.

**A status may not advance** — `consultation-stage` to `announced-policy` to
`enacted-not-commenced` to `in-force` — without a diff citing the primary
source that moved it, and maintainer approval. Status advances are never
self-service.

---

## Dating discipline

`lastCheckedAt` and `sourceUrlsResolvedAt` are **different facts** and must not
be set from each other. The first is when the regulatory position was last
checked. The second is when the links were last confirmed to resolve. A
document that inherits its content from an earlier one inherits that document's
`lastCheckedAt`, not its own creation date.

If you have re-checked a row's regulatory position, move `lastCheckedAt` and
say in the pull request what you checked it against. If you have only fixed a
link that moved, do not touch it.

---

## Before you open a pull request

Run the gate and the type check locally. Both are dependency-free — there is no
lockfile and no install step.

```bash
node .github/scripts/check-registers.mjs
npx --yes --package typescript@5 tsc --noEmit --strict --skipLibCheck schema/v1/envelope.ts
```

The gate reports every problem it finds rather than stopping at the first, and
exits non-zero if there are any.

---

## Nothing published may cite a document nobody can open

Every file in this repository has to stand on its own. The only things a
published artefact cites are **primary sources**. A pull request that
cross-references an unpublished working document will not merge, and CI checks
for the section-mark character in published files for exactly this reason: a
repository that footnotes an invisible document is worse than one that
footnotes nothing.

---

## Licensing of contributions

By opening a pull request you agree that your contribution is licensed under
the licence governing the path you are changing — Apache-2.0 for code,
CC-BY-4.0 for the vocabulary under `schema/`, CC-BY-SA-4.0 for editorial
content under `commons/`. `NOTICE` is the authoritative map. There is no
contributor licence agreement and no copyright assignment.

---

*This project is a suggestion — one possible trajectory for property packs in
England, endorsed by nobody. Not legal advice. The pack requirements this work
anticipates are `announced-policy`, not law.*
