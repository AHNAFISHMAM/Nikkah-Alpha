import confetti from 'canvas-confetti'

/**
 * Hook for triggering confetti celebrations
 */
export function useConfetti() {
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00FF87', '#00D9FF', '#FFD700'],
    })
  }

  return { triggerCelebration }
}

