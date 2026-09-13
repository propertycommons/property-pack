#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
//
// The reference validator for ukpp.pack.v1.
//
// Two layers, reported together. The first is the published JSON Schemas,
// checked by Ajv -- a real JSON Schema 2020-12 implementation, so that
// "validates against the published schemas" means what it says rather than
// what a home-made engine happens to do. The second is the handful of rules
// JSON Schema cannot express, each with a stable rule id.
//
// Ajv is loaded through a pinned npx rather than installed, so the repository
// carries no lockfile and no install step:
//
//   npx --yes --package ajv@8.20.0 -c 'node schema/validator/validate.mjs FILE...'

import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { delimiter, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const AJV_VERSION = '8.20.0'

const SCHEMA_DIR = fileURLToPath(new URL('../v1/', import.meta.url))
const BASE = 'https://propertycommons.github.io/property-pack/schema/v1/'

/** Every kind of document this validator checks, and the schema that governs it. */
export const KINDS = {
  bundle: `${BASE}bundle.schema.json`,
  answer: `${BASE}bundle.schema.json#/$defs/answer`,
  question: `${BASE}question.schema.json`,
  notification: `${BASE}notification.schema.json`,
  hook: `${BASE}hook.schema.json`,
  'rule-result': `${BASE}rule-result.schema.json`,
}

/** The rules JSON Schema cannot express. Ids are stable; messages are not. */
export const RULES = {
  'component.known-id':
    'A component id must be in the component register, unless it begins x- (a private extension).',
  'component.duplicate':
    'A component appears at most once in a bundle.',
  'component.stale-as-current':
    'A value past its validUntil is stale and must not be marked present; a value marked stale must be past its validUntil.',
  'request.days-elapsed':
    "daysElapsed must equal the whole days from requestedAt to the bundle's generatedAt.",
  'question.module-prefix':
    "A question's module must be the prefix of its questionId.",
}

export class UsageError extends Error {}

// npm exec puts the package's bin directory on PATH but does not put the
// package on the module resolution path, so look beside each such directory.
function loadAjv() {
  const resolvers = [createRequire(import.meta.url)]
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    if (/node_modules[\\/]\.bin$/.test(dir)) resolvers.push(createRequire(join(dir, '..', 'noop.js')))
  }
  for (const req of resolvers) {
    try {
      const mod = req('ajv/dist/2020')
      return mod.default ?? mod
    } catch {}
  }
  return null
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

function fromAjv(errors) {
  const out = []
  for (const e of errors ?? []) {
    // An if/then failure is always accompanied by the error from the branch
    // that failed, which is the useful one.
    if (e.keyword === 'if') continue
    let path = e.instancePath
    if (e.keyword === 'required' || e.keyword === 'dependentRequired') path += `/${e.params.missingProperty}`
    if (e.keyword === 'additionalProperties') path += `/${e.params.additionalProperty}`
    let message = e.message
    if (e.keyword === 'enum') message += `: ${e.params.allowedValues.join(', ')}`
    if (e.keyword === 'const') message += `: ${JSON.stringify(e.params.allowedValue)}`
    out.push({ rule: 'schema', path, message })
  }
  return out
}

function semantic(doc, kind, registered) {
  const out = []
  const err = (rule, path, message) => out.push({ rule, path, message })
  if (!isObject(doc)) return out

  const checkId = (id, path) => {
    if (typeof id === 'string' && !id.startsWith('x-') && !registered.has(id)) {
      err('component.known-id', path, `"${id}" is not in the component register`)
    }
  }

  if (kind === 'bundle') {
    const generatedAt = Date.parse(doc.generatedAt)
    const components = Array.isArray(doc.components) ? doc.components : []
    const seen = new Map()

    components.forEach((c, i) => {
      if (!isObject(c)) return
      const at = `/components/${i}`

      checkId(c.component, `${at}/component`)
      if (typeof c.component === 'string') {
        if (seen.has(c.component)) {
          err('component.duplicate', `${at}/component`, `"${c.component}" already appears at /components/${seen.get(c.component)}`)
        } else {
          seen.set(c.component, i)
        }
      }

      if (Number.isNaN(generatedAt)) return
      const validUntil = typeof c.validUntil === 'string' ? Date.parse(c.validUntil) : NaN
      if (c.status === 'present' && validUntil < generatedAt) {
        err('component.stale-as-current', `${at}/status`,
          `validUntil ${c.validUntil} is before generatedAt ${doc.generatedAt}, so this value is stale and must not be marked present`)
      }
      if (c.status === 'stale' && !(validUntil < generatedAt)) {
        err('component.stale-as-current', `${at}/status`,
          `marked stale, but validUntil ${c.validUntil ?? 'null'} is not before generatedAt ${doc.generatedAt}`)
      }

      const requestedAt = typeof c.requestedAt === 'string' ? Date.parse(c.requestedAt) : NaN
      if (Number.isInteger(c.daysElapsed) && !Number.isNaN(requestedAt)) {
        const expected = Math.floor((generatedAt - requestedAt) / 86_400_000)
        if (c.daysElapsed !== expected) {
          err('request.days-elapsed', `${at}/daysElapsed`,
            `is ${c.daysElapsed}, but from requestedAt ${c.requestedAt} to generatedAt ${doc.generatedAt} is ${expected}`)
        }
      }
    })

    const documents = Array.isArray(doc.documents) ? doc.documents : []
    documents.forEach((d, i) => isObject(d) && checkId(d.component, `/documents/${i}/component`))
  }

  if (kind === 'question') {
    const ids = Array.isArray(doc.mapsToComponents) ? doc.mapsToComponents : []
    ids.forEach((id, i) => checkId(id, `/mapsToComponents/${i}`))
    if (typeof doc.questionId === 'string' && typeof doc.module === 'string') {
      const prefix = doc.questionId.split('.')[0]
      if (prefix !== doc.module) {
        err('question.module-prefix', '/module', `is "${doc.module}", but questionId "${doc.questionId}" belongs to module "${prefix}"`)
      }
    }
  }

  if (kind === 'notification') {
    const suppress = Array.isArray(doc.suppressIf) ? doc.suppressIf : []
    suppress.forEach((s, i) => isObject(s) && checkId(s.component, `/suppressIf/${i}/component`))
  }

  if (kind === 'hook' && isObject(doc.payload)) {
    checkId(doc.payload.component, '/payload/component')
  }

  return out
}

/**
 * Compile every published schema and return a validator. Throws UsageError if
 * Ajv cannot be found, and Ajv's own error if a published schema is malformed.
 */
export function createValidator() {
  const Ajv2020 = loadAjv()
  if (!Ajv2020) {
    throw new UsageError(
      `Ajv was not found. Run the validator through a pinned npx:\n` +
      `  npx --yes --package ajv@${AJV_VERSION} -c 'node schema/validator/validate.mjs FILE...'`
    )
  }

  // strictRequired is off because it rejects `required` inside an if/then
  // branch, which is idiomatic 2020-12. Every other strict check stays on, so
  // a malformed published schema fails loudly here rather than passing
  // silently somewhere else.
  const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true })
  for (const file of readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.schema.json')).sort()) {
    ajv.addSchema(readJson(join(SCHEMA_DIR, file)))
  }

  const compiled = {}
  for (const [kind, ref] of Object.entries(KINDS)) compiled[kind] = ajv.getSchema(ref)

  const register = readJson(join(SCHEMA_DIR, 'components.json'))
  const registered = new Set(register.components.map((c) => c.id))

  return {
    /** The kind a document declares, or null if it cannot be told. */
    kindOf(doc) {
      if (!isObject(doc)) return null
      const declared = Object.entries(KINDS).find(([, ref]) => ref === doc.$schema)
      if (declared) return declared[0]
      // A bundle that names the wrong schema is still a bundle, and is
      // reported as one rather than as a document of unknown kind.
      if ('schemaVersion' in doc) return 'bundle'
      return null
    },

    /** Every problem with the document, as { rule, path, message }. Empty means valid. */
    validate(doc, kind) {
      const check = compiled[kind]
      if (!check) throw new UsageError(`unknown kind "${kind}" -- expected one of ${Object.keys(KINDS).join(', ')}`)
      check(doc)
      return [...fromAjv(check.errors), ...semantic(doc, kind, registered)]
    },
  }
}

