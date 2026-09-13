#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
//
// The schema gate.
//
// Every JSON Schema published under schema/v1/ must be served from the literal
// path its $id names, must declare the dialect it is written in, and must carry
// its licence and the framing line. And every enum token that is written down
// in more than one file must say the same thing in each: a vocabulary with two
// definitions that disagree has no definition at all.
//
// Dependency-free by design: no lockfile, no install step. Compiling the
// schemas is the conformance job's work; this only reads them.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const BASE_URI = 'https://propertycommons.github.io/property-pack/'
const DIR = 'schema/v1'
const DIALECT = 'https://json-schema.org/draft/2020-12/schema'
const SPDX = 'SPDX-License-Identifier: CC-BY-4.0'
const FRAMING = 'not a standard, and endorsed by nobody'

const problems = []
const fail = (where, msg) => problems.push(`${where}: ${msg}`)

const read = (path) => readFileSync(join(ROOT, path), 'utf8')

function readJson(path) {
  try {
    return JSON.parse(read(path))
  } catch (err) {
    fail(path, `not valid JSON -- ${err.message}`)
    return null
  }
}

// -- every published schema ---------------------------------------------------

const schemaFiles = readdirSync(join(ROOT, DIR))
  .filter((f) => f.endsWith('.schema.json'))
  .sort()

if (schemaFiles.length === 0) fail(DIR, 'no *.schema.json files found')

const schemas = {}
for (const file of schemaFiles) {
  const where = `${DIR}/${file}`
  const s = readJson(where)
  if (!s) continue
  schemas[file] = s

  if (s.$id !== BASE_URI + where) {
    fail(where, `$id must equal the address the file is served from.\n    expected ${BASE_URI + where}\n    got      ${s.$id}`)
  }
  if (s.$schema !== DIALECT) {
    fail(where, `$schema must be the JSON Schema 2020-12 dialect -- got ${JSON.stringify(s.$schema)}`)
  }
  if (typeof s.$comment !== 'string' || !s.$comment.includes(SPDX)) {
    fail(where, `$comment must carry "${SPDX}" -- the schemas are vocabulary`)
  }
  if (typeof s.$comment !== 'string' || !s.$comment.includes(FRAMING)) {
    fail(where, `$comment must carry the framing line "${FRAMING}"`)
  }
  console.log(`${where}: checked`)
}

// -- one vocabulary, one definition --------------------------------------------

// The string literals of an exported TypeScript union, with comments removed
// first so that an apostrophe in a doc comment cannot be read as a token.
function tsUnion(path, name) {
  const src = read(path)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
  const m = src.match(new RegExp(`export type ${name}\\s*=([\\s\\S]*?)(?=\\nexport |$)`))
  if (!m) {
    fail(path, `no exported type ${name}`)
    return []
  }
  return [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1])
}

// The string literals of a `const NAME = [...]` array in a script.
function jsArray(path, name) {
  const m = read(path).match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\]`))
  if (!m) {
    fail(path, `no const ${name} array`)
    return []
  }
  return [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1])
}

const register = readJson(`${DIR}/components.json`)
const envelope = schemas['envelope.schema.json']
const ruleResult = schemas['rule-result.schema.json']

const vocabularies = [
  {
    name: 'VerificationLevel',
    copies: {
      [`${DIR}/envelope.ts`]: tsUnion(`${DIR}/envelope.ts`, 'VerificationLevel'),
      [`${DIR}/envelope.schema.json`]: envelope?.$defs?.verificationLevel?.enum,
      [`${DIR}/components.json`]: Object.keys(register?.enums?.verificationLevel ?? {}),
    },
  },
  {
    name: 'LegalStatus',
    copies: {
      [`${DIR}/envelope.ts`]: tsUnion(`${DIR}/envelope.ts`, 'LegalStatus'),
      [`${DIR}/envelope.schema.json`]: envelope?.$defs?.legalStatus?.enum,
      [`${DIR}/components.json`]: Object.keys(register?.enums?.legalStatus ?? {}),
      '.github/scripts/check-registers.mjs': jsArray('.github/scripts/check-registers.mjs', 'LEGAL_STATUS'),
    },
  },
  {
    name: 'RuleStatus',
    copies: {
      [`${DIR}/rule-result.ts`]: tsUnion(`${DIR}/rule-result.ts`, 'RuleStatus'),
      [`${DIR}/rule-result.schema.json`]: ruleResult?.$defs?.ruleStatus?.enum,
    },
  },
]

for (const { name, copies } of vocabularies) {
  const entries = Object.entries(copies)
  const [refPath, refTokens] = entries[0]
  let agree = true
  for (const [path, tokens] of entries) {
    if (!Array.isArray(tokens) || tokens.length === 0) {
      fail(path, `${name}: no tokens found`)
      agree = false
      continue
    }
    const missing = refTokens.filter((t) => !tokens.includes(t))
    const extra = tokens.filter((t) => !refTokens.includes(t))
    if (missing.length || extra.length) {
      agree = false
      fail(
        path,
        `${name} disagrees with ${refPath}` +
          (missing.length ? `\n    missing: ${missing.join(', ')}` : '') +
          (extra.length ? `\n    extra:   ${extra.join(', ')}` : '')
      )
    }
  }
  if (agree) console.log(`${name}: ${refTokens.length} tokens, identical in ${entries.length} places`)
}

// -- report -------------------------------------------------------------------

if (problems.length > 0) {
  console.error(`\nSchema gate FAILED -- ${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  - ${p}`)
  console.error('')
  process.exit(1)
}

console.log('\nSchema gate passed.')
