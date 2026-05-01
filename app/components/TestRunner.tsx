'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { TestConfig, Question, TestResponse } from '../lib/types'
import { buildQuestionSet, QUESTION_COUNT } from '../lib/questions'

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
  const autoStart = useSearchParams().has('autoStart')

  const [phase, setPhase] = useState<Phase>(() => (autoStart ? 'countdown' : 'idle'))
  const [questions, setQuestions] = useState<Question[]>(() =>
    autoStart ? buildQuestionSet(config.types) : []
  )
  const [responses, setResponses] = useState<TestResponse[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [totalTimeMs, setTotalTimeMs] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')
  const [remainderAnswer, setRemainderAnswer] = useState('')
  const [overlay, setOverlay] = useState<'correct' | 'wrong' | null>(null)
  const [awaitingNext, setAwaitingNext] = useState(false)

  const answerInputRef = useRef<HTMLInputElement | null>(null)
  const remainderInputRef = useRef<HTMLInputElement | null>(null)
  const countdownRef = useRef<number | null>(null)
  const stopwatchRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

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

  const startCountdownInterval = () => {
    if (countdownRef.current !== null) clearInterval(countdownRef.current)
    countdownRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          startStopwatch()
          setPhase('active')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (autoStart) startCountdownInterval(); return clearTimers }, [])

  useEffect(() => {
    if (phase === 'active') answerInputRef.current?.focus()
  }, [currentIndex, phase])

  const startTest = () => {
    clearTimers()
    setQuestions(buildQuestionSet(config.types))
    setResponses([])
    setCurrentIndex(0)
    setAnswer('')
    setRemainderAnswer('')
    setOverlay(null)
    setAwaitingNext(false)
    setElapsedMs(0)
    setTotalTimeMs(null)
    setCountdown(3)
    setPhase('countdown')
    startCountdownInterval()
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
    const isLast = updated.length === questions.length
    const delay = correct ? 300 : 1000

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
            <p className="muted small">Ready</p>
            <h2>{config.name}</h2>
          </div>
        </div>
        <div className="question-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="primary" onClick={startTest}>Start</button>
        </div>
      </section>
    )
  }

  if (phase === 'results') {
    return (
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
              <h3>{score}/{QUESTION_COUNT}</h3>
            </div>
            <div>
              <p className="muted small">Time</p>
              <h3>{totalTimeMs !== null ? formatTimeMs(totalTimeMs) : '—'}</h3>
            </div>
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
          <button className="ghost" onClick={() => router.push('/')}>Choose a new test</button>
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
        <div className="stopwatch">
          <span className="dot" />
          <span>{formatTime(elapsedMs / 1000)}</span>
        </div>
      </div>

      <div className="status-row">
        <div className="counter">
          Question <strong>{currentIndex + 1}</strong>/<span>{QUESTION_COUNT}</span>
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
