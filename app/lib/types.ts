export type QuestionType = 'add20' | 'sub20' | 'mul9' | 'div9'

export type Question = {
  a: number
  b: number
  operand: '+' | '-' | '×' | '÷'
  type: QuestionType
  answer: number
}

export type TestConfig = {
  id: string
  name: string
  types: QuestionType[]
}

export type TestResponse = {
  question: Question
  userAnswer: number
  correct: boolean
}

export type SetInfo = {
  type: QuestionType
  name: string
  desc: string
}

export const SET_MAP = new Map<QuestionType, SetInfo>([
  ['add20', { type: 'add20', name: 'Addition to 20',     desc: 'Numbers 0-9, all addition.' }],
  ['sub20', { type: 'sub20', name: 'Subtraction to 20',  desc: 'Numbers 0-20 with a fair subtraction mix.' }],
  ['mul9',  { type: 'mul9',  name: 'Multiplication to 9', desc: 'Times tables up to 9.' }],
  ['div9',  { type: 'div9',  name: 'Division to 9',       desc: 'Clean division with no remainders, divisors up to 9.' }],
])