// -- command line -------------------------------------------------------------

const USAGE = `Usage: validate.mjs [--kind KIND] [--json] FILE...

  --kind KIND   one of: ${Object.keys(KINDS).join(', ')}
                Optional for bundles, which declare themselves through $schema.
  --json        print results as JSON

Exit status: 0 every file valid, 1 at least one invalid, 2 usage or internal error.`

function main(argv) {
  let kind = null
  let json = false
  const files = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--kind') kind = argv[++i]
    else if (arg === '--json') json = true
    else if (arg === '-h' || arg === '--help') return console.log(USAGE), 0
    else if (arg.startsWith('-')) throw new UsageError(`unknown option ${arg}\n\n${USAGE}`)
    else files.push(arg)
  }
  if (files.length === 0) throw new UsageError(USAGE)
  if (kind !== null && !(kind in KINDS)) throw new UsageError(`unknown kind "${kind}"\n\n${USAGE}`)

  const validator = createValidator()
  const results = []
  let status = 0

  for (const file of files) {
    let doc
    try {
      doc = readJson(file)
    } catch (e) {
      results.push({ file, kind, valid: false, errors: [{ rule: 'json', path: '', message: e.message }] })
      status = Math.max(status, 1)
      continue
    }
    const k = kind ?? validator.kindOf(doc)
    if (!k) {
      results.push({ file, kind: null, valid: false, errors: [{ rule: 'kind', path: '', message: 'cannot tell what kind of document this is -- pass --kind' }] })
      status = 2
      continue
    }
    const errors = validator.validate(doc, k)
    results.push({ file, kind: k, valid: errors.length === 0, errors })
    if (errors.length) status = Math.max(status, 1)
  }

  if (json) {
    console.log(JSON.stringify(results, null, 2))
  } else {
    for (const r of results) {
      console.log(`${r.valid ? 'valid  ' : 'INVALID'}  ${r.file}${r.kind ? ` (${r.kind})` : ''}`)
      for (const e of r.errors) console.log(`         [${e.rule}] ${e.path || '(document)'}  ${e.message}`)
    }
  }
  return status
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main(process.argv.slice(2))
  } catch (e) {
    console.error(e instanceof UsageError ? e.message : e.stack)
    process.exitCode = 2
  }
}
