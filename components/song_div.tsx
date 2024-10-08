import { type InfoLocalSong } from '@/logic/redux/info_song_slice';
import Typography from '@mui/material/Typography';
import React from 'react';

interface PropsSongDiv {
  sections: string[];
  infoSong: InfoLocalSong | undefined;
}

export const SongDiv = (props: PropsSongDiv): JSX.Element => {
  return (
    <div id="songDiv">
      {props.sections.map((section, index) => {
        return (
          <SectionSong
            key={index}
            section={section}
            infoSong={props.infoSong}
          />
        );
      })}
    </div>
  );
};

function SectionSong(props: {
  section: string;
  infoSong: InfoLocalSong | undefined;
}): JSX.Element {
  return (
    <Typography style={{ fontSize: props.infoSong?.zoom ?? 17 }}>
      <p
        className="expandable"
        onClick={(e) => {
          const isCompressed = e.currentTarget.classList.toggle('compressed');
          const classToPut = !isCompressed ? 'chord' : 'no-chord';
          const classToRemove = !isCompressed ? 'no-chord' : 'chord';

          const children = e.currentTarget.querySelectorAll(
            '.' + classToRemove
          );
          children.forEach((child) =>
            child.classList.replace(classToRemove, classToPut)
          );
        }}
      >
        <p dangerouslySetInnerHTML={{ __html: props.section }} />
      </p>
    </Typography>
  );
}
