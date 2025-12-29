import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import './App.css'
import drillImg from './assets/jackhammer.png'

type QuestionType = 'add20' | 'sub20' | 'mul9'

type Question = {
  a: number
  b: number
  operand: '+' | '-' | '×'
  type: QuestionType
  answer: number
}

type TestConfig = {
  id: string
  name: string
  types: QuestionType[]
}

type Response = {
  question: Question
  userAnswer: number
  correct: boolean
}

const PRESET_TESTS: TestConfig[] = [
  { id: 'add', name: 'Addition to 20', types: ['add20'] },
  { id: 'sub', name: 'Subtraction to 20', types: ['sub20'] },
  { id: 'mul', name: 'Multiplication to 9', types: ['mul9'] },
]

const QUESTION_COUNT = 10

const buildQuestion = (type: QuestionType): Question => {
  if (type === 'add20') {
    const a = Math.floor(Math.random() * 10)
    const b = Math.floor(Math.random() * 10)
    return { a, b, operand: '+', type, answer: a + b }
  }

  if (type === 'sub20') {
    const a = Math.floor(Math.random() * 21)
    const b = Math.floor(Math.random() * (a + 1))
    return { a, b, operand: '-', type, answer: a - b }
  }

  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { a, b, operand: '×', type: 'mul9', answer: a * b }
}

