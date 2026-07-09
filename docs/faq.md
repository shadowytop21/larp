# LARP Frequently Asked Questions (FAQ) & Top Beginner Mistakes

## General FAQ

**1. Why use LARP instead of Python or JavaScript?**
LARP is designed to be as close to plain English as possible, minimizing the punctuation and syntax rules that often trip up beginners (like forgetting a semicolon, mixing up `=` and `==`, or misplacing brackets). It's great for first-time coders, kids, and educators. Unlike visual blocks (like Scratch), it's real text-based coding that prepares you for traditional languages.

**2. Can I build real apps with LARP?**
Yes! Even though the syntax is simple, LARP compiles to JavaScript and runs on Node.js. It has built-in support for running web servers, connecting to databases, reading/writing files, and making network requests. You can build a real REST API in 10 lines of code.

**3. Does LARP support AI?**
Yes! LARP has a native `ask ai` keyword. By setting the `LARP_AI_KEY` environment variable, your programs can instantly query large language models like OpenAI's GPT or Google's Gemini natively.

**4. How fast is LARP?**
Very fast! Because LARP compiles directly to clean, standard JavaScript, it runs exactly as fast as a traditional Node.js application.

**5. How do I deploy a LARP app?**
Because LARP builds into JavaScript, you can deploy a LARP app anywhere you can deploy a Node.js app (like Render, Heroku, Vercel, or a standard VPS). Just run `larp build myapp.larp`, and deploy the resulting `myapp.js`.

**6. Can I use npm packages?**
Currently, LARP has a built-in standard library for the most common tasks (HTTP, files, math, AI). Support for importing arbitrary npm modules is planned for a future release.

---

## Top 20 Common Beginner Mistakes

**1. Forgetting `is equal to` vs `set`**
- **Mistake:** Writing `if x set 5:`
- **Correction:** Use `if x is equal to 5:` for checking conditions. `set` is only for creating or changing variables.

**2. Missing Colons `:` at the End of Blocks**
- **Mistake:** `if score > 10`
- **Correction:** `if score > 10:` — Blocks like `if`, `while`, and `function` must end with a colon.

**3. Misspelling `end`**
- **Mistake:** Forgetting to write `end` to close a block, which causes the rest of the file to be treated as inside the block.
- **Correction:** Every `if`, `while`, `for each`, and `function` needs a matching `end`.

**4. Indentation Confusion**
- **Mistake:** Indenting randomly.
- **Correction:** LARP is space-aware for formatting, but relies on `end` to close blocks. Still, it's best to indent consistently to read your code clearly.

**5. Mixing Up `say` and `return`**
- **Mistake:** Using `say result` inside a function to give a value back.
- **Correction:** `say` prints to the screen. Use `return result` to send a value back to the caller.

**6. Using JavaScript Syntax**
- **Mistake:** Writing `const x = 5;` or `console.log("hello")`
- **Correction:** Write `set fixed x to 5` and `say "hello"`. LARP doesn't use JS syntax.

**7. Uninitialized Variables**
- **Mistake:** Writing `set x to x + 1` without creating `x` first.
- **Correction:** Always define a variable with a starting value: `set x to 0`.

**8. Misusing `and` / `or` Logic**
- **Mistake:** `if x is 5 or 6:`
- **Correction:** `if x is equal to 5 or x is equal to 6:`

**9. Forgetting Quotes Around Strings**
- **Mistake:** `say Hello World`
- **Correction:** `say "Hello World"` (Text must be wrapped in quotes).

**10. Incorrect API Route Paths**
- **Mistake:** `when a GET request comes to home:`
- **Correction:** `when a GET request comes to "/home":` (Route paths must be strings).

**11. Returning HTTP Responses with `return`**
- **Mistake:** `return "Success"` inside a route handler.
- **Correction:** Use `respond with "Success"` to send data back to the client.

**12. Bringing in Modules Incorrectly**
- **Mistake:** `import math`
- **Correction:** `bring in "math"`

**13. Calling Functions Without Arguments**
- **Mistake:** `say randomInt`
- **Correction:** `say math.randomInt with 1 and 10` (if it requires arguments, provide them).

**14. Misusing Loop Counters**
- **Mistake:** Trying to modify the item variable in a `for each item in items:` loop and expecting the original list to change.
- **Correction:** The item variable is a temporary copy.

**15. Over-complicating `otherwise if`**
- **Mistake:** Writing an `if` inside an `otherwise` instead of using `otherwise if`.
- **Correction:** Use `otherwise if condition:` to keep it clean.

**16. Forgetting `await` Context**
- **Mistake:** Thinking `ask ai` blocks the whole server.
- **Correction:** LARP handles async automatically under the hood, but don't assume external calls are instantaneous.

**17. Incorrect List Creation**
- **Mistake:** `set list to [1, 2, 3]`
- **Correction:** `set list to a list containing 1, 2, 3`

**18. Using `break` outside loops**
- **Mistake:** Trying to stop an `if` block with `stop`.
- **Correction:** `stop` only works inside `while`, `repeat`, and `for each` loops.

**19. Misusing `repeat`**
- **Mistake:** `repeat x:` when `x` is a string.
- **Correction:** `repeat` must be followed by a number or a variable holding a number.

**20. Trying to Catch Errors Without `try`**
- **Mistake:** Hoping a failing database call won't crash the script.
- **Correction:** Use `if something goes wrong:` to handle risky operations.
