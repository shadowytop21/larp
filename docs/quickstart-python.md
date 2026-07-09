# Quickstart: LARP for Python Developers

If you know Python, you already know 90% of LARP! LARP uses a similar indentation-based block structure (though LARP uses the `end` keyword to explicitly close blocks, making it safer for beginners).

## Key Differences

1. **Variables:** Use `set x to 5` instead of `x = 5`. For constants, use `set fixed PI to 3.14`.
2. **Printing:** Use `say` instead of `print()`.
3. **Functions:** Use `create function name with args:` instead of `def name(args):`.
4. **Return:** Use `give back` instead of `return`.
5. **Loops:** Use `for each item in list:` instead of `for item in list:`.
6. **Block Endings:** Always close blocks (`if`, `for`, `while`, `create function`) with `end`.

## Python to LARP Cheat Sheet

### Variables
**Python:**
```python
name = "Alice"
age = 30
```
**LARP:**
```larp
set name to "Alice"
set age to 30
```

### Conditionals
**Python:**
```python
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("C")
```
**LARP:**
```larp
if score >= 90:
    say "A"
otherwise if score >= 80:
    say "B"
otherwise:
    say "C"
end
```

### Functions
**Python:**
```python
def add(a, b):
    return a + b
```
**LARP:**
```larp
create function add with a and b:
    give back a + b
end
```

### Lists and Loops
**Python:**
```python
fruits = ["apple", "banana"]
for fruit in fruits:
    print(fruit)
```
**LARP:**
```larp
set fruits to a list containing "apple", "banana"
for each fruit in fruits:
    say fruit
end
```
