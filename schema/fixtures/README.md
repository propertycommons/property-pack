# `schema/fixtures/`

SPDX-License-Identifier: Apache-2.0

## This is a suggestion, not a standard.

Everything here — the component register, the identifiers, the envelope, the
schemas, these fixtures — is one worked proposal for how a residential property
pack in England could be described. It is an indication of a possible
trajectory, published early and openly so that it can be argued with, adopted
in part, or replaced by something better. **No government department,
regulator, accreditation body or trade association has endorsed it.** Nothing
here is required of anyone.

---

## Every fixture is synthetic

**No fixture describes a real property, a real person or a real record.** The
address is `1 Example Street, Exampletown, ZZ99 9ZZ`, the UPRN is
`999999999999`, the local authority code is `E99999999`, certificate numbers
and hashes are zeros, and every record, user and document identifier contains
`EXAMPLE`. Open source is not open data, and that applies to test data
as much as to anything else. A pull request adding a fixture that could be
mistaken for a real record will not merge.

## Layout

```
schema/fixtures/
  README.md        this file
  v1/              the fixtures for ukpp.pack.v1
    manifest.json  every fixture, its kind, and what it is expected to do
    valid/         documents that must validate
    invalid/       documents that must fail, each for exactly one stated reason
```

Each manifest entry is `{ "file", "kind", "expect" }`, where `expect` is
either `"valid"` or a list of `{ "rule", "path" }` — the rule that must fail
and the JSON Pointer it must fail at. Every fixture's own `$comment` says what
it proves.

## What the runner enforces

`schema/validator/run-fixtures.mjs` fails if:

- a valid fixture produces any error;
- an invalid fixture validates, or does not produce every expected error;
- an invalid fixture produces an error its manifest entry does **not** state —
  so a fixture cannot pass by breaking in some other way;
- a fixture on disk is missing from the manifest;
- a kind of document has no valid fixture;
- a validator rule is exercised by no invalid fixture.

## The fixtures

