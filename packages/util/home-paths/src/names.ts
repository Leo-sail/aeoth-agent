/** Public and inherited home names shared by the Aeoth adaptation layer. */

/** Directory name for the default Aeoth Agent home under the OS home. */
export const AEOTH_HOME_DIR_NAME = '.aeoth'

/** Stable user-facing display form for the default Aeoth Agent home. */
export const DEFAULT_AEOTH_HOME_DISPLAY = `~/${AEOTH_HOME_DIR_NAME}`

/** Environment variable that overrides the default Aeoth Agent home. */
export const AEOTH_HOME_ENV = 'AEOTH_HOME'

/** Legacy environment variable accepted as an explicit migration fallback. */
export const DSH_HOME_ENV = 'DSH_HOME'
