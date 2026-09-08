#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
//
// The editorial gate.
//
// It runs on commons/** from the commit that creates that directory, so that
// the gate exists before there is anything to grandfather in. It also runs on
// the component register in schema/v1/, because the maintainer's own rows must
// pass the gate they ask contributors to pass.
//
// Dependency-free by design: no lockfile, no install step.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const BASE_URI = 'https://propertycommons.github.io/property-pack/'
const REGISTER = 'schema/v1/components.json'

const LEGAL_STATUS = [
  'in-force',
  'enacted-not-commenced',
  'announced-policy',
  'consultation-stage',
  'locally-discretionary',
]

const problems = []
const fail = (where, msg) => problems.push(`${where}: ${msg}`)

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

function walk(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (entry.endsWith('.json')) out.push(p)
  }
  return out
}

function readJson(path) {
  const where = relative(ROOT, path).split(sep).join('/')
  try {
    return { where, data: JSON.parse(readFileSync(path, 'utf8')) }
  } catch (err) {
    fail(where, `not valid JSON -- ${err.message}`)
    return { where, data: null }
  }
}

// Any object inside a top-level array is a row. That covers {"rows": [...]}
// and {"components": [...]} alike, so a new register does not need the gate
// taught about it.
function rowsOf(data) {
  const rows = []
  if (!data || typeof data !== 'object' || Array.isArray(data)) return rows
  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value)) continue
    value.forEach((item, i) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        rows.push({ key, index: i, row: item })
      }
    })
  }
  return rows
}

// The editorial five. A row missing any of them is unmergeable.
function checkEditorialFive(where, key, index, row) {
  const at = `${where} [${key}][${index}]${row.id ? ` id=${row.id}` : ''}`

  const url = row.sourceUrl
  if (typeof url !== 'string' || url.length === 0) {
    fail(at, 'missing sourceUrl -- every row needs a primary source')
  } else if (!url.startsWith('https://')) {
    fail(at, `sourceUrl must be https -- got ${url}`)
  } else if (
    url.includes('propertycommons.github.io/property-pack') ||
    url.includes('github.com/propertycommons/property-pack')
  ) {
    fail(at, 'sourceUrl points back into this repository -- it must be a primary source')
  }

  if (typeof row.status !== 'string' || row.status.length === 0) {
    fail(at, 'missing status')
  } else if (!LEGAL_STATUS.includes(row.status)) {
    fail(at, `status "${row.status}" is not one of the five taxonomy values -- no free text`)
  }

  if (typeof row.checkedBy !== 'string' || row.checkedBy.length === 0) {
    fail(at, 'missing checkedBy')
  }

  if (typeof row.lastCheckedAt !== 'string' || !ISO_DATE.test(row.lastCheckedAt)) {
    fail(at, `lastCheckedAt must be an ISO date, YYYY-MM-DD -- got ${JSON.stringify(row.lastCheckedAt)}`)
  }

  if (!Array.isArray(row.jurisdiction) || row.jurisdiction.length === 0) {
    fail(at, 'missing jurisdiction -- an unlabelled regulatory claim is unmergeable')
  }
}

// -- commons/** -------------------------------------------------------------

const commonsFiles = walk(join(ROOT, 'commons'))
if (commonsFiles.length === 0) {
  console.log(
    'commons/: no register files yet. The editorial gate is in place ahead of\n' +
    '          the content, which is the point -- nothing lands here ungated.'
  )
} else {
  for (const path of commonsFiles) {
    const { where, data } = readJson(path)
    if (!data) continue
    const rows = rowsOf(data)
    if (rows.length === 0) {
      console.log(`${where}: no rows found`)
      continue
    }
    for (const { key, index, row } of rows) checkEditorialFive(where, key, index, row)
    console.log(`${where}: ${rows.length} row(s) checked`)
  }
}

// -- the component register -------------------------------------------------

