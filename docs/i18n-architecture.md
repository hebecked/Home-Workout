# Internationalization architecture

## Scope

The first multilingual release supports exactly these 16 UI locales:

`de`, `en`, `nl`, `es`, `fr`, `ru`, `zh-Hans`, `ko`, `ja`, `ar`, `pt`, `it`, `pl`, `tr`, `uk`, and `hi`.

`pt` is deliberately neutral Portuguese. Arabic is the only right-to-left locale. The selected UI locale is device-local and is independent from the one or two languages shown for exercise names and instructions during a workout.

## Catalogue model

`src/i18n/locales.ts` is the locale registry. UI messages, bundled-routine names, and the exercise catalogue are separate domains. Each domain materializes a direct value for every supported locale. Supported catalogues do not use a runtime fallback; fallback is limited to resolving an unknown or unsupported stored/browser locale to English before catalogue lookup.

The TypeScript types catch missing and extra keys during compilation. The isolated catalogue tests also inspect the materialized runtime objects so that type assertions, empty strings, a partially loaded locale, or a fallback that merely hides a missing value fail continuous integration (CI). Placeholder names must match the English source exactly in every locale.

Exercise copy is catalogue-owned only for the bundled exercise library. User-authored plan names, exercise names, and instructions remain unchanged. The app never sends that free text anywhere unless the user explicitly chooses the existing optional online pre-translation action and accepts its adjacent disclosure.

## UI locale lifecycle

1. Read `home-workout:ui-locale` from local storage.
2. If it contains an unsupported value, match the browser language list, including normalization of simplified Chinese variants to `zh-Hans`.
3. Otherwise use English.
4. Apply both `document.documentElement.lang` and `document.documentElement.dir` before rendering.
5. Persist an explicit selection locally and render the current route again.

Changing the UI locale must not mutate a plan's language records or `displayLanguages`. Changing either of the two training-language slots must not change the UI locale.

## User-visible raw-text guard

The raw-text test scans user-interface source and rejects newly introduced visible string literals unless they come from the translation layer. The allowlist is intentionally limited to:

- the product name `Home Workout`, the `HW` brand mark, `GitHub`, `JSON`, and the license name;
- URLs, route fragments, selectors, data attributes, storage keys, MIME types, BCP 47 locale codes, stable plan/exercise identifiers, filenames, and CSS class names;
- punctuation, symbols, numeric formats, clocks, and values supplied by the user;
- legal provider names and the configured street/postal address, which are proper names rather than translated prose.

Any new exception must be documented here with its reason and added explicitly to the test allowlist. Error messages from validation and persistence cross the UI boundary as stable error codes; the UI translates the code and may append non-user-facing diagnostic context in development only.

## Meaning-sensitive copy

Every locale carries the same four statements:

- exercise suitability and intensity remain the user's decision;
- the app provides general suggestions and does not replace medical advice or individual coaching;
- users should stop for pain or illness and seek qualified medical advice when appropriate;
- the notice does not exclude statutory liability claims.

The AI import notice separately states that validation checks technical compatibility, not health suitability; AI-generated plans are used on the user's responsibility; exercises, volume, and intensity require review; and statutory liability rights remain unaffected.

Automated tests lock the presence of these message keys in every locale. Wording changes to them require a cross-locale review rather than a source-language-only edit.

## Test boundary

Unit tests cover exact locale and key sets, direct non-empty translations, placeholders, locale normalization, persistence, and the separation of UI and training languages. Browser tests cover selection, reload persistence, unsupported-value fallback, translated accessible names, `lang`, Arabic `dir=rtl`, mirrored layout without reordered workout semantics, and simultaneous exercise copy in two independently selected languages. Existing schema-v1 fixtures remain regression coverage; schema-v2 and phased-plan fixtures are added after the phased-plan integration lands.
