import { Html, Head, Main, NextScript } from 'next/document';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

/**
 * Migrazione della preferenza tema: prima il tema era salvato in `dark_mode`
 * (booleano JSON) dallo slice `settings`, ora viene gestito da MUI in
 * `mui-mode`. Lo script gira prima di InitColorSchemeScript, cosi' chi usava
 * gia' l'app non perde la sua scelta.
 */
const migrateThemePreference = `
(function() {
  try {
    if (localStorage.getItem('mui-mode') !== null) return;
    var legacy = localStorage.getItem('dark_mode');
    if (legacy === null) return;
    localStorage.setItem('mui-mode', legacy === 'false' ? 'light' : 'dark');
  } catch (e) {}
})();
`;

export default function Document() {
  return (
    <Html lang="it">
      <Head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: migrateThemePreference }} />
        <InitColorSchemeScript defaultMode="dark" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
