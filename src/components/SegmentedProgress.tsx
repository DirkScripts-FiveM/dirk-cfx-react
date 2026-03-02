import { motion, Variants } from "framer-motion";
import { MotionFlex } from "./Motion";

export type ProgressProps = {
  progress: number; // 0 - 100 range
  segments: number; // Number of segments (e.g., 5, 10, etc.)
  size?: string | number;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  }
};

// Child item variants
const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    }
  },
  exit: {
    opacity: 0,
    x: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
    }
  }
};



export function SegmentedProgress(props: ProgressProps) {
  const progressPerSegment = 100 / props.segments; // Percentage per segment
  const filledSegments = Math.floor(props.progress / progressPerSegment);
  const partialFill = (props.progress % progressPerSegment) / progressPerSegment; // 0 to 1 range for partial fill

  return (
    <MotionFlex 
      w="100%" 
      h={props.size || '1vh'}
      gap='xs'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      {[...Array(props.segments)].map((_, index) => {
        const isFilled = index < filledSegments;
        const isPartial = index === filledSegments;

        return (
          <motion.div
            key={index}
            variants={itemVariants}
            style={{
              flex: 1,
              height: "100%",
              background: isFilled
                ? "rgba(255, 255, 255, 0.8)"
                : isPartial
                ? `linear-gradient(to right, rgba(255, 255, 255, 0.8) ${partialFill * 100}%, rgba(255, 255, 255, 0.2) ${partialFill * 100}%)`
                : "rgba(255, 255, 255, 0.2)",
              transition: "background 0.3s ease",
            }}
          />
        );
      })}
    </MotionFlex>
  );
}