| Fixture | Kind | Expected | What it proves |
| --- | --- | --- | --- |
| [`valid/bundle-minimal.json`](v1/valid/bundle-minimal.json) | bundle | valid | The smallest valid bundle: every required field, no optional sections, no components. |
| [`valid/bundle-full.json`](v1/valid/bundle-full.json) | bundle | valid | A full bundle: every component status, every optional section, a private x- component and an x- extension property. |
| [`valid/answer.json`](v1/valid/answer.json) | answer | valid | An owner-declared answer with one piece of evidence. |
| [`valid/question.json`](v1/valid/question.json) | question | valid | A conditional enum question that accepts evidence. |
| [`valid/notification.json`](v1/valid/notification.json) | notification | valid | A certificate expiry reminder that states its fact and its source. |
| [`valid/hook.json`](v1/valid/hook.json) | hook | valid | A hook carrying a reference and a summary, and nothing else. |
| [`valid/rule-result-uncertain.json`](v1/valid/rule-result-uncertain.json) | rule-result | valid | An honest uncertain: licensing cannot be determined from open data, and the rule shows what it looked at. |
| [`invalid/bundle-missing-jurisdiction.json`](v1/invalid/bundle-missing-jurisdiction.json) | bundle | `schema` at `/jurisdiction` | A bundle must always emit jurisdiction, even from a product that only ever produces one value. |
| [`invalid/bundle-missing-disclaimer.json`](v1/invalid/bundle-missing-disclaimer.json) | bundle | `schema` at `/disclaimer` | A bundle must tell a consumer that reads only the JSON what it is and is not being given. |
| [`invalid/bundle-wrong-schema-uri.json`](v1/invalid/bundle-wrong-schema-uri.json) | bundle | `schema` at `/$schema` | A bundle must name the schema it conforms to by its published address. |
| [`invalid/bundle-bare-verified.json`](v1/invalid/bundle-bare-verified.json) | bundle | `schema` at `/components/0/verificationLevel` | There is no single "verified" state. Five states, never collapsed into one badge. |
| [`invalid/bundle-compliant-band.json`](v1/invalid/bundle-compliant-band.json) | bundle | `schema` at `/readiness/band` | Readiness is completeness, never compliance. "compliant" is not a band. |
| [`invalid/bundle-document-contents.json`](v1/invalid/bundle-document-contents.json) | bundle | `schema` at `/documents/0/contentBase64` | A bundle holds document references, never document contents. |
| [`invalid/answer-not-owner-declared.json`](v1/invalid/answer-not-owner-declared.json) | answer | `schema` at `/verificationLevel` | An owner's answer is never presented as verified. Every answer is ownerDeclared. |
| [`invalid/question-no-jurisdiction.json`](v1/invalid/question-no-jurisdiction.json) | question | `schema` at `/jurisdiction` | An unlabelled question is unmergeable. jurisdiction is required. |
| [`invalid/question-empty-who-asks.json`](v1/invalid/question-empty-who-asks.json) | question | `schema` at `/whoAsks` | No question without a stated reason: at least one party must be named as asking for it. |
| [`invalid/question-enum-without-options.json`](v1/invalid/question-enum-without-options.json) | question | `schema` at `/options` | An enum question must list its options. |
| [`invalid/notification-missing-provenance.json`](v1/invalid/notification-missing-provenance.json) | notification | `schema` at `/body/provenance` | A notification states where its fact came from. |
| [`invalid/hook-document-contents.json`](v1/invalid/hook-document-contents.json) | hook | `schema` at `/payload/documentContent` | Hooks carry references and summaries, never document contents. |
| [`invalid/rule-result-empty-because.json`](v1/invalid/rule-result-empty-because.json) | rule-result | `schema` at `/because` | A determination that cannot show its working is a verdict. because may not be empty. |
| [`invalid/rule-result-fail-status.json`](v1/invalid/rule-result-fail-status.json) | rule-result | `schema` at `/status` | A rule result is pass, action-needed, uncertain or not-applicable. "fail" is not a status. |
| [`invalid/bundle-unknown-component.json`](v1/invalid/bundle-unknown-component.json) | bundle | `component.known-id` at `/components/0/component` | A component id must be in the register. A private component must begin x-. |
| [`invalid/question-unknown-component.json`](v1/invalid/question-unknown-component.json) | question | `component.known-id` at `/mapsToComponents/1` | A question may only map to components that are in the register. |
| [`invalid/bundle-duplicate-component.json`](v1/invalid/bundle-duplicate-component.json) | bundle | `component.duplicate` at `/components/1/component` | A component appears at most once in a bundle. |
| [`invalid/bundle-stale-as-present.json`](v1/invalid/bundle-stale-as-present.json) | bundle | `component.stale-as-current` at `/components/0/status` | A value past its validUntil is stale, and must never be presented as current. |
| [`invalid/bundle-stale-not-expired.json`](v1/invalid/bundle-stale-not-expired.json) | bundle | `component.stale-as-current` at `/components/0/status` | A value marked stale must actually be past its validUntil. |
| [`invalid/bundle-days-elapsed-wrong.json`](v1/invalid/bundle-days-elapsed-wrong.json) | bundle | `request.days-elapsed` at `/components/0/daysElapsed` | daysElapsed must agree with requestedAt and the bundle's generatedAt. |
| [`invalid/question-module-mismatch.json`](v1/invalid/question-module-mismatch.json) | question | `question.module-prefix` at `/module` | A question's module must be the prefix of its questionId. |

## Licence

Apache-2.0, per the root `LICENSE`. The fixtures are test code; the schemas
they exercise are vocabulary and are CC-BY-4.0. `/NOTICE` is the authoritative
map.

---

*This project is a suggestion — one possible trajectory for property packs in
England, endorsed by nobody. Not legal advice.*
