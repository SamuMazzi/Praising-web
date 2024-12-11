'use client';
import ShareIcon from '@mui/icons-material/Share';
import React from 'react';
import dynamic from 'next/dynamic';
import { setPlaylist } from '@/logic/redux/playlist_slice';
import Routes from '@/logic/routes';
import { Playlist, setServerPlaylist } from '@/logic/server/database';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useAppDispatch } from '@/logic/redux/store';

const ShareOnSocial = dynamic(() => import('react-share-on-social'), {
  ssr: false
});

export function SharePlaylist(props: { playlist: Playlist }) {
  const dispatch = useAppDispatch();
  return (
    // TODO: temporary fix for window undefined on SSR
    typeof window !== 'undefined' && (
      <ShareOnSocial
        textToShare={
          'Visualizza la playlist ' + props.playlist!.name + " su 'Praising'!\n"
        }
        link={
          Routes.Base +
          Routes.Playlist +
          '/' +
          encodeURIComponent(props.playlist!.id)
        }
        linkTitle="Condividi questa playlist"
        linkFavicon="/favicon.ico"
        copyToClipboardText="Copia link"
        copySuccessText="Copiato"
        linkMetaDesc={
          'Visualizza la playlist ' + props.playlist!.name + " su 'Praising'!\n"
        }
        sites={['whatsapp', 'telegram', 'telegram', 'facebook', 'mail']}
        closeText="Chiudi"
        onSocialClick={() => {
          if (!props.playlist.shared) {
            const newPlaylist = { ...props.playlist, shared: true };
            dispatch(setPlaylist(newPlaylist));
            void setServerPlaylist(props.playlist);
          }
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Condividi" />
        </MenuItem>
      </ShareOnSocial>
    )
  );
}

export function ShareSong(props: { title: string; id: string }) {
  const textToShow = 'Visualizza la canzone ' + props.title + " su 'Praising'!";
  return (
    typeof window !== 'undefined' && (
      <ShareOnSocial
        textToShare={textToShow}
        link={Routes.Base + Routes.Songs + '/' + encodeURIComponent(props.id)}
        linkTitle="Condividi questa canzone"
        linkFavicon="/favicon.ico"
        copyToClipboardText="Copia link"
        copySuccessText="Copiato"
        linkMetaDesc={textToShow}
        sites={['whatsapp', 'telegram', 'telegram', 'facebook', 'mail']}
        closeText="Chiudi"
      >
        <MenuItem>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Condividi" />
        </MenuItem>
      </ShareOnSocial>
    )
  );
}
