export type QuestionType = 'add20' | 'sub20' | 'mul9' | 'div9' | 'mul12' | 'div12' | 'div9r' | 'div12r'

export type Question = {
  a: number
  b: number
  operand: '+' | '-' | '×' | '÷'
  type: QuestionType
  answer: number
  remainder?: number
}

export type TestConfig = {
  id: string
  name: string
  types: QuestionType[]
}

export type TestResponse = {
  question: Question
  userAnswer: number
  userRemainder?: number
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
  ['mul9',   { type: 'mul9',   name: 'Multiplication to 9',          desc: 'Times tables up to 9.' }],
  ['mul12',  { type: 'mul12',  name: 'Multiplication to 12',         desc: 'Times tables up to 12.' }],
  ['div9',   { type: 'div9',   name: 'Division to 9',                desc: 'Clean division with no remainders, divisors up to 9.' }],
  ['div12',  { type: 'div12',  name: 'Division to 12',               desc: 'Clean division with no remainders, divisors up to 12.' }],
  ['div9r',  { type: 'div9r',  name: 'Division to 9 with Remainder', desc: 'Divisors up to 9 — enter the quotient and remainder.' }],
  ['div12r', { type: 'div12r', name: 'Division to 12 with Remainder', desc: 'Divisors up to 12 — enter the quotient and remainder.' }],
])

