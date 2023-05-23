import run from "./interpreter";

describe("run function", () => {
  it("should be defined", () => {
    expect(run).toBeDefined();
  });

  it("should be a function", () => {
    expect(typeof run).toBe("function");
  });

  const context = (s) => {
    switch(s) {
      case "a":
        return "Letter A";
      case "b":
        return "Letter B";
      case "nine":
        return 9;
      case "ten":
        return 10;
      case "yes":
        return true;
      case "no":
        return false;
      case "arrayOfNumbers":
        return [1, 2, 3, 4, 5];
      case 'obj1':
        return {
          a: 1,
          b: 2,
          c: 3
        }
      case 'obj2':
        return {
          a: 'foo',
          b: 'bar',
          c: 'baz'
        }
      case 'obj3':
        return {
          a: 1,
          b: 'bar'
        }
    }
  };

  test.each([
    [ ``, true ],
    [ `a`, `Letter A` ],
    [ `b`, `Letter B` ],
    [ `nine`, 9 ],
    [ `ten`, 10 ],
    [ `yes`, true ],
    [ `no`, false ],
    [ `c`, undefined ],
    [ `nine < ten`, true ],
    [ `nine > ten`, false ],
    [ `nine + ten = 19`, true ],
    [ `[1,2,3]`, [1,2,3] ],
    [ `[1,[2,yes],4]`, [1,[2,true],4] ],
    [ `9 - 8`, 1 ],
    [ `9 - 4 * 2 `, 1 ],
    [ `(9 - 4) * 2 `, 10 ],
    [ `9 / 3`, 3 ],
    [ `(6 + 3) / 3`, 3 ],
    [ `13 % 5`, 3 ],
    [ `{ a: a }`, { a: `Letter A` } ],
    [ `{ a: a, b: 1-1 ? "Foo" : "Letter B" }`, { a: "Letter A", b: "Letter B" } ],
    [ `{ a: a, b: 1+1 ? "Foo" : "Letter B" }`, { a: "Letter A", b: "Foo" } ],
    [ `[1,2,3][0]`, 1 ],
    [ `[1,2,3][1]`, 2 ],
    [ `[].length > 0`, false ],
    [ `{yes: "foobar"}.yes`, "foobar" ],
    [ `{yes: [1,2,3,4]}.yes[3]`, 4 ],
    [ `{yes: [1,2,3,{a:a}]}["yes"][3].a`, 'Letter A' ],
    [ `undefined ?? a`, 'Letter A' ],
    [ `undefined ?? a ?? b`, 'Letter A' ],
    [ `undefined.a`, undefined ],
    [ `undefined.a.b[undefined] ?? a`, 'Letter A' ],
    [ `[a, b, c] =~ a`, true ],
    [ `a =~ [a, b, c]`, true ],
    [ `[b, c] =~ a`, false ],
    [ `a =~ [b, c]`, false ],
    [ `[b, c] =~ [b]`, true ],
    [ `[b, c] =~ [b, c]`, true ],
    [ `[b, c] =~ [a, b, c]`, false ],
    [ `a =~ "Letter"`, true ],
    [ `"ABC" =~ "D"`, false ],
    [ `12 =~ 6`, true ],
    [ `12 =~ 7`, false ],
    [ `ten  =~ 2 ? ten  + " is even" : ten  + " is odd"`, "10 is even" ],
    [ `nine =~ 2 ? nine + " is even" : nine + " is odd"`, "9 is odd" ],
    [ `nine + ten =~ 2 ? nine + ten + " is even" : nine + ten + " is odd"`, "19 is odd" ],
    [ `"abc" =~ /b/`, true ],
    [ `"abc" =~ /c$/`, true ],
    [ `"abc" =~ /b$/`, false ],
    [ `"abc" =~ /^a/`, true ],
    [ `"abc" =~ /^b/`, false ],
    [ `"a/bc" =~ /a\\/b/`, true ],
    [ `"a/bc" =~ /a\\/c/`, false ],
    [ `"string" =~ /iNG$/`, false ],
    [ `"string" =~ /iNG$/i`, true ],
    [ `"one word" =~ /\\bw/`, true ],
    [ `"no word begins with letterO" =~ /\\bo/`, false ],
    [ `[{filename: "lol.svg"}, {filename: "lol.svg.txt"}]::count($.filename =~ /\\.svg$/)`, 1],
    [ `[10][0]/2`, 5],
    [ `[1, 2, 3, 4, 5, 6]::count()/2`, 3],
    [ `arrayOfNumbers::count()`, 5 ],
    [ `arrayOfNumbers::count(1)`, 5 ],
    [ `arrayOfNumbers::count(true)`, 5 ],
    [ `arrayOfNumbers::count(true = true)`, 5 ],
    [ `[obj1, obj2, obj3] ::count($.a = 1)`, 2],
    [ `[obj1, obj2, obj3] ::any($.a = 'foo')`, true],
    [ `[obj1, obj2, obj3] ::all($.a = 'foo')`, false],
    [ `[obj1, obj2, obj3] ::all($ != null)`, true],
    [ `[obj1, obj2, obj3, null] ::all($ != null)`, false],
    [ `[obj1, obj2, obj3, null] ::any($ = null)`, true],
    [ `[1,2,3,4,5] ::filter($ > 3)`, [4,5]],
    [ `[1,2,3,4,5] ::filter($ > 3) ::filter($ < 5)`, [4]],
    [ `[1,2,3,4,5] ::filter($ > 3) ::count($ < 5)`, 1],
    [ `[1,2,3,4,5] ::filter($ > 3) ::filter($ < 5)[0]`, 4],
    [ `[[1,2,3],[4,5],[8,19,20]] ::map($ ::filter($ =~ 2))`, [[2],[4],[8,20]]],
    [ `[1,2,3,4] ::reduce($1 + $)`, 10],
    [ `[1,2,3,4] ::reduce($1 + $, 5)`, 15],
    [ `['1','2','3','4'] ::reduce($1 + $)`, '1234'],
  ])("\"%s\" should return %j", (input, expected) => {
    expect(run(context, input)).toStrictEqual(expected);
  });
})
