import React, { useEffect, useState } from 'react';
import styles from './shimmer_segments.module.css';

interface PropsShimmerSegments {
  numSegments: number;
}

const ShimmerSegments = (props: PropsShimmerSegments): JSX.Element => {
  const [segmentLengths, setSegmentLengths] = useState<number[]>([]);

  useEffect(() => {
    const minSegmentLength = 50;
    const maxSegmentLength = 300;
    const lengths = Array.from(
      { length: props.numSegments },
      () =>
        Math.floor(Math.random() * (maxSegmentLength - minSegmentLength + 1)) +
        minSegmentLength
    );
    setSegmentLengths(lengths);
  }, []);

  return (
    <div className="segmentContainer">
      {segmentLengths.map((length, index) => (
        <div
          key={index}
          className={styles.shimmerSegment + ' shimmer'}
          style={{ width: `${length}px` }}
        >
          &nbsp;
        </div>
      ))}
    </div>
  );
};

export default ShimmerSegments;
