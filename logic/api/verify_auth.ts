import { X509Certificate, createVerify } from 'node:crypto';

/**
 * Server-side verification of Firebase ID tokens, so that an endpoint can trust
 * the caller's uid/email instead of whatever the request body claims.
 *
 * Firebase signs ID tokens with rotating Google keys, published as X.509
 * certificates, so no service account credentials (and no firebase-admin
 * dependency) are needed to check a token — only the public certificates.
 */
const CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

/** Same project as logic/server/firebase_config.ts. */
const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'praising-web';

/** Tolerance for clock drift between Google's servers and ours, in seconds. */
const CLOCK_SKEW_SECONDS = 60;

interface TokenHeader {
  alg?: string;
  kid?: string;
}

interface TokenPayload {
  aud?: string;
  iss?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  email?: string;
  email_verified?: boolean;
  firebase?: { sign_in_provider?: string };
}

export interface VerifiedUser {
  uid: string;
  email: string;
  signInProvider: string;
}

export class InvalidTokenError extends Error {}
export class CertificatesUnavailableError extends Error {}

let cachedCerts: Record<string, string> | null = null;
let cachedCertsExpireAt = 0;

const fetchCertificates = async (): Promise<Record<string, string>> => {
  if (cachedCerts !== null && Date.now() < cachedCertsExpireAt) {
    return cachedCerts;
  }

  let res: Response;
  try {
    res = await fetch(CERTS_URL);
  } catch (e) {
    throw new CertificatesUnavailableError(String(e));
  }
  if (!res.ok) {
    throw new CertificatesUnavailableError(
      `Certificates endpoint returned ${res.status}`
    );
  }

  const certs = (await res.json()) as Record<string, string>;
  // Honour Google's cache-control so we rotate along with the published keys.
  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '');
  cachedCerts = certs;
  cachedCertsExpireAt =
    Date.now() + (maxAge === null ? 3600 : parseInt(maxAge[1], 10)) * 1000;
  return certs;
};

const decodeSegment = <T>(segment: string): T => {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
  } catch {
    throw new InvalidTokenError('Malformed token segment');
  }
};

export const verifyIdToken = async (
  idToken: string | undefined
): Promise<VerifiedUser> => {
  if (idToken === undefined || idToken === '') {
    throw new InvalidTokenError('Missing token');
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new InvalidTokenError('Malformed token');
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const header = decodeSegment<TokenHeader>(encodedHeader);
  if (header.alg !== 'RS256') {
    throw new InvalidTokenError('Unexpected token algorithm');
  }
  if (header.kid === undefined) {
    throw new InvalidTokenError('Token has no key id');
  }

  const certs = await fetchCertificates();
  const cert = certs[header.kid];
  if (cert === undefined) {
    throw new InvalidTokenError('Token signed with an unknown key');
  }

  const signatureIsValid = createVerify('RSA-SHA256')
    .update(`${encodedHeader}.${encodedPayload}`)
    .verify(
      new X509Certificate(cert).publicKey,
      Buffer.from(encodedSignature, 'base64url')
    );
  if (!signatureIsValid) {
    throw new InvalidTokenError('Invalid token signature');
  }

  const payload = decodeSegment<TokenPayload>(encodedPayload);
  const now = Math.floor(Date.now() / 1000);

  if (payload.aud !== PROJECT_ID) {
    throw new InvalidTokenError('Token issued for another project');
  }
  if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) {
    throw new InvalidTokenError('Unexpected token issuer');
  }
  if (payload.exp === undefined || payload.exp + CLOCK_SKEW_SECONDS < now) {
    throw new InvalidTokenError('Token expired');
  }
  if (payload.iat === undefined || payload.iat - CLOCK_SKEW_SECONDS > now) {
    throw new InvalidTokenError('Token issued in the future');
  }
  if (payload.sub === undefined || payload.sub === '') {
    throw new InvalidTokenError('Token has no subject');
  }

  return {
    uid: payload.sub,
    email: payload.email ?? '',
    signInProvider: payload.firebase?.sign_in_provider ?? 'unknown'
  };
};

/** Reads the bearer token out of an `Authorization` header. */
export const getBearerToken = (
  authorization: string | undefined
): string | undefined => {
  if (authorization === undefined) return undefined;
  const match = /^Bearer (.+)$/.exec(authorization);
  return match?.[1];
};
