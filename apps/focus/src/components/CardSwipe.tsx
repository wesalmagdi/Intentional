import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo, type Transition, AnimatePresence } from 'motion/react';
import { Icon } from '../App';

export interface CardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

interface CardSwipeProps {
  items: CardItem[];
  onSelect: (id: string) => void;
}

const ITEM_WIDTH = 320;
const GAP = 24;
const CONTAINER_WIDTH = ITEM_WIDTH + GAP;
const DRAG_BUFFER = 80;
const VELOCITY_THRESHOLD = 300;

const SPRING_OPTIONS: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 32,
  mass: 0.8,
};

interface CarouselCardProps {
  item: CardItem;
  index: number;
  x: ReturnType<typeof useMotionValue<number>>;
  currentIndex: number;
  onSelect: (id: string) => void;
}

const CarouselCard: React.FC<CarouselCardProps> = ({ item, index, x, currentIndex, onSelect }) => {
  const distance = index - currentIndex;
  
  const rotateY = useTransform(x, [-CONTAINER_WIDTH, 0, CONTAINER_WIDTH], [25, 0, -25], { clamp: true });
  const scale = useTransform(x, [-CONTAINER_WIDTH, 0, CONTAINER_WIDTH], [0.85, 1, 0.85], { clamp: true });
  const opacity = useTransform(x, [-CONTAINER_WIDTH, 0, CONTAINER_WIDTH], [0.6, 1, 0.6], { clamp: true });

  return (
    <motion.div
      style={{
        width: ITEM_WIDTH,
        height: 440,
        rotateY,
        scale,
        opacity,
        flexShrink: 0,
        background: item.gradient,
        borderRadius: 40,
        padding: 32,
        border: '3px solid rgba(255,255,255,0.9)',
        boxShadow: '0 20px 60px rgba(159,123,255,0.2), 0 8px 24px rgba(255,159,182,0.15)',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
      transition={SPRING_OPTIONS}
      whileHover={{ 
        y: distance === 0 ? -8 : 0,
        boxShadow: distance === 0 ? '0 28px 70px rgba(159,123,255,0.3), 0 12px 32px rgba(255,159,182,0.2)' : undefined
      }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Floating decorative circles */}
      <motion.div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Icon container with bounce */}
      <motion.div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: 'rgba(255,255,255,0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 8px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)',
          position: 'relative',
          zIndex: 1,
        }}
        whileHover={{ 
          scale: 1.08,
          rotate: [0, -5, 5, 0],
        }}
        transition={{ duration: 0.4 }}
      >
        <Icon name={item.icon} />
      </motion.div>

      {/* Title */}
      <motion.h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#4A3B5C',
          marginBottom: 12,
          fontFamily: 'var(--serif)',
          position: 'relative',
          zIndex: 1,
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {item.title}
      </motion.h2>

      {/* Description */}
      <motion.p
        style={{
          fontSize: 16,
          color: '#6B5A7E',
          marginBottom: 24,
          lineHeight: 1.6,
          flex: 1,
          position: 'relative',
          zIndex: 1,
          fontWeight: 500,
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {item.description}
      </motion.p>

      {/* Start button with sparkle effect */}
      <motion.button
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 8px 24px rgba(201,123,150,0.4)',
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(item.id)}
        style={{
          background: 'linear-gradient(135deg, #D99BB1 0%, #C97B96 100%)',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: 999,
          padding: '14px 28px',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(201,123,150,0.3)',
          position: 'relative',
          zIndex: 1,
          letterSpacing: '0.02em',
        }}
      >
        Start
      </motion.button>
    </motion.div>
  );
};

export const CardSwipe: React.FC<CardSwipeProps> = ({ items, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const leftConstraint = -((ITEM_WIDTH + GAP) * (items.length - 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          style={{ width: ITEM_WIDTH, height: 440, overflow: 'visible', position: 'relative' }}
        >
          <motion.div
            style={{
              display: 'flex',
              gap: GAP,
              perspective: 1200,
              perspectiveOrigin: 'center center',
              x,
            }}
            drag="x"
            dragConstraints={{ left: leftConstraint, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            animate={{ x: -(currentIndex * CONTAINER_WIDTH) }}
            transition={SPRING_OPTIONS}
          >
            {items.map((item, index) => (
              <CarouselCard
                key={item.id}
                item={item}
                index={index}
                x={x}
                currentIndex={currentIndex}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Dots with bounce animation */}
      <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
        {items.map((_, i) => (
          <motion.div
            key={i}
            onClick={() => setCurrentIndex(i)}
            animate={{
              scale: currentIndex === i ? 1.3 : 1,
              background: currentIndex === i ? '#FF7FA8' : '#E9C9DF',
            }}
            whileHover={{ scale: 1.2 }}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      {/* Helper text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.6, y: 0 }}
        style={{
          marginTop: 16,
          fontSize: 13,
          color: '#A79BB8',
          fontStyle: 'italic',
        }}
      >
        drag or click to explore
      </motion.p>
    </div>
  );
};
