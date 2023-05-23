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
 - `... ::reduce(...)`: Array Reducer (see below)

Member Access is always "optional": it does never throw an error if you access a property of undefined; it just evaluates to `undefined`. In short, `.` behaves like javascript's `?.` and `a[something]` behaves like `a?.[something]`. 

The search operator `=~` is a multifunction tool: it behaves differently depending on the type of its operands:
 - `"string" =~ "tri"`: string on string, returns `true` if a string contains another
 - `[a,b,c] =~ a`: element on array, returns `true` if an element is present in an array. This case can optionally also be written in the reverse order: `a =~ [a,b,c]`
 - `[a,b,c] =~ [b,c]`: array on array, returns `true` if all elements of the right hand side are present in the left hand side array. 
 - `12 =~ 2`: number on number, returns `true` if "left" is divisible by "right" (`left % right = 0`). 
 - `"string" =~ /inG$/i`: regex on string, returns `true` if the string matches the regex. RegExes are useful only in combination with the search operator. 
  
There's also support for String, Number, Boolean (`true`, `false`), Object and Array literals. 
 
#### Array operators

- `::map(expr)`: replaces each item in the array with the right hand side expression
- `::filter(expr)`: filters the array by evaluating right hand side expression
- `::count(expr)`: counts all items in the array that return true for the right hand side expression
- `::any(expr)`: returns `true` if at least 1 item in the array returns true for the right hand side expression, `false` otherwise
- `::all(expr)`: returns `true` if all items in the array return true for the right hand side expression, `false` otherwise

##### General syntax:

Array operators are made of 3 parts:
1. In the left the array they operate on
2. after `::` the name of the operation
3. between the parentheses the expression that is evaluated for each array item. 

Inside of the parentheses, the symbol `$` represents the "current" item. 

##### Example
```yml
fields:
  blocks:
    type: blocks
    
  imagesEncouragement:
    type: info
    label: Nice job!
    text: Good! You have at least 13 images in this post. This will be a **great** post.
    theme: positive
    whenQuery: blocks ::count($.type = 'image') >= 13
``` 

#### Array reducers
Array reducers are functions that take an array and return a single value. They can be used to aggregate values in an array.
The syntax is similar to the array operators, but `::reduce(expr, ?initial)` accepts an optional initial value. If no initial value is provided, the first item of the array is used.
Inside of the parentheses, the symbol `$` represents the "current" item, while `$1` represents the return value of the "previous" iteration (aka the "accumulator").
The array is always traversed left to right.

##### Example
```yml
fields:
  percentages:
    type: structure
    fields:
      percent:
        type: number
        after: "%"

  percentagesEncouragement:
    type: info
    label: Math GENIUS!
    text: Great job! The sum of all percentages is exactly 100%.
    theme: positive
    whenQuery: percentages ::reduce($1 + $.percent, 0) = 100
```
An example usage without an initial value:
```yml
    whenQuery: percentages ::map($.percent) ::reduce($1 + $) = 100
```

### Variables lookup
#### Content variables
By default, any valid identifier refers to the "current" fieldset. 
This means that page fields could be [shadowed](https://en.wikipedia.org/wiki/Variable_shadowing) 
by other fields with the same name in a structure or block, when the query is executed in such structure or block.
If no field is found in the current fieldset, the query is evaluated in the page fields.

#### Model variables
The Site, Pages, Files and Users are "models". Other than content, they also have other properties that might be useful in a query.
These properties are accessible by prepending an underscore (`_`) to their name, when (and only when) the query is being executed inside of their respective View.

The accessible Site properties are:
 - `_title`: the title of the site

The accessible Page properties are:
 - `_status`: the status of the page (one of 'draft', 'unlisted' or 'listed')
 - `_id`: the id of the page
 - `_title`: the title of the page

The accessible User properties are:
 - `_id`: the id of the user
 - `_email`: the email of the user
 - `_name`: the name of the user
 - `_username`: the username of the user (either the name or the email as fallback)
 - `_language`: the language of the user
 - `_role`: the role name of the user (e.g. "Admin" with a capital "A")
 - `_avatar`: the url of the user's avatar
 - `_account`: boolean indicating if this is the current user's account

The accessible File properties are:
 - `_dimensions.width`: If the file is an image, the width of the image
 - `_dimensions.height`: If the file is an image, the height of the image
 - `_dimensions.ratio`: If the file is an image, the ratio of the image
 - `_dimensions.orientation`: If the file is an image, one of "landscape", "square" or "portrait"
 - `_extension`: the extension of the file (e.g. "jpg", "png", "gif")
 - `_filename`: the filename of the file
 - `_mime`: the mime type of the file
 - `_niceSize`: the nice size of the file (e.g. "1.2 MB", "2.3 KB")
 - `_template`: the file template
 - `_type`: the file type, any of "archive", "audio", "code", "document", "image", "video" or null
 - `_url`: the media url to the file

##### Example
```yml
fields:
    date:
        type: date

    dateInfo:
        type: info
        label: Heads up!
        text: This page is listed, its date will be ignored for sorting.
        theme: positive
        whenQuery: date && _status = 'listed'
```

## Known issues
 - This plugin extends and replaces the default `Blocks` and `Layout` field types. This means that it is not compatible with other plugins that do the same.
