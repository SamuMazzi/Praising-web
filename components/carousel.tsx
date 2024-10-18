import React, { useEffect, ReactNode } from 'react';
import styles from './carousel.module.css';

interface CarouselProps {
    idDiv: string;
    items: ReactNode[];
    titles?: string[];
}

const Carousel: React.FC<CarouselProps> = ({ items, idDiv, titles }) => {
    // TODO: Aggiungi freccie laterali
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const idInterval = self.setInterval(() => {
                const container = document.getElementById(idDiv);
                if (document.readyState !== 'complete') {
                    return;
                }
                if (container === null) {
                    self.clearInterval(idInterval);
                    return;
                }
                container.scrollBy(5, 0);
            }, 5);
        }
    }, []);

  return (
    <div
        id={idDiv}
        className={styles.carousel}
    >
      {[...items, ...items, ...items].map((item, index) => (
        <div 
            key={index} 
            className={styles.carouselItem + " hover-reveal"}
            data-hover-text={titles ? titles[index % items.length] : ('Vai ' + String.fromCharCode(10140))}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default Carousel;