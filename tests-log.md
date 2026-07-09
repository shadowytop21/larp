# Comprehensive Testing Log (Part 2)

This document contains the execution outputs of all the new LARP features added in this iteration. All tests were executed using the newly bundled `larp-lang-win.exe` standalone binary.

## 1. Loop Control & Match (`loop_control.larp`)
```text
Outer: 0 Inner: 0
Outer: 0 Inner: 2
Outer stopped at 1!
Name: Guest
$15.50
```

## 2. Compile-time Type Checking (`type_check.larp`)
```text
Error in examples\tests\type_check.larp (line 1, column 10):
  Cannot use '+' between different types directly.

Fix: Convert them first.
```

## 3. Currency Formatting (`format_currency.larp`)
```text
Balance is $1,450.50
Debt is -$30.00
```

## 4. Seeded Randomization (`seed_test.larp`)
```text
0.6011037519201636
45
0.6011037519201636
45
```
*(Notice how the random values match exactly after resetting the seed to 42)*

## 5. Null Safety (`null_safety.larp`)
```text
Anonymous
Alice
```

## 6. Real-World Bug Fix (`guess-the-number.larp`)
```text
=== Guess the Number ===
I'm thinking of a number between 1 and 100.
You have 7 attempts. Good luck!

Attempt 1: guessing 50
  Too high! Try lower.
Attempt 2: guessing 75
  ...
Attempt 7: guessing 43

  ✓ Correct! The number was 43
  You got it in 7 attempts!

Game over — you won!
```
*(The loop exited immediately after the win condition instead of printing "Out of attempts" or continuing!)*
