/**
 * Interview quick-revision questions shown on the homepage, per course.
 * Key = course folder name under content/learn/ (e.g. "javascript").
 * A course without an entry simply doesn't appear in that section.
 * `to` should point at the lesson that explains the answer in full.
 */
export interface InterviewQuestion {
  label: string
  content: string
  to: string
}

export const interviewQuestions: Record<string, InterviewQuestion[]> = {
  javascript: [{
    label: 'What is the difference between var, let and const?',
    content: 'var is function-scoped and can be redeclared. let and const are block-scoped. let can be reassigned, const cannot (but the contents of a const object or array can still change).',
    to: '/learn/javascript/variables'
  }, {
    label: 'What is the difference between == and ===?',
    content: '== compares values after converting them to the same type, so "5" == 5 is true. === compares both value and type without converting, so "5" === 5 is false. Prefer ===.',
    to: '/learn/javascript/operators'
  }, {
    label: 'Why does "5" + 1 give "51" but "5" - 1 give 4?',
    content: 'This is type coercion. + joins strings when either side is a string, so 1 becomes "1". The - operator only works on numbers, so "5" is converted to 5 first.',
    to: '/learn/javascript/type-casting'
  }, {
    label: 'What are primitive and reference types?',
    content: 'Primitives (string, number, boolean, null, undefined, bigint, symbol) are copied by value. Objects, arrays and functions are reference types: copying the variable copies a reference to the same object.',
    to: '/learn/javascript/data-types'
  }, {
    label: 'for...in or for...of: which one should I use?',
    content: 'for...of loops over values of iterables like arrays and strings. for...in loops over the keys of an object. Use for...of for arrays, and for...in (or Object.keys) for objects.',
    to: '/learn/javascript/for-of-loop'
  }, {
    label: 'When should I use map() instead of forEach()?',
    content: 'map() returns a new array built from what your callback returns, so use it when you want a transformed copy. forEach() returns undefined and is meant for side effects, like logging or updating something else.',
    to: '/learn/javascript/array-methods'
  }]
}
