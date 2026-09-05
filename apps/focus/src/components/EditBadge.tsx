import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig, type Transition } from 'motion/react';
import { X } from 'lucide-react';
import { BiSolidPencil } from 'react-icons/bi';
import { FaCircleCheck } from 'react-icons/fa6';
import { BsDashCircleFill } from 'react-icons/bs';
import { MdTimelapse } from 'react-icons/md';
import { HiPencil } from 'react-icons/hi2';
import { LuTimer } from 'react-icons/lu';

export type BadgeIconType = 'loader' | 'clock' | 'timer' | 'check' | 'minus';

export interface BadgeConfig {
  text: string;
  icon: BadgeIconType;
  color: string;
}

const COLORS = [
  { id: 'blue', bg: '#016FFE', badgeBg: '#E7F1FD', text: '#016FFE' },
  { id: 'green', bg: '#2EBE52', badgeBg: '#E0FAE7', text: '#2EBE52' },
  { id: 'orange', bg: '#FFC405', badgeBg: '#FBF1DE', text: '#FFC405' },
  { id: 'pink', bg: '#E85D90', badgeBg: '#FFE9F1', text: '#E85D90' },
  { id: 'purple', bg: '#9F7BFF', badgeBg: '#F3EAF3', text: '#9F7BFF' },
];

const ICONS: Record<BadgeIconType, React.ElementType> = {
  loader: LuTimer,
  clock: MdTimelapse,
  timer: LuTimer,
  check: FaCircleCheck,
  minus: BsDashCircleFill,
};

const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
  mass: 1,
};

type EditBadgeProps = {
  initialBadge?: BadgeConfig;
  onChange?: (badge: BadgeConfig) => void;
};

export function EditBadge({ initialBadge = { text: 'Status', icon: 'check', color: 'pink' }, onChange }: EditBadgeProps) {
  const [badge, setBadge] = useState<BadgeConfig>(initialBadge);
  const [tempBadge, setTempBadge] = useState<BadgeConfig>(initialBadge);
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentColor = COLORS.find((c) => c.id === badge.color) || COLORS[0];
  const IconComponent = ICONS[badge.icon];

  const handleOpen = () => {
    setTempBadge(badge);
    setIsEditing(true);
  };

  const handleUpdate = () => {
    setBadge(tempBadge);
    onChange?.(tempBadge);
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };
    if (isEditing) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }} ref={containerRef}>
      <MotionConfig transition={springTransition}>
        <AnimatePresence>
          {!isEditing ? (
            <div key="close" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <motion.div
                layoutId="eb-container"
                style={{ borderRadius: 32 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  layoutId="badge-container"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 999,
                    padding: '8px 14px',
                    background: currentColor.badgeBg,
                    color: currentColor.text,
                    cursor: 'default',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  <motion.div layoutId={badge.icon}>
                    <IconComponent style={{ width: 18, height: 18 }} />
                  </motion.div>
                  <motion.span layoutId="badge-text" style={{ fontSize: 14, textTransform: 'capitalize' }}>
                    {badge.text}
                  </motion.span>
                </motion.div>
              </motion.div>
              <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: '2px solid #E9C9DF',
                  background: '#FFF6FA',
                  color: '#4A3B5C',
                  cursor: 'pointer',
                }}
              >
                <BiSolidPencil style={{ width: 18, height: 18 }} />
              </motion.button>
            </div>
          ) : (
            <motion.div
              key="open"
              layoutId="eb-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              style={{
                borderRadius: 24,
                position: 'absolute',
                top: '50%',
                left: '50%',
                zIndex: 10,
                width: 320,
                transform: 'translate(-50%, -50%)',
                border: '2px solid #E9C9DF',
                background: '#fff',
                padding: 20,
              }}
            >
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#7C6C91' }}>Edit Badge</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: '#A9B2A6',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: 14, height: 14 }} strokeWidth={4} />
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <motion.input
                  layoutId="badge-text"
                  type="text"
                  autoFocus
                  value={tempBadge.text}
                  onChange={(e) => setTempBadge((prev) => ({ ...prev, text: e.target.value }))}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    border: '2px solid #E9C9DF',
                    background: '#fff',
                    padding: '10px 14px',
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#4A3B5C',
                    textTransform: 'capitalize',
                    outline: 'none',
                  }}
                  placeholder="Enter status..."
                />
              </div>

              <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {(Object.keys(ICONS) as BadgeIconType[]).map((iconKey) => {
                  const Icon = ICONS[iconKey];
                  const isSelected = tempBadge.icon === iconKey;
                  return (
                    <motion.button
                      key={iconKey}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTempBadge((prev) => ({ ...prev, icon: iconKey }))}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        border: '2px solid #E9C9DF',
                        color: '#A79BB8',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected && (
                        <motion.div
                          layout
                          layoutId="selected-pill"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 12,
                            border: '2px solid #4A3B5C',
                            background: 'transparent',
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon style={{ width: 20, height: 20 }} />
                    </motion.button>
                  );
                })}
              </div>

              <div style={{
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                borderRadius: 12,
                border: '2px solid #E9C9DF',
                padding: 8,
              }}>
                {COLORS.map((color) => {
                  const isSelected = tempBadge.color === color.id;
                  return (
                    <motion.button
                      key={color.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTempBadge((prev) => ({ ...prev, color: color.id }))}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: color.bg,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    >
                      {isSelected && <HiPencil style={{ width: 14, height: 14, color: '#fff' }} />}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdate}
                style={{
                  width: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #FF9FB6, #FF7FA8)',
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(255,127,168,0.3)',
                }}
              >
                Update Badge
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}
