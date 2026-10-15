# Security policy

## Supported versions

Security fixes land on the newest published release of the `0.1.0-preview` line. Pre-release
builds are unsigned previews distributed as DMG and ZIP archives from
[the releases page](https://github.com/Leo-sail/aeoth-agent/releases/latest); older previews are
not maintained.

## Reporting a vulnerability

Report vulnerabilities privately through GitHub's
[security advisory form](https://github.com/Leo-sail/aeoth-agent/security/advisories/new).
Do not open a public issue for a suspected vulnerability.

Please include, as far as you can:

- the affected version (the release tag you installed) and your macOS version;
- what an attacker gains, and the conditions the attack needs;
- the smallest reproduction you have — steps, a crafted workspace, or a patch;
- whether the issue also affects the DSH runtime the application embeds, as opposed to the
  Electron shell, the private Node host, or the packaging toolchain.

You will get an acknowledgement on the advisory thread, and the fix and disclosure are
coordinated there. Please allow time for a release before publishing details.

## Out of scope

- The bundling of third-party dependencies whose own security policy covers them; report those
  upstream and mention them here if the application's use of them matters.
- Anything that requires an attacker to already run code as your user or to hold your credentials.
- The unsigned preview builds failing Gatekeeper on first launch, which is expected and
  documented in the README.

## Handling secrets

The application reads model credentials and other secrets from its own home directory, and the
release toolchain reads distribution credentials from the environment or an external credential
file. Never include real values in a report, an issue, or a pull request; redact them and
describe where they came from instead.
