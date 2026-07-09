# Quickstart: LARP for JavaScript Developers

LARP compiles directly to JavaScript! Think of LARP as a friendlier, highly readable front-end for the Node.js runtime. 

## Key Differences

1. **No brackets or semicolons:** LARP uses colons `:` to open blocks and `end` to close them.
2. **Variables:** `set x to 5` maps to `let x = 5`. `set fixed x to 5` maps to `const x = 5`.
3. **Equality:** LARP's `==` automatically maps to JavaScript's strict `===`.
4. **Console:** Use `say` instead of `console.log()`.
5. **Nulls:** LARP uses `nothing` instead of `null` or `undefined`.
6. **Async/Await:** LARP handles async automatically in most cases. You don't need to manually write `async/await` for standard library calls, though you can use `wait for` if you want explicit control.

## JS to LARP Cheat Sheet

### Variables & Constants
**JavaScript:**
```javascript
let count = 0;
const MAX = 100;
```
**LARP:**
```larp
set count to 0
set fixed MAX to 100
```

### Objects and Arrays
**JavaScript:**
```javascript
const user = { name: "Alice", age: 30 };
const items = [1, 2, 3];
```
**LARP:**
```larp
set fixed user to a map containing "name" is "Alice", "age" is 30
set fixed items to a list containing 1, 2, 3
```

### Switch Statements
**JavaScript:**
```javascript
switch(status) {
    case "ok": console.log("Good"); break;
    default: console.log("Bad");
}
```
**LARP:**
```larp
match status:
    case "ok":
        say "Good"
    otherwise:
        say "Bad"
end
```

### Classes
**JavaScript:**
```javascript
class Dog extends Animal {
    constructor(name) {
        super(name);
        this.name = name;
    }
    speak() {
        return this.name + " barks!";
    }
}
```
**LARP:**
```larp
create a blueprint called Dog extending Animal with name:
    create function speak:
        give back name + " barks!"
    end
end
```
