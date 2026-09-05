import React, { useState } from 'react';
import { motion, type Transition, useMotionValue, useTransform } from 'motion/react';
import { Icon } from '../App';

export interface DockItem {
  id: string;
  icon: string;
  label: string;
}

interface DockProps {
  items: DockItem[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const dockSpring: Transition = {
  stiffness: 300,
  damping: 22,
  mass: 0.7,
};

export const Dock: React.FC<DockProps> = ({ items, onSelect, selectedId }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      layout
      transition={dockSpring}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 14,
        borderRadius: 24,
        border: '2px solid #E9C9DF',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        padding: '8px 12px',
        boxShadow: '0 12px 32px rgba(255,159,182,0.2)',
      }}
    >
      {items.map((item) => (
        <DockIcon
          key={item.id}
          item={item}
          mouseX={mouseX}
          selected={selectedId === item.id}
          onSelect={() => onSelect(item.id)}
        />
      ))}
    </motion.div>
  );
};

const DockIcon: React.FC<{
  item: DockItem;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  selected: boolean;
  onSelect: () => void;
}> = ({ item, mouseX, selected, onSelect }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const width = useTransform(widthSync, (v) => v);

  return (
    <motion.div
      ref={ref}
      onClick={onSelect}
      style={{
        position: 'relative',
        transformOrigin: 'bottom',
      }}
    >
      <motion.div
        style={{
          width,
          height: width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: 16,
          background: selected ? 'linear-gradient(135deg, #FF9FB6, #FF7FA8)' : '#FFF6FA',
          transition: 'background 0.2s',
        }}
        whileHover={{ y: -4 }}
      >
        <Icon name={item.icon} />
      </motion.div>

      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#FF7FA8',
          }}
        />
      )}
    </motion.div>
  );
};
