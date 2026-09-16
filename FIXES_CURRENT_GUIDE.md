# Full audit against the current 10-song guide (v4)

This pass treats the **detailed numbered song sections 1–10** as the main reference because those sections contain the key, timestamps, Roman-numeral progression, dot counts, and correct/wrong pattern choices.

## Runtime fixes made

### Dot / beat counts
- **Shout to the Lord – Chorus line 4:** corrected `VIm` from 7 continuation dots to 6.
- **Beauty and the Beast:** added manual bar/dot layouts instead of the old automatic 3-dot-per-chord fallback, including the compact `I(dominant11).I IIIm` and `IV.IV IIImIIm. V. I…` passages.
- **Endless Love:** added manual dot layouts for Verse and Chorus, including `IV/V.V`, `I..V/VII`, `VIIb/I.IIIm.`, etc.
- **A Thousand Years:** rebuilt the dot layout from the supplied notation, including the long Intro holds, Verse holds, Prechorus, and the mid-bar Chorus changes.
- **Marry Your Daughter:** added manual dot layouts for Verse and Chorus, including the fast chord chains written with hyphens in the guide.
- **Until I Found You:** corrected Verse line 4 and both Chorus lines (including the long first `IV`, `I7`, and the extended `IV`/`IVm` holds).
- **I Sing Praises:** final `I….` now has 4 continuation dots in both Intro and Verse.
- **Praise:** the last `I… …` in each Verse repetition now has 6 continuation dots rather than 7.

### Chord-quality fixes
The old chord arrays dropped qualities that are explicitly present in the guide. These now stay intact in the Translate Chord step and final summary:
- **Beauty and the Beast:** `I(dominant11)` -> `Eb11` after the Eb modulation.
- **I Sing Praises:** `Cmaj7`, `Bm7`, `Em7`, `Am7`, and `Dm7` are now preserved.
- **Marry Your Daughter:** the two explicit `IIminor7` occurrences are now `C#m7`.
- **Until I Found You:** `I7` is now `Bb7`.
- Chord-input validation now accepts the chord qualities required by the guide (`maj7`, `m7`, `7`, `11`).

### Pattern fixes
- **Lagu Cepat 2:** second RH hit moved to beat 3.
- **Lagu Cepat 5:** RH hits moved to the offbeats (`n`) as shown in the guide.
- **Pattern 6/8 used by Until I Found You:** second LH `1` moved to beat 3.
- **Shout to the Lord:** added a separate 12/8 wrong-choice pattern matching the special table in that song's guide instead of incorrectly reusing the generic `12/8 Pattern 2`.
- **Shout to the Lord has 4 wrong patterns in the supplied guide.** The game previously sampled only 3 wrong patterns globally; explicit wrong-pattern lists are now all shown, so Shout displays all four.
- Removed the misleading sentence `Pattern bisa pakai semua lagu cepat dan lambat.` because it is not part of the supplied guide and conflicts with the exercise's correct/wrong pattern choices.

### Previously fixed and retained
- **Beauty and the Beast:** post-modulation harmony uses `do = Eb`, matching the detailed guide.
- **Goodness of God:** restored the missing `V/VII` in Verse line 1.
- Summary rendering uses each guide's real chord symbols rather than reconstructing every chord from a diatonic Roman table, preserving borrowed chords and slash chords.

### Project consistency
- Updated both the standalone `index.html` and the duplicated app data inside `wordpress-snippet.php`.
- JavaScript syntax checks pass.
- PHP syntax check for `wordpress-snippet.php` passes.
- All 10 song guides have matching Roman/chord counts.
- Every manual bar layout has the same non-null chord order as its Roman progression.
- Every referenced pattern ID exists.

## Source conflicts that cannot be silently resolved
The short song list at the top of the supplied guide conflicts with the detailed numbered sections:
- Short Pop list: **A Whole New World** and **Beautiful In White**; detailed #3/#4: **A Thousand Years** and **Marry Your Daughter**.
- Short Worship list: **You Are Good**; detailed #7: **Shout to the Lord**.

The runtime currently follows the **detailed numbered sections**, because those contain the complete key/timestamp/progression/pattern data.

## Remaining ambiguity
A few pattern-table positions are represented only by spacing in pasted proportional text. Where the intended subdivision could not be proven from the source, the code avoids inventing additional musical information. The explicit chord/dot notation itself has been aligned as closely as the supplied text supports.
