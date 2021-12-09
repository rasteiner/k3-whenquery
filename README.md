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
 - `... ?? ...`: Nullish coalescing operator 
 - `... ? ... : ...`: Ternary operator
 - `... || ...`: Logical Or
 - `... && ...`: Logical And
 - `... + ...`: String concatenation or Number addition
 - `... - ...`: Number subtraction
 - `... * ...`: Number multiplication
 - `... / ...`: Number division
 - `(...)`: Precedence grouping
 - `...[...]`: Subscript operator (calculated member access)
 - `.`: Member access by identifier (like javascript)
 
 There's also support for String, Number, Boolean (`true`, `false`), Object and Array literals. 
 
