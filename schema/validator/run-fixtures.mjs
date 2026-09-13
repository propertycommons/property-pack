#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
//
// Runs the conformance fixtures against the reference validator.
//
// A valid fixture must produce no errors. An invalid fixture must fail for
// exactly the reason its manifest entry states -- every expected error must be
// reported, and every reported error must be one that was expected -- so that
// a fixture cannot pass by breaking in some other way.
//
// It also fails if a fixture on disk is missing from the manifest, if a kind
// of document has no valid fixture, or if any rule is exercised by no invalid
// fixture. A rule nobody has seen fail is untested.
//
//   npx --yes --package ajv@8.20.0 -c 'node schema/validator/run-fixtures.mjs'

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createValidator, KINDS, RULES, UsageError } from './validate.mjs'

const FIXTURES = fileURLToPath(new URL('../fixtures/v1/', import.meta.url))

const problems = []
const fail = (where, msg) => problems.push(`${where}: ${msg}`)

const show = (errors) => errors.map((e) => `\n      [${e.rule}] ${e.path || '(document)'}  ${e.message}`).join('')
const covers = (expected, actual) =>
  expected.rule === actual.rule &&
  (actual.path === expected.path || actual.path.startsWith(`${expected.path}/`))

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (entry.endsWith('.json')) out.push(relative(FIXTURES, p).split(sep).join('/'))
  }
  return out
}

let validator
try {
  validator = createValidator()
} catch (e) {
  console.error(e instanceof UsageError ? e.message : e.stack)
  process.exit(2)
}

const manifest = JSON.parse(readFileSync(join(FIXTURES, 'manifest.json'), 'utf8'))
const listed = new Set()
const validKinds = new Set()
const exercised = new Set()
let valid = 0
let invalid = 0

for (const { file, kind, expect } of manifest.fixtures) {
  listed.add(file)
  if (!(kind in KINDS)) {
    fail(file, `unknown kind "${kind}"`)
    continue
  }

  let doc
  try {
    doc = JSON.parse(readFileSync(join(FIXTURES, file), 'utf8'))
  } catch (e) {
    fail(file, `cannot be read as JSON -- ${e.message}`)
    continue
  }

  const errors = validator.validate(doc, kind)

  if (expect === 'valid') {
    valid++
    validKinds.add(kind)
    if (errors.length) fail(file, `expected valid, but got:${show(errors)}`)
    continue
  }

  invalid++
  if (!Array.isArray(expect) || expect.length === 0) {
    fail(file, 'expect must be "valid" or a non-empty list of { rule, path }')
    continue
  }
  for (const e of expect) {
    if (e.rule !== 'schema' && !(e.rule in RULES)) fail(file, `expects unknown rule "${e.rule}"`)
    exercised.add(e.rule)
  }
  if (errors.length === 0) {
    fail(file, 'expected to fail, but it validated')
    continue
  }
  for (const e of expect) {
    if (!errors.some((a) => covers(e, a))) {
      fail(file, `expected [${e.rule}] at ${e.path || '(document)'}, but got:${show(errors)}`)
    }
  }
  const unexpected = errors.filter((a) => !expect.some((e) => covers(e, a)))
  if (unexpected.length) {
    fail(file, `fails for a reason its manifest entry does not state:${show(unexpected)}`)
  }
}

for (const file of walk(FIXTURES)) {
  if (file !== 'manifest.json' && !listed.has(file)) fail(file, 'is not listed in manifest.json')
}
for (const kind of Object.keys(KINDS)) {
  if (!validKinds.has(kind)) fail('manifest.json', `no valid fixture for kind "${kind}"`)
}
for (const rule of Object.keys(RULES)) {
  if (!exercised.has(rule)) fail('manifest.json', `rule ${rule} is exercised by no invalid fixture -- a rule nobody has seen fail is untested`)
}

if (problems.length > 0) {
  console.error(`\nConformance fixtures FAILED -- ${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  - ${p}`)
  console.error('')
  process.exit(1)
}

console.log(`${valid} valid and ${invalid} invalid fixtures behaved as stated.`)
console.log(`${Object.keys(RULES).length} rules, each seen to fail; ${Object.keys(KINDS).length} kinds, each seen to pass.`)
console.log('\nConformance fixtures passed.')
