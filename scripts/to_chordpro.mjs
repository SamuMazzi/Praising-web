#!/usr/bin/env node
/**
 * Converte il formato "accordi sopra il testo" (quello che si copia da
 * Ultimate Guitar, dai PDF dei fogli canto, ecc.) nel ChordPro inline che
 * l'app si aspetta nei file `public/accordi/*.crd`.
 *
 * L'allineamento e' l'unica informazione che conta: la colonna in cui inizia
 * un accordo diventa il punto in cui si apre la parentesi quadra nel verso
 * sottostante. Per questo il file va letto senza normalizzare gli spazi (i
 * tab vengono espansi a 8 colonne, come li rende un terminale).
 *
 * Convenzioni di sezione, allineate a come sono scritti i .crd esistenti:
 *  - `[Chorus]` / `[Ritornello]` -> blocco `{soc}` ... `{eoc}`, chiuso alla
 *    prima riga vuota (i ritornelli sono blocchi singoli; gli stacchi
 *    strumentali che seguono restano fuori);
 *  - `[Verse N]` -> nessun marcatore, i .crd non etichettano le strofe;
 *  - ogni altra etichetta (`[Intro]`, `[Bridge]`, ...) -> riga `[Nome:]`,
 *    che chordsheetjs rende come una riga di accordi senza testo.
 *
 * Senza argomenti aggiunge il canto al catalogo: scrive
 * `public/accordi/<Nome file>.crd` e la voce in `logic/songs.config.json`,
 * assegnando l'`Id` successivo a quello piu' alto gia' presente. Il testo si
 * incolla su stdin (Ctrl+D per chiudere), i metadati si rispondono ai prompt,
 * che leggono da /dev/tty proprio perche' stdin e' occupato dall'incolla.
 *
 * Uso:
 *   npm run chordpro                      # incolla, rispondi, canto aggiunto
 *   npm run chordpro -- canto.txt
 *   npm run chordpro -- canto.txt --stdout
 *   npm run chordpro -- canto.txt -o "public/accordi/Nome.crd"
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const CATALOG = path.join(REPO_ROOT, 'logic/songs.config.json');
const CHORDS_DIR = path.join(REPO_ROOT, 'public/accordi');

const ROOTS_EN = '[A-G]';
const ROOTS_IT = '(?:Sol|Si|Do|Re|Mi|Fa|La)';

/** Parole della notazione italiana che sono anche parole del testo. */
const AMBIGUOUS_IT = new Set(['Do', 'Re', 'Mi', 'Fa', 'La', 'Si', 'Sol']);

const chordPattern = (roots) =>
  new RegExp(
    `^${roots}[#b♯♭]?` +
      `(?:maj|min|m|M|dim|aug|sus|add|alt|no|°|ø|Δ|\\+|-|[0-9])*` +
      `(?:\\([^)]*\\))?` +
      `(?:/${roots}[#b♯♭]?(?:maj|min|m|[0-9])*)?$`
  );

const CHORD_EN = chordPattern(ROOTS_EN);
const CHORD_IT = chordPattern(ROOTS_IT);

const CHORUS_LABEL = /^(chorus|ritornello|rit\.?|refrain|coro)\b/i;
const VERSE_LABEL = /^(verse|strofa|stanza|verso)\b/i;
const PAGE_ARTIFACT = /^(page|pagina|pag\.?)\s*\d+\s*(\/\s*\d+)?$/i;

const isChord = (token, notation) => {
  const en = CHORD_EN.test(token);
  const it = CHORD_IT.test(token);
  if (notation === 'en') return en;
  if (notation === 'it') return it;
  return en || it;
};

/**
 * Una riga e' di accordi se ogni token lo e'. L'unica trappola sono i versi
 * italiani fatti solo di parole che coincidono con la notazione solfeggio:
 * li si scarta quando non hanno la spaziatura larga tipica degli accordi.
 */
const isChordLine = (line, notation) => {
  const trimmed = line.trim();
  if (trimmed === '') return false;
  const tokens = trimmed.split(/\s+/);
  if (!tokens.every((t) => isChord(t, notation))) return false;
  const allAmbiguous = tokens.every((t) => AMBIGUOUS_IT.has(t));
  if (allAmbiguous && !/\s{2,}/.test(trimmed)) return false;
  return true;
};

const chordPositions = (line) => {
  const found = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(line)) !== null) found.push({ col: m.index, text: m[0] });
  return found;
};

