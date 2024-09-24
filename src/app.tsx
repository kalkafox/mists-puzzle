import { useEffect, useRef, useState } from 'react'

import CountUp from 'react-countup'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { animated, useSpring, useSprings } from '@react-spring/web'
import { Button } from './components/ui/button'
import mistsIcons from './lib/mists-icons'
import { Difficulty, Item, Round } from './types/mists'

import { Icon } from '@iconify-icon/react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useAtom } from 'jotai'
import Confetti from './components/confetti'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components/ui/popover'
import { Separator } from './components/ui/separator'
import { Switch } from './components/ui/switch'
import { useToast } from './hooks/use-toast'
import {
  appSettingsAtomWithPersistence,
  statsAtomWithPersistence,
} from './lib/atom'

function getPuzzleRound(tries = 0): Round {
  // Shuffle the items to ensure randomness
  const shuffledItems = mistsIcons.sort(() => Math.random() - 0.5)

  // Pick the entrance item
  const entrance = shuffledItems[0]

  // Filter items to create a pool for choices
  const choicesPool = shuffledItems.slice(1) // Exclude the entrance item

  // Create a map to count occurrences of each attribute
  const attributeCount: Record<string, number> = {}

  // Count attributes from the entrance item
  entrance.attributes.forEach((attr) => {
    attributeCount[attr] = (attributeCount[attr] || 0) + 1
  })

  // Select 3 choices while avoiding duplicates and ensuring only one unique attribute
  const choices: Item[] = []

  while (choices.length < 3 && choicesPool.length > 0) {
    const index = Math.floor(Math.random() * choicesPool.length)
    const choice = choicesPool[index]

    // Ensure the choice is not a duplicate and doesn't match the entrance
    if (!choices.includes(choice) && choice.id !== entrance.id) {
      choices.push(choice)
      // Count the attributes for this choice
      choice.attributes.forEach((attr) => {
        attributeCount[attr] = (attributeCount[attr] || 0) + 1
      })
      // Remove the choice from the pool
      choicesPool.splice(index, 1)
    }
  }

  // Find the unique attribute
  const uniqueAttributes = Object.keys(attributeCount).filter(
    (attr) => attributeCount[attr] === 1,
  )

  // Ensure we have a unique attribute
  if (uniqueAttributes.length === 0) {
    return getPuzzleRound(++tries) // Retry if no unique attribute is found
  }

  const uniqueAttribute = uniqueAttributes[0] // Take the first unique attribute

  // Find the choice that contains the unique attribute
  const correctChoice = choices.find((choice) =>
    choice.attributes.includes(uniqueAttribute),
  )

  // Ensure we always return a valid choice
  if (!correctChoice) {
    return getPuzzleRound(++tries) // Retry if no correct choice is found
  }

  return { entrance, choices, correctChoice, tries }
}

