'use client';

import { Song } from '@/logic/local_logic';
import { useEffect, useRef, useState } from 'react';
import Multitrack from 'wavesurfer-multitrack';

interface MultitrackMixerProps {
  song: Song;
}

export default function MultitrackMixer(props: MultitrackMixerProps) {
  const containerRef = useRef(null);
  const multitrackRef = useRef<Multitrack | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (!containerRef.current) return;

    const multitrack = Multitrack.create(
      [
        {
          id: 0,
          startPosition: 0,
          url: props.song.link,
          options: {
            renderFunction: (channels, ctx) => {
              const { width, height } = ctx.canvas;
              const scale = channels[0].length / width;
              const step = 10;

              ctx.translate(0, height / 2);
              ctx.strokeStyle = ctx.fillStyle;
              ctx.beginPath();

              for (let i = 0; i < width; i += step * 2) {
                const index = Math.floor(i * scale);
                const value = Math.abs(channels[0][index]);
                let x = i;
                let y = value * height;

                ctx.moveTo(x, 0);
                ctx.lineTo(x, y);
                ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, true);
                ctx.lineTo(x + step, 0);

                x = x + step;
                y = -y;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, y);
                ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, false);
                ctx.lineTo(x + step, 0);
              }

              ctx.stroke();
              ctx.closePath();
            }
          }
        },
        {
          id: 1,
          draggable: false,
          startPosition: 14,
          url: '/examples/audio/librivox.mp3',
          envelope: [
            { time: 2, volume: 0.5 },
            { time: 10, volume: 0.8 },
            { time: 255, volume: 0.8 },
            { time: 264, volume: 0 }
          ],
          volume: 0.95,
          options: {
            waveColor: 'hsl(46, 87%, 49%)',
            progressColor: 'hsl(46, 87%, 20%)'
          },
          intro: {
            endTime: 16,
            label: 'Intro', // TODO: Add name of part
            color: '#FFE56E'
          },
          markers: [
            { time: 21, label: 'M1', color: 'hsla(600, 100%, 30%, 0.5)' },
            { time: 22.7, label: 'M2', color: 'hsla(400, 100%, 30%, 0.5)' },
            { time: 24, label: 'M3', color: 'hsla(200, 50%, 70%, 0.5)' },
            { time: 27, label: 'M4', color: 'hsla(200, 50%, 70%, 0.5)' }
          ]
        },
        {
          id: 2,
          draggable: true,
          startPosition: 1,
          startCue: 2.1,
          endCue: 20,
          fadeInEnd: 8,
          fadeOutStart: 14,
          envelope: true,
          volume: 0.8,
          options: {
            waveColor: 'hsl(161, 87%, 49%)',
            progressColor: 'hsl(161, 87%, 20%)'
          },
          url: '/examples/audio/audio.wav'
        }
      ],
      {
        container: containerRef.current,
        minPxPerSec: zoom,
        cursorWidth: 5,
        cursorColor: '#D72F21',
        trackBackground: '#2D2D2D',
        trackBorderColor: '#7C7C7C',
        dragBounds: true,
        envelopeOptions: {
          lineColor: 'rgba(255, 0, 0, 0.7)',
          lineWidth: '4px',
          dragPointSize: window.innerWidth < 600 ? 20 : 10,
          dragPointFill: 'rgba(255, 255, 255, 0.8)',
          dragPointStroke: 'rgba(255, 255, 255, 0.3)'
        }
      }
    );

    multitrackRef.current = multitrack;

    // Events
    multitrack.on('canplay', async () => {
      setIsReady(true);
      await multitrack.setSinkId('default');
    });

    multitrack.on('volume-change', ({ id, volume }) => {
      console.log(`Track ${id} volume updated to ${volume}`);
    });

    multitrack.on('drop', ({ id }) => {
      multitrack.addTrack({
        id,
        url: '/examples/audio/demo.wav',
        startPosition: 0,
        draggable: true,
        options: {
          waveColor: 'hsl(25, 87%, 49%)',
          progressColor: 'hsl(25, 87%, 20%)'
        }
      });
    });

    return () => {
      multitrack.destroy();
      multitrackRef.current = null;
    };
  }, [zoom]);

  // Zoom handling
  useEffect(() => {
    if (multitrackRef.current) {
      multitrackRef.current.zoom(zoom);
    }
  }, [zoom]);

  const togglePlay = () => {
    const mt = multitrackRef.current;
    if (!mt) return;

    mt.isPlaying() ? mt.pause() : mt.play();
    setIsPlaying(mt.isPlaying());
  };

  const forward = () => {
    const mt = multitrackRef.current;
    if (!mt) return;
    mt.setTime(mt.getCurrentTime() + 30);
  };

  const backward = () => {
    const mt = multitrackRef.current;
    if (!mt) return;
    mt.setTime(mt.getCurrentTime() - 30);
  };

  return (
    <div>
      <label>
        Zoom:{' '}
        <input
          type="range"
          min="10"
          max="100"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </label>

      <div style={{ margin: '2em 0' }}>
        <button onClick={togglePlay} disabled={!isReady}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={forward}>Forward 30s</button>
        <button onClick={backward}>Backward 30s</button>
      </div>

      <div
        ref={containerRef}
        style={{ background: '#2d2d2d', color: '#fff' }}
      />
    </div>
  );
}
