import Interpreter from "./interpreter";

describe("Interpreter", () => {
  it("should be defined", () => {
    expect(Interpreter).toBeDefined();
  });

  it("should be instantiable", () => {
    expect(new Interpreter(() => {})).toBeInstanceOf(Interpreter);
  });

  it("should have a method `run`", () => {
    expect(new Interpreter(() => {}).run).toBeDefined();
  });

  const testInterpreter = new Interpreter((s) => {
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
    }
  });

  test.each([
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
    [ `{ a: a }`, { a: `Letter A` } ],
    [ `{ a: a, b: 1-1 ? "Foo" : "Letter B" }`, { a: "Letter A", b: "Letter B" } ],
    [ `{ a: a, b: 1+1 ? "Foo" : "Letter B" }`, { a: "Letter A", b: "Foo" } ],
    [ `[1,2,3][0]`, 1 ],
    [ `[1,2,3][1]`, 2 ],
    [ `[].length > 0`, false ],
    [ `{yes: "foobar"}.yes`, "foobar" ],
    [ `{yes: [1,2,3,4]}.yes[3]`, 4 ],
    [ `{yes: [1,2,3,{a:a}]}["yes"][3].a`, 'Letter A' ],
  ])("\"%s\" should return %j", (input, expected) => {
    expect(testInterpreter.run(input)).toStrictEqual(expected);
  });
})