function shuffleArray(array: Item[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function App() {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const { toast } = useToast()

  const [round, setRound] = useState({
    entrance: { id: '', attributes: [''] },
    choices: [{}, {}, {}],
    correctChoice: { id: '', attributes: [''] },
  } as Round)

  const [selected, setSelected] = useState<Item | null>(null)

  const [correct, setCorrect] = useState(false)

  const [items, setItems] = useState<Item[]>([])

  const [roundTransition, setRoundTransition] = useState(false)

  const [time, setTime] = useState(0)

  const [newRecord, setNewRecord] = useState(false)

  const [appSettings, setAppSettings] = useAtom(appSettingsAtomWithPersistence)

  const [stats, setStats] = useAtom(statsAtomWithPersistence)

  const [mistsSprings, api] = useSprings(
    4,
    () => ({
      from: { opacity: 0, top: appSettings.reducedMotion ? 0 : -50 },
    }),
    [],
  )

  const [submitPuzzleSpring, setSubmitPuzzleSpring] = useSpring(() => ({
    from: {
      opacity: 0,
      top: 10,
    },
    config: {
      friction: 10,
    },
  }))

  const [mistForegroundSpring, setMistForegroundSpring] = useSpring(() => ({
    from: {
      opacity: 0.1,
    },
  }))

  const [checkmarkSpring, checkmarkSpringApi] = useSpring(() => ({
    opacity: 0,
  }))

  const [roundSpring, roundSpringApi] = useSpring(() => ({
    opacity: 1,
    scale: 1,
  }))

  useEffect(() => {
    setRoundTransition(true)
    const round = getPuzzleRound()
    setRound(round)

    setItems(() => shuffleArray([...round.choices, round.entrance]))

    console.log(`Took ${round.tries} tries.`)

    api.start((a) => ({
      opacity: 1,
      top: 0,
      delay: 500 + a * 100,
      onRest: () => {
        setRoundTransition(false)
        setTime(Date.now())
      },
    }))
  }, [])

  useEffect(() => {
    if (selected) {
      setSubmitPuzzleSpring.start({
        opacity: 1,
        top: 0,
      })
    }
  }, [selected])

  return (
    <>
      <animated.div
        style={mistForegroundSpring}
        className="fixed h-full w-full"
      >
        <div id="foglayer_01" className="fog">
          <div className="image01"></div>
          <div className="image02"></div>
        </div>
        <div id="foglayer_02" className="fog">
          <div className="image01"></div>
          <div className="image02"></div>
        </div>
        <div id="foglayer_03" className="fog">
          <div className="image01"></div>
          <div className="image02"></div>
        </div>
        <div className="h-full w-full bg-slate-600/50"></div>
      </animated.div>

      {newRecord && <Confetti />}
      <div className="fixed h-full w-full">
        <animated.div
          style={checkmarkSpring}
          className="relative flex justify-center"
        >
          {roundTransition ? (
            <DotLottieReact
              className="h-20 w-20"
              src={`${correct ? 'checkmark.lottie' : 'x.lottie'}`}
              autoplay
            />
          ) : (
            <div className="h-20 w-20" />
          )}
        </animated.div>
        <animated.div
          className="m-4 items-center justify-center"
          style={roundSpring}
        >
          <div className="m-4 flex items-center justify-center">
            {items.length > 0 &&
              mistsSprings.map((props, i) => (
                <animated.div
                  style={props}
                  className={`relative m-2 select-none transition-transform ${selected === items[i] && 'scale-110'} ${!roundTransition && 'hover:scale-110'}`}
                  key={items[i].id}
                >
                  <button
                    ref={(el) => (buttonRefs.current[i] = el)}
                    disabled={roundTransition}
                    onMouseMove={(e) => {
                      if (roundTransition) return
                      e.currentTarget.classList.remove('blur-xl')
                    }}
                    onMouseEnter={(e) => {
                      if (roundTransition) return

                      e.currentTarget.classList.remove('blur-xl')

                      if (appSettings.difficulty !== 'hard') return

                      buttonRefs.current
                        .filter((el) => el !== e.currentTarget)
                        .map((e) => {
                          e?.classList.add('blur-xl')
                        })
                    }}
                    onMouseLeave={(e) => {
                      if (roundTransition) return
                      if (appSettings.difficulty !== 'hard') return
                      if (selected !== items[i]) {
                        e.currentTarget.classList.add('blur-xl')
                      }

                      buttonRefs.current.map((e, index) => {
                        if (selected === items[index]) {
                          e?.classList.remove('blur-xl')
                        }
                      })
                    }}
                    className={`transition-all border-2 p-2 rounded-full ${
                      selected === items[i]
                        ? 'hover:border-white'
                        : 'hover:border-white/20'
                    } ${
                      appSettings.difficulty === 'hard' && selected !== items[i]
                        ? 'blur-xl'
                        : ''
                    } ${
                      selected === items[i]
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                    onClick={() => {
                      setSelected(items[i])
                    }}
                  >
                    <img src={`${items[i].id}.png`} />
                  </button>
                </animated.div>
              ))}
          </div>
          <div className="m-4 flex items-center justify-center">
            {selected && (
              <animated.div style={submitPuzzleSpring} className="relative">
                <Button
                  onClick={async () => {
                    console.log('yo')

                    const isCorrect = selected === round.correctChoice

                    setRoundTransition(true)
                    setCorrect(isCorrect)

                    checkmarkSpringApi.set({ opacity: 0 })
                    checkmarkSpringApi.start({
                      opacity: 1,
                    })

                    if (!isCorrect) {
                      setMistForegroundSpring.start({
                        opacity: 1,
                      })
                      // setLosses(losses + 1)
                      setStats({
                        ...stats,
                        [appSettings.difficulty]: {
                          ...stats[appSettings.difficulty],
                          losses: stats[appSettings.difficulty].losses + 1,
                        },
                      })
                    } else {
                      const newElapsed = Date.now() - time
                      console.log(newElapsed)
                      console.log(stats[appSettings.difficulty].elapsed)

                      // extremely fucking dumb
                      let setWin = false

                      if (
                        newElapsed < stats[appSettings.difficulty].elapsed ||
                        stats[appSettings.difficulty].elapsed === 0
                      ) {
                        // setElapsed(newElapsed)
                        setStats({
                          ...stats,
                          [appSettings.difficulty]: {
                            elapsed: newElapsed,
                            wins: stats[appSettings.difficulty].wins + 1,
                          },
                        })

                        setWin = true

                        setNewRecord(true)
                        toast({
                          description: 'A new record!',
                        })

                        //console.log(stats[appSettings.difficulty].elapsed)
                      }

                      if (!setWin) {
                        setStats({
                          ...stats,
                          [appSettings.difficulty]: {
                            ...stats[appSettings.difficulty],
                            wins: stats[appSettings.difficulty].wins + 1,
                          },
                        })
                      }

                      // setWins(wins + 1)
                    }

                    if (!appSettings.reducedMotion) {
                      setSubmitPuzzleSpring.start({
                        opacity: 0,
                        top: 10,
                      })

                      await Promise.all([
                        roundSpring.opacity.start(0),
                        roundSpring.scale.start(isCorrect ? 1.1 : 0.9),
                      ])

                      roundSpringApi.set({
                        opacity: 0,
                        scale: 1,
                      })
                    }

                    setSelected(null)

                    const newRound = getPuzzleRound()
                    setRound(newRound)
                    setItems(() =>
                      shuffleArray([newRound.entrance, ...newRound.choices]),
                    )

                    roundSpringApi.set({ scale: 0.9, opacity: 0 })
                    roundSpringApi.start({
                      opacity: 1,
                      scale: 1,
                    })

                    mistsSprings.map((a) => {
                      a.opacity.set(0)
                      a.top.set(appSettings.reducedMotion ? 0 : -50)
                    })

                    setMistForegroundSpring.start({
                      opacity: 0.1,
                    })

                    api.start((i) => ({
                      top: 0,
                      opacity: 1,
                      delay: i * 100,
                      onRest: () => {
                        checkmarkSpringApi.start({
                          opacity: 0,
                          onRest: () => {
                            setRoundTransition(false)
                            setTime(Date.now())
                            setTimeout(() => setNewRecord(false), 5000)
                          },
                        })
                      },
                    }))
                  }}
                >
                  <Icon
                    width={24}
                    className="inline"
                    inline={true}
                    icon="formkit:submit"
                  />
                </Button>
              </animated.div>
            )}
          </div>
        </animated.div>
        <div className="fixed bottom-0 right-2 rounded-lg">
          <Popover>
            <PopoverTrigger>
              <DotLottieReact
                width={40}
                height={40}
                src={`settings.lottie`}
                autoplay
                loop
              />
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex items-center justify-between space-x-2 rounded-lg p-2">
                <b>Difficulty</b>
                <Select
                  value={appSettings.difficulty}
                  onValueChange={(e: Difficulty) => {
                    //setDifficulty(e)
                    setAppSettings({
                      ...appSettings,
                      difficulty: e,
                    })
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a difficulty..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="my-1 flex justify-center space-x-2 rounded-lg p-2">
                <Switch
                  checked={appSettings.reducedMotion}
                  onCheckedChange={(e) =>
                    setAppSettings({ ...appSettings, reducedMotion: e })
                  }
                />
                <div>Reduce motion</div>
              </div>
              <div className="my-2 flex justify-center space-x-2 rounded-lg p-2">
                <Switch
                  checked={appSettings.warnBeforeReset}
                  onCheckedChange={(e) =>
                    setAppSettings({ ...appSettings, warnBeforeReset: e })
                  }
                />
                <div>Warn before reset</div>
              </div>
              <div className="my-2 flex justify-center space-x-2">
                <AlertDialog>
                  {!appSettings.warnBeforeReset ? (
                    <AlertDialogTrigger className="rounded-lg bg-stone-800 p-2">
                      Reset Scoreboard
                    </AlertDialogTrigger>
                  ) : (
                    <button
                      onClick={() => {
                        setStats({
                          ...stats,
                          [appSettings.difficulty]: {
                            wins: 0,
                            losses: 0,
                            elapsed: 0,
                          },
                        })
                      }}
                      className="rounded-lg bg-stone-800 p-2"
                    >
                      Reset Scoreboard
                    </button>
                  )}
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        clear your score. There's no going back!
                        <div className="flex space-x-2 items-center absolute bottom-0 my-8">
                          <Switch
                            checked={appSettings.warnBeforeReset}
                            onCheckedChange={(e) =>
                              setAppSettings({
                                ...appSettings,
                                warnBeforeReset: e,
                              })
                            }
                          />
                          <span>Don't show me again</span>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setStats({
                            ...stats,
                            [appSettings.difficulty]: {
                              wins: 0,
                              losses: 0,
                              elapsed: 0,
                            },
                          })
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="fixed bottom-0 m-2">
          <a href="https://github.com/kalkafox/mists-puzzle" target="_blank">
            <DotLottieReact
              width={24}
              height={24}
              src={`github.lottie`}
              autoplay
              loop
            />
          </a>
        </div>
        <div className="fixed bottom-0 -z-10 my-2 flex w-full justify-center">
          <div className="w-48 rounded-lg bg-slate-800/20 p-2 backdrop-blur-lg">
            <Icon
              width={24}
              className="flex justify-center"
              inline={true}
              icon="ic:baseline-sports-score"
            />
            <div className="flex justify-center">
              {appSettings.difficulty.charAt(0).toUpperCase() +
                appSettings.difficulty.slice(1)}
            </div>
            <Separator className="my-2" />
            <div className="flex items-center space-x-2 rounded-lg bg-slate-800 p-2">
              <Icon
                width={24}
                className="inline text-green-400"
                inline={true}
                icon="carbon:checkmark-filled"
              />
              <b>
                <CountUp
                  end={stats[appSettings.difficulty].wins}
                  preserveValue
                />
              </b>
            </div>
            <div className="my-1 flex items-center space-x-2 rounded-lg bg-slate-800 p-2">
              <Icon
                width={24}
                className="inline text-red-400"
                inline={true}
                icon="codicon:error"
              />
              <b>
                <CountUp
                  end={stats[appSettings.difficulty].losses}
                  preserveValue
                />
              </b>
            </div>
            {stats[appSettings.difficulty].elapsed > 0 ? (
              <div className="my-1 flex items-center space-x-2 rounded-lg bg-slate-800 p-2">
                <Icon
                  width={24}
                  className="inline"
                  inline={true}
                  icon="mingcute:time-fill"
                />
                <b>
                  <CountUp
                    end={stats[appSettings.difficulty].elapsed}
                    preserveValue
                    suffix="ms"
                  />
                </b>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
