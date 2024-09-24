import { Difficulty } from '@/types/mists'
import { atom, createStore } from 'jotai'

export const store = createStore()

interface UserStats {
  normal: Stats
  hard: Stats
}

interface Stats {
  wins: number
  losses: number
  elapsed: number
}

interface AppSettings {
  difficulty: Difficulty
  reducedMotion: boolean
  warnBeforeReset: boolean
  showCorrect: boolean
  showCorrectDuration: number
}

const createStats = () => ({ wins: 0, losses: 0, elapsed: 0 })

export const statsAtom = atom(
  JSON.parse(localStorage.getItem('stats')!) ??
    ({
      normal: createStats(),
      hard: createStats(),
    } as UserStats),
)

export const statsAtomWithPersistence = atom(
  (get) => get(statsAtom) as UserStats,
  (_, set, stats: UserStats) => {
    set(statsAtom, stats)
    localStorage.setItem('stats', JSON.stringify(stats))
  },
)

export const appSettingsAtom = atom(
  (JSON.parse(localStorage.getItem('appSettings')!) as AppSettings) ?? {
    difficulty: 'normal',
    reducedMotion: false,
    warnBeforeReset: false,
    showCorrect: true,
    showCorrectDuration: 1000,
  },
)

export const appSettingsAtomWithPersistence = atom(
  (get) => get(appSettingsAtom),
  (_, set, appSettings: AppSettings) => {
    set(appSettingsAtom, appSettings)
    localStorage.setItem('appSettings', JSON.stringify(appSettings))
  },
)

export const difficultyAtom = atom<Difficulty>(
  (localStorage.getItem('difficulty') as Difficulty) ?? 'normal',
)

export const difficultyAtomWithPersistence = atom(
  (get) => get(difficultyAtom),
  (_, set, newDifficulty: Difficulty) => {
    set(difficultyAtom, newDifficulty)
    localStorage.setItem('difficulty', newDifficulty)
  },
)

export const reducedMotionAtom = atom(
  localStorage.getItem('reduceMotion') === 'true',
)

export const reducedMotionAtomWithPersistence = atom(
  (get) => get(reducedMotionAtom),
  (_, set, reducedMotion: boolean) => {
    set(reducedMotionAtom, reducedMotion)
    localStorage.setItem('reduceMotion', reducedMotion.toString())
  },
)
