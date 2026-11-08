// Bulgarian Cyrillic - this app's settings for the core (2026-11-07, on the
// cyrillic branch; the warm-up for Japanese). Same shape as pt/app.js.
window.APP = {
  storagePrefix: 'bgDrill',
  latestChangelog: '2026-11-07a',
  backupName: 'bulgarian-drill-backup',
  vocabTabLabel: 'думи',
  vocabPills: [],
  screens: {
    script: { root: true, pill: 'nav-script', onShow: () => renderScriptChart(document.getElementById('script-chart')) },
    tips: { root: true, pill: 'nav-tips' },
  },
  onStart: [() => bgImportOldScores(), () => showScreen('script')],
  randomDrills: {
    read: { items: () => bgReadItems().map(i => ({ jp: 'read|' + i.jp, en: '' })), start: () => startReadDrill(bgReadItems) },
  },
  voiceNotes: { fallback: '', none: tx('bgVoice.none') },

  // The alphabet. confusedWith: what an English reader takes the letter for.
  script: {
    groups: { same: tx('bgGroup.same'), false: tx('bgGroup.false'), new: tx('bgGroup.new') },
    letters: [
      {"char": "А", "lower": "а", "sound": "a", "howItSounds": "a in \"father\"", "group": "same"},
      {"char": "Б", "lower": "б", "sound": "b", "howItSounds": "b in \"bed\"", "group": "new"},
      {"char": "В", "lower": "в", "sound": "v", "howItSounds": "v in \"van\", not b", "group": "false", "confusedWith": "b"},
      {"char": "Г", "lower": "г", "sound": "g", "howItSounds": "g in \"go\"", "group": "new"},
      {"char": "Д", "lower": "д", "sound": "d", "howItSounds": "d in \"dog\"", "group": "new"},
      {"char": "Е", "lower": "е", "sound": "e", "howItSounds": "e in \"bed\"", "group": "same"},
      {"char": "Ж", "lower": "ж", "sound": "zh", "howItSounds": "s in \"measure\"", "group": "new"},
      {"char": "З", "lower": "з", "sound": "z", "howItSounds": "z in \"zoo\", not 3", "group": "new"},
      {"char": "И", "lower": "и", "sound": "i", "howItSounds": "ee in \"see\"", "group": "new"},
      {"char": "Й", "lower": "й", "sound": "y", "howItSounds": "y in \"yes\" or \"boy\"", "group": "new"},
      {"char": "К", "lower": "к", "sound": "k", "howItSounds": "k in \"kit\"", "group": "same"},
      {"char": "Л", "lower": "л", "sound": "l", "howItSounds": "l in \"lamp\"", "group": "new"},
      {"char": "М", "lower": "м", "sound": "m", "howItSounds": "m in \"map\"", "group": "same"},
      {"char": "Н", "lower": "н", "sound": "n", "howItSounds": "n in \"net\", not h", "group": "false", "confusedWith": "h"},
      {"char": "О", "lower": "о", "sound": "o", "howItSounds": "o in \"hot\"", "group": "same"},
      {"char": "П", "lower": "п", "sound": "p", "howItSounds": "p in \"pen\"", "group": "new"},
      {"char": "Р", "lower": "р", "sound": "r", "howItSounds": "rolled r, not p", "group": "false", "confusedWith": "p"},
      {"char": "С", "lower": "с", "sound": "s", "howItSounds": "s in \"sun\", not k", "group": "false", "confusedWith": "k"},
      {"char": "Т", "lower": "т", "sound": "t", "howItSounds": "t in \"top\"", "group": "same"},
      {"char": "У", "lower": "у", "sound": "u", "howItSounds": "oo in \"boot\", not y", "group": "false", "confusedWith": "y"},
      {"char": "Ф", "lower": "ф", "sound": "f", "howItSounds": "f in \"fun\"", "group": "new"},
      {"char": "Х", "lower": "х", "sound": "h (kh)", "howItSounds": "a rough, breathy h; not x, and not ch (that's Ч)", "group": "false", "confusedWith": "x"},
      {"char": "Ц", "lower": "ц", "sound": "ts", "howItSounds": "ts in \"cats\"", "group": "new"},
      {"char": "Ч", "lower": "ч", "sound": "ch", "howItSounds": "ch in \"chip\"", "group": "new"},
      {"char": "Ш", "lower": "ш", "sound": "sh", "howItSounds": "sh in \"ship\"", "group": "new"},
      {"char": "Щ", "lower": "щ", "sound": "sht", "howItSounds": "sht in \"ashtray\"", "group": "new"},
      {"char": "Ъ", "lower": "ъ", "sound": "uh", "howItSounds": "u in \"but\"; written a in Latin", "group": "new"},
      {"char": "Ь", "lower": "ь", "sound": "ʼy", "howItSounds": "softener; only before о (ьо = yo)", "group": "new"},
      {"char": "Ю", "lower": "ю", "sound": "yu", "howItSounds": "\"you\"", "group": "new"},
      {"char": "Я", "lower": "я", "sound": "ya", "howItSounds": "ya in \"yard\"", "group": "new"},
    ],
  },
};
// Every word in the lists, for the sign-reading drill.
function bgReadItems() { return getCoreVocabPool(); }
function bgStartLetters(reverse) {
  const groups = [...document.querySelectorAll('#script-filters [data-g].active')].map(b => b.dataset.g);
  startLetterDrill(reverse, groups.length ? groups : null);
}
function bgToggleGroup(btn) {
  btn.classList.toggle('active');
  if (!document.querySelector('#script-filters [data-g].active')) btn.classList.add('active');
}

// One-off (2026-11-07): bring across the scores from the original single-file
// Cyrillic app (localStorage 'bg-cyrillic-drill-v2'). Same {score, lastSeen}
// shape; letters keep their keys (l:А letter->sound, r:А sound->letter), and
// the old signs tab w:СОФИЯ becomes the sign-reading drill's read|СОФИЯ.
// Runs once; a score already earned in this app is never overwritten, and the
// old app's data is left where it is.
function bgImportOldScores() {
  const done = APP.storagePrefix + 'ImportedOldScores';
  try {
    if (localStorage.getItem(done)) return;
    const old = JSON.parse(localStorage.getItem('bg-cyrillic-drill-v2') || '{}') || {};
    let n = 0;
    Object.keys(old).forEach(k => {
      const v = old[k];
      if (!v || typeof v.score !== 'number') return;
      const key = k.startsWith('w:') ? 'read|' + k.slice(2) : k;
      if (!/^(l:|r:|read\|)/.test(key) || kanaScores[key]) return;
      kanaScores[key] = { score: v.score, lastSeen: v.lastSeen || Date.now() };
      n++;
    });
    if (n) saveKanaScores();
    localStorage.setItem(done, String(n));
  } catch (e) { /* no storage: nothing to bring across */ }
}
