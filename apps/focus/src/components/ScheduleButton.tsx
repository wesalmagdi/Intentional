import { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { FaAngleDown } from 'react-icons/fa6';
import { BsCalendar3 } from 'react-icons/bs';
import { X } from 'lucide-react';

export const ScheduleButton = ({ onSchedule }: { onSchedule?: (text: string, date: string, time: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [date, setDate] = useState('25 Dec 2024');
  const [time, setTime] = useState('9:30 AM');

  const handleSchedule = () => {
    if (text.trim()) {
      onSchedule?.(text, date, time);
      setText('');
      setIsOpen(false);
    }
  };

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          layout
          style={{
            position: 'relative',
            zIndex: 10,
            width: 320,
            border: '2px solid #E9C9DF',
            background: '#fff',
            boxShadow: '0 8px 24px rgba(255,159,182,0.15)',
            borderRadius: 25,
          }}
        >
          <div style={{ padding: 8 }}>
            <textarea
              placeholder="What's up? (ᴗ )"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%',
                resize: 'none',
                background: 'transparent',
                padding: 8,
                color: '#4A3B5C',
                outline: 'none',
                fontFamily: 'var(--sans)',
                fontSize: 15,
                minHeight: 60,
              }}
            />
          </div>

          <div style={{ position: 'relative', paddingTop: 40 }}>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  style={{ position: 'absolute', top: 0, width: '100%', padding: '0 8px' }}
                  initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
                >
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    borderRadius: 999,
                    border: '2px solid #E9C9DF',
                    background: '#FFF6FA',
                  }}>
                    <div style={{
                      display: 'flex',
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      borderRadius: 999,
                      background: '#fff',
                    }}>
                      <div style={{
                        display: 'flex',
                        height: 40,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRight: '2px solid #E9C9DF',
                        padding: '0 12px',
                        fontSize: 13,
                        color: '#7C6C91',
                      }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{date}</span>
                        <FaAngleDown size={12} style={{ flexShrink: 0, color: '#A79BB8' }} />
                      </div>
                      <div style={{
                        display: 'flex',
                        height: 40,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 12px',
                        fontSize: 13,
                        color: '#7C6C91',
                      }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{time}</span>
                        <FaAngleDown size={12} style={{ flexShrink: 0, color: '#A79BB8' }} />
                      </div>
                    </div>
                    <button
                      title="close"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: 'flex',
                        height: 40,
                        width: 40,
                        flexShrink: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#A79BB8',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '8px 12px' }}>
              <motion.button
                layoutId="container"
                onClick={() => setIsOpen(true)}
                style={{
                  display: 'flex',
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #E9C9DF',
                  background: '#FFF6FA',
                  color: '#E85D90',
                  borderRadius: 25,
                  opacity: isOpen ? 0 : 1,
                  cursor: 'pointer',
                }}
              >
                <motion.span
                  layout="size"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0, delay: 0.175, duration: 0.4 }}
                >
                  <BsCalendar3 size={18} />
                </motion.span>
              </motion.button>

              <motion.button
                onClick={handleSchedule}
                style={{
                  background: 'linear-gradient(135deg, #FF9FB6, #FF7FA8)',
                  padding: '8px 32px',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: 25,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(255,127,168,0.3)',
                  transformOrigin: 'right',
                }}
                animate={{
                  scale: isOpen ? 0.9 : 1,
                  transition: { type: 'spring', bounce: 0, delay: isOpen ? 0.175 : 0, duration: 0.4 },
                }}
              >
                Save
              </motion.button>

              <AnimatePresence>
                {isOpen && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', padding: '8px 12px' }}>
                    <motion.button
                      layoutId="container"
                      onClick={handleSchedule}
                      style={{
                        height: 40,
                        width: '100%',
                        background: 'linear-gradient(135deg, #FF9FB6, #FF7FA8)',
                        padding: '8px 32px',
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 25,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(255,127,168,0.4)',
                      }}
                    >
                      <motion.span
                        layout="size"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0, delay: 0.175, duration: 0.4 }}
                      >
                        Schedule
                      </motion.span>
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: 0.1 }}
              style={{
                position: 'relative',
                zIndex: 0,
                marginTop: -25,
                display: 'flex',
                width: 320,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 0 25px 25px',
                border: '2px solid #E9C9DF',
                borderTop: 'none',
                background: '#FFF6FA',
                padding: '12px 12px 12px 12px',
                paddingTop: 32,
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: '#7C6C91', textAlign: 'center' }}>
                Will be saved on {date} at {time}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};
