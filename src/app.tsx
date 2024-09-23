import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { ThemeProvider } from './components/theme-provider'

import mistsIcons from './lib/mists-icons'
import { Item, Round } from './types/mists'
import {
  animated,
  useSpring,
  useSprings,
  useTransition,
} from '@react-spring/web'
import { Button } from './components/ui/button'
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

import {
  DotLottie,
  DotLottieReact,
  DotLottieReactProps,
} from '@lottiefiles/dotlottie-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components/ui/popover'
import { useAtom } from 'jotai'
import { difficultyAtom, difficultyAtomWithPersistence } from './lib/atom'

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
    return getPuzzleRound(tries++) // Retry if no unique attribute is found
  }

  const uniqueAttribute = uniqueAttributes[0] // Take the first unique attribute

  // Find the choice that contains the unique attribute
  const correctChoice = choices.find((choice) =>
    choice.attributes.includes(uniqueAttribute),
  )

  // Ensure we always return a valid choice
  if (!correctChoice) {
    return getPuzzleRound(tries++) // Retry if no correct choice is found
  }

  return { entrance, choices, correctChoice, tries }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function App() {
  const lottieRef = useRef<HTMLCanvasElement>(null)
  const [difficulty, setDifficulty] = useAtom(difficultyAtomWithPersistence)

  const [round, setRound] = useState({
    entrance: { id: '', attributes: [''] },
    choices: [{}, {}, {}],
    correctChoice: { id: '', attributes: [''] },
  } as Round)

  const [selected, setSelected] = useState<Item | null>(null)

  const [correct, setCorrect] = useState(false)

  const [items, setItems] = useState<Item[]>([])

  const [roundTransition, setRoundTransition] = useState(false)

  const [settingsOpen, setSettingsOpen] = useState(false)

  const [mistsSprings, api] = useSprings(
    4,
    () => ({
      from: { opacity: 0, top: -50 },
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
      opacity: 0,
      display: 'none',
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

    console.log(round)

    console.log(round.correctChoice)

    console.log(`Took ${round.tries} tries.`)

    api.start((a, i) => ({
      opacity: 1,
      top: 0,
      delay: 500 + a * 100,
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
        className='fixed w-full h-full'>
        <div id='foglayer_01' className='fog'>
          <div className='image01'></div>
          <div className='image02'></div>
        </div>
        <div id='foglayer_02' className='fog'>
          <div className='image01'></div>
          <div className='image02'></div>
        </div>
        <div id='foglayer_03' className='fog'>
          <div className='image01'></div>
          <div className='image02'></div>
        </div>
        <div className='bg-slate-600/50 w-full h-full'></div>
      </animated.div>
      <div className='fixed w-full h-full'>
        {/* {round.choices.map((key) => (
          <button
            className={`hover:opacity-100 opacity-50 hover:border-2 hover:border-white rounded-full transition-all border-2 ${
              selected === key ? 'border-white' : 'border-transparent'
            }`}
            key={key.id}
            onClick={() => {
              console.log(round)
              console.log(correctChoice)
              setSelected(key)
            }}>
            <img src={`${key.id}.png`} />
          </button>
        ))} */}
        <animated.div
          style={checkmarkSpring}
          className='relative flex justify-center'>
          {roundTransition ? (
            <DotLottieReact
              className='w-20 h-20'
              src={`${correct ? 'checkmark.lottie' : 'x.lottie'}`}
              autoplay
            />
          ) : (
            <div className='w-20 h-20' />
          )}
        </animated.div>
        <animated.div
          className='m-4 items-center justify-center'
          style={roundSpring}>
          <div className='flex m-4 items-center justify-center'>
            {items.length > 0 &&
              mistsSprings.map((props, i) => (
                <animated.button
                  style={props}
                  className={`m-2 hover:opacity-100 relative opacity-50 ${
                    !roundTransition && 'hover:border-white'
                  } ${
                    !roundTransition ? 'transition-all' : ''
                  } rounded-full border-2 p-2 ${
                    difficulty === 'hard' ? 'blur-xl' : ''
                  } ${
                    selected === items[i]
                      ? 'border-white'
                      : 'border-transparent'
                  }`}
                  key={items[i].id}
                  onClick={() => {
                    console.log(round)
                    console.log(round.correctChoice)
                    setSelected(items[i])
                  }}>
                  <img src={`${items[i].id}.png`} />
                </animated.button>
              ))}
          </div>
          <div className='flex m-4 items-center justify-center'>
            {selected && (
              <animated.div style={submitPuzzleSpring} className='relative'>
                <Button
                  disabled={roundTransition}
                  onClick={async () => {
                    console.log(selected)
                    console.log(round.correctChoice)

                    const isCorrect = selected === round.correctChoice

                    setCorrect(isCorrect)

                    setRoundTransition(true)

                    checkmarkSpringApi.start({
                      opacity: 1,
                    })

                    if (!isCorrect) {
                      setMistForegroundSpring.start({
                        opacity: 1,
                        display: 'block',
                      })
                    }

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

                    setSelected(null)

                    const newRound = getPuzzleRound()
                    setRound(newRound)
                    setItems(() =>
                      shuffleArray([newRound.entrance, ...newRound.choices]),
                    )

                    roundSpringApi.set({ scale: 0.9, opacity: 0 })
                    roundSpringApi.start({ opacity: 1, scale: 1 })

                    mistsSprings.map((a, b, c) => {
                      a.opacity.set(0)
                      a.top.set(-50)
                    })

                    setMistForegroundSpring.start({
                      opacity: 0,
                      onRest: (a, b) => {
                        b.start({
                          display: 'none',
                        })
                      },
                    })

                    api.start((i, b) => ({
                      top: 0,
                      opacity: 1,
                      delay: i * 100,
                    }))

                    checkmarkSpringApi.start({
                      opacity: 0,
                      onRest: () => {
                        setRoundTransition(false)
                      },
                    })
                  }}>
                  Submit
                </Button>
              </animated.div>
            )}
          </div>
        </animated.div>
        <div className='fixed bottom-0 right-2 rounded-lg'>
          <Popover
            onOpenChange={(a) => {
              console.log(a)
              setSettingsOpen(a)
            }}>
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
              <div className='flex items-center justify-between'>
                <b>Difficulty</b>
                <Select
                  value={difficulty}
                  onValueChange={(e) => {
                    setDifficulty(e)
                  }}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select a difficulty...' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='normal'>Normal</SelectItem>
                    <SelectItem value='hard'>Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex justify-center my-2'>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button>Reset Scoreboard</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        clear your score. There's no going back!
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className='fixed bottom-0 m-2'>
          <a href='https://github.com/kalkafox/mists-puzzle' target='_blank'>
            <DotLottieReact
              width={24}
              height={24}
              src={`github.lottie`}
              autoplay
              loop
            />
          </a>
        </div>
      </div>
    </>
  )
}

export default App