const registerPath = join(ROOT, REGISTER)
if (!existsSync(registerPath)) {
  fail(REGISTER, 'missing -- the component register is a required artefact')
} else {
  const { where, data: reg } = readJson(registerPath)
  if (reg) {
    const expectedId = BASE_URI + REGISTER
    if (reg.$id !== expectedId) {
      fail(where, `$id must equal the address the file is served from.\n    expected ${expectedId}\n    got      ${reg.$id}`)
    }
    if (reg.schemaVersion !== 'ukpp.pack.v1') {
      fail(where, `schemaVersion must be "ukpp.pack.v1" -- got ${JSON.stringify(reg.schemaVersion)}`)
    }
    if (typeof reg.disclaimer !== 'string' || reg.disclaimer.length === 0) {
      fail(where, 'missing disclaimer -- a consumer that reads only the JSON must still be told this is a suggestion, not a standard')
    }
    if (!ISO_DATE.test(reg.lastCheckedAt ?? '')) {
      fail(where, 'lastCheckedAt must be an ISO date')
    }
    if (!ISO_DATE.test(reg.sourceUrlsResolvedAt ?? '')) {
      fail(where, 'sourceUrlsResolvedAt must be an ISO date, and must stay a separate field from lastCheckedAt')
    }

    const components = reg.components
    if (!Array.isArray(components)) {
      fail(where, 'components must be an array')
    } else {
      if (components.length !== 27) {
        fail(where, `expected exactly 27 components -- got ${components.length}`)
      }

      const sales = components.filter((c) => c.packSide === 'sales').length
      if (sales !== 21) {
        fail(where, `expected exactly 21 sales-side components -- got ${sales}`)
      }

      const seen = new Set()
      const enums = reg.enums ?? {}
      const keysOf = (name) => Object.keys(enums[name] ?? {})

      components.forEach((c, i) => {
        const at = `${where} [components][${i}]${c.id ? ` id=${c.id}` : ''}`

        if (typeof c.id !== 'string' || !KEBAB.test(c.id)) {
          fail(at, `id must be kebab-case -- got ${JSON.stringify(c.id)}`)
        } else if (seen.has(c.id)) {
          fail(at, `duplicate id "${c.id}" -- component ids are permanent identifiers`)
        } else {
          seen.add(c.id)
        }

        if (c.ordinal !== i + 1) {
          fail(at, `ordinal must be sequential -- expected ${i + 1}, got ${c.ordinal}`)
        }

        if (!Array.isArray(c.supply) || c.supply.length === 0) {
          fail(at, 'supply must be a non-empty array')
        } else {
          for (const s of c.supply) {
            if (!keysOf('supply').includes(s)) fail(at, `supply code "${s}" is not in the declared enum`)
          }
        }

        for (const [field, enumName] of [
          ['bestVerificationToday', 'verificationLevel'],
          ['mvpPrefill', 'mvpPrefill'],
          ['packSide', 'packSide'],
        ]) {
          if (!keysOf(enumName).includes(c[field])) {
            fail(at, `${field} "${c[field]}" is not in the declared ${enumName} enum`)
          }
        }

        if (!c.expiry || !keysOf('expiryKind').includes(c.expiry.kind)) {
          fail(at, `expiry.kind "${c.expiry?.kind}" is not in the declared expiryKind enum`)
        }

        checkEditorialFive(where, 'components', i, c)
      })

      // The vocabulary must keep the state nothing currently reaches.
      if (!keysOf('verificationLevel').includes('statutoryRegisterVerified')) {
        fail(where, 'statutoryRegisterVerified must remain in the verificationLevel enum. It describes a kind of evidence, not an available feed, and removing it would be a breaking change to a published interchange format.')
      }
    }
    console.log(`${where}: ${reg.components?.length ?? 0} component(s) checked`)
  }
}

// -- report -----------------------------------------------------------------

if (problems.length > 0) {
  console.error(`\nEditorial gate FAILED -- ${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  - ${p}`)
  console.error('')
  process.exit(1)
}

console.log('\nEditorial gate passed.')