/** Fonde la riga di accordi nel verso sottostante, da destra a sinistra. */
const mergeChordsIntoLyrics = (chordLine, lyricLine) => {
  const chords = chordPositions(chordLine);
  let out = lyricLine.replace(/\s+$/, '');
  for (let i = chords.length - 1; i >= 0; i -= 1) {
    const { col, text } = chords[i];
    if (col > out.length) out = out.padEnd(col, ' ');
    out = `${out.slice(0, col)}[${text}]${out.slice(col)}`;
  }
  return out;
};

/** Riga strumentale: accordi soli, con le distanze originali preservate. */
const chordOnlyLine = (chordLine) => {
  const chords = chordPositions(chordLine);
  let out = '';
  let prevEnd = null;
  for (const { col, text } of chords) {
    const gap = prevEnd === null ? 0 : Math.max(1, col - prevEnd);
    out += ' '.repeat(gap) + `[${text}]`;
    prevEnd = col + text.length;
  }
  return out;
};

const normalize = (raw) =>
  raw
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) =>
      line
        .replace(/\u00a0/g, ' ')
        .replace(/\t/g, '        ')
        .replace(/\s+$/, '')
    )
    .filter((line) => !PAGE_ARTIFACT.test(line.trim()));

const sectionLabel = (line) => {
  const m = /^\[([^\]]+)\]$/.exec(line.trim());
  return m === null ? null : m[1].trim();
};

const convert = (raw, { notation = 'auto', key = null } = {}) => {
  const lines = normalize(raw);
  const out = [];
  let inChorus = false;

  const closeChorus = () => {
    if (!inChorus) return;
    while (out.length > 0 && out[out.length - 1] === '') out.pop();
    out.push('{eoc}');
    inChorus = false;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const label = sectionLabel(line);

    // Le etichette che sono anche accordi validi ([Am], [C/G]) sono accordi.
    if (label !== null && !isChord(label, notation)) {
      closeChorus();
      if (out.length > 0 && out[out.length - 1] !== '') out.push('');
      if (CHORUS_LABEL.test(label)) {
        out.push('{soc}');
        inChorus = true;
      } else if (!VERSE_LABEL.test(label)) {
        out.push(`[${label}:]`);
      }
      continue;
    }

    if (line.trim() === '') {
      if (inChorus) closeChorus();
      if (out.length > 0 && out[out.length - 1] !== '') out.push('');
      continue;
    }

    if (isChordLine(line, notation)) {
      const next = lines[i + 1];
      const merges =
        next !== undefined &&
        next.trim() !== '' &&
        sectionLabel(next) === null &&
        !isChordLine(next, notation);
      if (merges) {
        out.push(mergeChordsIntoLyrics(line, next));
        i += 1;
      } else {
        out.push(chordOnlyLine(line));
      }
      continue;
    }

    out.push(line.trim());
  }

  closeChorus();
  while (out.length > 0 && out[0] === '') out.shift();
  while (out.length > 0 && out[out.length - 1] === '') out.pop();
  const header = key === null ? [] : [`{key: ${key}}`];
  return `${[...header, ...out].join('\n')}\n`;
};

/* ------------------------------------------------------------------ CLI */

const USAGE = `Uso: npm run chordpro [-- <input.txt> ] [opzioni]

Senza input legge il testo da stdin (incolla, poi Ctrl+D).
Senza --stdout/--out aggiunge il canto al catalogo: scrive il .crd in
public/accordi e la voce in logic/songs.config.json con l'Id successivo.

  --stdout            stampa e basta, non tocca il repo
  -o, --out <file>    scrive il .crd nel file indicato, senza voce di catalogo
  --key <nota>        aggiunge {key: ...} in testa
  --notation <modo>   auto (default) | en | it
  --force             sovrascrive un .crd esistente / accetta un nome duplicato

Metadati (se omessi vengono chiesti a schermo):
  --nome, --file, --caratteristica, --parte, --link, --autore
`;

const FLAGS = {
  '-o': 'out',
  '--out': 'out',
  '--key': 'key',
  '--notation': 'notation',
  '--nome': 'nome',
  '--file': 'file',
  '--caratteristica': 'caratteristica',
  '--parte': 'parte',
  '--link': 'link',
  '--autore': 'autore'
};

const parseArgs = (argv) => {
  const opts = { input: null, out: null, key: null, notation: 'auto' };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (FLAGS[a] !== undefined) opts[FLAGS[a]] = argv[++i];
    else if (a === '--stdout') opts.stdout = true;
    else if (a === '--force') opts.force = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (a !== '-') opts.input = a;
  }
  return opts;
};

const readStdin = async () =>
  await new Promise((resolve, reject) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (buf += c));
    process.stdin.on('end', () => resolve(buf));
    process.stdin.on('error', reject);
  });

/**
 * I prompt leggono da /dev/tty e non da stdin: quando il canto lo si incolla,
 * stdin e' gia' stato consumato fino a EOF e non puo' piu' rispondere.
 */
