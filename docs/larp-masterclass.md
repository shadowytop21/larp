# The LARP Masterclass: From Zero to Builder

Welcome to **LARP**! 

LARP was built with a single goal: to be the absolute easiest programming language to learn in the world, while still giving you the exact same superpowers as professional backend engineers. 

With LARP, you don't need to learn confusing symbols like `{}`, `()`, or cryptic words like `public static void`. Instead, LARP **reads like English where it matters, and reads like math where math is clearer.**

By the end of this masterclass, you will know how to write code, build a live web server, and integrate Artificial Intelligence (AI) into your apps. Let's get building!

---

## Part 1: The Basics

### 1. Talking to the computer
The easiest way to get started is to make the computer say something back to you. We use the word `say`.

```larp
say "Hello, world!"
say "I am writing code."
```

### 2. Remembering things (Variables)
You often need the computer to remember a piece of information so you can use it later. We do this using `set`.

```larp
set name to "Alex"
set age to 20

say "My name is " + name
```
> [!TIP]
> If you have a value that should *never* change (like the speed of light), use `set fixed`:
> `set fixed gravity to 9.8`

### 3. Making Decisions
Computers are smart because they can make decisions based on different situations. We use `if`, `otherwise if`, and `otherwise`.
Every block of decisions **must** end with the word `end`.

```larp
set temperature to 35

if temperature > 30:
    say "It is really hot outside!"
otherwise if temperature < 15:
    say "It is quite cold!"
otherwise:
    say "The weather is perfect."
end
```

### 4. Doing things over and over (Loops)
If you want to repeat an action, you don't need to write the code 100 times. Just use a loop!

**Repeat a specific number of times:**
```larp
repeat 5 times:
    say "I will not talk in class."
end
```

**Loop until a condition is met:**
```larp
set countdown to 3
while countdown > 0:
    say countdown
    set countdown to countdown - 1
end
say "Liftoff!"
```

---

## Part 2: Leveling Up

### 1. Lists
A list is exactly what it sounds like: a way to store multiple items in a single variable.

```larp
set movies to a list containing "Inception", "Interstellar", "Batman"

for each movie in movies:
    say "I love watching " + movie
end
```

### 2. Maps (Dictionaries)
A map lets you store information using "labels" (keys) and "values". Think of it like a contact in your phone book.

```larp
set player to a map containing "name" is "Hero", "score" is 1500

say "Player Name: " + player.name
say "High Score: " + player.score
```

### 3. Creating your own Functions
When you write a really useful chunk of code, you can wrap it in a `function` so you can easily use it again later. Use `give back` to output the final result.

```larp
create function calculate_tax with price:
    set tax to price * 0.18
    give back tax
end

set my_tax to calculate_tax with 100
say "You owe: $" + my_tax
```

---

## Part 3: The Superpowers (Real Projects)

Now that you know the basics, let's look at what makes LARP truly special. LARP comes with built-in modules for Web Servers, AI, and Databases!

To use these superpowers, you just type `bring in "module_name"`.

### Superpower 1: Building a live Web Server
In other languages, building a web server takes hours of setup. In LARP, it takes 4 lines of code.

**Project: A Custom Website Backend**
Create a file called `server.larp` and write this:

```larp
bring in "server"

create a server

when a request comes to "/welcome":
    respond with "Welcome to my very first website built in LARP!"
end

start app on port 8080
```
Run `larp run server.larp`, open your browser to `http://localhost:8080/welcome`, and you will see your website!

### Superpower 2: Artificial Intelligence
LARP is the only beginner language in the world that has AI built directly into the standard library.
*(Note: To use this, you must have an OpenAI API key saved in an environment variable named `LARP_AI_KEY` on your computer).*

**Project: A Smart Summarizer App**
```larp
bring in "ai"

set long_article to "The quick brown fox jumped over the lazy dog. The dog was very tired because it had been playing all day in the sun."

say "Asking the AI to summarize..."
set summary to ask ai "Summarize this in exactly 3 words: " + long_article

say "AI says: " + summary
```

### Superpower 3: Reading and Writing Files
Want to save high scores in your game? Use the `files` module!

**Project: A High Score Tracker**
```larp
bring in "files"

set new_score to 9999
write new_score to file "highscore.txt"

set saved_score to read file "highscore.txt"
say "The current high score is: " + saved_score
```

---

## Capstone Project: An AI-Powered API

Let's combine everything you just learned into a massive, professional-grade project. We are going to build a live Web API that takes a topic from a user, asks AI to write a joke about it, and sends the joke back to the browser!

Create a file called `ai_joke_server.larp`:

```larp
bring in "server"
bring in "ai"

say "Starting the AI Joke Server..."

create a server

note: When a user visits http://localhost:3000/joke
when a request comes to "/joke":
    
    note: Ask the AI for a joke
    set joke to ask ai "Tell me a short, funny programming joke."
    
    note: Create a map to send back as JSON
    set response_data to a map containing "success" is true, "joke" is joke
    
    respond with response_data
end

start app on port 3000
```

> [!IMPORTANT]  
> Run this file using `larp run ai_joke_server.larp`. Open your browser to `http://localhost:3000/joke`. You just built an AI-powered microservice backend in 15 lines of code!

---

## You are now a Developer.
Congratulations! You have learned variables, logic, loops, functions, and how to build live web servers with AI integration. 

You are no longer just using apps—you have the power to build them. Happy coding!
