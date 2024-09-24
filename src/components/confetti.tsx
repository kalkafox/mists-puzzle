import Fireworks from 'react-canvas-confetti/dist/presets/realistic'

export default function Confetti() {
  return (
    <>
      <Fireworks autorun={{ speed: 1, duration: 500 }} />
    </>
  )
}
