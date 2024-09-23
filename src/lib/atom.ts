import { atom, createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

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
