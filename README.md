# k3-whenquery
Conditionally show fields and sections. Better.

## Installation

### Download

Download and copy this repository to `/site/plugins/k3-whenquery`.

### Git submodule

```
git submodule add https://github.com/rasteiner/k3-whenquery.git site/plugins/k3-whenquery
```

### Composer

```
composer require rasteiner/k3-whenquery
```

## Use

Add a `whenQuery` property to your fields and sections. The expression in this query will be evaluated in real time in the browser to **hide** the section or field when it evaluates to a *falsy* value. 

```yml
title: Woofler page

fields:
  foosables:
    type: select
    label: Foosables
    options:
      gerryconas: Gerryconas
      peterwands: Peterwands
      perlskippies: Perl Skippies

  barsters:
    type: range
    label: Barsters

  warning:
    type: info
    label: Woofling warning
    text: Having more than 30 Barsters is **not recommended** while wooffling Gerryconas.
    theme: negative
    whenQuery: foosables = 'gerryconas' && barsters > 30   
```

### Expression Language Syntax

There are no assignments and function calls (it's meant to be as harmless as possible). 
Since there are no assignments, `=` is an equality comparison (there is no `==`). 

#### Supported operators
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
 - `... % ...`: Remainder operator
 - `(...)`: Precedence grouping
 - `...[...]`: Optional subscript operator (calculated member access)
 - `.`: Optional member access by identifier
 - `... ::map(...)`: Array `map` operator (see below)
 - `... ::filter(...)`: Array `filter` operator (see below)
 - `... ::count(...)`: Array `count` operator (see below)
 - `... ::any(...)`: Array `any` operator (see below)
 - `... ::all(...)`: Array `all` operator (see below)

Member Access is always "optional": it does never throw an error if you access a property of undefined; it just evaluates to `undefined`. In short, `.` behaves like javascript's `?.` and `a[something]` behaves like `a?.[something]`. 

The search operator `=~` is a multifunction tool: it behaves differently depending on the type of its operands:
 - `"string" =~ "tri"`: string on string, returns `true` if a string contains another
 - `[a,b,c] =~ a`: element on array, returns `true` if an element is present in an array. This case can optionally also be written in the reverse order: `a =~ [a,b,c]`
 - `[a,b,c] =~ [b,c]`: array on array, returns `true` if all elements of the right hand side are present in the left hand side array. 
 - `12 =~ 2`: number on number, returns `true` if "left" is divisible by "right" (`left % right = 0`). 
 
There's also support for String, Number, Boolean (`true`, `false`), Object and Array literals. 
 
#### Array operators

- `::map()`: replaces each item in the array with the right hand side expression
- `::filter()`: filters the array by evaluating right hand side expression
- `::count()`: counts all items in the array that return true for the right hand side expression
- `::any()`: returns `true` if at least 1 item in the array returns true for the right hand side expression, `false` otherwise
- `::all()`: returns `true` if all items in the array return true for the right hand side expression, `false` otherwise

##### General syntax:

Array operators are made of 3 parts:
1. In the left the array they operate on
2. after `::` the name of the operation
3. betwen the parentheses the expression that is evaluated for each array item. 

Inside of the parentheses, the symbol `$` represents the "current" item. 

##### Example
```yml
fields:
  blocks:
    type: blocks
    
  imagesWarning:
    type: info
    label: Image warning
    text: Good! You have at least 13 images in this post. This will be a **great** post.
    theme: positive
    whenQuery: blocks ::count($.type = 'image') >= 13
``` 
