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
  } else {
    for (let a = 1; a <= 9; a++)
      for (let b = 1; b <= 9; b++)
        questions.push({ a, b, operand: '×', type: 'mul9', answer: a * b })
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

