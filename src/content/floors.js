/** Chapter I floor metadata. Each lesson follows the nine-stage study method. */
const make = (floor, title, topic, fn, setup, tests, lesson) => ({
  floor, title, topic, fn, setup, tests, chapter: 1,
  difficulty: floor === 10 ? 'boss' : floor === 0 ? 'intro' : 'standard',
  lesson: {
    objectives: lesson.objectives,
    terms: lesson.terms,
    explanation: lesson.explanation,
    visualization: lesson.visualization,
    example: lesson.example,
    applications: lesson.applications,
    exercise: lesson.exercise,
    miniProject: lesson.miniProject,
    capstone: lesson.capstone ?? 'Every repaired subsystem will contribute to your final Tower Control System.',
    hint: lesson.hint
  },
  dialogue: lesson.dialogue ?? `PATCH: "${title}. Try not to set anything on fire this time."`,
  success: lesson.success ?? 'PATCH: "The system actually works. Suspicious, but I\'ll allow it."'
});

export const FLOORS = [
  make(0, 'Subject Not Found', 'First contact · functions', 'identify',
`function identify(name) {
  // Return a usable name. Blank names become 'Subject 404'.
  return name;
}`, [
{ args: ['Alex'], expected: 'Alex', label: 'Regular identity' },
{ args: ['  Ghost  '], expected: 'Ghost', label: 'Trim extra spaces' },
{ args: ['  '], expected: 'Subject 404', label: 'Recover an empty identity' },
{ args: [''], expected: 'Subject 404', label: 'Empty identity fallback' }
], {
 objectives: 'Write and return a value from a JavaScript function.', terms: 'function: reusable block of code; parameter: input; return: result sent back.',
 explanation: 'The tower lost your name. The function identify(name) receives a string. Use .trim() to remove extra spaces. Return a default name when nothing remains.',
 visualization: 'INPUT NAME → TRIM SPACES → EMPTY? → DEFAULT NAME or REAL NAME → EXIT GATE',
 example: `function greet(name) {\n  return 'Hello, ' + name.trim();\n}\ngreet(' Ada '); // 'Hello, Ada'`,
 applications: 'Every signup form cleans user input before using it; however, production applications must also validate and safely handle data.',
 exercise: 'What happens if you call identify("  Pat  ")?', miniProject: 'Write a displayName function for a future player profile.',
 hint: `const cleaned = name.trim(); return cleaned ? cleaned : 'Subject 404';`,
 dialogue: 'ROOT: "Identity not found." PATCH: "At least the computer and I agree on something. Let’s fix it."',
 success: 'PATCH: "You exist now. Try not to get deleted."'
 }),
 make(1, 'The Dead Generator', 'Variables · values · operators', 'powerOn',
`function powerOn(voltage) {
  // The generator needs at least 5 volts.
  return false;
}`, [
{ args: [5], expected: true, label: 'Minimum voltage' },
{ args: [4], expected: false, label: 'Insufficient voltage' },
{ args: [12], expected: true, label: 'High voltage' },
{ args: [0], expected: false, label: 'Zero voltage' },
{ args: [-2], expected: false, label: 'Negative voltage' }
], {
 objectives: 'Use parameters, numeric comparisons and Boolean return values.',
 terms: 'variable: named storage; number: numeric value; Boolean: true or false; >=: greater than or equal to.',
 explanation: 'powerOn receives a voltage. A Boolean condition determines whether enough power reaches the generator. Return true for five or more volts and false otherwise.',
 visualization: 'VOLTAGE → CHECK >= 5 → TRUE: LIGHTS ON / FALSE: DARKNESS',
 example: `const required = 5;\nconst voltage = 8;\nconsole.log(voltage >= required); // true`,
 applications: 'Threshold checks appear in battery systems, stock alerts, speed limits, and access rules.',
 exercise: 'Predict the output of 5 >= 5, 3 >= 5 and 8 >= 5.', miniProject: 'Build a battery-warning rule.',
 hint: 'Return the result of comparing voltage with the number 5.',
 dialogue: 'PATCH: "No power, no elevator. On the plus side, the electricity bill is excellent."'
 }),
 make(2, 'The Suspicious Door', 'Conditionals · Boolean logic', 'checkAccess',
`function checkAccess(hasKey, clearance) {
  // A key AND clearance level 3 or above are required.
  return false;
}`, [
{ args: [true, 3], expected: true, label: 'Authorized at threshold' },
{ args: [false, 7], expected: false, label: 'Missing key' },
{ args: [true, 2], expected: false, label: 'Insufficient clearance' },
{ args: [true, 5], expected: true, label: 'Higher clearance' },
{ args: [false, 0], expected: false, label: 'No credentials' }
], {
 objectives: 'Combine conditions using && and understand logical AND.',
 terms: 'condition: expression evaluated as true/false; &&: logical AND; comparison: relationship between values.',
 explanation: 'Both requirements must be true for the door to unlock. JavaScript && returns true only if both Boolean expressions are true.',
 visualization: 'KEY? ─YES─┐  CLEARANCE >= 3? ─YES─┤ → UNLOCK; OTHER CASES → DENY',
 example: `const hasTicket = true;\nconst age = 18;\nconsole.log(hasTicket && age >= 18); // true`,
 applications: 'Permissions, form validation, online checkout rules, and feature gates all use compound logic.',
 exercise: 'If clearance=4 but hasKey=false, does the door open?', miniProject: 'Write a two-factor access rule.',
 hint: 'Combine hasKey and clearance >= 3 using &&.',
 dialogue: 'ROOT: "ACCESS DENIED." PATCH: "Doors in this tower have serious trust issues."'
 }),
 make(3, 'Signal Lost', 'if / else · truth and choices', 'repairSignal',
`function repairSignal(signal) {
  // A positive signal is ONLINE; all other numbers are OFFLINE.
  return 'OFFLINE';
}`, [
{ args: [10], expected: 'ONLINE', label: 'Positive signal' },
{ args: [1], expected: 'ONLINE', label: 'Small positive signal' },
{ args: [0], expected: 'OFFLINE', label: 'Zero signal' },
{ args: [-5], expected: 'OFFLINE', label: 'Negative signal' }
], {
 objectives: 'Use conditional branches to return one of two results.',
 terms: 'if: execute when condition is true; else: alternative branch; branch: path selected by a condition.',
 explanation: 'When signal > 0, return ONLINE. Otherwise return OFFLINE. You may use if/else or a conditional expression.',
 visualization: 'SIGNAL → POSITIVE? → YES: ONLINE → NO: OFFLINE',
 example: `const temperature = 35;\nif (temperature > 30) console.log('HOT');\nelse console.log('OK');`,
 applications: 'Wi-Fi signal indicators, online status, sensor monitoring and health checks.',
 exercise: 'Does a signal strength of 0 count as ONLINE?', miniProject: 'Make a network status checker.',
 hint: `if (signal > 0) return 'ONLINE'; return 'OFFLINE';`,
 dialogue: 'PATCH: "The tower has lost signal. Even the walls are buffering."'
 }),
 make(4, 'Steps to Freedom', 'Loops · counters', 'countSteps',
`function countSteps(target) {
  // Return [1, 2, ..., target]. Return [] when target is zero.
  return [];
}`, [
{ args: [1], expected: [1], label: 'One step' },
{ args: [4], expected: [1,2,3,4], label: 'Four steps' },
{ args: [0], expected: [], label: 'No steps' },
{ args: [6], expected: [1,2,3,4,5,6], label: 'Six steps' }
], {
 objectives: 'Construct a for loop, count iterations and build an array.',
 terms: 'loop: repeated instructions; iteration: one repetition; counter: changes each iteration; array: ordered collection.',
 explanation: 'Start with an empty array. Repeat from 1 through target, pushing each counter value into the array, then return it.',
 visualization: 'START 1 → APPEND → INCREMENT → REPEAT UNTIL target → RETURN ARRAY',
 example: `const steps = [];\nfor (let n=1; n<=3; n++) steps.push(n);\n// [1,2,3]`,
 applications: 'Pagination, data processing, animations, repeated form fields and batch operations.',
 exercise: 'How many times does a loop from 1 to 5 run?', miniProject: 'Write a countdown timer using a loop.',
 hint: 'Use for (let i = 1; i <= target; i++) and result.push(i).',
 dialogue: 'PATCH: "The staircase is missing steps. Naturally, you have to generate them yourself."'
 }),
 make(5, 'Power Redistribution', 'Arrays · .map()', 'doublePower',
`function doublePower(values) {
  // Return a new array with every number doubled.
  return values;
}`, [
{ args: [[1,2,3]], expected: [2,4,6], label: 'Basic array' },
{ args: [[]], expected: [], label: 'Empty array' },
{ args: [[0,-2,5]], expected: [0,-4,10], label: 'Zero and negative numbers' },
{ args: [[7]], expected: [14], label: 'Single value' }
], {
 objectives: 'Transform arrays without changing the source array.',
 terms: 'array: ordered collection; map: creates a transformed array; callback: function passed to another function.',
 explanation: 'The array has several power readings. Use .map() or a loop to produce a separate array with each number multiplied by two.',
 visualization: '[1, 2, 3] → ×2 EACH → [2, 4, 6]',
 example: `const prices = [2, 4];\nconst doubled = prices.map(n => n*2);\n// [4, 8]`,
 applications: 'Formatting API results, changing prices, plotting chart series and data transformations.',
 exercise: 'What does [0, -1].map(n => n * 2) return?', miniProject: 'Convert Celsius readings to Fahrenheit.',
 hint: 'return values.map(value => value * 2);',
 dialogue: 'ROOT: "Power insufficient." PATCH: "Apparently our problem is multiplication now."'
 }),
 make(6, 'The Three-Door Protocol', 'Objects · search · arrays', 'findSafeDoor',
`function findSafeDoor(doors) {
  // Return the id of the first door with status 'safe'.
  // If none exists, return -1.
  return -1;
}`, [
{ args: [[{id:1,status:'trap'},{id:2,status:'safe'}]], expected: 2, label: 'Safe door after trap' },
{ args: [[{id:8,status:'safe'},{id:9,status:'safe'}]], expected: 8, label: 'First matching door' },
{ args: [[{id:1,status:'danger'}]], expected: -1, label: 'No safe door' },
{ args: [[]], expected: -1, label: 'No doors' },
{ args: [[{id:13,status:'locked'},{id:7,status:'safe'}]], expected: 7, label: 'Nonsequential identifiers' }
], {
 objectives: 'Read object properties and search arrays with find().',
 terms: 'object: collection of named properties; property: a value referenced by a key; find: returns first matching element.',
 explanation: 'Inspect each door object and find the first one whose status is safe. Return its id, not its position in the array. Return -1 if none match.',
 visualization: 'DOORS → CHECK status PROPERTY → FIRST "safe" → RETURN id',
 example: `const users = [{id:2,active:false},{id:6,active:true}];\nusers.find(u => u.active)?.id; // 6`,
 applications: 'Finding inventory items, matching user records, and selecting UI elements.',
 exercise: 'Is an object id necessarily the same as its array index?', miniProject: 'Filter a room inventory for usable items.',
 hint: `const match = doors.find(door => door.status === 'safe'); return match ? match.id : -1;`,
 dialogue: 'PATCH: "Three doors. One is safe. Statistics says we should still be nervous."'
 }),
 make(7, 'The Broken Transmission', 'Strings · methods', 'formatTransmission',
`function formatTransmission(message) {
  // Trim whitespace and convert the message to uppercase.
  return message;
}`, [
{ args: [' help '], expected: 'HELP', label: 'Trim and uppercase' },
{ args: ['Patch online'], expected: 'PATCH ONLINE', label: 'Mixed casing' },
{ args: ['  '], expected: '', label: 'Whitespace only' },
{ args: ['404?'], expected: '404?', label: 'Symbols remain unchanged' }
], {
 objectives: 'Transform strings using chained methods.',
 terms: 'string: text; method: a function attached to an object; trim: remove outer whitespace; toUpperCase: uppercase conversion.',
 explanation: 'Clean the corrupted signal by removing extra outer whitespace and converting the text to uppercase. Return the cleaned string.',
 visualization: '" help " → trim() → "help" → toUpperCase() → "HELP"',
 example: `const code = '  alpha  ';\nconsole.log(code.trim().toUpperCase()); // ALPHA`,
 applications: 'Formatting labels, normalizing user-entered codes, searching, and preparing messages.',
 exercise: 'Does trim() remove spaces in the middle of a string?', miniProject: 'Build a message-normalization helper.',
 hint: 'return message.trim().toUpperCase();',
 dialogue: 'PATCH: "The transmission is messy. So, just like my memory."'
 }),
 make(8, 'The Function Factory', 'Functions · parameters · defaults', 'calculateEnergy',
`function calculateEnergy(base, bonus = 0) {
  // Total energy is base * 2 + bonus.
  return 0;
}`, [
{ args: [4,3], expected: 11, label: 'Base with bonus' },
{ args: [2], expected: 4, label: 'Default bonus' },
{ args: [0,5], expected: 5, label: 'Zero base' },
{ args: [-2,1], expected: -3, label: 'Negative base' }
], {
 objectives: 'Create reusable functions with default parameter values.',
 terms: 'parameter: declared input; argument: supplied value; default parameter: value used if argument is omitted.',
 explanation: 'Energy is double the base amount plus an optional bonus. Make sure calls that omit bonus still work.',
 visualization: '(BASE × 2) + BONUS (DEFAULT 0) → TOTAL ENERGY',
 example: `function charge(units, tax=0) { return units + tax; }\ncharge(10); // 10\ncharge(10,2); // 12`,
 applications: 'Pricing functions, reusable business rules, calculation services and UI helpers.',
 exercise: 'What does calculateEnergy(3) return?', miniProject: 'Write a reusable discount calculator.',
 hint: 'return base * 2 + bonus;',
 dialogue: 'ROOT: "Production line halted." PATCH: "We could automate this with a function. Wild idea."'
 }),
 make(9, 'The Array of Broken Modules', 'Array methods · filter', 'repairCore',
`function repairCore(modules) {
  // Count modules whose active property is true.
  return 0;
}`, [
{ args: [[{active:true},{active:false},{active:true}]], expected: 2, label: 'Mixed modules' },
{ args: [[]], expected: 0, label: 'Empty module list' },
{ args: [[{active:false},{active:false}]], expected: 0, label: 'All inactive' },
{ args: [[{active:true},{active:true},{active:true}]], expected: 3, label: 'All active' }
], {
 objectives: 'Use filter or iteration to count matching objects.',
 terms: 'filter: creates a new array of matches; length: number of items; predicate: function deciding whether an item qualifies.',
 explanation: 'The core controller needs to count modules with active === true. You can filter and inspect the length, or count manually.',
 visualization: '[TRUE, FALSE, TRUE] → filter(active) → [TRUE, TRUE] → length 2',
 example: `const nums=[2,7,9];\nnums.filter(n => n > 5).length; // 2`,
 applications: 'Analytics dashboards, stock counts, status pages and database result summaries.',
 exercise: 'What does [].filter(Boolean).length return?', miniProject: 'Generate a status dashboard summary.',
 hint: 'return modules.filter(module => module.active === true).length;',
 dialogue: 'PATCH: "Count the surviving modules. Please do not count me as one."'
 }),
 make(10, 'THE INFINITE LOOP', 'Boss · loops · conditions · edge cases', 'stabilizeLift',
`function stabilizeLift(start, end) {
  // Return every integer floor from start to end, inclusive.
  // Support both ascending and descending travel.
  return [];
}`, [
{ args: [1,4], expected: [1,2,3,4], label: 'Climb the tower' },
{ args: [5,2], expected: [5,4,3,2], label: 'Emergency descent' },
{ args: [3,3], expected: [3], label: 'Already at destination' },
{ args: [-2,1], expected: [-2,-1,0,1], label: 'Below-ground floors' },
{ args: [8,6], expected: [8,7,6], label: 'Descending checkpoint' }
], {
 objectives: 'Combine functions, branching, loops and arrays to solve a new problem.',
 terms: 'edge case: unusual valid input; loop invariant: fact maintained through iterations; off-by-one: wrong boundary.',
 explanation: 'ROOT corrupted the elevator. Build the exact sequence of stops between start and end, inclusive. When start > end the elevator must descend. If equal, return just that floor.',
 visualization: 'START vs END → CHOOSE +1 OR -1 → APPEND EACH FLOOR → STOP AT END',
 example: `function directions(a,b) { return a <= b ? 1 : -1; }\n// Use the direction to advance or descend.`,
 applications: 'State transitions, navigation paths, ordered data generation, test-case boundary handling.',
 exercise: 'What happens if start === end? How do you avoid an infinite loop?',
 miniProject: 'Program a reliable elevator controller that responds to emergency reversals.',
 capstone: 'Deploy the Logic Core: connect the restored power, permissions, signals and elevator into a simulated control module.',
 hint: `const steps = []; const direction = start <= end ? 1 : -1; for (let f = start; ; f += direction) { steps.push(f); if (f === end) break; } return steps;`,
 dialogue: 'ROOT: "ASCENT TERMINATED." PATCH: "It would be funnier if we weren’t inside the elevator."',
 success: 'PATCH: "Logic Core recovered. Nine more chapters until you learn what this place really is."'
 })
];

export const FLOOR_COUNT = 10;
export function getFloor(number) { return FLOORS.find(floor => floor.floor === Number(number)) ?? FLOORS[0]; }
