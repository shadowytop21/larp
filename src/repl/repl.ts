// ============================================================
// LARP REPL + Interactive Learn Mode
// ============================================================
import * as readline from 'readline';
import { tokenize }  from '../lexer/lexer';
import { parse }     from '../parser/parser';
import { transpile } from '../transpiler/transpiler';

const c = {
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
  gray:   (s: string) => `\x1b[90m${s}\x1b[0m`,
  magenta:(s: string) => `\x1b[35m${s}\x1b[0m`,
};

// ── Eval a single LARP snippet ────────────────────────────────────────────────
function evalLarp(snippet: string): { output: string; error?: string } {
  try {
    const tokens = tokenize(snippet);
    const ast    = parse(tokens);
    const js     = transpile(ast);

    // Capture console.log output
    let output = '';
    const origLog = console.log;
    console.log = (...args: any[]) => { output += args.map(String).join(' ') + '\n'; };
    try {
      const fn = new Function('require', 'process', js);
      fn(require, process);
    } finally {
      console.log = origLog;
    }
    return { output: output.trim() };
  } catch (err: any) {
    const fix = err.fix ? `\n${c.yellow('Fix')}: ${err.fix}` : '';
    return { output: '', error: err.message + fix };
  }
}

// ── REPL ─────────────────────────────────────────────────────────────────────
export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log(c.bold(c.cyan('LARP REPL')) + c.gray(' — type LARP code and press Enter. Type "exit" to quit.'));
  console.log(c.gray('Multi-line: end a line with \\ to continue on the next line.\n'));

  let buffer = '';

  const prompt = () => {
    rl.question(buffer ? '... ' : c.cyan('→ '), (line: string) => {
      if (line.trim().toLowerCase() === 'exit') { rl.close(); return; }

      if (line.endsWith('\\')) {
        buffer += line.slice(0, -1) + '\n';
        prompt();
        return;
      }

      const snippet = buffer + line;
      buffer = '';

      // Check for recoverable missing 'end'
      const openBlocks = countOpenBlocks(snippet);
      if (openBlocks > 0) {
        console.log(c.yellow(`⚠ It looks like you forgot to close a block with "end" — add it to finish.\n`));
        prompt();
        return;
      }

      const { output, error } = evalLarp(snippet);
      if (error) {
        console.error(c.red('Error') + ': ' + error);
      } else if (output) {
        console.log(c.green(output));
      }
      prompt();
    });
  };

  prompt();
}

// ── Learn mode ────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    title: 'Lesson 1 — Saying Something',
    explanation: `The simplest thing a program can do is display a message.\nIn LARP, you use the word ${c.cyan('say')} followed by your message in quotes.`,
    example: `say "Hello, world!"`,
    expectedOutput: 'Hello, world!',
    hint: 'Type: say "Hello, world!"',
    tryIt: `Now try saying your own name! Type: say "My name is [YOUR NAME]"`,
  },
  {
    title: 'Lesson 2 — Storing Values',
    explanation: `You can store a value in a variable using ${c.cyan('set')}.\nThink of it like labelling a box: "set box to contents".`,
    example: `set name to "Pranjal"\nsay "Hello, " + name`,
    expectedOutput: 'Hello, Pranjal',
    hint: 'Type those two lines, pressing Enter after each.',
    tryIt: 'Try: set age to 21\n      say "I am " + age + " years old"',
  },
  {
    title: 'Lesson 3 — Making Decisions',
    explanation: `Use ${c.cyan('if')} to run code only when a condition is true.\nClose every ${c.cyan('if')} block with ${c.cyan('end')}.`,
    example: `set score to 85\nif score > 60:\n    say "You passed!"\notherwise:\n    say "Try again"\nend`,
    expectedOutput: 'You passed!',
    hint: 'Type the whole block, then press Enter.',
    tryIt: 'Try: if 10 > 5:\n          say "Math works!"\n     end',
  },
  {
    title: 'Lesson 4 — Repeating with Loops',
    explanation: `${c.cyan('repeat N times')} runs a block N times.\n${c.cyan('while condition')} keeps running while something is true.`,
    example: `repeat 3 times:\n    say "LARP is fun!"\nend`,
    expectedOutput: 'LARP is fun!\nLARP is fun!\nLARP is fun!',
    hint: 'Type the repeat block and press Enter.',
    tryIt: 'Try: repeat 5 times:\n          say "hello"\n     end',
  },
  {
    title: 'Lesson 5 — Creating Functions',
    explanation: `A function is a reusable chunk of code.\nUse ${c.cyan('create function')} and close with ${c.cyan('end')}.\nUse ${c.cyan('give back')} to return a result.`,
    example: `create function greet with name:\n    give back "Hello, " + name + "!"\nend\n\nsay greet with "Pranjal"`,
    expectedOutput: 'Hello, Pranjal!',
    hint: 'Define the function first, then call it.',
    tryIt: 'Try making a function that doubles a number.',
  },
  {
    title: 'Lesson 6 — Lists',
    explanation: `A list holds multiple values.\nUse ${c.cyan('a list containing')} to create one.\nAccess items by position: ${c.cyan('myList[0]')}.`,
    example: `set fruits to a list containing "apple", "mango", "grape"\nfor each fruit in fruits:\n    say fruit\nend`,
    expectedOutput: 'apple\nmango\ngrape',
    hint: 'Create the list and loop through it.',
    tryIt: 'Make a list of 3 cities and print each one.',
  },
  {
    title: 'Lesson 7 — Maps (Key-Value Pairs)',
    explanation: `A map stores data as key-value pairs.\nLike a dictionary: word → definition.`,
    example: `set person to a map containing "name" is "Pranjal", "age" is 21\nsay person["name"]`,
    expectedOutput: 'Pranjal',
    hint: 'Create the map and access a value.',
    tryIt: 'Create a map for a product with name and price.',
  },
  {
    title: 'Lesson 8 — Error Handling',
    explanation: `Use ${c.cyan('try')} to safely run risky code.\nUse ${c.cyan('if something goes wrong as error')} to catch errors.`,
    example: `try:\n    stop and say "something broke!"\nif something goes wrong as error:\n    say "Caught: " + error message\nend`,
    expectedOutput: 'Caught: something broke!',
    hint: 'Type the try block and press Enter.',
    tryIt: 'Try causing a division by zero inside a try block.',
  },
];