const buildQuestionSet = (types: QuestionType[], count = QUESTION_COUNT) => {
  const list: Question[] = []
  for (let i = 0; i < count; i += 1) {
    const choice = types[Math.floor(Math.random() * types.length)]
    list.push(buildQuestion(choice))
  }
  return list
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatTimeMs = (ms: number) => {
  const totalSeconds = ms / 1000
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  const millis = Math.floor(ms % 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}.${millis
    .toString()
    .padStart(3, '0')}`
}

type View = 'home' | 'test' | 'results'

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedTest, setSelectedTest] = useState<TestConfig | null>(null)
  const [customTypes, setCustomTypes] = useState<QuestionType[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [countdownActive, setCountdownActive] = useState(false)
  const [testActive, setTestActive] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [totalTimeMs, setTotalTimeMs] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')
  const [overlay, setOverlay] = useState<'correct' | 'wrong' | null>(null)
  const [awaitingNext, setAwaitingNext] = useState(false)

  const answerInputRef = useRef<HTMLInputElement | null>(null)
  const countdownRef = useRef<number | null>(null)
  const stopwatchRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const resetTimers = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
    if (stopwatchRef.current) {
      clearInterval(stopwatchRef.current)
    }
  }

  useEffect(() => {
    return () => resetTimers()
  }, [])

  useEffect(() => {
    if (testActive && !countdownActive) {
      answerInputRef.current?.focus()
    }
  }, [currentIndex, testActive, countdownActive])

  const startStopwatch = () => {
    if (stopwatchRef.current) {
      clearInterval(stopwatchRef.current)
    }
    startTimeRef.current = performance.now()
    setElapsedMs(0)
    stopwatchRef.current = window.setInterval(() => {
      if (startTimeRef.current !== null) {
        const ms = performance.now() - startTimeRef.current
        setElapsedMs(ms)
      }
    }, 100)
  }

  const startCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
    startTimeRef.current = null
    setCountdown(3)
    setCountdownActive(true)
    setTestActive(false)
    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current)
          }
          setCountdownActive(false)
          setTestActive(true)
          startStopwatch()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startTest = (config: TestConfig) => {
    const questionSet = buildQuestionSet(config.types)
    resetTimers()
    setSelectedTest(config)
    setQuestions(questionSet)
    setResponses([])
    setCurrentIndex(0)
    setAnswer('')
    setOverlay(null)
    setAwaitingNext(false)
    setElapsedMs(0)
    setTotalTimeMs(null)
    setView('test')
    startCountdown()
  }

  const goHome = (event?: MouseEvent<HTMLAnchorElement>) => {
    if (event) event.preventDefault()
    resetTimers()
    setCountdownActive(false)
    setTestActive(false)
    setOverlay(null)
    setAwaitingNext(false)
    setView('home')
  }

  const finishTest = () => {
    setTestActive(false)
    if (stopwatchRef.current) {
      clearInterval(stopwatchRef.current)
    }
    const msTaken = startTimeRef.current
      ? performance.now() - startTimeRef.current
      : elapsedMs
    setTotalTimeMs(msTaken)
    setView('results')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!testActive || awaitingNext) return
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return
    if (answer.trim() === '') return

    const numericAnswer = Number(answer)
    const isCorrect = numericAnswer === currentQuestion.answer
    const updatedResponses = [
      ...responses,
      { question: currentQuestion, userAnswer: numericAnswer, correct: isCorrect },
    ]
    const isLast = updatedResponses.length === questions.length
    const delay = isCorrect ? 300 : 1000

    setOverlay(isCorrect ? 'correct' : 'wrong')
    setAwaitingNext(true)
    setResponses(updatedResponses)

    setTimeout(() => {
      setOverlay(null)
      setAwaitingNext(false)
      setAnswer('')
      if (isLast) {
        finishTest()
      } else {
        setCurrentIndex((idx) => idx + 1)
      }
    }, delay)
  }

  const handleTryAgain = () => {
    if (selectedTest) {
      startTest(selectedTest)
    }
  }

  const handleCustomToggle = (type: QuestionType) => {
    setCustomTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    )
  }

  const score = responses.filter((r) => r.correct).length

  const testHeader = selectedTest ? selectedTest.name : 'Math Test'
  const currentQuestion = questions[currentIndex]

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <a href="#" className="hero-link" onClick={(e) => goHome(e)}>
            <h1>Math Drills</h1>
          </a>
        </div>
        <div className="drill-art">
          <img src={drillImg} alt="Illustration of a floor drill tool" />
        </div>
      </header>

      {view === 'home' && (
        <div className="panel-grid">
          <section className="panel">
            <div className="panel-head">
              <h2>Ready-made sets</h2>
            </div>
            <div className="preset-grid">
              {PRESET_TESTS.map((preset) => (
                <div key={preset.id} className="card">
                  <div>
                    <p className="chip">10 questions</p>
                    <h3>{preset.name}</h3>
                    <p className="muted">
                      {preset.types[0] === 'add20' && 'Numbers 0-9, all addition.'}
                      {preset.types[0] === 'sub20' && 'Numbers 0-20 with a fair subtraction mix.'}
                      {preset.types[0] === 'mul9' && 'Times tables up to 9.'}
                    </p>
                  </div>
                  <button className="primary" onClick={() => startTest(preset)}>
                    Start
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Build your own!</h2>
            </div>
            <div className="custom-grid">
              {(['add20', 'sub20', 'mul9'] as QuestionType[]).map((type) => (
                <label key={type} className={`picker ${customTypes.includes(type) ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={customTypes.includes(type)}
                    onChange={() => handleCustomToggle(type)}
                  />
                  <div>
                    <strong>
                      {type === 'add20' && 'Addition to 20'}
                      {type === 'sub20' && 'Subtraction to 20'}
                      {type === 'mul9' && 'Multiplication to 9'}
                    </strong>
                    <span className="muted small">
                      {type === 'add20' && '0-9 with +'}
                      {type === 'sub20' && '0-20 with -'}
                      {type === 'mul9' && '1-9 with ×'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <button
              className="primary wide"
              onClick={() =>
                startTest({
                  id: 'custom',
                  name: 'Custom Mix',
                  types: customTypes,
                })
              }
              disabled={customTypes.length === 0}
            >
              Start custom test
            </button>
          </section>
        </div>
      )}

      {view === 'test' && (
        <section className="test-area">
          <div className="top-row">
            <div>
              <p className="muted small">Now playing</p>
              <h2>{testHeader}</h2>
            </div>
            <div className="stopwatch">
              <span className="dot" />
              <span>{formatTime(elapsedMs / 1000)}</span>
            </div>
          </div>

          <div className="status-row">
            <div className="counter">
              Question <strong>{currentIndex + 1}</strong>/<span>{QUESTION_COUNT}</span>
            </div>
            {countdownActive && <div className="countdown-pill">Starting in {countdown}</div>}
          </div>

          <div className="question-card">
            {countdownActive && <div className="countdown-frosted">{countdown}</div>}
            {!countdownActive && currentQuestion && (
              <form onSubmit={handleSubmit} className="question-form">
                <p className="muted small">Solve this</p>
                <div className="equation">
                  <span>{currentQuestion.a}</span>
                  <span className="operand">{currentQuestion.operand}</span>
                  <span>{currentQuestion.b}</span>
                  <span className="operand">=</span>
                  <input
                    ref={answerInputRef}
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="?"
                    disabled={!testActive}
                  />
                </div>
                <div className="actions">
                  <button type="submit" className="primary" disabled={!testActive || awaitingNext}>
                    Submit
                  </button>
                  <p className="muted small">Press Enter or tap Submit</p>
                </div>
                {overlay && (
                  <div className={`overlay question-overlay ${overlay}`}>
                    <span>{overlay === 'correct' ? 'O' : 'X'}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </section>
      )}

      {view === 'results' && (
        <section className="results">
          <div className="results-head">
            <div>
              <p className="eyebrow">Finished</p>
              <h2>Nice run!</h2>
              <p className="muted">Review your answers and jump back in.</p>
            </div>
            <div className="summary">
              <div>
                <p className="muted small">Score</p>
                <h3>
                  {score}/{QUESTION_COUNT}
                </h3>
              </div>
              <div>
                <p className="muted small">Time</p>
                <h3>
                  {totalTimeMs !== null ? formatTimeMs(totalTimeMs) : formatTimeMs(elapsedMs)}
                </h3>
              </div>
            </div>
          </div>
          <div className="review">
            {responses.map((entry, idx) => {
              const { question, userAnswer, correct } = entry
              return (
                <div key={`${question.type}-${idx}`} className="review-row">
                  <div className="tag">{idx + 1}</div>
                  <div className="equation review-text">
                    <span>{question.a}</span>
                    <span className="operand">{question.operand}</span>
                    <span>{question.b}</span>
                    <span className="operand">=</span>
                    <span className={correct ? 'correct' : 'wrong'}>{userAnswer}</span>
                    {!correct && (
                      <>
                        <span className="operand muted">/</span>
                        <span className="correct"> {question.answer}</span>
                      </>
                    )}
                  </div>
                  <div className={`mark ${correct ? 'yes' : 'no'}`}>
                    {correct ? 'Correct' : 'Missed'}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="results-actions">
            <button className="primary" onClick={handleTryAgain}>
              Try again
            </button>
            <button className="ghost" onClick={() => setView('home')}>
              Choose a new test
            </button>
          </div>
        </section>
      )}

    </div>
  )
}

export default App
