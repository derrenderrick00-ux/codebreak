export const DIAGNOSTIC = [
  { question: 'Which value is a Boolean?', choices: ['"false"', 'false', '0', 'null'], answer: 1, topic: 'Values' },
  { question: 'What does 7 >= 7 evaluate to?', choices: ['true', 'false', '7', 'undefined'], answer: 0, topic: 'Comparisons' },
  { question: 'When does a && b evaluate to true?', choices: ['Either is true', 'Both are true', 'Both are false', 'Never'], answer: 1, topic: 'Logic' },
  { question: 'What does [10,20,30].length return?', choices: ['2', '3', '30', 'undefined'], answer: 1, topic: 'Arrays' },
  { question: 'What does "  hi  ".trim() produce?', choices: ['"HI"', '"hi"', '"  hi"', 'An error'], answer: 1, topic: 'Strings' },
  { question: 'Which method returns the first matching array element?', choices: ['find()', 'push()', 'filter()', 'join()'], answer: 0, topic: 'Array methods' },
  { question: 'What does a function return without a return statement?', choices: ['null', 'false', 'undefined', '0'], answer: 2, topic: 'Functions' },
  { question: 'What is the result of [1,2].map(n => n*3)?', choices: ['[1,2,3]', '[3,6]', '6', 'Error'], answer: 1, topic: 'Transformation' }
];

/** Placement grants access to lessons, never mastery or completed challenge status. */
export function assessDiagnostic(answers) {
  const score = DIAGNOSTIC.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  const recommendedFloor = score >= 8 ? 8 : score >= 6 ? 6 : score >= 4 ? 4 : score >= 2 ? 2 : 1;
  return { score, total: DIAGNOSTIC.length, recommendedFloor };
}
