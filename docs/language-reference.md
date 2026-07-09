# LARP Language Reference

LARP (Language for Accessible Rapid Programming) is a beginner-first language designed to bridge the gap between human thought and executable code.

**"Reads like English where it matters, reads like math where math is clearer."**

---

## 1. Getting Started

LARP programs run as standalone executables — no Node.js, npm, or JavaScript knowledge needed.

```
larp run hello.larp       # Run a LARP program
larp build hello.larp     # Compile to a .js file
larp test ./tests/        # Run all test files
larp format hello.larp    # Auto-format a file
larp install              # Install dependencies from larp.json
larp init                 # Create a new larp.json manifest
larp version              # Show version
```

Your very first program:
```larp
say "Hello, World!"
```

---

## 2. Step-by-Step Tutorial

### Output (`say`)
```larp
say "Welcome to LARP!"
say 42
say "Price is " + price
```

### Variables (`set`)
```larp
set name to "Alice"
set age to 25
set fixed PI to 3.14159     note: constants can't be changed
say "Hello, " + name
```

### Console Input & Type Conversion
```larp
set name to ask "What's your name? "
say "Hello, " + name

set age_text to ask "How old are you? "
set age to age_text as a number
say "Next year you'll be " + (age + 1)

set price to 10
say "The price is " + (price as text)
```

### Operators & Math
```larp
set price to 10
set tax to 2
set total to price + tax
say total

set area to 5 ^ 2          note: exponent / power
say square root of 144      note: = 12
```

### Conditionals (`if`)
```larp
set score to 85

if score >= 90:
    say "A"
otherwise if score >= 80:
    say "B"
otherwise:
    say "Try again"
end
```

### Match (Pattern Matching)
Use `match` when you have many specific cases — cleaner than long `if / otherwise if` chains.
```larp
set day to "Monday"

match day:
    case "Monday":
        say "Start of the week!"
    case "Friday":
        say "Almost the weekend!"
    otherwise:
        say "A regular day."
end
```

### Loops
```larp
note: Repeat a fixed number of times
repeat 3 times:
    say "Knock"
end

note: Loop while a condition is true
set count to 0
while count < 3:
    say count
    set count to count + 1
end

note: Loop over a list
set fruits to a list containing "apple", "banana", "cherry"
for each fruit in fruits:
    say fruit
end
```

### Loop Control
```larp
note: Exit the loop immediately
for each item in items:
    if item == "stop":
        stop this loop
    end
    say item
end

note: Skip to the next iteration
for each number in numbers:
    if number % 2 == 0:
        skip this attempt
    end
    say number       note: Only prints odd numbers
end

note: Break out of nested loops
for each row in grid:
    for each cell in row:
        if cell == "X":
            stop the outer loop
        end
    end
end

note: Stop the entire program
if error_occurred:
    say "Critical error!"
    stop the program
end
```

### Lists and Maps
```larp
set fruits to a list containing "apple", "banana", "cherry"

note: List operations
fruits.add "mango"
fruits.remove "banana"
say fruits length          note: = 3
say fruits.contains "mango" note: = true
say fruits.at 0            note: = "apple"
set sorted_fruits to fruits.sorted

set user to a map containing "name" is "Alice", "age" is 25
say user["name"]        note: = "Alice"
say user.name           note: also works
```

### Functions (`create function`)
```larp
create function greet with person:
    give back "Hello, " + person + "!"
end

say greet with "Alice"

note: Default parameters
create function power with base and exponent = 2:
    give back base ^ exponent
end

say power with 5         note: = 25
say power with 3 and 3   note: = 27
```

### Null Safety (`use ... otherwise`)
When a value might be missing (`nothing`), provide a fallback:
```larp
set name to nothing
set display to use name otherwise "Anonymous"
say display    note: prints "Anonymous"

set name to "Alice"
set display to use name otherwise "Anonymous"
say display    note: prints "Alice"
```

### String Formatting
```larp
set balance to 1450.50
say format balance as currency    note: "$1,450.50"

set name to "World"
say "Hello, {name}!"             note: String interpolation with {}
```

### Error Handling (`try`)
```larp
try:
    set result to 10 / 0
if something goes wrong as error:
    say "Oops: " + error message
end

note: Throw your own errors
if age < 0:
    stop and say "Age cannot be negative"
end
```

### Blueprints (Classes)
```larp
create a blueprint called Animal with name and sound:
    create function speak:
        give back name + " says " + sound
    end
end

create a blueprint called Dog extending Animal with name:
    create function speak:
        give back name + " barks!"
    end
end

set cat to a new Animal with name "Whiskers" and sound "Meow"
set dog to a new Dog with name "Rex"
say cat.speak
say dog.speak
```

### Modules (`bring in`)
```larp
note: In utils.larp
create function add with a and b:
    give back a + b
end
share function add

note: In main.larp
bring in "./utils.larp"
say add with 5 and 10

note: Built-in modules
bring in "math"
say math.squareRoot with 16    note: = 4
say math.randomInt with 1, 100
```

### Randomness
```larp
note: Basic random number
set x to random_int(1, 6)

note: Reproducible (seeded) random — same seed gives same results
seed random with 42
set n1 to random_int(1, 100)
seed random with 42
set n2 to random_int(1, 100)
say n1 == n2     note: true — both are the same!
```

### Server & Concurrency
```larp
create a server
when a request comes to "/":
    respond with "Hello from LARP!"
end
start app on port 3000
```

### Database
```larp
connect to database "postgres://user:pass@localhost/db"
set users to wait for run query "SELECT * FROM users"
say users
```

### AI Integration
```larp
note: Set LARP_AI_KEY environment variable first
set reply to ask ai "What is the capital of France?"
say reply
```

