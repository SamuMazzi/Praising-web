/**
 * Reports the Firestore review queue into a single GitHub issue.
 *
 * The issue is created when something is pending, updated in place while it
 * stays pending, and closed once the queue empties. Editing an issue body is
 * silent on GitHub, so a comment is posted only when there is genuinely
 * something new to look at: a new submission, or one that has just crossed the
 * "stuck" threshold. That keeps a daily job from mailing you every morning.
 *
 * Run locally with --dry-run to print the report without touching GitHub.
 */
import { pathToFileURL } from 'node:url';
import { fetchPendingQueue } from './lib/pending_queue.mjs';

const MARKER = '<!-- pending-queue-report -->';
const STATE_PREFIX = '<!-- pending-queue-state:';
const LABEL = 'pending-review';

const dryRun = process.argv.includes('--dry-run');
const stuckAfterDays = Number(process.env.STUCK_AFTER_DAYS ?? 3);

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;

const api = async (method, urlPath, body) => {
  const res = await fetch(`https://api.github.com${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(
      `GitHub ${method} ${urlPath} -> ${res.status} ${await res.text()}`
    );
  }
  return res.status === 204 ? null : res.json();
};

export const idOf = (item) => `${item.kind}:${item.songId}:${item.docId}`;

export const renderRow = (item, isStuck) => {
  const what =
    item.kind === 'version'
      ? 'versione'
      : item.kind === 'song'
        ? 'canto nuovo'
        : `parte${item.partName ? ` "${item.partName}"` : ''}`;
  const who = item.authorName
    ? `${item.authorName} (${item.email})`
    : item.email;
  const age = `${Math.floor(item.ageDays)}g`;
  const flags = [];
  if (isStuck) flags.push('⚠️ ferma');
  if (item.fileMissing === true) flags.push('❌ file mancante');
  // Un canto proposto non ha ancora una pagina sul sito: al suo posto il
  // link alla canzone, se l'utente ne ha messo uno.
  const link = item.previewUrl ?? item.linkSong;
  const openCell = link ? `[apri](${link})` : '—';
  return `| ${what} | ${item.songName} | ${who} | ${age} ${flags.join(' ')} | ${openCell} |`;
};

export const renderBody = (items) => {
  const stuck = items.filter((i) => i.ageDays >= stuckAfterDays);
  const state = {
    ids: items.map(idOf),
    stuck: stuck.map(idOf),
    updatedAt: new Date().toISOString()
  };
  const lines = [
    MARKER,
    '',
    `**${items.length} contributi in attesa di revisione**` +
      (stuck.length > 0
        ? ` — di cui ${stuck.length} da almeno ${stuckAfterDays} giorni.`
        : '.'),
    '',
    '| Tipo | Canto | Autore | Attesa | Anteprima |',
    '| --- | --- | --- | --- | --- |',
    ...items.map((i) => renderRow(i, i.ageDays >= stuckAfterDays)),
    '',
    '<details><summary>Percorsi dei documenti</summary>',
    '',
    '```',
    ...items.map((i) => `${i.docPath}  ->  ${i.storagePath}`),
    '```',
    '',
    '</details>',
    '',
    '_Approva o rifiuta con `npm run pending`. Questa issue si chiude da sola quando la coda è vuota._',
    '',
    `${STATE_PREFIX} ${JSON.stringify(state)} -->`
  ];
  return lines.join('\n');
};

export const readPreviousState = (body) => {
  const start = body?.indexOf(STATE_PREFIX);
  if (start === undefined || start === -1) return { ids: [], stuck: [] };
  const end = body.indexOf('-->', start);
  try {
    return JSON.parse(body.slice(start + STATE_PREFIX.length, end).trim());
  } catch {
    return { ids: [], stuck: [] };
  }
};

const findQueueIssue = async () => {
  const issues = await api(
    'GET',
    `/repos/${repo}/issues?state=open&labels=${LABEL}&per_page=100`
  );
  return issues.find((i) => i.body?.includes(MARKER)) ?? null;
};

const ensureLabel = async () => {
  try {
    await api('POST', `/repos/${repo}/labels`, {
      name: LABEL,
      color: 'fbca04',
      description: 'Contributi in attesa di revisione'
    });
  } catch (e) {
    if (!String(e.message).includes('already_exists')) throw e;
  }
};

const main = async () => {
  const items = await fetchPendingQueue({
    checkStorage: process.env.CHECK_STORAGE === 'true'
  });

  if (dryRun) {
    console.log(items.length === 0 ? 'Queue is empty.' : renderBody(items));
    return;
  }
  if (!repo || !token) {
    throw new Error(
      'GITHUB_REPOSITORY and GITHUB_TOKEN are required (or pass --dry-run).'
    );
  }

  const issue = await findQueueIssue();

  if (items.length === 0) {
    if (issue) {
      await api('POST', `/repos/${repo}/issues/${issue.number}/comments`, {
        body: '✅ Coda vuota: tutti i contributi sono stati revisionati.'
      });
      await api('PATCH', `/repos/${repo}/issues/${issue.number}`, {
        state: 'closed'
      });
      console.log(`Closed issue #${issue.number}: queue is empty.`);
    } else {
      console.log('Queue is empty, nothing to report.');
    }
    return;
  }

  const body = renderBody(items);
  const title = `Revisione: ${items.length} contributi in attesa`;

  if (!issue) {
    await ensureLabel();
    const created = await api('POST', `/repos/${repo}/issues`, {
      title,
      body,
      labels: [LABEL]
    });
    console.log(
      `Opened issue #${created.number} with ${items.length} pending items.`
    );
    return;
  }

  const previous = readPreviousState(issue.body);
  const current = {
    ids: items.map(idOf),
    stuck: items.filter((i) => i.ageDays >= stuckAfterDays).map(idOf)
  };
  const newItems = current.ids.filter((id) => !previous.ids.includes(id));
  const newlyStuck = current.stuck.filter((id) => !previous.stuck.includes(id));

  await api('PATCH', `/repos/${repo}/issues/${issue.number}`, { title, body });

  if (newItems.length > 0 || newlyStuck.length > 0) {
    const parts = [];
    if (newItems.length > 0) parts.push(`${newItems.length} nuovi contributi`);
    if (newlyStuck.length > 0)
      parts.push(
        `${newlyStuck.length} fermi da oltre ${stuckAfterDays} giorni`
      );
    await api('POST', `/repos/${repo}/issues/${issue.number}/comments`, {
      body: `🔔 ${parts.join(', ')}. Dettagli aggiornati nella descrizione.`
    });
    console.log(
      `Updated issue #${issue.number} and commented: ${parts.join(', ')}.`
    );
  } else {
    console.log(`Updated issue #${issue.number} silently (nothing new).`);
  }
};

// Only run when invoked directly, so the formatting helpers above stay
// importable from tests.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
