# Master Prompt v2: Build [NAME] — A Beginner-First Language That's Actually Capable

Design and build a general-purpose programming language, [NAME], that is dramatically easier to learn than Python while remaining fully capable of building real backend software (APIs, databases, servers). This version supersedes earlier drafts — it fixes the "too much English" problem by mixing plain words for structure with symbols for math/logic, matching how Python/JS/Ruby actually work.

## 1. Positioning

| Problem elsewhere | How [NAME] fixes it |
|---|---|
| Indentation-only blocks (Python) — invisible errors | Blocks close explicitly with `end` |
| Cryptic errors ("NoneType is not subscriptable") | Plain-English errors naming the variable, the reason, and a fix |
| `self`, `__init__`, dunder methods | No `self` — blueprints read as plain descriptions |
| No server/DB built in — needs Flask/FastAPI | Server, routes, database access are core language features |
| Long, wordy math/logic in earlier "pure English" drafts | Math and comparisons use standard symbols; only control-flow and actions use English |

One-line pitch: **"Reads like English where it matters, reads like math where math is clearer."**

## 2. Hybrid Syntax Rule (core design decision)

Two categories, treated differently on purpose:

**A. Structure & actions → full English** (this is where words genuinely aid understanding)
- `set`, `set fixed`, `if / otherwise if / otherwise / end`, `while`, `for each`, `repeat`, `create function`, `give back`, `try / if something goes wrong / end`, `create a blueprint`, `bring in`

