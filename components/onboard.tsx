'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Image from 'next/image';
import Typography from '@mui/material/Typography';

// created with https://www.blobmaker.app/
const bgBlobs = [
  'M45.1,-52.5C54.8,-45.5,56.6,-27.9,53.9,-13.8C51.3,0.3,44.3,10.9,39.3,25.7C34.3,40.5,31.5,59.5,20.6,68.6C9.8,77.7,-9,77,-23,69.3C-37,61.5,-46.2,46.8,-55.2,31.6C-64.3,16.5,-73.1,1,-74.1,-16.5C-75.1,-34.1,-68.3,-53.7,-54.7,-59.9C-41,-66.2,-20.5,-59.1,-1.4,-57.4C17.7,-55.7,35.3,-59.4,45.1,-52.5Z',
  'M44.4,-55.8C55.9,-43.2,62.6,-27.7,68.6,-9.7C74.7,8.3,80.1,28.8,72.6,42C65.1,55.2,44.7,61,25.8,65.6C6.9,70.1,-10.5,73.4,-26.9,69.4C-43.3,65.4,-58.7,54.1,-68.2,38.8C-77.8,23.5,-81.5,4.2,-77.2,-12.5C-72.9,-29.2,-60.6,-43.5,-46.5,-55.6C-32.3,-67.7,-16.1,-77.8,0.1,-77.9C16.4,-78.1,32.9,-68.4,44.4,-55.8Z',
  'M52.8,-58.7C64.3,-53.3,66.6,-32.7,68.5,-13.4C70.4,6,71.8,24.1,62.7,32.6C53.5,41,33.8,39.7,18.8,40.3C3.8,40.8,-6.4,43.1,-16.6,41.3C-26.8,39.4,-37,33.3,-49.4,23.1C-61.7,12.8,-76.3,-1.6,-74,-12.8C-71.7,-24,-52.6,-32,-37.5,-36.8C-22.4,-41.5,-11.2,-43.1,4.7,-48.7C20.7,-54.4,41.3,-64.1,52.8,-58.7Z',
  'M60.6,-54.7C75.1,-46,81.2,-23,76.1,-5.2C70.9,12.7,54.5,25.4,39.9,37.8C25.4,50.2,12.7,62.5,-3.2,65.6C-19,68.8,-38,62.9,-48.9,50.5C-59.7,38,-62.3,19,-64.1,-1.8C-66,-22.7,-67.1,-45.4,-56.3,-54.1C-45.4,-62.7,-22.7,-57.3,0.1,-57.4C23,-57.6,46,-63.3,60.6,-54.7Z',
  'M47.9,-46.5C64.5,-31.3,82.1,-15.6,82.4,0.3C82.7,16.2,65.7,32.4,49.1,43.1C32.4,53.8,16.2,58.9,0.2,58.7C-15.7,58.4,-31.5,52.8,-47.3,42.1C-63.2,31.5,-79.3,15.7,-80.7,-1.4C-82.1,-18.5,-68.8,-37,-52.9,-52.2C-37,-67.5,-18.5,-79.4,-1.4,-78C15.6,-76.5,31.3,-61.7,47.9,-46.5Z'
];

const slides = [
  {
    title: 'Schermo sempre attivo',
    description:
      'Quando utilizzerai Praising non dovrai preoccuparti di toccare lo schermo per non farlo spegnere, ora rimarrà sempre acceso!',
    icon: '/assets/undraw_illustrations/onboarding/undraw_screen.svg',
    buttonText: 'Continua'
  },
  {
    title: 'Playlist condivisibili',
    description:
      "Hai scelto i canti che vuoi fare e non ti va cercarli nell'elenco ogni volta? Ora puoi creare una playlist e condividerla con i tuoi amici!",
    icon: '/assets/undraw_illustrations/onboarding/undraw_share.svg',
    buttonText: 'Continua'
  },
  {
    title: 'Crea PDF',
    description:
      'Hai bisogno di stampare i canti per portarli con te? Ora puoi creare un PDF a partire da un singolo canto o dalla tua playlist!',
    icon: '/assets/undraw_illustrations/onboarding/undraw_docs.svg',
    buttonText: 'Continua'
  },
  {
    title: 'Feedback',
    description:
      "Qualcosa non ti piace o vuoi suggerire delle modifiche? Clicca sull'icona in alto a destra per inviarmi un messaggio!",
    icon: '/assets/undraw_illustrations/onboarding/undraw_feedback.svg',
    buttonText: 'Continua'
  },
  {
    title: "Installa l'app (beta)",
    description:
      "Sai che se vuoi, puoi installare Praising come un'app?\nVai nelle impostazioni per più informazioni.",
    icon: '/assets/undraw_illustrations/onboarding/undraw_pwa.svg',
    buttonText: 'Continua'
  },
  {
    title: 'Altro in arrivo...',
    description:
      'Praising è in continuo sviluppo, nuove funzionalità sono in arrivo, come le seconde voci e la modifica dei canti!\nResta aggiornato per non perderti nulla!',
    icon: '/assets/undraw_illustrations/onboarding/undraw_programming.svg',
    buttonText: 'Finito'
  }
];

