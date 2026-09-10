/**
 * Il minimo indispensabile di manipolazione DOM per `handle_text_song.ts`.
 *
 * Prima quel file usava cheerio, che di default monta il parser parse5:
 * conforme alle specifiche HTML5, ma pensato per documenti veri e pagato a
 * caro prezzo su mobile, sia in byte scaricati sia in millisecondi per canto.
 * L'HTML che dobbiamo ritoccare non arriva pero' dal web: lo genera
 * `HtmlDivFormatter` di chordsheetjs ed e' fatto solo di `<div>` annidati con
 * una classe, quindi non serve un parser tollerante agli errori.
 *
 * Qui sotto stanno htmlparser2 (lo stesso parser "veloce" che cheerio offre
 * come alternativa) e quattro helper sulle classi. L'output e' identico byte
 * per byte a quello di prima: c'e' uno script di confronto che lo verifica su
 * tutti i canti del repertorio per ogni combinazione di impostazioni.
 */
import { parseDocument } from 'htmlparser2';
import { findAll, textContent } from 'domutils';
import render from 'dom-serializer';
import { Element, Text, type AnyNode, type Document } from 'domhandler';

/** parse5 serializza ` ` come `&nbsp;`; escapeUTF8 di dom-serializer no. */
const NBSP = / /g;

const RENDER_OPTIONS = { encodeEntities: 'utf8', emptyAttrs: true } as const;

export const parseHtml = (html: string): Document => parseDocument(html);

export const renderNodes = (nodes: AnyNode[]): string =>
  nodes
    .map((node) => render(node, RENDER_OPTIONS))
    .join('')
    .replace(NBSP, '&nbsp;');

const classesOf = (el: Element): string[] => {
  const value = el.attribs.class;
  return value === undefined || value === '' ? [] : value.split(/\s+/);
};

export const hasClass = (el: Element, name: string): boolean =>
  classesOf(el).includes(name);

export const addClass = (el: Element, name: string): void => {
  if (hasClass(el, name)) return;
  const classes = classesOf(el);
  classes.push(name);
  el.attribs.class = classes.join(' ');
};

export const removeClass = (el: Element, name: string): void => {
  el.attribs.class = classesOf(el)
    .filter((c) => c !== name)
    .join(' ');
};

export const getText = (node: AnyNode): string => textContent(node);

/** Come `.text(valore)` di cheerio: butta via i figli e ne mette uno solo. */
export const setText = (el: Element, value: string): void => {
  const text = new Text(value);
  text.parent = el;
  el.children = [text];
};

const isElement = (node: AnyNode): node is Element => node instanceof Element;

/** Tutti i discendenti con quella classe, in ordine di documento. */
export const byClass = (root: AnyNode | AnyNode[], name: string): Element[] => {
  const roots = Array.isArray(root) ? root : [root];
  return findAll(
    (el) => hasClass(el, name),
    roots.flatMap((node) =>
      isElement(node) ? node.children : (node as Document).children
    )
  );
};

/** Solo i figli diretti con quella classe. */
export const childrenByClass = (el: Element, name: string): Element[] =>
  el.children.filter((c): c is Element => isElement(c) && hasClass(c, name));
