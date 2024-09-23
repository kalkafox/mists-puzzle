import { atom, createStore } from 'jotai'

export const store = createStore()

export const difficultyAtom = atom(
  localStorage.getItem('difficulty') ?? 'normal',
)

export const difficultyAtomWithPersistence = atom(
  (get) => get(difficultyAtom),
  (get, set, newDifficulty: string) => {
    set(difficultyAtom, newDifficulty)
    localStorage.setItem('difficulty', newDifficulty)
  },
)

export const winsAtom = atom(parseInt(localStorage.getItem('wins') ?? '0') ?? 0)

export const winsAtomWithPersistence = atom(
  (get) => get(winsAtom),
  (get, set, wins: number) => {
    set(winsAtom, wins)
    localStorage.setItem('wins', wins.toString())
  },
)

export const lossesAtom = atom(
  parseInt(localStorage.getItem('losses') ?? '0') ?? 0,
)

export const lossesAtomWithPersistence = atom(
  (get) => get(lossesAtom),
  (get, set, losses: number) => {
    set(lossesAtom, losses)
    localStorage.setItem('losses', losses.toString())
  },
)

export const elapsedAtom = atom(
  parseInt(localStorage.getItem('elapsed') ?? '0') ?? 0,
)

export const elapsedAtomWithPersistence = atom(
  (get) => get(elapsedAtom),
  (get, set, elapsed: number) => {
    set(elapsedAtom, elapsed)
    localStorage.setItem('elapsed', elapsed.toString())
  },
)

export const reducedMotionAtom = atom(
  localStorage.getItem('reduceMotion') === 'true',
)

export const reducedMotionAtomWithPersistence = atom(
  (get) => get(reducedMotionAtom),
  (get, set, reducedMotion: boolean) => {
    set(reducedMotionAtom, reducedMotion)
    localStorage.setItem('reduceMotion', reducedMotion.toString())
  },
)
