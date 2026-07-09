# LARP Example Gallery

Here are some real-world examples of what you can build with LARP! All of these can be found in the `/examples` directory.

## 1. Blog Backend API (`blog-backend.larp`)
A complete REST API that connects to a PostgreSQL database to manage blog posts.
```larp
bring in "db"

say "Starting Blog Backend..."
connect to database "postgres://user:password@localhost:5432/blogdb"

create a server
start app on port 3000

note: Get all posts
when a GET request comes to "/api/posts":
    set posts to run query "SELECT * FROM posts ORDER BY created_at DESC"
    respond with posts
end

note: Get a single post by ID
when a GET request comes to "/api/posts/:id":
    set id to request.params.id
    set result to run query "SELECT * FROM posts WHERE id = $1" with a list containing id
    
    if length of result is 0:
        respond with a map containing "error" is "Post not found"
    otherwise:
        respond with result[0]
    end
end
```

## 2. Interactive Quiz Game (`quiz-game.larp`)
A terminal-based quiz game that iterates through a list of questions and tracks your score.
```larp
bring in "helpers"

say "Welcome to the LARP Quiz Game!"
set score to 0

set q1 to a map containing "question" is "What is the capital of France?", "answer" is "Paris"
set q2 to a map containing "question" is "What is 5 + 7?", "answer" is "12"

set questions to a list containing q1, q2

for each q in questions:
    say q.question
    set userAnswer to helpers.askUser with "Your answer: "
    
    if userAnswer is equal to q.answer:
        say "Correct!"
        set score to score + 1
    otherwise:
        say "Wrong! The correct answer was " + q.answer
    end
end

say "You scored " + score + " out of " + length of questions
```


## 1. Number Guessing Game (`guess-the-number.larp`)
A complete CLI game using random numbers and console input.
```larp
bring in "math"

say "Welcome to Guess the Number!"
set secret to math.randomInt(1, 100)
set guessing to true
set attempts to 0

while guessing:
    set attempts to attempts + 1
    say "Guess a number between 1 and 100:"
    set guess to ask user
    
    if guess == secret:
        say "You got it in " + attempts + " attempts!"
        set guessing to false
    otherwise if guess < secret:
        say "Too low!"
    otherwise:
        say "Too high!"
    end
end
```

## 2. To-Do REST API (`todo-api.larp`)
A fully functional REST API with an in-memory database.
```larp
create a server
set todos to a list containing

when a request comes to "/todos":
    respond with todos
end

when a request comes to "/todos" with method POST as req:
    set newTodo to a map containing "task" is req.body["task"], "done" is false
    set todos to todos + a list containing newTodo
    respond with newTodo
end

start app on port 3000
```

## 3. AI Article Summarizer (`ai-summarizer.larp`)
A tool that downloads a webpage and uses AI to summarize it.
```larp
note: Requires LARP_AI_KEY to be set
set url to "https://example.com/article"

try:
    say "Fetching article..."
    set html to wait for get request to url
    
    say "Summarizing..."
    set summary to ask ai "Summarize this text in 3 bullet points: " + html
    say summary
if something goes wrong as err:
    say "Failed to summarize: " + err.message
end
```

## 4. Student Grade Calculator (`student-grades.larp`)
Processing lists of data using custom blueprints.
```larp
create a blueprint called Student with name, score:
    create function getGrade:
        if score >= 90: give back "A"
        otherwise if score >= 80: give back "B"
        otherwise: give back "C"
        end
    end
end

set class to a list containing
class.push with a new Student with name "Alice", score 95
class.push with a new Student with name "Bob", score 82

for each student in class:
    say student.name + " got a " + student.getGrade
end
```