**B. Math & comparisons → standard symbols** (symbols are clearer here, and this is what every mainstream language already does)
- Arithmetic: `+ - * / %` (keep `**` written as `^` for power, more familiar than either English or `**`)
- Comparison: `== != > < >= <=`
- Logical: `and`, `or`, `not` stay as short English words (they're rare enough not to add clutter, and `&&`/`||` are genuinely harder to read for beginners)

**High-frequency keyword shortening:** the most-typed actions get the shortest possible word:
- `say` (not `print`) for output
- `set` for variables (kept — dropping it entirely would require `=`, undoing the point)

### Before / After example
```
note: too English (earlier draft — rejected)
if age is greater than 18 and score is at least 90:
    set total to price plus tax minus discount

note: hybrid (current design)
if age > 18 and score >= 90:
    set total to price + tax - discount
```

## 3. Beginner-First Learning Design
- Learnable with just 5 words to write a first working program: `set`, `if`, `otherwise`, `say`, `end`.
- Progressive lesson order: say something → store something → **make something appear on a live webpage (a 2-line taste of the server, deliberately moved early)** → decide → repeat → functions → data (lists/maps) → blueprints → full server/API build (the deeper "wow" moment). Seeing something live on the internet by lesson 3 is what hooks beginners — don't save every server feature for the very end.
- No jargon before it's earned. No setup required to try the first program — **web playground** is the primary entry point.
- `runlang learn` — an interactive terminal tutorial that checks typed snippets and explains mistakes in plain English.
- Every common beginner mistake (forgetting `end`, comparing text to a number, misspelling a variable) gets a hand-written, specific error message.
- Success bar: a total beginner writes a working first program in under 5 minutes, and can use functions/loops/conditionals confidently within an hour — test this on 3 real non-coders before calling it done.

## 4. Full Language Specification

### Comments
```
note: this is a comment
```

### Variables & Constants
```
set name to "Pranjal"
set fixed pi to 3.14159
```

### Data Types
`number`, `text` (with interpolation: `"Hello, {name}"`), `true`/`false`, `nothing` (the one empty value), lists (`a list containing ...`), maps (`a map containing ...`).

### Operators
- Math: `+ - * / % ^`
- Comparison: `== != > < >= <=`
- Logical: `and`, `or`, `not`

### Control Flow
```
if age >= 18:
    say "adult"
otherwise if age >= 13:
    say "teen"
otherwise:
    say "child"
end

repeat 5 times:
    say "hi"
end

while attempts < 3:
    set attempts to attempts + 1
end

for each student in students:
    say student
end
```

### Functions
```
create function total with price and quantity:
    give back price * quantity
end

create function greet with name and title equal to "friend":
    give back "Hello, " + title + " " + name
end
```

### Error Handling
```
try:
    set result to 10 / 0
if something goes wrong as error:
    say "Oops: " + error message
end
```
Custom errors: `stop and say "invalid input"`

### Blueprints (Classes)
```
create a blueprint called Tutor with name, subject, city:
    create function introduce:
        give back name + " teaches " + subject + " in " + city
    end
end

set tutor1 to a new Tutor with name "Alexander", subject "Physics", city "Mathura"
```
Inheritance: `create a blueprint called OnlineTutor based on Tutor with ...`

### Modules
```
bring in "math"
bring in "./helpers.eng"
share function greet
```

### Concurrency
```
create function fetch user with id:
    set response to wait for get request to "https://api.example.com/users/" + id
    give back response
end
```
`wait for` = await; `do at the same time: ... end` = run tasks in parallel.

### Backend Standard Library (v1 requirement)
- **Server:** `create a server`, `when a request comes to "/path":`, `respond with ...`, `start app on port ...`
- **HTTP client:** `get request to`, `post request to`
- **JSON:** automatic conversion between maps/lists and request/response bodies
- **Database:** `connect to database "postgres://..."`, `run query "..." with [params]` (parameterized, safe by default)
- **Files:** `read file "data.txt"`, `write "text" to file "data.txt"`
- **Environment:** `get environment variable "PORT"`
- **Time/date, math, text helpers:** `current time`, `square root of`, `round`, `uppercase of`, `split by`, `join with`, `trim`

### AI Built-In (differentiator — no other beginner language has this natively)
```
set summary to ask ai "summarize this in one sentence: " + article text
```
- `ask ai "[prompt]"` calls a configured LLM API and returns text directly, no separate SDK setup needed for common tasks (summarizing, extracting, classifying).
- Errors from `ask ai` (rate limits, bad key, network issues) follow the same plain-English error philosophy as the rest of the language.

### Built-In Testing (teaches good habits from day one, no separate framework needed)
```
check that total is equal to 100
check that greet with "Ram" is equal to "Hello, friend Ram"
```
- `check that [expression]` runs as a lightweight assertion; failing checks print a plain-English diff ("expected 100, got 90") rather than a raw stack trace.
- `runlang test` runs every `check that` in a project and reports pass/fail counts.

### Error Message Philosophy
Every error states: what the program was trying to do, why it failed in plain terms, and a suggested fix. No raw stack traces by default (`--verbose` flag reveals the underlying JS for advanced debugging).

### Safety Nets by Default
- Database queries only ever run parameterized (`run query "..." with [params]`) — raw string concatenation into SQL is not possible through the standard library, closing off SQL injection by construction, not by convention.
- `--safe mode` (on by default for `runlang learn` and the playground) disables destructive operations (overwriting files, dropping tables) until a learner explicitly opts in with `--allow-unsafe`.

## 5. Tooling Requirements
- **Web playground** — zero install, the default entry point, with pre-loaded examples
- **CLI** — `run file.eng`, `build`, `format file.eng`, `test` (runs all `check that` assertions)
- **REPL + `learn` mode**, with **recoverable-mistake prompts** — e.g. forgetting `end` triggers "It looks like you forgot to close this block with `end` — add it now? (Y/n)" instead of just failing
- **Autocomplete/IntelliSense** in the VS Code extension — suggests the next valid keyword based on context, so beginners aren't guessing what's allowed
- **Package manager** — thin wrapper over npm (`get package "some-library"`) so the JS/npm ecosystem is usable, not rebuilt from scratch
- **VS Code extension** — syntax highlighting, inline errors, hover docs, autocomplete
- **Formatter** — one enforced style, no debates
- **Debugger** — source maps back to `.eng` line numbers

## 6. Documentation to Generate (required deliverable, not optional)
Produce a single, complete Markdown documentation file with:
1. **Getting Started** — 2-sentence intro, no jargon, first runnable program in under 2 minutes.
2. **Step-by-step tutorial** — one concept per section (say → variables → operators → conditionals → loops → lists/maps → functions → error handling → blueprints → modules → concurrency → server → database → capstone project), each with: plain-English explanation, an analogy, a runnable example, and a mini "try it yourself" exercise with expected output.
3. **Full syntax reference** — alphabetical, exhaustive. Every keyword and stdlib function gets: category, one-sentence description, syntax pattern, runnable example, common mistakes + the error message they trigger, and related keywords. Nothing in the language may be left undocumented.
4. **Python comparison appendix** — 10-15 common tasks shown side-by-side in Python and [NAME].
5. **Cheat sheet** — one condensed page, syntax only, grouped by category, for quick lookup once someone already knows the language.

Formatting rules: every example must run as-is with no missing pieces; short plain sentences throughout (the docs should model the same beginner-first philosophy as the language); any unavoidable technical term gets defined in-line the first time it's used; friendly tone, zero assumed prior knowledge in the tutorial sections.

## 7. Community & Content Flywheel

Since documentation and marketing content can share the same source material, design them together rather than separately:
- **"100 Days of [NAME]"-style short-video series** — one keyword or concept per reel, each one doubling as both a marketing asset and a bite-sized tutorial (fits a casual Hindi-language tech-reel format for Indian CS students).
- **Public project gallery** — anything built in the playground can optionally be shared to a public gallery of small community projects, giving new learners inspiration and giving the language social proof without needing a large userbase yet.
- **Every documentation example doubles as content** — write Section 6's tutorial examples so they're screenshot/clip-friendly on their own, reducing the work needed to turn docs into reels later.

## 8. Performance & Efficiency Requirements

Beginner-friendly cannot come at the cost of feeling slow or clunky — both must be true at once.

- **Transpile, don't interpret line-by-line.** Since [NAME] compiles down to JS/TypeScript ahead of time (not interpreted token-by-token at runtime), programs run at native Node.js speed once transpiled — there is no separate slow "runtime engine" bottleneck to worry about.
- **Fast feedback loop for learners.** Running a file (`run file.eng`) should feel instant — target under 200ms from command to output for typical beginner-sized programs (lex + parse + transpile + execute combined). This matters more for a beginner's experience than raw runtime speed, since it's what they feel every single time they hit run.
- **Lean generated code.** The transpiler should output clean, minimal JS — no unnecessary wrapper functions or bloated boilerplate per line — so transpiled backend code runs efficiently in production, not just in the playground.
- **Efficient standard library.** Built-in functions (database queries, HTTP requests, JSON handling) should be thin wrappers directly over well-optimized existing Node libraries (e.g. `pg` for Postgres, native `fetch`) — never reinvented from scratch, since reinventing usually means slower and buggier.
- **No performance tax for readability.** Full-English keywords (`is greater than`, `create function`) must compile to the exact same efficient JS as their symbol equivalents — the friendliness is only a surface-level translation layer, with zero runtime cost.
- **Benchmark it.** Include a small benchmark suite (loops, function calls, list operations) comparing transpiled [NAME] output against equivalent hand-written JS and Python, to confirm speed stays close to native JS and meaningfully faster than Python for typical backend workloads.

## 9. Implementation Architecture
1. **Lexer** — tokenizes source, handling both symbol operators and multi-word English keywords.
2. **Parser** — builds an AST; produces plain-English, line/column-anchored error messages.
3. **Transpiler** — AST → readable JS/TypeScript, with source maps preserved for debugging.
4. **Runtime helpers** — small JS library implementing `nothing`, error formatting, and the backend stdlib (server, DB, HTTP).
5. **Test suite** — golden-file tests (`.eng` in, expected output out) covering every feature and every documented "common mistake" error message.

## 10. Build Phases
1. **Core** — variables, operators (hybrid syntax), control flow, functions, error handling; CLI + REPL.
2. **Data & OOP** — lists, maps, blueprints/inheritance, modules.
3. **Backend** — server, routes, HTTP client, JSON, database, env vars.
4. **Polish** — VS Code extension, formatter, full documentation (Section 6), web playground.
5. **v1.0** — package manager bridge to npm, concurrency, performance pass.

## 11. Success Criteria
- Beginner correctly predicts what 8/10 example programs do after seeing only 3 examples first.
- First working program written unassisted within 5 minutes in the playground.
- Functions, loops, and conditionals used confidently within one hour of starting, unaided.
- Every error message is understandable with no outside lookup.
- A REST API with a database read/write built in under 40 lines.
- Documentation (Section 6) covers 100% of language keywords/functions with no gaps.
- Onboarding tested on 3 real non-coders; any point of confusion is treated as a design/doc bug to fix.
- `run file.eng` feels instant for typical beginner programs (under ~200ms end-to-end).
- Benchmark suite shows transpiled output performs close to hand-written JS, and noticeably faster than equivalent Python for typical backend tasks (loops, requests, JSON handling).

## 12. Deliverables
1. Full grammar specification.
2. Lexer, parser, transpiler, runtime helper library (TypeScript/Node project).
3. CLI + REPL with `learn` mode and recoverable-mistake prompts.
4. Web playground with safe mode on by default and a public project gallery.
5. 15+ example programs, including one full backend demo (API + database) and one using `ask ai`.
6. VS Code extension — syntax highlighting, inline errors, hover docs, autocomplete.
7. Complete documentation file per Section 6.
8. Benchmark suite comparing transpiled output to hand-written JS and Python.
9. `check that` testing support wired into the CLI (`runlang test`).
