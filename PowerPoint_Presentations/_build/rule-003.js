// Rule 003: Ghunnah on doubled noon. Content from Rule_Explanation.docx (source: Tajweed1.pdf PDF p. 11, Hafs through Shatibiyyah).
const NS = "نّ", MS = "مّ";
const E1 = { a: "مِنَ ", b: "ٱلْجِنَّةِ", c: " وَٱلنَّاسِ" };     // 114:6, exact Uthmani text from the source
const E2 = { a: "إِنَّ", b: " ٱلَّذِينَ" };                      // 2:6 (opening words)
const ex1 = (hl1, hl2) => [{ t: E1.a }, { t: E1.b, hl: hl1 }, { t: " وَ" }, { t: "ٱلنَّاسِ", hl: hl2 }];   // waw does not join forward, so the split keeps joining intact
const ex2 = hl => [{ t: E2.a, hl }, { t: E2.b }];
const G = "guided", C = "challenge";

const M = {
  title: "Ghunnah on Doubled Noon", series: "Firdaws Academy", renderers: "./renderers.js",
  palette: { primary: "1D7A6E", primaryDark: "0F5148", dark: "0F3D3A", ink: "16302E", body: "2C4744", muted: "5D7774",
    bg: "F3F8F6", soft: "E2F0EC", soft2: "8CC9BC", cardLine: "D5E5E0", accent: "F2B134", accentDark: "B9770E", accentTint: "FDF3DC",
    gold: "F6C552", hl: "FFE08A", faded: "B8C9C5", good: "2E9E5B", goodDark: "1E7543", goodBg: "EAF7EF", goodLine: "BFE5CD",
    coral: "E0674F", coralDark: "B2432E", tryBg: "FDF0EA", tryLine: "F3CDBF" },
  slides: [
  { key: "title", type: "title", master: "LESSON_DARK", kicker: "NASAL SOUND  ·  LESSON 003", title: "Ghunnah on Doubled Noon", arabic: "غنة النون المشددة",
    tagline: "Spot it  ·  Say it  ·  Explain it", guided: "goals", challenge: "act1", footer: "Hafs through Shatibiyyah  ·  Source series · Firdaws Academy",
    notes: `WELCOME. Read the title together: "ghunnah" is a nasal sound; "doubled noon" is a noon with a shaddah. The Arabic reads: ghunnat an-noon al-mushaddadah.
Choose a route:
- Guided Lesson: full teaching path (goals, idea, steps, examples, mistakes, practice, activities).
- Challenge Mode: jumps straight to Activity 1, then the activities, final check and recap. Good for revision or for older learners who already know shaddah.
- Lesson menu: jump to any section.
Ask: "Have you ever noticed a sound that hums in your nose when you read?"
Navigation: every slide has Home, Menu, Back and Next buttons. Answer buttons open feedback slides; these are hidden slides, so the arrow keys skip them.
Reading context: Hafs through Shatibiyyah, as stated in the source (Tajweed1.pdf, PDF p. 11).` },

  { key: "menu", type: "menu", title: "Where would you like to go?", items: [
    { label: "Goals", to: "goals", route: G }, { label: "Warm-up", to: "warm", route: G }, { label: "The idea", to: "idea", route: G },
    { label: "Spot it in the Mushaf", to: "cues", route: G }, { label: "Three steps", to: "steps", route: G }, { label: "Timing", to: "timing", route: G },
    { label: "Examples", to: "ex1", route: G }, { label: "Common mistakes", to: "mistakes", route: G }, { label: "Read aloud", to: "guided", route: G },
    { label: "Activities", to: "act1", route: C }, { label: "Final check", to: "final", route: C }, { label: "Recap", to: "recap", route: C } ],
    notes: `LESSON MENU. Click any tile to jump to that part. Teal tiles are the guided teaching path; gold tiles are the challenge and review path.
Tip: with a returning group, start at "Activities" and send learners back to a teaching tile only if they struggle.
Question to ask: "Which part do you feel least sure about?"` },

  { key: "goals", type: "goals", route: G, kicker: "LEARNING GOALS", title: "By the end you can…", goals: [
    { icon: "search", head: "Recognise", text: "Spot a noon or meem carrying shaddah in the Mushaf." },
    { icon: "mic", head: "Apply", text: "Read it with a two-count ghunnah, and tell it apart from a plain noon." },
    { icon: "teach", head: "Explain", text: "Explain the timing and correct the common mistake." } ],
    terms: [ { mark: "نّ", term: "Shaddah", mean: "doubles a letter" }, { mark: "نْ", term: "Sukoon", mean: "no vowel: the letter is saakin" },
             { icon: "nose", term: "Ghunnah", mean: "nasal resonance" } ],
    notes: `GOALS. Read the three goals aloud. Point out the key words: a Mushaf is a printed Quran; sukoon marks a saakin letter (no short vowel); shaddah doubles a consonant; ghunnah is nasal resonance.
Ask: "Where have you seen the little shaddah mark before?"
Younger learners: call the shaddah "the double sign" and act out two people standing in one spot.
Older learners: ask them to define saakin and shaddah in their own words before you show the next slide.` },

  { key: "warm", type: "reveal", route: G, kicker: "WARM-UP", title: "Spot the mark", prompt: "Which of these letters carry a shaddah?",
    tiles: [ { ar: "نَ", lab: "fathah only" }, { ar: "نَّ", ok: true }, { ar: "مِ", lab: "kasrah only" }, { ar: "مَّ", ok: true } ], revealTo: "warmA",
    notes: `WARM-UP (predict, then reveal). Give learners a few seconds to decide, or let them point or say the letter (A, B, C, D). Then click Reveal.
Answer: B (noon with shaddah) and D (meem with shaddah). A and C carry only a short vowel.
Ask: "What do B and D have in common?" (the shaddah, and they are noon or meem).
Easier: cover two tiles and compare just A and B.
Harder: ask which of the four would get a held nasal sound, and why, before revealing.` },
  { key: "warmA", type: "reveal", hidden: true, answer: true, route: G, kicker: "WARM-UP · ANSWER", title: "Spot the mark", prompt: "Which of these letters carry a shaddah?",
    tiles: [ { ar: "نَ", lab: "fathah only" }, { ar: "نَّ", ok: true }, { ar: "مِ", lab: "kasrah only" }, { ar: "مَّ", ok: true } ],
    explain: "B and D carry a shaddah, and they are noon and meem. That is exactly where this lesson's ghunnah lives.", backTo: "warm", nextTo: "idea",
    notes: `REVEAL. B and D are noon and meem with shaddah: these are the letters this rule is about. A and C have a short vowel only.
Click Continue to move to the idea, or Back to question to try with another learner.` },

  { key: "idea", type: "idea", route: G, kicker: "THE IDEA", title: "One shaddah, two parts",
    lead: "A shaddah means a doubled letter: a saakin first part joined to a vowelled second part.",
    eq: { first: { ar: "نْ", lab: "1st part: saakin" }, second: { ar: "نَ", lab: "2nd part: vowelled" }, result: { ar: "نَّ", lab: "One doubled noon" } },
    ghunnah: "A doubled noon or meem has a clear ghunnah: the sound resonating through the nose.",
    notes: `THE IDEA. Read the equation from right to left, as Arabic is read: a saakin noon, then a noon with a vowel, written together as one noon with shaddah.
Then the key point: when the doubled letter is noon or meem, it carries a clear ghunnah, a sound that resonates through the nose.
Pronunciation: the ghunnah is the nasal sound itself; it is not an extra letter.
Ask: "How many noons are hiding in one noon with shaddah?" (two parts: saakin then vowelled).
Easier: use two cut-out noon cards and slide them together.
Harder: ask learners to explain why the first part must be saakin.` },

  { key: "cues", type: "cues", route: G, kicker: "SPOT IT IN THE MUSHAF", title: "Look above noon and meem",
    tiles: [ { ar: NS, lab: "noon + shaddah" }, { ar: MS, lab: "meem + shaddah" } ],
    cues: [ { icon: "eye", text: "Look for shaddah above noon or meem." }, { icon: "nose", text: "A ghunnah is a nasal sound, not an extra letter." } ],
    image: "image1.png", imageLabel: "Lesson card 1: the rule",
    notes: `RECOGNITION CUES. When to look for it: a noon or meem carrying shaddah.
Show lesson card 1 (right) and let the learner name the trigger, as the source activity suggests.
Ask: "What two things must you see together?" (the letter noon or meem, and a shaddah on it).
Common confusion: a shaddah on other letters is still a doubled letter, but this ghunnah rule is about noon and meem.
Note: the lesson title says "doubled noon", but the source rule covers noon and meem with shaddah; both worked examples use noon.` },

  { key: "steps", type: "steps", route: G, kicker: "HOW TO APPLY IT", title: "Pronounce it in three steps", steps: [
    { icon: "search", text: "Find the shaddah." },
    { icon: "nose", text: "Form the letter at its normal articulation point and keep the nasal passage open." },
    { icon: "mic", text: "Hold the ghunnah for two counts, then release into its written vowel." } ],
    model: "Teacher models slowly  →  learner echoes  →  learner reads alone.",
    notes: `THREE STEPS. Model each step slowly using lesson card 2 (shown on the next slide). Then ask the learner to echo you.
1 Find the shaddah. 2 Form the letter at its normal articulation point, keeping the nasal passage open. 3 Hold the ghunnah for two counts, then release into the written vowel.
Use a teacher model for articulation; naming the rule alone does not show accurate pronunciation.
Ask: "Which step is about the eyes, which about the mouth and nose, and which about time?"
Easier: practise step 3 on a single letter (noon with shaddah and fathah) before whole words.
Harder: learner models the steps for a partner and corrects them.` },

  { key: "timing", type: "timing", route: G, kicker: "TIMING AND PACE", title: "Hold for two counts",
    beatNote: "One count = one short vowel at your pace.", text: "Measured against two short vowels at your current recitation speed. Counts are relative to pace, not fixed seconds.",
    image: "image2.png", imageLabel: "Lesson card 2: how to apply it",
    accurate: "Do not remove the nasal sound or add a separate vowel between the doubled parts.",
    notes: `TIMING. Two counts, measured against two short vowels at the reader's current speed. Counts are relative to pace, not fixed seconds: a slower recitation gives slightly longer counts, a faster one shorter.
Demonstrate: tap two short vowel beats ("ba, ba"), then hold the ghunnah for the same two beats.
Keep it accurate: do not remove the nasal sound, and do not add a separate vowel between the two parts of the doubled letter.
Ask: "If I recite more slowly, do the two counts get longer or shorter?" (a little longer: they follow the pace).
Easier: clap the two counts while the learner hums the ghunnah.
Harder: recite the same example at two speeds and keep the counts proportional.` },

  { key: "ex1", type: "example", route: G, kicker: "WORKED EXAMPLE 1  ·  114:6", title: "The doubled noon in al-jinnah",
    segs: ex1(true, false), focusNote: "Focus: ٱلْجِنَّةِ  ·  short excerpt; read it only in its stated context", rows: [
    { head: "Where and why", text: "The doubled noon carries nasal resonance." },
    { head: "Pronounce", text: "Hold the ghunnah for two counts, then release into its written vowel." },
    { head: "Notice", text: "Keep the surrounding letters and vowels clear." } ],
    notes: `EXAMPLE 1 (Surah 114, verse 6): مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ
Focus: ٱلْجِنَّةِ. The noon has a shaddah, so it carries a two-count ghunnah, then releases into its kasrah.
Model it slowly, then have the learner echo. Keep the surrounding letters and vowels clear. Other Tajweed rules can occur in the same excerpt; this slide focuses on the doubled noon only.
Ask: "Can you find another doubled noon in this same excerpt?" (Yes: ٱلنَّاسِ. It is the subject of Activity 1.)
Source note: lesson card 3 prints the focus label without its shaddah; the full excerpt above shows it correctly.` },

  { key: "ex2", type: "example", route: G, kicker: "WORKED EXAMPLE 2  ·  2:6", title: "The doubled noon of inna",
    segs: ex2(true), focusNote: "Focus: إِنَّ  ·  opening words of the verse; read them only in their stated context", rows: [
    { head: "Where and why", text: "The noon of inna is doubled; keep two counts of ghunnah." },
    { head: "Pronounce", text: "Hold the ghunnah for two counts, then release into its written vowel." },
    { head: "Notice", text: "Keep the surrounding letters and vowels clear." } ],
    notes: `EXAMPLE 2 (Surah 2, verse 6, opening words): إِنَّ ٱلَّذِينَ
Focus: إِنَّ. The noon of inna is doubled: hold two counts of ghunnah, then release into the fathah.
Ask: "There is another shaddah in this excerpt. Where is it, and is it on noon or meem?" (On the lam of ٱلَّذِينَ; it is not a noon or meem, so it is not this lesson's ghunnah. This is Activity 2.)
Easier: read only إِنَّ several times before adding the next word.
Harder: read both examples back to back at two different speeds, keeping the counts relative to pace.` },

  { key: "mistakes", type: "mistakes", route: G, kicker: "COMMON MISTAKES", title: "Two slips to avoid", wrong: [
    { head: "Dropping the nasal sound", text: "The doubled noon is read flat, with no ghunnah." },
    { head: "Adding a vowel in the middle", text: "A separate vowel slips in between the two parts of the doubled letter." } ],
    fix: { head: "The correction", text: "Keep the nasal sound and join the two parts smoothly: hold two counts, then release into the written vowel." },
    notes: `COMMON MISTAKE AND CORRECTION (from the source): do not remove the nasal sound or add a separate vowel between the doubled parts.
Model each mistake once (clearly labelled as wrong), then the correct reading, using إِنَّ. Let learners say which one was correct and why.
Ask: "What would change if a vowel slipped in between the two parts?" (the doubled letter would split apart).
Easier: thumbs up or down for each version the teacher reads.
Harder: learners listen to a recording of themselves and name which slip, if any, they made.` },

  { key: "guided", type: "guided", route: G, kicker: "GUIDED PRACTICE", title: "Read aloud and check", steps: [
    "Teacher models Example 1 slowly.", "Learner echoes the model.", "Learner reads Example 1 alone.", "Replay a short recording and check together." ],
    image: "image3.png", imageLabel: "Lesson card 3: worked examples",
    check: "Found the target? No added vowel? Can you explain the timing?",
    notes: `GUIDED PRACTICE (source teaching activity). Use lesson card 3 or the example slides. Model Example 1, ask the learner to echo, then to read it without help. If possible, record and replay a short clip and check the target feature together.
Ask the learner to explain their choice before repeating it: naming the rule alone does not show accurate pronunciation.
Before moving on: can the learner find the target, apply the method without an added vowel, and explain the timing? Return to the model for anything still uncertain.
Easier: practise only the focus word, then the full excerpt.
Harder: learner reads Example 2 alone first, then explains the timing to the group.` },

  { key: "act1", type: "mcq", route: C, kicker: "ACTIVITY 1  ·  FIND THE RULE", title: "How many doubled noons?",
    prompt: "Look carefully at Example 1. How many noons carry a shaddah?", segs: ex1(false, false), ref: "114:6",
    choices: [ { text: "One", to: "act1_1" }, { text: "Two", to: "act1_ok" }, { text: "Three", to: "act1_3" } ],
    notes: `ACTIVITY 1: FIND THE RULE. Learners count the noons that carry a shaddah, then click an answer.
Correct answer: B, two. ٱلْجِنَّةِ and ٱلنَّاسِ both have a noon with shaddah, so each carries a two-count ghunnah.
Why not three: the noon of مِنَ has a fathah, not a shaddah.
Note: the source highlights ٱلْجِنَّةِ as the focus; ٱلنَّاسِ meets the same stated condition (noon carrying shaddah).
Easier: point at each noon in turn and ask "shaddah or not?"
Harder: also ask learners to read both doubled noons with the correct timing.` },
  { key: "act1_ok", type: "good", hidden: true, master: "FEEDBACK_GOOD", segs: ex1(true, true), backTo: "act1", nextTo: "act2",
    text: "Two! The noon in ٱلْجِنَّةِ and the noon in ٱلنَّاسِ both carry a shaddah, so each gets a two-count ghunnah.",
    extra: "Read the whole excerpt aloud and hold both ghunnahs for two counts each.",
    notes: `CORRECT. Two doubled noons: ٱلْجِنَّةِ and ٱلنَّاسِ. Each is held with two counts of ghunnah, then released into its written vowel.
Extra challenge: read the full excerpt with both ghunnahs, keeping the counts equal and relative to pace.` },
  { key: "act1_1", type: "tryAgain", hidden: true, master: "FEEDBACK_TRY", head: "Good start! There is one more.", segs: ex1(true, false), backTo: "act1",
    text: "You found the noon in ٱلْجِنَّةِ. Now look at the last word: does its noon carry a shaddah too?",
    notes: `TRY AGAIN (answered "one"). The learner has likely found ٱلْجِنَّةِ but missed ٱلنَّاسِ. Point to the last word and ask them to look above the noon.` },
  { key: "act1_3", type: "tryAgain", hidden: true, master: "FEEDBACK_TRY", head: "Careful: one of those is a plain noon.", segs: [{ t: "مِنَ", hl: true }, { t: " ٱلْجِنَّةِ وَٱلنَّاسِ" }], backTo: "act1",
    text: "The noon in مِنَ has a fathah, but no shaddah. Count only the noons that carry a shaddah.",
    notes: `TRY AGAIN (answered "three"). The learner counted every noon. The noon of مِنَ carries a fathah only, so it is not a doubled noon. Ask them to count again, looking for the shaddah each time.` },

  { key: "act2", type: "mcq", route: C, kicker: "ACTIVITY 2  ·  IDENTIFY THE TRIGGER", title: "Which letter gets the ghunnah?",
    prompt: "In Example 2, which letter is held with a two-count ghunnah?", segs: ex2(false), ref: "2:6",
    choices: [ { ar: [{ t: "إِ" }, { t: "نَّ", hl: true }], text: "The noon of inna", to: "act2_ok" },
               { ar: [{ t: "ٱ" }, { t: "لَّ", hl: true }, { t: "ذِينَ" }], text: "The doubled lam", to: "act2_lam" },
               { ar: [{ t: "ٱلَّذِي" }, { t: "نَ", hl: true }], text: "The last noon", to: "act2_noon" } ],
    notes: `ACTIVITY 2: IDENTIFY THE TRIGGER. Learners must check two things: is it noon or meem, and does it carry a shaddah?
Correct answer: A, the noon of إِنَّ (noon + shaddah).
B is wrong: the lam of ٱلَّذِينَ has a shaddah, but it is not noon or meem.
C is wrong: the final noon of ٱلَّذِينَ has a fathah and no shaddah.
Easier: give the two-question checklist first ("Noon or meem? Shaddah?").
Harder: ask learners to explain why B and C do not qualify before clicking.` },
  { key: "act2_ok", type: "good", hidden: true, master: "FEEDBACK_GOOD", segs: ex2(true), backTo: "act2", nextTo: "act3",
    text: "Yes! The noon of inna carries a shaddah, so hold two counts of ghunnah, then release into its fathah.",
    extra: "There is another shaddah in this excerpt. Where is it, and why does this ghunnah rule not apply to it?",
    notes: `CORRECT. The noon of إِنَّ is doubled: two counts of ghunnah, then release into the written vowel.
Extra challenge answer: the shaddah on the lam of ٱلَّذِينَ. This rule needs noon or meem with shaddah, and lam is neither.` },
  { key: "act2_lam", type: "tryAgain", hidden: true, master: "FEEDBACK_TRY", head: "Good eye: that is a shaddah!", segs: [{ t: "إِنَّ ٱ" }, { t: "لَّ", hl: true }, { t: "ذِينَ" }], backTo: "act2",
    text: "But it sits on a lam. This lesson's ghunnah is for a noon or meem carrying shaddah. Look for one of those.",
    notes: `TRY AGAIN (chose the doubled lam). Praise noticing the shaddah. Then remind: the condition has two parts, noon or meem AND shaddah. Lam fails the first part.` },
  { key: "act2_noon", type: "tryAgain", hidden: true, master: "FEEDBACK_TRY", head: "Right letter, wrong mark.", segs: [{ t: "إِنَّ ٱلَّذِي" }, { t: "نَ", hl: true }], backTo: "act2",
    text: "That is a noon, but look at its mark: a fathah and no shaddah. No two-count hold here. Find the noon that carries a shaddah.",
    notes: `TRY AGAIN (chose the final noon). The learner found a noon but did not check for shaddah. The last noon of ٱلَّذِينَ has only a fathah.` },

  { key: "act3", type: "mcq", route: C, kicker: "ACTIVITY 3  ·  FIX THE IDEA", title: "True or false?",
    prompt: "“Every noon and meem must be held with the same two-count nasal sound.”",
    choices: [ { text: "True", to: "act3_t", fs: 30 }, { text: "False", to: "act3_ok", fs: 30 } ],
    notes: `ACTIVITY 3: FIX THE IDEA (source practice question 3). Read the claim aloud, then let learners vote.
Correct answer: B, False. A shaddah means a doubled letter: a saakin first part joined to a vowelled second part. The doubled noon or meem has the clear ghunnah of this lesson. A noon with only a vowel, such as the noon of مِنَ, is not doubled and is not held for two counts.
Also restate: do not remove the nasal sound or add a separate vowel between the doubled parts.
Easier: compare مِنَ and إِنَّ aloud and ask which one hums longer.
Harder: ask learners to rewrite the claim so that it is correct.` },
  { key: "act3_ok", type: "good", hidden: true, master: "FEEDBACK_GOOD", backTo: "act3", nextTo: "final", head: "Correct: it is false!",
    text: "The two-count hold in this lesson belongs to a noon or meem carrying shaddah. A noon with only a vowel, like the noon of مِنَ, is not doubled, so it has no held ghunnah.",
    extra: "Rewrite the claim so that it is true. (Hint: add the word “shaddah”.)",
    notes: `CORRECT. False: the two-count ghunnah of this lesson is for noon or meem carrying shaddah, not every noon and meem.
Model rewrite: "Every noon or meem carrying shaddah is held with a two-count nasal sound."` },
  { key: "act3_t", type: "tryAgain", hidden: true, master: "FEEDBACK_TRY", head: "Not quite. Compare these two.", segs: [{ t: "مِنَ", hl: true }, { t: "   ·   " }, { t: "إِنَّ", hl: true }], backTo: "act3",
    text: "Both have a noon, but only one carries a shaddah. Does the noon of مِنَ get the same two-count hold as إِنَّ?",
    notes: `TRY AGAIN (answered "true"). Read مِنَ and إِنَّ aloud. Only إِنَّ has a doubled noon with the two-count ghunnah. Let the learner hear the difference, then try again.` },

  { key: "final", type: "mcq", route: C, kicker: "FINAL CHECK", title: "How long is the ghunnah?",
    prompt: "On a doubled noon or meem, how long do you hold the ghunnah?",
    choices: [ { text: "Two counts, relative to your pace", to: "final_ok", fs: 24 }, { text: "Exactly two seconds", to: "final_sec", fs: 24 }, { text: "One quick count, no hold", to: "final_one", fs: 24 } ],
    notes: `FINAL UNDERSTANDING CHECK.
Correct answer: A. Two counts, measured against two short vowels at your current recitation speed. Counts are relative to pace, not fixed seconds.
B is wrong: counts are not fixed seconds. C is wrong: the ghunnah is held for two counts.
Easier: clap two counts first, then ask.
Harder: ask the learner to justify the answer using the words "short vowel" and "pace".` },
  { key: "final_ok", type: "good", hidden: true, master: "FEEDBACK_GOOD", backTo: "final", nextTo: "teach", nextLabel: "Extra challenge  ›",
    text: "Two counts, measured against two short vowels at your current recitation speed. Counts follow your pace; they are not fixed seconds.",
    extra: "Recite Example 2 slowly, then a little faster. Keep the ghunnah at two counts both times.",
    notes: `CORRECT. Two counts relative to pace. Continue to the optional Extra Challenge (teach it back), or go straight to the recap using the Menu.` },
  { key: "final_sec", type: "tryAgain", hidden: true, master: "FEEDBACK_TRY", head: "Close, but not seconds.", backTo: "final",
    text: "Counts are relative to your recitation pace, not fixed seconds. One count is about the length of one short vowel at your speed.",
    notes: `TRY AGAIN (chose fixed seconds). Remind: counts follow the reader's pace; two counts = two short vowels at the current speed.` },
  { key: "final_one", type: "tryAgain", hidden: true, master: "FEEDBACK_TRY", head: "A little too short.", backTo: "final",
    text: "The ghunnah on a doubled noon or meem is held for two counts, then released into its written vowel. Dropping the hold removes the nasal sound.",
    notes: `TRY AGAIN (chose one quick count). Model a clipped reading and the correct two-count reading of إِنَّ so the learner hears the difference.` },

  { key: "teach", type: "teach", route: C, kicker: "EXTRA CHALLENGE  ·  TEACH IT BACK", title: "Now you be the teacher",
    prompt: "Teach the rule to a partner or to the class:", tasks: [
    { icon: "teach", text: "Explain the three steps." }, { icon: "flag", text: "Give the timing." }, { icon: "mic", text: "Demonstrate one example." } ],
    examples: [ { ar: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", ref: "Example 1  ·  114:6" }, { ar: "إِنَّ ٱلَّذِينَ", ref: "Example 2  ·  2:6" } ], revealTo: "teachA",
    notes: `EXTRA CHALLENGE: TEACH IT BACK (source practice question 4). Optional; suits confident learners.
The learner explains the three steps, gives the timing, then demonstrates one example. Then click "Show model answer" to compare.
Younger learners: they may point to each step on the steps slide while explaining.
Older learners: ask them to also correct the common mistake in their explanation.` },
  { key: "teachA", type: "teachAnswer", hidden: true, kicker: "EXTRA CHALLENGE · MODEL ANSWER", title: "A model explanation", steps: [
    "Find the shaddah.", "Form the letter at its normal articulation point and keep the nasal passage open.", "Hold the ghunnah for two counts, then release into its written vowel." ],
    timing: "Two counts, measured against two short vowels at your current recitation speed; relative to pace, not fixed seconds.",
    demo: "Read إِنَّ or ٱلْجِنَّةِ with a two-count ghunnah and no added vowel.", backTo: "teach", nextTo: "recap",
    notes: `MODEL ANSWER. Compare the learner's explanation with these points. Accept their own wording if the meaning matches. Check the demonstration: nasal sound present, two counts, no added vowel between the doubled parts.` },

  { key: "recap", type: "recap", route: C, master: "LESSON_DARK", title: "Recognise → Apply → Check", cols: [
    { icon: "search", head: "Recognise", text: "A noon or meem carrying shaddah: a saakin part joined to a vowelled part." },
    { icon: "nose", head: "Apply", text: "Keep the nasal passage open, hold two counts, release into the vowel." },
    { icon: "check", head: "Check", text: "No dropped ghunnah, and no extra vowel between the doubled parts." } ],
    cheer: "Well done! You can now spot, say and explain the ghunnah of a doubled noon.", galleryTo: "gallery",
    notes: `RECAP. A shaddah means a doubled letter: a saakin first part joined to a vowelled second part. A doubled noon or meem has a clear ghunnah, the sound resonating through the nose. Look for noon or meem carrying shaddah.
Ask each learner for one thing they will remember. Celebrate the effort.
Before moving on (source checklist): can the learner find the target, apply the method without an added vowel, and explain the timing? Return to the model for anything still uncertain.
"Lesson cards and sources" opens the four original lesson cards and the source reference.` },
  { key: "gallery", type: "gallery", hidden: true, title: "Lesson cards and sources", backTo: "recap", images: [
    { file: "image1.png", label: "Card 1: understand the rule" }, { file: "image2.png", label: "Card 2: how to apply it" },
    { file: "image3.png", label: "Card 3: worked examples" }, { file: "image4.png", label: "Card 4: practice and review" } ],
    sources: [
      { text: "Source: ", options: { bold: true } }, { text: "Tajweed1.pdf, PDF page 11 (page positions include covers).", options: { breakLine: true } },
      { text: "Reading: ", options: { bold: true } }, { text: "Hafs through Shatibiyyah, as stated in the source.", options: { breakLine: true } },
      { text: "Excerpts: ", options: { bold: true } }, { text: "114:6 and 2:6 (opening words), checked by the source against the Uthmani text (alquran.cloud).", options: { breakLine: true } },
      { text: "Teaching package: ", options: { bold: true } }, { text: "Firdaws Academy Source series, Lesson 003." } ],
    notes: `REFERENCE. The four original lesson cards from the teaching package, and the source references.
Card 4 refers to "page 4 of the Word lesson" for answers; in this deck those answers are built into the activity feedback slides and these notes.
Source issues noted while building: (1) Card 3 prints the focus labels (الجنة, إن) without shaddah or vowels; the full excerpts are correct. (2) The title says "doubled noon" while the rule text covers noon and meem; both examples use noon. (3) The Word document mentions Source_Issues.md at the collection root; that file was not included with this package.` },
  ],
};
// Source text stores shaddah before the short vowel (e.g. ن + ّ + َ); normalise every string to that order.
const fixAr = v => typeof v === "string" ? v.replace(/([\u064B-\u0650\u0652])\u0651/g, "\u0651$1")
  : Array.isArray(v) ? v.map(fixAr) : (v && typeof v === "object") ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fixAr(x)])) : v;
module.exports = fixAr(M);
