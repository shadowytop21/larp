// ============================================================
// LARP Runtime Helpers
// Small JS library included (via require) in every transpiled program.
// Provides: check(), typeOf(), and plain-English error formatting.
// ============================================================
'use strict';

const chalk = {
  red:    (s: any) => `\x1b[31m${s}\x1b[0m`,
  green:  (s: any) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: any) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s: any) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s: any) => `\x1b[1m${s}\x1b[0m`,
  gray:   (s: any) => `\x1b[90m${s}\x1b[0m`,
};

// ── check that ... is equal to ... ────────────────────────────────────────────
exports.check = function check(actual: any, expected: any, sourceText: any) {
  const pass = exports.deepEqual(actual, expected);
  if (pass) {
    process.stdout.write(chalk.green(`  ✓  check that ${sourceText}\n`));
    return;
  }
  const actualStr   = exports.pretty(actual);
  const expectedStr = exports.pretty(expected);
  process.stderr.write(
    chalk.red(`  ✗  check that ${sourceText}\n`) +
    chalk.red(`     Expected: ${expectedStr}\n`) +
    chalk.red(`     Got:      ${actualStr}\n`)
  );
  process.exitCode = 1;
}

// ── Type name in LARP terms ────────────────────────────────────────────────────
exports.typeOf = function typeOf(value: any) {
  if (value === null || value === undefined) return 'nothing';
  if (Array.isArray(value))  return 'list';
  if (typeof value === 'object') return 'map';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return typeof value; // 'number', 'text' (string), etc.
}

// ── Plain-English error formatter ─────────────────────────────────────────────
exports.larpError = function larpError(message: any, fix: any, line: any) {
  const lineInfo = line ? ` (line ${line})` : '';
  return new Error(
    `\n${chalk.red('Error')}${lineInfo}: ${message}` +
    (fix ? `\n${chalk.yellow('Fix')}: ${fix}` : '')
  );
}

// ── Deep equality (used by check) ────────────────────────────────────────────
exports.deepEqual = function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(k => deepEqual(a[k], b[k]));
  }
  return false;
}

// ── Pretty-print a value ──────────────────────────────────────────────────────
exports.pretty = function pretty(v: any) {
  if (v === null || v === undefined) return 'nothing';
  if (typeof v === 'string') return `"${v}"`;
  return JSON.stringify(v);
}

// ── Global error handler ──────────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  // Translate common Node errors into LARP-friendly messages
  let msg = err.message;
  let fix;

  if (msg.includes('Cannot read propert')) {
    msg = `You tried to access something on a value that doesn't exist (nothing).`;
    fix = `Check that the variable has a value before using it. You can use: if myVar != nothing:`;
  } else if (msg.includes('is not a function')) {
    const m = msg.match(/"?([^"]+)"? is not a function/);
    if (m) {
      msg = `"${m[1]}" is not a function — you might have a typo in the function name, or the function hasn't been created yet.`;
      fix = `Make sure you spelled the function name correctly and it was created with: create function ${m[1]} ...`;
    }
  } else if (msg.includes('ENOENT')) {
    msg = `The file you tried to read doesn't exist.`;
    fix = `Check the file path is correct and the file exists.`;
  } else if (msg.includes('Division by zero') || msg.includes('Infinity')) {
    msg = `You tried to divide a number by zero, which isn't possible.`;
    fix = `Check that the number you're dividing by is not zero before dividing.`;
  }

  process.stderr.write(
    `\n${chalk.bold(chalk.red('LARP Error'))}: ${msg}\n` +
    (fix ? `${chalk.yellow('Fix')}: ${fix}\n` : '') +
    `\n${chalk.gray('(Run with --verbose to see the full stack trace.)')}\n`
  );

  if (process.argv.includes('--verbose')) {
    console.error('\nFull stack trace:');
    console.error(err.stack);
  }

  process.exit(1);
});

// ── Random seeding ────────────────────────────────────────────────────────────
exports.seedRandom = function seedRandom(seed: any) {
  let s = Number(seed) || 0;
  Math.random = () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
