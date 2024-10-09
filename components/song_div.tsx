import { type InfoLocalSong } from '@/logic/redux/info_song_slice';
import React, { useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

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
  const [compressed, setCompressed] = useState<boolean>(false);

  const onClickExpandable = (e: React.MouseEvent<HTMLDivElement>): void => {
    const isCompressed = e.currentTarget.classList.toggle('compressed');
    const classToPut = !isCompressed ? 'chord' : 'no-chord';
    const classToRemove = !isCompressed ? 'no-chord' : 'chord';

    const children = e.currentTarget.querySelectorAll('.' + classToRemove);
    children.forEach((child) =>
      child.classList.replace(classToRemove, classToPut)
    );
    setCompressed(isCompressed);
  };

  return (
    <div
      style={{ position: 'relative', paddingLeft: 28, width: 'fit-content' }}
    >
      <div className="expandable" onClick={onClickExpandable}>
        <p
          style={{ fontSize: props.infoSong?.zoom ?? 17 }}
          dangerouslySetInnerHTML={{ __html: props.section }}
        />
      </div>
      <KeyboardArrowDownRoundedIcon
        className="arrow-down-compressed"
        style={{
          display: compressed ? 'flex' : 'none',
          position: 'absolute',
          top: 20,
          left: 2
        }}
      />
    </div>
  );
}
