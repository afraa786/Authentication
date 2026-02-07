import { motion } from 'framer-motion';

export type CatMode = 'idle' | 'email' | 'password';

type HideBehavior = 'turnLeft' | 'turnRight' | 'lookUp' | 'coverEyes';

interface CatProps {
  color: string;
  earInner?: string;
  mode: CatMode;
  behavior: HideBehavior;
  index: number;
}

const Cat = ({
  color,
  earInner = '#F9B4BC',
  mode,
  behavior,
  index,
}: CatProps) => {
  const isPassword = mode === 'password';
  const isEmail = mode === 'email';

  // Pupil target positions
  let lCx = 33, lCy = 40, rCx = 47, rCy = 40;

  if (isEmail) {
    lCx = 35; lCy = 43;
    rCx = 49; rCy = 43;
  } else if (isPassword) {
    switch (behavior) {
      case 'turnLeft':
        lCx = 29; rCx = 43;
        break;
      case 'turnRight':
        lCx = 37; rCx = 51;
        break;
      case 'lookUp':
        lCy = 36; rCy = 36;
        break;
    }
  }

  const headRotation = isPassword
    ? behavior === 'turnLeft' ? -22
    : behavior === 'turnRight' ? 22
    : behavior === 'lookUp' ? -10
    : 0
    : isEmail ? 4 : 0;

  const showOpen = !(isPassword && behavior === 'coverEyes');

  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 80 100"
        className="w-[52px] h-[65px] sm:w-[68px] sm:h-[85px]"
        style={{ overflow: 'visible' }}
      >
        {/* Tail */}
        <motion.path
          d="M 62,78 Q 74,64 70,50"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          animate={{ rotate: [0, 10, -5, 0] }}
          transition={{
            duration: 2.8 + index * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '62px 78px' }}
        />

        {/* Body */}
        <ellipse cx="40" cy="79" rx="19" ry="15" fill={color} />

        {/* Head group */}
        <motion.g
          animate={{ rotate: headRotation }}
          transition={{ type: 'spring', stiffness: 110, damping: 14 }}
          style={{ transformOrigin: '40px 43px' }}
        >
          {/* Head */}
          <circle cx="40" cy="43" r="17" fill={color} />

          {/* Ears */}
          <path d="M 26,33 L 23,13 L 35,28 Z" fill={color} />
          <path d="M 45,28 L 57,13 L 54,33 Z" fill={color} />
          <path d="M 28,31 L 26,18 L 34,28 Z" fill={earInner} opacity="0.6" />
          <path d="M 46,28 L 54,18 L 52,31 Z" fill={earInner} opacity="0.6" />

          {/* Open eyes */}
          {showOpen && (
            <>
              <circle cx="33" cy="41" r="5.5" fill="white" />
              <circle cx="47" cy="41" r="5.5" fill="white" />
              <motion.circle
                r="2.8"
                fill="#2A2A2A"
                cx={lCx}
                cy={lCy}
                animate={{ cx: lCx, cy: lCy }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              />
              <motion.circle
                r="2.8"
                fill="#2A2A2A"
                cx={rCx}
                cy={rCy}
                animate={{ cx: rCx, cy: rCy }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              />
              {/* Eye highlights */}
              <circle cx="31" cy="39" r="1.2" fill="white" opacity="0.9" />
              <circle cx="45" cy="39" r="1.2" fill="white" opacity="0.9" />
            </>
          )}

          {/* Closed eyes */}
          {!showOpen && (
            <>
              <motion.path
                d="M 27,42 Q 33,45 39,42"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25 }}
              />
              <motion.path
                d="M 41,42 Q 47,45 53,42"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, delay: 0.05 }}
              />
            </>
          )}

          {/* Nose */}
          <path d="M 38,48 L 40,50.5 L 42,48 Z" fill={earInner} opacity="0.8" />

          {/* Mouth */}
          <path d="M 40,50.5 Q 37.5,53.5 35.5,52" stroke="#BBB" strokeWidth="0.8" fill="none" />
          <path d="M 40,50.5 Q 42.5,53.5 44.5,52" stroke="#BBB" strokeWidth="0.8" fill="none" />

          {/* Whiskers */}
          <line x1="12" y1="45" x2="28" y2="44" stroke="#D5D5D5" strokeWidth="0.6" />
          <line x1="12" y1="49" x2="28" y2="48" stroke="#D5D5D5" strokeWidth="0.6" />
          <line x1="52" y1="44" x2="68" y2="45" stroke="#D5D5D5" strokeWidth="0.6" />
          <line x1="52" y1="48" x2="68" y2="49" stroke="#D5D5D5" strokeWidth="0.6" />
        </motion.g>

        {/* Paws */}
        {behavior === 'coverEyes' ? (
          <>
            <motion.ellipse
              cx={33}
              cy={isPassword ? 42 : 90}
              rx={7}
              ry={5.5}
              fill={color}
              animate={{ cy: isPassword ? 42 : 90 }}
              transition={{ type: 'spring', stiffness: 130, damping: 13 }}
            />
            <motion.ellipse
              cx={47}
              cy={isPassword ? 42 : 90}
              rx={7}
              ry={5.5}
              fill={color}
              animate={{ cy: isPassword ? 42 : 90 }}
              transition={{ type: 'spring', stiffness: 130, damping: 13, delay: 0.04 }}
            />
          </>
        ) : (
          <>
            <ellipse cx="28" cy="90" rx="6" ry="4.5" fill={color} />
            <ellipse cx="52" cy="90" rx="6" ry="4.5" fill={color} />
          </>
        )}
      </svg>
    </motion.div>
  );
};

interface CatAnimationProps {
  mode: CatMode;
}

const CatAnimation = ({ mode }: CatAnimationProps) => {
  return (
    <div className="flex items-end justify-center gap-1 sm:gap-3 relative z-10 -mb-2">
      <Cat color="#C9C9D2" mode={mode} behavior="turnLeft" index={0} />
      <Cat color="#F2B07E" earInner="#F9B4BC" mode={mode} behavior="coverEyes" index={1} />
      <Cat color="#9494A0" mode={mode} behavior="lookUp" index={2} />
      <Cat color="#F0DCBE" earInner="#F2C5A0" mode={mode} behavior="turnRight" index={3} />
    </div>
  );
};

export default CatAnimation;
