# Contributing

English | [中文](CONTRIBUTING.zh.md)

This private Aeoth distribution retains the runtime and build toolchain but intentionally excludes automated tests and test-only assets.

1. Keep changes scoped to the current product and preserve third-party licenses and protocol compatibility.
2. Install pinned dependencies with `pnpm install --frozen-lockfile` and compile affected code with the existing build commands.
3. Verify changed install/start behavior once with an isolated temporary application home; remove temporary data afterwards. Do not claim test coverage from the removed upstream suites.
4. Never commit personal paths, credentials, profiles, logs, dependencies or generated release archives.
5. Coordinate publication with the repository owner. Do not publish inherited package names to public registries or push to the upstream repository.

## JSDoc conventions

The Cordis catalog gates read JSDoc directly, so these conventions are enforced rather than advisory:

1. Give every service class and every service method a JSDoc block whose description prose, placed above the block tags, says what it does and what the caller gets.
2. Document every parameter as `@param <name> - <description>.`, in signature order and with the exact parameter name.
3. Add `@returns <description>.` whenever the method resolves a value; omit it for `void` and `Promise<void>`.
4. Tag every event declaration with `@mode` (`emit`, `bail`, `waterfall`, `parallel`, or `serial`) and document its payload parameter.
