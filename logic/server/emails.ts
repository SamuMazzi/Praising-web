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
