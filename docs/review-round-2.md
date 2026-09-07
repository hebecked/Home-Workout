# Illustration revision 2

The owner export from 2026-09-07 contains 51 reviews: 33 correction requests and 18 confirmations. Only the 33 flagged images were revised. Dynamic Superman is one additional exercise. The 18 accepted SVGs remain byte-identical.

## Decisions

- Squats: front view, mirrored legs and two direction cues. Split squat: staggered feet, rear knee lowered toward the floor, not a kneeling hold. [ACE squat variations](https://www.acefitness.org/resources/everyone/blog/5564/squat-variations-6-effective-squat-variations-to-try/).
- Bridges: connected hip, one knee per leg, shoulder–hip–supporting knee line; single-leg version separates the raised leg. Yoga bridge arms extend along the floor toward the feet. [ACE glute bridge](https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/).
- Push-ups: straight body, visible bending arms; knee push-up rests on knees. Incline remains hands-elevated: raising the feet would change it into a harder decline push-up, not the easier alternative this entry represents. Plank has one forearm-supported pose. [ACE progression sequence](https://www.acefitness.org/resources/pros/expert-articles/7076/progressions-and-regressions-what-do-they-look-like/).
- Calf raise, heel digs, shoulder rolls and marching: heel/toe contact, shoulder motion and profile view clarified. Leg swing explicitly shows forward/backward movement. [NHS warm-up](https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/), [NHS strength exercises](https://www.nhs.uk/live-well/exercise/strength-exercises/).
- Row: torso and legs share a hip. Dead bug: back grounded; hollow hold: flat start distinct from hold; mountain climber: bent knee moves toward elbow.
- Burpee: four numbered panels distinguish crouch, high support, lowered push-up and jump; the instructions include returning the feet before the jump.
- Superman: separate static duration and dynamic repetition entries. [ACE Supermans](https://www.acefitness.org/resources/everyone/exercise-library/9/supermans/).
- Stretches: calf faces support; hamstring heel rests at the wall; hip flexor shows entering then holding; shoulder has an upward supporting forearm; chest uses one forearm at a wall. Child pose has one knee bend, cobra a lifted but not forced-back head. [Mayo stretching guide](https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20546848), [Leicester Hospitals chest stretch](https://yourhealth.leicestershospitals.nhs.uk/library/csi/therapies/physiotherapy/4419-exercises-to-help-manage-your-thoracic-outlet-syndrome-tos/file).

## Anatomy model and limits

`scripts/revised-poses.mjs` declares head, neck, shoulder, hip, elbow/wrist and knee/ankle coordinates. The torso is one segment, each arm and leg two segments. Arms always attach to the shoulder and legs to the hip. Profile views intentionally hide coincident far-side limbs. Base head radius is 12 SVG units; torso is approximately 50–75 units, upper/lower limb segments approximately 30–60 units, with shorter frontal projections. Regression tests reject segments outside 15–80 units, disconnected attachments and extra joints; key tests check squat symmetry, rigid push-up alignment, bridge alignment and floor supports. These are drawing conventions, not clinical anatomical measurements or a guarantee of correct form.

## Second owner review

`/#review` contains 34 revised/new images. A blank submitted comment confirms the current revision; text requests another correction. Revision 1 feedback stays in local storage and in the JSON export. Neither rebuilding nor opening the viewer constitutes acceptance. The old comment is available under “Dein bisheriges Feedback”. Subsequent changes must increment the affected image revisions before another review.

## Legal notice assumption

The owner supplied the public postal address and states that this is a private, non-commercial project. Name and address implement [§ 18(1) MStV](https://www.gesetze-bayern.de/Content/Document/MStV-18). [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) expressly requires email for services in its businesslike/economic scope; absence of stored user data is not an exemption. Omitting email relies on the stated non-economic character and must be reassessed if advertising, monetisation or professional promotion is added. This is not a binding legal opinion.

Do not claim that no data is processed: local plans, progress and review comments are stored in the browser; translation sends selected text to Cloudflare, and hosting entails network request data. Hosting/provider retention was not audited in this task.

## Verification and local preview

- Production build, TypeScript, ESLint and production-license check pass.
- 164 unit tests pass. Core coverage: statements 99.30%, branches 98.63%, functions 100%, lines 99.67%; thresholds remain 95%.
- Full Windows Chromium-fallback suite: 48 passed, 36 intentionally skipped by viewport routing. These are Chromium runs, not native Firefox/WebKit results.
- Revised images were rendered and visually inspected. The 18 previously confirmed SVG files compare byte-for-byte equal to their pre-edit versions.
- The local review is served at `http://127.0.0.1:5173/#review`; no existing port owner was stopped. It serves the verified build from `C:/tmp/hw-revision2/dist`, not a live source watcher. After subsequent code changes, rebuild that preview copy or start a new explicitly free development port. The durable sources live in the project repository.
- No commit, push or public deployment was performed. User acceptance and the platform-specific browser checks described in `ci-quality.md` remain open.