const openPrompter = () => {
  try {
    const input = createReadStream('/dev/tty');
    input.on('error', () => {});
    const rl = createInterface({
      input,
      output: createWriteStream('/dev/tty'),
      terminal: true
    });
    return {
      ask: async (label, fallback = '') => {
        const suffix = fallback === '' ? '' : ` [${fallback}]`;
        const answer = (await rl.question(`${label}${suffix}: `)).trim();
        return answer === '' ? fallback : answer;
      },
      close: () => {
        rl.close();
      }
    };
  } catch {
    return null;
  }
};

const fileExists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

/** Il .crd non deve poter finire fuori da public/accordi per via del nome. */
const safeFileName = (name) =>
  name.replace(/[/\\]/g, '-').replace(/^\.+/, '').trim();

const addToCatalog = async (chordpro, opts) => {
  // Senza un terminale (pipe, CI) i prompt non hanno dove chiedere: si va
  // avanti con i soli flag e il resto resta vuoto.
  const interactive =
    process.stdout.isTTY === true || process.stderr.isTTY === true;
  const prompter = interactive ? openPrompter() : null;
  const ask = async (label, flag, fallback = '') => {
    if (opts[flag] !== undefined) return opts[flag];
    if (prompter === null) return fallback;
    return await prompter.ask(label, fallback);
  };

  const defaultName =
    opts.input === null
      ? ''
      : path.basename(opts.input, path.extname(opts.input));

  try {
    const nome = await ask('Nome del canto', 'nome', defaultName);
    if (nome === '')
      throw new Error('Serve un nome: usa --nome o rispondi al prompt.');
    const nomeFile = safeFileName(
      (await ask('Nome file', 'file', `${nome}.crd`)).replace(
        /(\.crd)?$/,
        '.crd'
      )
    );
    const caratteristica = await ask(
      'Caratteristica (Ado, Ingl, Can, Mar, Nat...)',
      'caratteristica'
    );
    const parte = await ask(
      'Parte della messa (Ingr, Off, San, Com, Fin...)',
      'parte'
    );
    const link = await ask('Link YouTube', 'link');
    const autore = await ask('Autore', 'autore');

    const catalog = JSON.parse(await readFile(CATALOG, 'utf8'));
    const duplicate = catalog.find(
      (s) => s.Nome.toLowerCase() === nome.toLowerCase()
    );
    if (duplicate !== undefined && opts.force !== true) {
      throw new Error(
        `"${nome}" e' gia' in catalogo con Id ${duplicate.Id}. Usa --force per aggiungerlo comunque.`
      );
    }

    const target = path.join(CHORDS_DIR, nomeFile);
    if ((await fileExists(target)) && opts.force !== true) {
      throw new Error(
        `${path.relative(REPO_ROOT, target)} esiste gia'. Usa --force per sovrascriverlo.`
      );
    }

    const id = catalog.reduce((max, s) => Math.max(max, Number(s.Id)), 0) + 1;
    catalog.push({
      Nome: nome,
      'Nome file': nomeFile,
      Caratteristica: caratteristica,
      'Parte della messa': parte,
      Link: link,
      Autore: autore,
      Id: id
    });
    catalog.sort((a, b) => Number(a.Id) - Number(b.Id));

    await writeFile(target, chordpro, 'utf8');
    await writeFile(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

    console.log(`\n[chordpro] ${path.relative(REPO_ROOT, target)}`);
    console.log(`[chordpro] catalogo aggiornato: "${nome}", Id ${id}`);
    console.log('[chordpro] `npm run build` per sitemap e service worker.');
  } finally {
    prompter?.close();
  }
};

const main = async () => {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help === true) {
    process.stdout.write(USAGE);
    return;
  }

  if (opts.input === null && process.stdin.isTTY === true) {
    process.stderr.write(
      'Incolla il canto (accordi sopra il testo), poi Ctrl+D:\n'
    );
  }
  const raw =
    opts.input === null
      ? await readStdin()
      : await readFile(opts.input, 'utf8');
  if (raw.trim() === '') throw new Error('Input vuoto.');

  const chordpro = convert(raw, { notation: opts.notation, key: opts.key });

  if (opts.stdout === true) {
    process.stdout.write(chordpro);
    return;
  }
  if (opts.out !== null) {
    await writeFile(opts.out, chordpro, 'utf8');
    console.log(`[chordpro] scritto ${opts.out}`);
    return;
  }
  await addToCatalog(chordpro, opts);
};

export { convert };

main().catch((e) => {
  console.error(`[chordpro] ${e.message}`);
  process.exit(1);
});