const BgBlob = (props: { index: number; matchHeight: boolean }) => {
  const [matches, setMatches] = useState(
    window.matchMedia('(min-width: 480px)').matches
  );

  useEffect(() => {
    window
      .matchMedia('(min-width: 480px)')
      .addEventListener('change', (e) => setMatches(e.matches));
  }, []);

  return (
    <svg
      style={{
        position: 'absolute',
        left: matches ? 30 : 0,
        height: props.matchHeight ? 300 : 200,
        width: 300
      }}
      viewBox="10 10 180 180"
      className="w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#F0B647"
        fill-opacity="0.7"
        transform="translate(100 100)"
        d={bgBlobs[props.index % bgBlobs.length]}
      />
    </svg>
  );
};
// 250, 200, 120
// 300, 250, 180
const OnboardingSlider = (props: { closeFn: () => void }) => {
  // TODO: Make image actually responsive
  const [currentSlide, setCurrentSlide] = useState(0);
  const [matchHeight, setMatchHeight] = useState(
    window.matchMedia('(min-height: 690px)').matches
  );
  const [showImage, setShowImage] = useState(
    window.matchMedia('(min-height: 580px)').matches
  );

  useEffect(() => {
    window
      .matchMedia('(min-height: 690px)')
      .addEventListener('change', (e) => setMatchHeight(e.matches));
    window
      .matchMedia('(min-height: 580px)')
      .addEventListener('change', (e) => setShowImage(e.matches));
  }, []);

  const styles = {
    root: {
      minHeight: '100vh',
      width: '100%',
      p: 4
    },
    container: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 4
    },
    content: {
      maxWidth: 'md'
    },
    skipButton: {
      color: 'white',
      '&:hover': {
        color: 'orange.200'
      },
      mt: 2,
      mr: 2
    },
    slideContent: {
      textAlign: 'center',
      color: 'white'
    },
    iconContainer: {
      height: 48 * 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    textContainer: {
      mt: 4,
      mb: 4
    },
    actionButton: {
      width: '100%',
      bgcolor: 'white',
      color: 'orange.700',
      '&:hover': {
        bgcolor: 'orange.100'
      }
    },
    progressContainer: {
      display: 'flex',
      justifyContent: 'center',
      mt: 4,
      gap: 2
    }
  };

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      props.closeFn();
      return;
    }
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    if (currentSlide === 0) {
      return;
    }
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <Box sx={{ ...styles.root, zIndex: 9000 }}>
      <Box sx={{ width: '100%', px: 4 }}>
        <motion.div
          key={currentSlide}
          style={{ inset: 0, position: 'fixed' }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={styles.container}>
            <Card elevation={3} sx={{ ...styles.content, mt: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: matchHeight ? 4 : 0
                }}
              >
                <Box width={32} />
                <Button
                  variant="outlined"
                  sx={styles.skipButton}
                  style={{
                    textTransform: 'none',
                    marginBottom: showImage ? 0 : 48
                  }}
                  onClick={props.closeFn}
                >
                  Esci
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mx: 4, mb: 4 }}>
                {showImage && (
                  <motion.div
                    style={{
                      position: 'relative',
                      height: matchHeight ? 250 : 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <BgBlob index={currentSlide} matchHeight={matchHeight} />
                    <div style={{ position: 'relative' }}>
                      <Image
                        src={slides[currentSlide].icon}
                        alt={'image ' + slides[currentSlide].icon}
                        width={matchHeight ? 180 : 120}
                        height={matchHeight ? 180 : 120}
                      />
                    </div>
                  </motion.div>
                )}

                <Box sx={{ mb: 4, mt: matchHeight ? 4 : 0 }}>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {slides[currentSlide].title}
                  </Typography>
                  <Typography
                    color="primary"
                    sx={{ maxWidth: 350, whiteSpace: 'pre-wrap' }}
                  >
                    {slides[currentSlide].description}
                  </Typography>
                </Box>

                {currentSlide !== 0 && 
                <Button variant="outlined" sx={{ mr: 2, textTransform: 'none' }} onClick={handlePrev}>
                  Indietro
                </Button>}
                <Button variant="contained" onClick={handleNext}>
                  {slides[currentSlide].buttonText}
                </Button>
              </Box>
            </Card>
          </Box>
        </motion.div>
        <Box
          sx={{
            position: 'relative',
            top:
              typeof window !== 'undefined'
                ? `${window.innerHeight * (window.innerHeight < 850 ? 0.85 : 0.8)}px`
                : '50px',
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            gap: 1
          }}
        >
          {slides.map((_, index) => (
            <motion.div
              key={index}
              style={{
                height: 4,
                borderRadius: 9999,
                backgroundColor: currentSlide === index ? '#fff' : '#F7D28F'
              }}
              animate={{
                width: currentSlide === index ? 32 : 16,
                backgroundColor: currentSlide === index ? '#fff' : '#F7D28F'
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const AnimatedOnboardingSlider = (props: {
  isOpen: boolean;
  closeFn: () => void;
}) => {
  return (
    <AnimatePresence>
      {props.isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <OnboardingSlider closeFn={props.closeFn} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedOnboardingSlider;
