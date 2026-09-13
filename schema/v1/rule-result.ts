// SPDX-License-Identifier: CC-BY-4.0
//
// A suggested way forward for property packs in England. One worked proposal
// -- not a standard, and endorsed by nobody. Nothing here is required of
// anyone.
//
// Published address (this file's identifier):
//   https://propertycommons.github.io/property-pack/schema/v1/rule-result.ts
// JSON twin, for validation:
//   https://propertycommons.github.io/property-pack/schema/v1/rule-result.schema.json
//
// Note on fetching this file: GitHub Pages serves .ts as video/mp2t, so a
// browser will offer to download it rather than display it. For reading, use
// the GitHub blob view:
//   https://github.com/propertycommons/property-pack/blob/main/schema/v1/rule-result.ts

import type { LegalStatus } from './envelope'

/**
 * An explainable determination.
 *
 * Where an implementation applies a rule, it returns its working. That is a
 * UX asset, a debugging asset and a liability posture at once: it shows an
 * inference from stated evidence rather than issuing a verdict.
 */
export type RuleResult = {
  /** The rule that was applied. */
  ruleId: string

  /** What the rule concluded. */
  status: RuleStatus

  /**
   * The evidence trail: each field the rule read, and the value it observed.
   * Never empty. A determination that cannot show its working is a verdict.
   */
  because: Array<{ fieldPath: string; observed: unknown }>

  /** The legal status of the rule itself. */
  legalStatus: LegalStatus

  /** ISO 8601. The moment the determination was made. */
  asOf: string
}

/**
 * `uncertain` is a first-class status, not a failure. A tool that says "I
 * cannot determine this for your address -- here is your council's page" is
 * honest and useful. A tool that guesses is a liability wearing a confidence
 * badge.
 */
export type RuleStatus =
  /** The evidence satisfies the rule. */
  | 'pass'
  /** The evidence shows something the owner may want to act on. */
  | 'action-needed'
  /** The rule cannot be determined from the evidence available. */
  | 'uncertain'
  /** The rule does not apply to this record. */
  | 'not-applicable'
