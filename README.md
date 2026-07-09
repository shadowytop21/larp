# ⟨ LARP ⟩ — Language for Accessible Rapid Programming

LARP is a beginner-friendly, plain-English programming language designed to bridge the gap between human thought and executable code. 

**"Reads like English where it matters, reads like math where math is clearer."**

LARP compiles directly into fast, clean Node.js JavaScript and comes with built-in protections against common errors (like confusing stack traces or missing variables).

---

## 🚀 Getting Started

### 1. Build the Language
Before you can run LARP programs, you need to compile the language itself:
```bash
# Install dependencies
npm install

# Compile the TypeScript compiler to JavaScript
npm run compile
```

### 2. Set Up the CLI (Command Line Interface)
To use the `larp` command everywhere in your terminal, link the package globally:
```bash
npm link
```

### 3. Run a Program
Now you can run any of the examples! (If you didn't run `npm link`, you can use `node dist/cli/index.js run examples/hello.larp` instead).

```bash
larp run examples/hello.larp
```

---

## 🛠️ CLI Commands

* **`larp run <file.larp>`**: Runs your program instantly.
* **`larp build <file.larp>`**: Transpiles your code into a `.js` file that you can deploy anywhere Node.js runs.
* **`larp format <file.larp>`**: Auto-formats your code (fixes indentation).
* **`larp test [directory]`**: Runs all test files in a folder and checks `check that` statements.
* **`larp learn`**: **(Recommended!)** Starts an interactive, 8-lesson tutorial directly in your terminal.

---

## 📖 Language Syntax Guide

### Variables and Output
```larp
note: This is a comment!
set name to "Pranjal"
set fixed PI to 3.14159

say "Hello, " + name
```

### Conditions
```larp
set score to 85

if score >= 90:
    say "A"
otherwise if score >= 80:
    say "B"
otherwise:
    say "Needs improvement"
end
```

### Loops
```larp
note: Repeat a specific number of times
repeat 5 times:
    say "Hello!"
end

note: Loop over a list
set fruits to a list containing "apple", "mango"
for each fruit in fruits:
    say fruit
end
```

### Functions
```larp
create function greet with name:
    give back "Hello, " + name
end

say greet with "Alice"
```

### Blueprints (Classes/Objects)
```larp
create a blueprint called Animal with name, sound:
    create function speak:
        give back name + " says " + sound
    end
end

set dog to a new Animal with name "Rex", sound "Woof"
say dog.speak
```

### Built-in AI! 🤖
LARP has a built-in AI assistant you can call from code. Just set your `LARP_AI_KEY` environment variable (OpenAI or Gemini).
```larp
try:
    set summary to ask ai "Summarize this article: ..."
    say summary
if something goes wrong as error:
    say "AI is sleeping!"
end
```

---

## 🎮 Web Playground

You don't even need to use the terminal to try LARP! 
Open `playground/index.html` in your web browser to access the beautiful, interactive web playground. It includes an in-browser interpreter, a cheat sheet, and 12+ pre-loaded examples.

## 📝 VS Code Extension

LARP comes with a VS Code extension for full syntax highlighting and auto-closing brackets!

1. Open VS Code and press `Ctrl+Shift+X` to open Extensions.
2. Click `...` -> `Install from VSIX` (once built), OR to use it right now:
3. Open the `vscode-extension` folder in VS Code, and press `F5` to launch an Extension Development Host with LARP syntax highlighting enabled!
