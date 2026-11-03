# Security policy

UF-CSS is in **early development** and has no stable release or formal support window.

## Reporting a vulnerability

Please **do not file public issues with exploit details, credentials or private user information**. Prefer GitHub's **Report a vulnerability** option in the Security tab if enabled. If it is not available, contact the repository maintainer privately through an established channel and request a secure way to share a report.

Include affected code, likely impact, minimum reproduction and mitigation suggestions when possible. Do not disclose third-party secrets or test against systems without permission.

No guaranteed response or disclosure timeline is offered at this stage. Security advisories and patched release versions will be used when applicable.

## Package supply-chain and prerelease controls

UF-CSS's prerelease workflow is **manual-only** and is intentionally unusable for publication until the repository owner enables an explicit opt-in variable, sets GitHub environment required reviewers and configures the matching npm Trusted Publisher. The publication step requests short-lived GitHub OIDC credentials instead of embedding a long-lived npm token. Avoid `NPM_TOKEN` fallbacks. See [release procedure](docs/RELEASE.md).

The offline tarball verification checks declared public files and rejects compiled test bundles and common secret filename patterns. This is **not** a complete secret scan or malware audit; review sensitive files and dependencies separately before any publication. npm provenance links a package to a build source but does not prove the package is secure.

If a release is compromised, suspend publishing and use the repository Security tab/private maintainer communication. No fixed vulnerability response SLA is promised during early development.
