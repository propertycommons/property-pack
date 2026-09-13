// SPDX-License-Identifier: CC-BY-4.0
//
// A suggested way forward for property packs in England. One worked proposal
// -- not a standard, and endorsed by nobody. Nothing here is required of
// anyone.
//
// Published address (this file's identifier):
//   https://propertycommons.github.io/property-pack/schema/v1/envelope.ts
// JSON twin, for validation:
//   https://propertycommons.github.io/property-pack/schema/v1/envelope.schema.json
//
// Note on fetching this file: GitHub Pages serves .ts as video/mp2t, so a
// browser will offer to download it rather than display it. For reading, use
// the GitHub blob view:
//   https://github.com/propertycommons/property-pack/blob/main/schema/v1/envelope.ts

/**
 * The provenance envelope.
 *
 * Every field in a property record is wrapped in one of these, with no
 * exceptions. Adding `source` and `validUntil` to a field you are already
 * writing costs minutes. Adding them to two years of accumulated records is a
 * migration you cannot actually perform, because you no longer know where the
 * old values came from.
 *
 * Records are append-only: never update an envelope in place. Write a new one
 * and set `supersedes` to the identifier of the envelope it replaces. That is
 * what keeps "what did the seller know, and when?" an answerable question.
 */
export type Envelope<T> = {
  /** The value itself. */
  value: T

  /**
   * Where the value came from. Examples in use today: 'epc-odc',
   * 'planning-data', 'voa', 'hmlr', 'prs-database', 'ownerDeclaration'.
   * Deliberately a string rather than a closed enum: an implementer with a
   * source this project does not have should not need a schema change.
   */
  source: string

  /** The identifier of the record in that source, where the source has one. */
  sourceRecordId: string | null

  /** ISO 8601. When the value was fetched or captured. */
  collectedAt: string

  /** ISO 8601. When the value was last confirmed against its source. */
  verifiedAt: string | null

  /**
   * ISO 8601. After this instant the value is rendered as stale and is never
   * presented as current. A null means no expiry semantics apply, not that the
   * value is permanently fresh.
   */
  validUntil: string | null

  /** How well the value is evidenced. Always shown; never collapsed to a tick. */
  verificationLevel: VerificationLevel

  /** Where the field carries a rule, the legal status of that rule. */
  legalStatus: LegalStatus | null

  /** The identifier of the envelope this one replaces, in the field history. */
  supersedes: string | null
}

/**
 * Five states, never collapsed into a binary badge. A reader shown a single
 * "verified" tick learns nothing, and whoever showed it has inherited
 * responsibility for a claim they did not actually make. Show the level.
 */
export type VerificationLevel =
  /** The owner typed it. Useful, not authoritative. */
  | 'ownerDeclared'
  /** Matched against a public dataset. */
  | 'sourceMatched'
  /** A surveyor, assessor, engineer or installer supplied it. */
  | 'professionallyVerified'
  /**
   * Confirmed against a statutory register.
   *
   * Nothing populates this state in England today. It is retained
   * deliberately: this enum describes kinds of evidence, not currently
   * available feeds, and it remains the correct label for the private rented
   * sector database the day that register becomes operational. An unused enum
   * value costs nothing. An absent one costs a breaking change to a published
   * interchange format.
   */
  | 'statutoryRegisterVerified'
  /** Explicitly unknown. A first-class state, not a null. */
  | 'unknown'

/**
 * The status of a rule or policy the field depends on.
 *
 * These are not editorial hedges. The difference between a rule that is in
 * force, one that is on the statute book but not commenced, and one that has
 * only been announced is the difference between a safe statement and an unsafe
 * one, and it drives what copy an implementation is permitted to show.
 */
export type LegalStatus =
  /** Law today, commenced, enforceable. */
  | 'in-force'
  /** On the statute book, awaiting commencement regulations. */
  | 'enacted-not-commenced'
  /** Government has stated an intent that requires future legislation. */
  | 'announced-policy'
  /** Consultation announced or open; content not settled. */
  | 'consultation-stage'
  /** Exists, but varies by local authority and date. */
  | 'locally-discretionary'
