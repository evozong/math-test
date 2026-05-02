'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { TestConfig, Question, TestResponse } from '../lib/types'
import { SET_MAP } from '../lib/types'
import { buildQuestionSet, buildStaminaPool, QUESTION_COUNT } from '../lib/questions'

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
  return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`
}

type Phase = 'idle' | 'countdown' | 'active' | 'results'

export default function TestRunner({ config }: { config: TestConfig }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoStart = searchParams.has('autoStart')
  const isStamina = searchParams.get('mode') === 'stamina'
  const staminaSettings = config.types.reduce(
    (acc, t) => {
      const s = SET_MAP.get(t)?.stamina ?? { startSecs: 30, bonusSecs: 5 }
      return { startSecs: Math.max(acc.startSecs, s.startSecs), bonusSecs: Math.max(acc.bonusSecs, s.bonusSecs) }
    },
    { startSecs: 0, bonusSecs: 0 }
  )
  const staminaStartSecs = staminaSettings.startSecs
  const staminaBonusSecs = staminaSettings.bonusSecs

  const [phase, setPhase] = useState<Phase>(() => (autoStart ? 'countdown' : 'idle'))
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (!autoStart) return []
    return isStamina ? buildStaminaPool(config.types) : buildQuestionSet(config.types)
  })
  const [responses, setResponses] = useState<TestResponse[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [totalTimeMs, setTotalTimeMs] = useState<number | null>(null)
  const [staminaMs, setStaminaMs] = useState(0)
  const [answer, setAnswer] = useState('')
  const [remainderAnswer, setRemainderAnswer] = useState('')
  const [overlay, setOverlay] = useState<'correct' | 'wrong' | null>(null)
  const [awaitingNext, setAwaitingNext] = useState(false)
  const [bonusFlash, setBonusFlash] = useState<number | null>(null)

  const answerInputRef = useRef<HTMLInputElement | null>(null)
  const remainderInputRef = useRef<HTMLInputElement | null>(null)
  const countdownRef = useRef<number | null>(null)
  const stopwatchRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const staminaMsRef = useRef<number>(0)

  const clearTimers = () => {
    if (countdownRef.current !== null) { clearInterval(countdownRef.current); countdownRef.current = null }
    if (stopwatchRef.current !== null) { clearInterval(stopwatchRef.current); stopwatchRef.current = null }
  }

  const startStopwatch = () => {
    if (stopwatchRef.current !== null) clearInterval(stopwatchRef.current)
    startTimeRef.current = performance.now()
    setElapsedMs(0)
    stopwatchRef.current = window.setInterval(() => {
      setElapsedMs(performance.now() - startTimeRef.current!)
    }, 100)
  }

  const startStaminaTimer = (initialMs: number) => {
    if (stopwatchRef.current !== null) clearInterval(stopwatchRef.current)
    staminaMsRef.current = initialMs
    setStaminaMs(initialMs)
    stopwatchRef.current = window.setInterval(() => {
      const next = Math.max(0, staminaMsRef.current - 100)
      staminaMsRef.current = next
      setStaminaMs(next)
      if (next <= 0) {
        clearInterval(stopwatchRef.current!)
        stopwatchRef.current = null
        setPhase('results')
      }
    }, 100)
  }

  const startCountdownInterval = (onStart: () => void) => {
    if (countdownRef.current !== null) clearInterval(countdownRef.current)
    countdownRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          onStart()
          setPhase('active')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (autoStart) {
      startCountdownInterval(isStamina
        ? () => startStaminaTimer(staminaStartSecs * 1000)
        : startStopwatch)
    }
    return clearTimers
  }, [])

  useEffect(() => {
    if (phase === 'active') answerInputRef.current?.focus()
  }, [currentIndex, phase])

  const startTest = () => {
    clearTimers()
    setQuestions(isStamina ? buildStaminaPool(config.types) : buildQuestionSet(config.types))
    setResponses([])
    setCurrentIndex(0)
    setAnswer('')
    setRemainderAnswer('')
    setOverlay(null)
    setAwaitingNext(false)
    setElapsedMs(0)
    setTotalTimeMs(null)
    setStaminaMs(0)
    setCountdown(3)
    setPhase('countdown')
    startCountdownInterval(isStamina
      ? () => startStaminaTimer(staminaStartSecs * 1000)
      : startStopwatch)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (phase !== 'active' || awaitingNext) return
    const q = questions[currentIndex]
    if (!q || answer.trim() === '') return

    const isRemainder = q.remainder !== undefined
    if (isRemainder && remainderAnswer.trim() === '') {
      remainderInputRef.current?.focus()
      return
    }

    const num = Number(answer)
    const rem = isRemainder ? Number(remainderAnswer) : undefined
    const correct = isRemainder
      ? num === q.answer && rem === q.remainder
      : num === q.answer
    const updated = [...responses, { question: q, userAnswer: num, userRemainder: rem, correct }]
    const isLast = !isStamina && updated.length === questions.length
    const delay = correct ? 300 : 1000

    if (isStamina && correct) {
      const bonus = SET_MAP.get(q.type)?.stamina.bonusSecs ?? staminaBonusSecs
      staminaMsRef.current += bonus * 1000
      setStaminaMs(staminaMsRef.current)
      setBonusFlash(bonus)
      setTimeout(() => setBonusFlash(null), 900)
    }

    setOverlay(correct ? 'correct' : 'wrong')
    setAwaitingNext(true)
    setResponses(updated)

    setTimeout(() => {
      setOverlay(null)
      setAwaitingNext(false)
      setAnswer('')
      setRemainderAnswer('')
      if (isLast) {
        if (stopwatchRef.current !== null) { clearInterval(stopwatchRef.current); stopwatchRef.current = null }
        setTotalTimeMs(startTimeRef.current !== null ? performance.now() - startTimeRef.current : 0)
        setPhase('results')
      } else {
        setCurrentIndex(i => i + 1)
      }
    }, delay)
  }

  const handleQuotientKeyDown = (e: KeyboardEvent<HTMLInputElement>, q: Question) => {
    if (e.key === 'Enter' && q.remainder !== undefined && remainderAnswer.trim() === '') {
      e.preventDefault()
      remainderInputRef.current?.focus()
    }
  }

  const score = responses.filter(r => r.correct).length
  const q = questions[currentIndex]

  if (phase === 'idle') {
    return (
      <section className="test-area">
        <div className="top-row">
          <div>
            <p className="muted small">{isStamina ? 'Stamina Mode' : 'Ready'}</p>
            <h2>{config.name}</h2>
          </div>
          {isStamina && (
            <div className="stamina-info-pill">
              <span>{staminaStartSecs}s start</span>
              <span className="sep">·</span>
              <span>+{staminaBonusSecs}s per correct</span>
            </div>
          )}
        </div>
        <div className="question-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="primary" onClick={startTest}>Start</button>
        </div>
      </section>
    )
  }

  if (phase === 'results') {
    const total = responses.length
    return (
      <section className="results">
        <div className="results-head">
          <div>
            <p className="eyebrow">{isStamina ? "Time's up" : 'Finished'}</p>
            <h2>{isStamina ? 'Stamina over!' : 'Nice run!'}</h2>
            <p className="muted">Review your answers and jump back in.</p>
          </div>
          <div className="summary">
            <div>
              <p className="muted small">Score</p>
              <h3>{score}/{isStamina ? total : QUESTION_COUNT}</h3>
            </div>
            {!isStamina && (
              <div>
                <p className="muted small">Time</p>
                <h3>{totalTimeMs !== null ? formatTimeMs(totalTimeMs) : '—'}</h3>
              </div>
            )}
          </div>
        </div>
        <div className="review">
          {responses.map((entry, idx) => {
            const { question, userAnswer, userRemainder, correct } = entry
            const hasRemainder = question.remainder !== undefined
            return (
              <div key={`${question.type}-${idx}`} className="review-row">
                <div className="tag">{idx + 1}</div>
                <div className="equation review-text">
                  <span>{question.a}</span>
                  <span className="operand">{question.operand}</span>
                  <span>{question.b}</span>
                  <span className="operand">=</span>
                  {hasRemainder ? (
                    <>
                      <span className={correct ? 'correct' : 'wrong'}>{userAnswer}</span>
                      <span className="operand muted">r</span>
                      <span className={correct ? 'correct' : 'wrong'}>{userRemainder ?? 0}</span>
                      {!correct && (
                        <>
                          <span className="operand muted">/</span>
                          <span className="correct">{question.answer} r {question.remainder}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className={correct ? 'correct' : 'wrong'}>{userAnswer}</span>
                      {!correct && (
                        <>
                          <span className="operand muted">/</span>
                          <span className="correct"> {question.answer}</span>
                        </>
                      )}
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
          <button className="primary" onClick={startTest}>Try again</button>
          <button className="ghost" onClick={() => router.push(isStamina ? '/?mode=stamina' : '/')}>Choose a new test</button>
        </div>
      </section>
    )
  }

  return (
    <section className="test-area">
      <div className="top-row">
        <div>
          <p className="muted small">Now playing</p>
          <h2>{config.name}</h2>
        </div>
        {isStamina ? (
          <div className={`stamina-timer${staminaMs < 10000 ? ' urgent' : ''}${bonusFlash !== null ? ' bonus-flash' : ''}`} style={{ position: 'relative' }}>
            <span className="dot" />
            <span>{formatTime(staminaMs / 1000)}</span>
            {bonusFlash !== null && (
              <span className="bonus-pop">+{bonusFlash}s</span>
            )}
          </div>
        ) : (
          <div className="stopwatch">
            <span className="dot" />
            <span>{formatTime(elapsedMs / 1000)}</span>
          </div>
        )}
      </div>

      <div className="status-row">
        <div className="counter">
          {isStamina
            ? <>Answered <strong>{responses.length}</strong></>
            : <>Question <strong>{currentIndex + 1}</strong>/<span>{QUESTION_COUNT}</span></>
          }
        </div>
        {phase === 'countdown' && (
          <div className="countdown-pill">Starting in {countdown}</div>
        )}
      </div>

      <div className="question-card">
        {phase === 'countdown' && <div className="countdown-frosted">{countdown}</div>}
        {phase === 'active' && q && (
          <form onSubmit={handleSubmit} className="question-form">
            <p className="muted small">Solve this</p>
            <div className="equation">
              <span>{q.a}</span>
              <span className="operand">{q.operand}</span>
              <span>{q.b}</span>
              <span className="operand">=</span>
              <input
                ref={answerInputRef}
                type="number"
                inputMode="numeric"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => handleQuotientKeyDown(e, q)}
                placeholder="?"
                disabled={awaitingNext}
              />
              {q.remainder !== undefined && (
                <>
                  <span className="operand">r</span>
                  <input
                    ref={remainderInputRef}
                    type="number"
                    inputMode="numeric"
                    value={remainderAnswer}
                    onChange={e => setRemainderAnswer(e.target.value)}
                    placeholder="?"
                    disabled={awaitingNext}
                    style={{ width: 80 }}
                  />
                </>
              )}
            </div>
            <div className="actions">
              <button type="submit" className="primary" disabled={awaitingNext}>Submit</button>
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
  )
}
