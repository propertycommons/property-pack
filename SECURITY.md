# Security policy

SPDX-License-Identifier: Apache-2.0

A suggested way forward for property packs in England. One worked proposal —
not a standard, and endorsed by nobody.

## Reporting a vulnerability

**Use GitHub private vulnerability reporting:**
[Report a vulnerability](https://github.com/propertycommons/property-pack/security/advisories/new)

Or navigate to the **Security** tab of this repository and choose *Report a
vulnerability*. The report is private to the maintainers until an advisory is
published.

**This file carries no email address, deliberately.** A published contact
address on a repository whose subject is private property information is a
permanent liability, this project has no domain to host one behind, and a
personal address on a specification ages badly.

Please do not report vulnerabilities through public issues or pull requests.

## What to expect

There is no service-level commitment, and none is promised. Reports are
triaged as time allows. You will get an acknowledgement when the report is
read, and an outcome when there is one.

## Scope

This repository publishes schemas, vocabularies, registers and the scripts that
check them. There is no running service here, no user data and no credentials.

In scope:

- a defect in the check scripts or the CI workflow that would let an invalid or
  malicious document pass the editorial gate;
- a published artefact that could cause a consumer to mis-parse or mis-trust a
  document — for example an identifier that resolves somewhere unexpected;
- anything in this repository that discloses information it should not.

Out of scope:

- the content of any regulatory claim. That is an editorial matter — open a
  pull request with a primary source, per `CONTRIBUTING.md`;
- vulnerabilities in any third-party service this repository merely links to.
  Report those to the service.

## No user data lives here

**This repository contains no property records and no personal data, and it
never will.** No user record, no uploaded document, no access log and no
identity evidence is ever published here. If you believe something in this
repository discloses personal data, that is in scope above and worth reporting
straight away.