### Command-Line Arguments
```larp
note: Read a CLI argument (e.g. larp run script.larp --env prod)
set env to command line argument "env" otherwise "dev"
say "Running in " + env + " mode."
```

### Package Management
Create a `larp.json` in your project folder using `larp init`. You can specify npm dependencies there. Run `larp install` to install them, and then use `bring in` to import them into your LARP programs.
```json
{
  "name": "my-app",
  "dependencies": {
    "axios": "^1.0.0"
  }
}
```

### Testing (`check that`)
```larp
create function add with a and b:
    give back a + b
end

check that add with 2 and 2 is equal to 4
check that add with 0 and 5 is equal to 5
```

---

## 3. Full Syntax Reference

| Keyword / Symbol | Description | Example |
|---|---|---|
| `set ... to ...` | Creates or updates a variable. | `set x to 5` |
| `set fixed ... to ...` | Creates a constant (can't be changed). | `set fixed PI to 3.14` |
| `say ...` | Prints output to the console. | `say "Hello"` |
| `if ...:` | Starts a conditional block. | `if x > 5:` |
| `otherwise if ...:` | Alternate condition. | `otherwise if x == 5:` |
| `otherwise:` | Default fallback. | `otherwise:` |
| `end` | Closes a block. | `end` |
| `match ...:` | Pattern match on a value. | `match day:` |
| `case ...:` | A case in a match block. | `case "Monday":` |
| `repeat ... times:` | Fixed-count loop. | `repeat 5 times:` |
| `while ...:` | Condition-based loop. | `while x < 10:` |
| `for each ... in ...:` | Loops over a list. | `for each item in list:` |
| `stop this loop` | Exits the current loop (`break`). | `stop this loop` |
| `stop the outer loop` | Exits the enclosing outer loop. | `stop the outer loop` |
| `skip this attempt` | Skips to next iteration (`continue`). | `skip this attempt` |
| `create function ...:` | Defines a new function. | `create function greet:` |
| `give back ...` | Returns a value from a function. | `give back true` |
| `a list containing ...` | Creates a list/array. | `a list containing 1, 2` |
| `a map containing ...` | Creates a map/object. | `a map containing "a" is 1` |
| `use ... otherwise ...` | Null-coalescing (fallback if nothing). | `use name otherwise "Guest"` |
| `format ... as currency` | Formats a number as currency string. | `format price as currency` |
| `seed random with ...` | Seeds random number generator. | `seed random with 42` |
| `try:` | Starts an error-catching block. | `try:` |
| `if something goes wrong as ...:` | Catches errors. | `if something goes wrong as err:` |
| `stop and say ...` | Throws a custom error. | `stop and say "bad input"` |
| `create a blueprint ...:` | Defines a class/blueprint. | `create a blueprint called User:` |
| `bring in "..."` | Imports a module or file. | `bring in "./math"` |
| `share function ...` | Exports a function. | `share function run` |
| `ask ai "..."` | Queries the configured AI API. | `ask ai "Summarize this"` |
| `wait for ...` | Awaits an async operation. | `wait for get request to "url"` |
| `check that ... is equal to ...` | Asserts a value matches expected. | `check that 5 is equal to 5` |
| `ask ...` | Prompts user for console input. | `set n to ask "Name: "` |
| `... as a number` | Converts a value to a number. | `set num to str as a number` |
| `... as text` | Converts a value to text. | `set str to num as text` |
| `stop the program` | Exits the program immediately. | `stop the program` |
| `command line argument ...` | Reads a CLI flag. | `command line argument "mode" otherwise "dev"` |
| `note starts` / `note ends` | Multi-line comment block. | `note starts ... note ends` |
| `note: ...` | A comment (ignored by the language). | `note: this is a comment` |

---

## 4. Python vs LARP Appendix

| Task | Python | LARP |
|---|---|---|
| Assignment | `x = 5` | `set x to 5` |
| Constant | `X = 5  # convention` | `set fixed X to 5` |
| Printing | `print("hi")` | `say "hi"` |
| Conditionals | `if x > 5:` | `if x > 5:` |
| Match / Switch | `match x: case 1: ...` | `match x: case 1: ... end` |
| Functions | `def add(a, b): return a+b` | `create function add with a and b: give back a+b end` |
| Default params | `def f(x=1):` | `create function f with x = 1:` |
| For loop | `for item in items:` | `for each item in items:` |
| Break | `break` | `stop this loop` |
| Continue | `continue` | `skip this attempt` |
| Null coalesce | `x or "default"` | `use x otherwise "default"` |
| Try/Catch | `try: ... except Exception as e:` | `try: ... if something goes wrong as e:` |
| Class | `class Dog:` | `create a blueprint called Dog:` |
| Inheritance | `class Dog(Animal):` | `create a blueprint called Dog extending Animal:` |

---

## 5. Cheat Sheet

```larp
note: VARIABLES
set x to 10
set fixed MAX to 100

note: OUTPUT
say "Hello, World!"
say "Balance: " + (format balance as currency)

note: CONDITIONS
if x > 5:
    say "Big"
otherwise if x == 5:
    say "Exactly 5"
otherwise:
    say "Small"
end

note: PATTERN MATCHING
match status:
    case "ok":
        say "All good"
    case "error":
        say "Something went wrong"
    otherwise:
        say "Unknown status"
end

note: LOOPS
repeat 3 times:
    say "Knock"
end

while x > 0:
    set x to x - 1
end

for each item in myList:
    if item == "skip me":
        skip this attempt
    end
    say item
end

note: FUNCTIONS
create function add with a and b:
    give back a + b
end
say add with 2 and 3    note: 5

note: NULL SAFETY
set value to nothing
set safe to use value otherwise "default"

note: TESTING
check that add with 2 and 2 is equal to 4
```
