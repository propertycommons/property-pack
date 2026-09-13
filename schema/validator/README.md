# `schema/validator/`

SPDX-License-Identifier: Apache-2.0

## This is a suggestion, not a standard.

Everything here — the component register, the identifiers, the envelope, the
schemas, this validator — is one worked proposal for how a residential property
pack in England could be described. It is an indication of a possible
trajectory, published early and openly so that it can be argued with, adopted
in part, or replaced by something better. **No government department,
regulator, accreditation body or trade association has endorsed it.** Nothing
here is required of anyone.

A document that passes this validator interoperates with this proposal. That
is all it means. It is **not** a mark of quality, an endorsement, a
certification, or evidence that anything is compliant with any legal
requirement.

---

## What it is

The reference validator for `ukpp.pack.v1`. It checks a document in two
layers and reports both together:

1. **The published JSON Schemas** in `schema/v1/`, checked by
   [Ajv](https://ajv.js.org/), a JSON Schema 2020-12 implementation. The
   schemas are loaded from this checkout, not fetched, so the validator needs
   no network. Any other conformant 2020-12 validator should reach the same
   verdict on this layer — the schemas use `pattern` rather than `format` for
   dates for exactly that reason.
2. **The rules JSON Schema cannot express**, listed below. Each has a stable
   rule id, so a test can assert *which* rule failed without depending on the
   wording of a message.

## Running it

No install step and no lockfile. Ajv is fetched through a pinned `npx`, the
same way the type check fetches `tsc`:

```bash
npx --yes --package ajv@8.20.0 -c 'node schema/validator/validate.mjs FILE...'
```

| Option | Meaning |
| --- | --- |
| `--kind KIND` | `bundle`, `answer`, `question`, `notification`, `hook` or `rule-result`. Optional for a bundle, which declares itself through `$schema` |
| `--json` | Print the results as JSON: one `{ file, kind, valid, errors }` per file, each error `{ rule, path, message }` |

| Exit status | Meaning |
| --- | --- |
| `0` | Every file is valid |
| `1` | At least one file is invalid |
| `2` | A usage or internal error — including Ajv not being found, or a document whose kind cannot be told |

Paths in errors are JSON Pointers into the document. For a missing required
property the path names the property that is missing.

## The rules

Schema failures are reported as rule `schema`. The rest:

| Rule id | What it checks |
| --- | --- |
| `component.known-id` | Every component id — in a bundle's components and documents, a question's `mapsToComponents`, a notification's `suppressIf`, a hook's payload — is in the component register. Ids beginning `x-` are private extensions and are exempt |
| `component.duplicate` | A component appears at most once in a bundle |
| `component.stale-as-current` | A component marked `present` is not past its `validUntil` at the bundle's `generatedAt`; one marked `stale` is |
| `request.days-elapsed` | `daysElapsed` equals the whole days from `requestedAt` to the bundle's `generatedAt` |
| `question.module-prefix` | A question's `module` is the prefix of its `questionId` |

Every rule is exercised by at least one invalid conformance fixture, and CI
fails if one is not. A rule nobody has seen fail is untested.

## Running the conformance fixtures

```bash
npx --yes --package ajv@8.20.0 -c 'node schema/validator/run-fixtures.mjs'
```

This runs every fixture in `schema/fixtures/v1/` and checks that each one does
exactly what its manifest entry says. See
[`schema/fixtures/README.md`](../fixtures/README.md).

## Licence

Apache-2.0, per the root `LICENSE`. The schemas it validates against are
vocabulary and are CC-BY-4.0; `/NOTICE` is the authoritative map.

---

*This project is a suggestion — one possible trajectory for property packs in
England, endorsed by nobody. Not legal advice.*