export async function runLearn(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (q: string): Promise<string> =>
    new Promise(resolve => rl.question(q, resolve));

  console.log('\n' + c.bold(c.magenta('  ★  Welcome to larp learn  ★')));
  console.log(c.gray('  Interactive tutorial — type code, get instant feedback.\n'));
  console.log(`  Type ${c.cyan('"skip"')} to skip a lesson, ${c.cyan('"quit"')} to exit.\n`);

  for (let i = 0; i < LESSONS.length; i++) {
    const lesson = LESSONS[i];
    console.log(c.bold(c.cyan(`\n─── ${lesson.title} ───`)));
    console.log('\n' + lesson.explanation);
    console.log(`\n${c.gray('Example:')}\n${lesson.example.split('\n').map(l => '  ' + c.cyan(l)).join('\n')}`);
    console.log(`\n${c.gray('Expected output:')} ${c.green(lesson.expectedOutput)}`);
    console.log(`\n${c.yellow('Try it yourself:')} ${lesson.tryIt}`);
    console.log(`${c.gray('Hint:')} ${lesson.hint}\n`);

    let attempts = 0;
    while (true) {
      const input = (await ask(c.cyan('→ '))).trim();
      if (!input) continue;
      if (input.toLowerCase() === 'quit') { rl.close(); return; }
      if (input.toLowerCase() === 'skip') { console.log(c.yellow('Skipping...')); break; }

      const { output, error } = evalLarp(input);
      if (error) {
        console.error(c.red('\nError') + ': ' + error);
        attempts++;
        if (attempts === 2) console.log(c.yellow(`\nHint: ${lesson.hint}\n`));
        continue;
      }

      console.log(c.green('\nOutput: ' + (output || '(no output)')));

      if (output === lesson.expectedOutput) {
        console.log(c.green(c.bold('\n✓ Correct! Great work.\n')));
        break;
      } else if (output) {
        console.log(c.yellow(`Almost! Expected: ${lesson.expectedOutput}\n`));
      }
      attempts++;
      if (attempts >= 3) {
        console.log(c.gray(`\nFull example:\n${lesson.example.split('\n').map(l => '  ' + l).join('\n')}\n`));
      }
    }
  }

  console.log(c.bold(c.green('\n★ You completed the LARP tutorial! ★')));
  console.log(c.gray('Check out the examples/ folder for more programs.\n'));
  rl.close();
}

// Heuristic: count unclosed block keywords
function countOpenBlocks(code: string): number {
  let count = 0;
  const blockOpeners = /\b(if|while|for each|repeat|create function|create a blueprint called|try|do at the same time)\b.*:/gm;
  const closers      = /^end\b/gm;
  count += (code.match(blockOpeners) || []).length;
  count -= (code.match(closers) || []).length;
  return Math.max(0, count);
}
