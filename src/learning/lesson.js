export const LESSON_STEPS = [
  { key: 'objectives', name: '01 / Objectives', summary: 'Know what you are about to learn.' },
  { key: 'terms', name: '02 / Key definitions', summary: 'Learn the essential vocabulary.' },
  { key: 'explanation', name: '03 / Step-by-step', summary: 'Understand the concept and reasoning.' },
  { key: 'visualization', name: '04 / Visualization', summary: 'Picture the flow of information.' },
  { key: 'example', name: '05 / Worked example', summary: 'Inspect functioning JavaScript.' },
  { key: 'applications', name: '06 / Real-life applications', summary: 'Connect the skill to practical software.' },
  { key: 'exercise', name: '07 / Exercise', summary: 'Predict the result before coding.' },
  { key: 'miniProject', name: '08 / Mini-project', summary: 'Apply the concept in a small task.' },
  { key: 'capstone', name: '09 / Main project connection', summary: 'See how the skill contributes to the bigger system.' }
];
export function validateLesson(floor) {
  return LESSON_STEPS.every(({ key }) => typeof floor.lesson[key] === 'string' && floor.lesson[key].trim().length > 0);
}
