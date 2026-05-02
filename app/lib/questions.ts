import type { Question, QuestionType } from './types'

export const QUESTION_COUNT = 10

export const buildAllQuestions = (type: QuestionType): Question[] => {
  const questions: Question[] = []
  if (type === 'add20') {
    for (let a = 0; a <= 9; a++)
      for (let b = 0; b <= 9; b++)
        questions.push({ a, b, operand: '+', type, answer: a + b })
  } else if (type === 'sub20') {
    for (let a = 0; a <= 20; a++)
      for (let b = 0; b <= a; b++)
        questions.push({ a, b, operand: '-', type, answer: a - b })
  } else if (type === 'mul9') {
    for (let a = 1; a <= 9; a++)
      for (let b = 1; b <= 9; b++)
        questions.push({ a, b, operand: '×', type: 'mul9', answer: a * b })
  } else if (type === 'mul12') {
    for (let a = 1; a <= 12; a++)
      for (let b = 1; b <= 12; b++)
        questions.push({ a, b, operand: '×', type: 'mul12', answer: a * b })
  } else if (type === 'div9') {
    for (let b = 1; b <= 9; b++)
      for (let q = 1; q <= 9; q++)
        questions.push({ a: b * q, b, operand: '÷', type: 'div9', answer: q })
  } else if (type === 'div12') {
    for (let b = 1; b <= 12; b++)
      for (let q = 1; q <= 12; q++)
        questions.push({ a: b * q, b, operand: '÷', type: 'div12', answer: q })
  } else if (type === 'div9r') {
    for (let b = 2; b <= 9; b++)
      for (let q = 1; q <= 9; q++)
        for (let r = 1; r < b; r++)
          questions.push({ a: b * q + r, b, operand: '÷', type: 'div9r', answer: q, remainder: r })
  } else {
    for (let b = 2; b <= 12; b++)
      for (let q = 1; q <= 12; q++)
        for (let r = 1; r < b; r++)
          questions.push({ a: b * q + r, b, operand: '÷', type: 'div12r', answer: q, remainder: r })
  }
  return questions
}

const shuffle = <T,>(arr: T[]): T[] => {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const buildQuestionSet = (types: QuestionType[], count = QUESTION_COUNT): Question[] => {
  const uniqueTypes = [...new Set(types)]
  const pools = new Map(uniqueTypes.map(t => [t, shuffle(buildAllQuestions(t))]))
  const pointers = new Map(uniqueTypes.map(t => [t, 0]))

  const list: Question[] = []
  for (let i = 0; i < count; i++) {
    const available = uniqueTypes.filter(t => (pointers.get(t) ?? 0) < pools.get(t)!.length)
    if (available.length === 0) break
    const choice = available[Math.floor(Math.random() * available.length)]
    list.push(pools.get(choice)![pointers.get(choice)!])
    pointers.set(choice, pointers.get(choice)! + 1)
  }
  return list
}

export const buildStaminaPool = (types: QuestionType[], size = 1000): Question[] => {
  const uniqueTypes = [...new Set(types)]
  const result: Question[] = []
  while (result.length < size) {
    const batch: Question[] = []
    for (const type of uniqueTypes) {
      batch.push(...shuffle(buildAllQuestions(type)))
    }
    result.push(...shuffle(batch))
  }
  return result.slice(0, size)
}

