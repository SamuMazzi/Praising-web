export function translateChord(chord: string, from: "US" | "IT", to: "US" | "IT"): string {
  const chordMapUS: Record<string, string> = {
    "A": "La",
    "A#": "La#",
    "Bb": "Sib",
    "B": "Si",
    "C": "Do",
    "C#": "Do#",
    "Db": "Reb",
    "D": "Re",
    "D#": "Re#",
    "Eb": "Mib",
    "E": "Mi",
    "F": "Fa",
    "F#": "Fa#",
    "Gb": "Solb",
    "G": "Sol",
    "G#": "Sol#",
    "Ab": "Lab"
  };

  const chordMapIT: Record<string, string> = {
    C: "Do",
    'C#': "Do#",
    Db: "Reb",
    D: "Re",
    'D#': "Re#",
    Eb: "Mib",
    E: "Mi",
    F: "Fa",
    'F#': "Fa#",
    Gb: "Solb",
    G: "Sol",
    'G#': "Sol#",
    Ab: "Lab",
    A: "La",
    'A#': "La#",
    Bb: "Sib",
    B: "Si",
  };

  const root = chord[0];
  let quality = chord.substring(1);

  let translatedRoot: string;
  if (from === "US" && to === "IT") {
    translatedRoot = chordMapUS[root] || root;
    translatedRoot = translatedRoot.replace(/b/g, "bemolle");
    translatedRoot = translatedRoot.replace(/#/g, "diesis");
    if (quality === "m") {
      quality = "-";
    }
    return `${chordMapIT[translatedRoot]}${quality}`;
  } else if (from === "IT" && to === "US") {
    translatedRoot = chordMapIT[root] || root;
    translatedRoot = translatedRoot.replace(/bemolle/g, "b");
    translatedRoot = translatedRoot.replace(/diesis/g, "#");
    if (quality === "-") {
      quality = "m";
    }
    return `${chordMapUS[translatedRoot]}${quality}`;
  } else {
    // No translation needed, return the original chord
    return chord;
  }
}
