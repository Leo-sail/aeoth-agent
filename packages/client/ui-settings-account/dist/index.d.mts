import z from "@deepseek-ai/schemastery";
import { Context, Volatile } from "@deepseek-ai/cordis";

//#region src/contact-config.d.ts
/** Questionnaire destination and bonus notice timings shared by Host and Client. */
interface ContactConfig {
  /** HTTPS questionnaire URL; override for a test form. */
  contactFormUrl: string;
  /** Questionnaire source option; empty until Harness is supported by the form. */
  contactSource: string;
  /** First delay before retrying a failed bonus acknowledgement. */
  bonusAckRetryDelayMs: number;
  /** Ceiling for the acknowledgement retry backoff. */
  bonusAckRetryMaxDelayMs: number;
}
/** Validate public questionnaire options. */
declare const ContactConfig: z<Partial<ContactConfig>, ContactConfig>;
//#endregion
//#region src/onboarding-settings.d.ts
/** Persisted steps; a native top-up page leaves the durable step at credit. */
type OnboardingStep = 'welcome' | 'credit' | 'purpose' | 'process' | 'done';
/** Work scenarios offered by the desktop introduction. */
type OnboardingPurpose = 'office' | 'development' | 'both';
/** Work-detail mode applied to Chat when onboarding completes. */
type OnboardingProcess = 'compact' | 'standard' | 'detailed';
//#endregion
//#region src/index.d.ts
/** Public contact options and live device-local onboarding progress. */
interface Config extends ContactConfig {
  /** Onboarding progress format version. */
  version: Volatile<1>;
  /** Last accepted onboarding page. */
  step: Volatile<OnboardingStep>;
  /** Selected work scenario. */
  purpose?: Volatile<OnboardingPurpose | null | undefined>;
  /** Selected transcript detail. */
  process?: Volatile<OnboardingProcess | null | undefined>;
  /** Completion reason, absent until completion. */
  completion?: Volatile<'completed' | 'skipped' | 'api-key' | null | undefined>;
  /** Selected usage detail. */
  usage: Volatile<'compact' | 'detailed'>;
  /** Selected developer-tool visibility. */
  developerTools: Volatile<boolean>;
}
/** Configuration projected through the account plugin's shared form. */
declare const Config: z<Schemastery.ObjectS<NoInfer<{
  contactFormUrl: z<string, string, "defined">;
  contactSource: z<string, string, "defined">;
  bonusAckRetryDelayMs: z<number, number, "defined">;
  bonusAckRetryMaxDelayMs: z<number, number, "defined">;
  version: z<1, 1, "volatile-defined">;
  step: z<"welcome" | "credit" | "purpose" | "process" | "done", "welcome" | "credit" | "purpose" | "process" | "done", "volatile-defined">;
  purpose: z<"office" | "development" | "both" | null, "office" | "development" | "both" | null, "volatile">;
  process: z<"compact" | "standard" | "detailed" | null, "compact" | "standard" | "detailed" | null, "volatile">;
  completion: z<"completed" | "skipped" | "api-key" | null, "completed" | "skipped" | "api-key" | null, "volatile">;
  usage: z<"compact" | "detailed", "compact" | "detailed", "volatile-defined">;
  developerTools: z<boolean, boolean, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
  contactFormUrl: z<string, string, "defined">;
  contactSource: z<string, string, "defined">;
  bonusAckRetryDelayMs: z<number, number, "defined">;
  bonusAckRetryMaxDelayMs: z<number, number, "defined">;
  version: z<1, 1, "volatile-defined">;
  step: z<"welcome" | "credit" | "purpose" | "process" | "done", "welcome" | "credit" | "purpose" | "process" | "done", "volatile-defined">;
  purpose: z<"office" | "development" | "both" | null, "office" | "development" | "both" | null, "volatile">;
  process: z<"compact" | "standard" | "detailed" | null, "compact" | "standard" | "detailed" | null, "volatile">;
  completion: z<"completed" | "skipped" | "api-key" | null, "completed" | "skipped" | "api-key" | null, "volatile">;
  usage: z<"compact" | "detailed", "compact" | "detailed", "volatile-defined">;
  developerTools: z<boolean, boolean, "volatile-defined">;
}>>, "plain">;
/**
 * Publish public questionnaire options before browser plugins activate.
 * @param ctx - Host context collecting page initialization data.
 * @param config - validated deployment options.
 */
declare function apply(ctx: Context, config: Config): void;
//#endregion
export { Config, apply };
//# sourceMappingURL=index.d.mts.map