export interface EmailPayloadVersionSong {
  userId: string;
  songId: string;
  versionId: string;
  nameSong: string;
  email: string;
}

export interface EmailPayloadPartSong {
  userName: string;
  songId: string;
  partId: string;
  namePart: string;
  nameSong: string;
  email: string;
}

/**
 * The proposer's identity is taken from the verified Firebase ID token sent in
 * the `Authorization` header, so it is deliberately absent from the payload.
 */
export interface EmailPayloadProposalSong {
  linkSong: string;
  linkChords: string;
}
