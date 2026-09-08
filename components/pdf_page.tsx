import { type InfoRenderSong } from '@/logic/handle_text_song';
import { type Song } from '@/logic/local_logic';
import { SongDiv } from '@/components/song_div';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

interface PropsPdfPage {
  song: Song | undefined;
  info: InfoRenderSong;
}

const PagePDFSong = (props: PropsPdfPage) => {
  if (props.song === undefined) {
    return <div></div>;
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p
          translate="no"
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            lineHeight: 1,
            marginLeft: 30
          }}
        >
          {props.song.name}
        </p>
        <p
          style={{
            fontSize: 25,
            fontStyle: 'italic',
            lineHeight: 1,
            marginLeft: 10
          }}
        >
          {' '}
          - Praising
        </p>
      </div>
      <SongDiv sections={props.info.sections} infoSong={props.song} />
    </>
  );
};

export const getHtmlPdfPage = (props: PropsPdfPage): string => {
  return ReactDOMServer.renderToString(<PagePDFSong {...props} />);
};
