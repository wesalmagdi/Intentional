import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo, type Transition } from 'motion/react';
import { Icon } from '../App';

export interface CardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface CardSwipeProps {
  items: CardItem[];
  onSelect: (id: string) => void;
}

const ITEM_WIDTH = 300;
const GAP = 16;
const CONTAINER_WIDTH = ITEM_WIDTH + GAP;
const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;

const SPRING_OPTIONS: Transition = {
  type: 'spring',
  stiffness: 330,
  damping: 30,
};

interface CarouselCardProps {
  item: CardItem;
  index: number;
  x: ReturnType<typeof useMotionValue<number>>;
  itemCount: number;
  onSelect: (id: string) => void;
}

const CarouselCard: React.FC<CarouselCardProps> = ({ item, index, x, itemCount, onSelect }) => {
  const nextIndex = Math.min(index + 1, itemCount - 1);
  const prevIndex = Math.max(index - 1, 0);

  const range = [
    (-100 * (index + 1) * CONTAINER_WIDTH) / 100,
    (-100 * index * CONTAINER_WIDTH) / 100,
    (-100 * (index - 1) * CONTAINER_WIDTH) / 100,
  ];
  const outputRange = [nextIndex ? 90 : 90, 0, prevIndex ? -90 : -90];

  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      style={{
        width: ITEM_WIDTH,
        height: 400,
        rotateY,
        flexShrink: 0,
        background: item.color,
        borderRadius: 32,
        padding: 28,
        border: '2px solid rgba(255,255,255,0.8)',
        boxShadow: '0 12px 32px rgba(90,60,120,0.15)',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
      }}
      transition={SPRING_OPTIONS}
      whileHover={{ y: -4 }}
      whileTap={{ cursor: 'grabbing' }}
    >
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
      }}>
        <Icon name={item.icon} />
      </div>

      <h2 style={{
        fontSize: 26,
        fontWeight: 800,
        color: '#4A3B5C',
        marginBottom: 10,
        fontFamily: 'var(--serif)',
      }}>
        {item.title}
      </h2>

      <p style={{
        fontSize: 16,
        color: '#7C6C91',
        marginBottom: 20,
        lineHeight: 1.5,
        flex: 1,
      }}>
        {item.description}
      </p>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onSelect(item.id)}
        style={{
          background: 'rgba(74,59,92,0.9)',
          color: '#fff',
          border: 'none',
          borderRadius: 999,
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: ITEM_WIDTH, height: 400, overflow: 'hidden', position: 'relative' }}>
        <motion.div
          style={{
            display: 'flex',
            gap: GAP,
            perspective: 1000,
            perspectiveOrigin: currentIndex * ITEM_WIDTH + ITEM_WIDTH / 2,
            x,
          }}
          drag="x"
          dragConstraints={{ left: leftConstraint, right: 0 }}
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
              itemCount={items.length}
              onSelect={onSelect}
            />
          ))}
        </motion.div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
        {items.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: currentIndex === i ? '#E85D90' : '#E9C9DF',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
};
