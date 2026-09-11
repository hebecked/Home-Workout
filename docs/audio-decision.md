# Audio decision

Decision date: 2026-09-10

## Outcome

Implement an optional timer-end signal. Do not implement spoken exercise names in this release.

The timer signal is a short tone synthesized with the Web Audio API. It is off by default. A compact stateful sound button sits immediately right of the wide Start workout action; the workout mute button sits immediately left of End workout. The tone never replaces the visible timer, exercise name, or phase state. Unsupported, suspended, or interrupted audio fails silently while the workout continues.

The separate in-app volume slider was removed on 2026-09-11. Without an immediate preview it was not useful, and it made a secondary feature too prominent. The signal now uses a fixed moderate output; users control listening volume through their device and can disable or mute the signal inside the app.

Existing stored objects containing `enabled` and the former `volume` value remain readable. The old volume is ignored; the next toggle change stores only the current `enabled` state. This keeps existing opt-in choices without preserving a control that no longer exists.

Speech synthesis is deferred because the application cannot guarantee a suitable local voice for every one of its 16 interface locales or for arbitrary plan languages. The Web Speech specification permits both local and remote voices. Voice enumeration is asynchronous on some browsers, voice quality and language coverage depend on the device, and a remote voice could add network use, latency, or disclosure of user-authored exercise text. Those constraints conflict with the app's predictable offline and privacy model.

## Browser and autoplay behavior

Web Audio is widely available, but support is feature-detected and browsers may create an `AudioContext` in the `suspended` state until the page has user activation. Home Workout therefore creates or resumes audio only from an explicit interaction: enabling the setting, starting or resuming a workout, or using a workout control. A timer transition never attempts to bypass browser policy.

Unit tests cover old and current stored settings. Browser tests cover enablement, simplified persistence, mute, and reload. Native Windows WebKit passes the app and offline suite but exposes no `AudioContext` in this Playwright build; the setting is disabled and the workout remains unaffected. Native Firefox cannot launch on this host, so its engine coverage remains a CI responsibility.

The signal uses an oscillator and gain node rather than a downloaded file:

- it is available with the cached app while offline;
- it adds no media request, cookie, permission, microphone access, or third-party service;
- it has a fixed moderate output and follows the device's listening volume;
- it is shorter than one second and stops itself;
- failure to create or resume an audio context does not affect timing or navigation.

A backgrounded browser may suspend or delay audio despite prior activation. The timestamp-based workout engine remains authoritative, so returning to the app shows the correct state even when a cue could not be heard.

## Accessibility

Audio remains opt-in because unexpected sound can mask or compete with screen-reader output. Both the home and workout controls are compact labeled buttons whose state is exposed with `aria-pressed`; their speaker icons are hidden from the accessibility tree. The signal carries no unique information: the timer reaching zero already advances the visible phase/exercise state, and a polite atomic status region announces phase, round, exercise, pause, and rest changes separately.

The design follows Web Content Accessibility Guidelines (WCAG) advice to let users request and stop sound. The cue is well below the three-second threshold in WCAG 2.2 success criterion 1.4.2; the application provides opt-in and mute controls, while the device controls listening volume.

## Localization

Settings and accessible names are present in every shipped interface catalogue. The tone itself has no language. A plan may still contain any supported BCP 47 language record without requiring an installed speech voice.

Spoken names can be reconsidered only if a future design:

1. selects local voices exclusively and communicates when none is available;
2. proves offline behavior and language coverage on the supported browser/device matrix;
3. prevents overlap with screen readers and rapid workout transitions;
4. gives users separate speech, voice, rate, and volume controls; and
5. never sends user-authored plan text to an undisclosed remote speech service.

## Sources

- [Web Audio API 1.1 specification](https://webaudio.github.io/web-audio-api/) — an audio context may require sticky user activation before it can enter the running state.
- [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — create or resume audio from a user gesture and provide user control.
- [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay/) — Chrome applies autoplay policy to Web Audio and may require `AudioContext.resume()` after interaction.
- [Web Speech API specification](https://dvcs.w3.org/hg/speech-api/raw-file/tip/webspeechapi) — voices are browser-dependent and may use local or remote synthesis services.
- [SpeechSynthesisVoice `localService`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService) and [`voiceschanged`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event) — local/remote status is exposed, while the available voice list can change asynchronously.
- [WCAG 2.2: Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html) and [technique G171](https://www.w3.org/WAI/WCAG22/Techniques/general/G171.html) — avoid disruptive automatic sound and give users control.
