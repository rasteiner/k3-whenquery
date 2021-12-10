# k3-whenquery
Conditionally show fields and sections. Better.

## Install
Plugin is currently in beta stage - it's available only as download here. 

## (really bad) Example usage
```yml
title: Default Page

sections:
  info:
    text: Enter some content, will you?
    whenQuery: text.length < 10
  fields:
    fields:
      text:
        type: text
```

## Query syntax
Almost like javascript, but only expressions (no flow control).

There are no assignments and function calls (it's meant to be as harmless as possible). 
Since there are no assignments, `=` is an equality comparison (there is no `==`). 

## Supported operators
 - `... = ...`: Equals
 - `... != ...`: Not equals
 - `... < ...`: Less than
 - `... > ...`: Greater than
 - `... <= ...`: Less or equal
 - `... >= ...`: Greater or equal
 - `... =~ ...`: Search something in something (see below)
 - `... ?? ...`: Nullish coalescing operator 
 - `... ? ... : ...`: Ternary operator
 - `... || ...`: Logical Or
 - `... && ...`: Logical And
 - `... + ...`: String concatenation or Number addition
 - `... - ...`: Number subtraction
 - `... * ...`: Number multiplication
 - `... / ...`: Number division
 - `(...)`: Precedence grouping
 - `...[...]`: Optional subscript operator (calculated member access)
 - `.`: Optional member access by identifier

Member Access is always "optional": it does never throw an error if you access a property of undefined; it just evaluates to `undefined`. In short, `.` behaves like javascript's `?.` and `a[something]` behaves like `a?.[something]`. 

The search operator `=~` is a multifunction tool: it behaves differently depending on the type of its operands:
 - `"string" =~ "tri"`: string on string, returns `true` if a string contains another
 - `[a,b,c] =~ a`: element on array, returns `true` if an element is present in an array
 - `[a,b,c] =~ [b,c]`: array on array, returns `true` if all elements of the right hand side are present in the left hand side array. 
 - `12 =~ 2`: number on number, returns `true` if "left" is divisible by "right" (`left % right == 0` in javascript). 
 
 There's also support for String, Number, Boolean (`true`, `false`), Object and Array literals. 
 
