enum TokenType {
  //Single Char tokens
  LEFT_PAREN, RIGHT_PAREN, COMMA, DOT, MINUS, PLUS, SLASH, STAR,
  LEFT_BRACE, RIGHT_BRACE, COLON, EQUAL,
  LEFT_BRACKET, RIGHT_BRACKET, CURRENT,

  //One or two char tokens
  BANG, BANG_EQUAL,
  GREATER, GREATER_EQUAL,
  LESS, LESS_EQUAL,
  ARROW, QUESTION, DOUBLE_QUESTION,
  SEARCH,

  //Two char tokens
  OR, AND, DOUBLE_COLON,

  //Literals
  IDENTIFIER, STRING, NUMBER,

  //KEYWORDS
  NULL, TRUE, FALSE,

  EOF, ILLEGAL
}

class Token {
  constructor(public type:TokenType, public lexeme:string, public literal:object) {
  }

  toString() {
    return `Token(${this.type}, ${this.lexeme}, ${this.literal})`;
  }
}

class Scanner {
  source:String;
  tokens:Token[];
  start:number;
  current:number;

  constructor(source:String) {
    this.source = source;
  }

  scanTokens():Token[] {
    this.tokens = [];
    this.start = 0;
    this.current = 0;

    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', null));
    return this.tokens;
  }

  scanToken() {
    let c = this.advance();
    switch (c) {
      case '(': this.addToken(TokenType.LEFT_PAREN); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case '[': this.addToken(TokenType.LEFT_BRACKET); break;
      case ']': this.addToken(TokenType.RIGHT_BRACKET); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case '/': this.addToken(TokenType.SLASH); break;
      case '*': this.addToken(TokenType.STAR); break;
      case '$': this.addToken(TokenType.CURRENT); break;
      case ':': this.addToken(this.match(':') ? TokenType.DOUBLE_COLON : TokenType.COLON); break;
      case '=': this.addToken(this.match('~') ? TokenType.SEARCH : TokenType.EQUAL); break;
      case '?': this.addToken(this.match('?') ? TokenType.DOUBLE_QUESTION : TokenType.QUESTION); break;
      case '-': this.addToken(this.match('>') ? TokenType.ARROW : TokenType.MINUS); break;
      case '!': this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
      case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
      case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
      case '|':
        if (this.match('|')) {
          this.addToken(TokenType.OR);
        } else {
          this.error('Invalid token');
        }
        break;
      case '&':
        if (this.match('&')) {
          this.addToken(TokenType.AND);
        } else {
          this.error('Invalid token');
        }
        break;
      case '"': this.string('"'); break;
      case '\'': this.string('\''); break;
      case ' ':
      case '\t':
        break;
      case '\r':
      case '\n':
        this.error('New line not allowed');
        break;
      case '\0':
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.error(`Unexpected character ${c}`);
        }
    }
  }

  addToken(type:TokenType, literal?:Object) {
    let text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal));
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  advance() {
    this.current++;
    return this.source.charAt(this.current - 1);
  }

  match(expected:String) {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) != expected) return false;

    this.current++;
    return true;
  }

  peek() {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  string(terminator:String) {
    let value = '';
    let prev = '';

    while (!this.isAtEnd()) {
      let c = this.peek();
      if(prev == '\\') {
        switch(c) {
          case 'n': value += '\n'; break;
          case 'r': value += '\r'; break;
          case 't': value += '\t'; break;
          case '\\': value += '\\'; break;
          case terminator: value += terminator; break;
          default:
            this.error(`Invalid escape sequence \\${c}`);
        }
      } else {
        if (c === terminator) break;
        value += c;
      }
      prev = c;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.error('Unterminated string');
    }

    this.advance();
    this.addToken(TokenType.STRING, value);
  }

  number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() == '.' && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(TokenType.NUMBER, Number(this.source.substring(this.start, this.current)));
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    let text = this.source.substring(this.start, this.current);
    let type = TokenType.IDENTIFIER;

    if (text == 'null') {
      type = TokenType.NULL;
    } else if (text == 'true') {
      type = TokenType.TRUE;
    } else if(text == 'false') {
      type = TokenType.FALSE;
    }
    this.addToken(type);
  }

  isDigit(c:String) {
    return '0' <= c && c <= '9';
  }

  isAlpha(c:String) {
    return 'a' <= c && c <= 'z' || 'A' <= c && c <= 'Z' || c == '_';
  }

  isAlphaNumeric(c:String) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  error(message:String) {
    throw new Error(`[Syntax error] ${message}`);
  }
}

interface Visitor {
  visit(node:ExpressionNode):any;
  visitUnary(node:Unary):any;
  visitBinary(node:Binary):any;
  visitIdentifier(node:Identifier):any;
  visitObjectExpression(node:ObjectExpression):any;
  visitArrayExpression(node:ArrayExpression):any;
  visitProperty(node:Property):any;
  visitTernary(node:Ternary):any;
  visitNullishCoalescing(node:NullishCoalescing):any;
  visitArrayExpression(node:ArrayExpression):any;
  visitLiteral(node:Literal):any;
  visitMemberAccess(node:MemberAccess):any;
  visitComputedMemberAccess(node:ComputedMemberAccess):any;
  visitArrayOperation(node:ArrayOperation):any;
  visitCurrent():any;
}

class ExpressionNode {
  accept(visitor: Visitor) {
    return visitor.visit(this);
  }
}

class Unary extends ExpressionNode {
  constructor(public operator:Token, public right:ExpressionNode) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitUnary(this);
  }
}

class Binary extends ExpressionNode {
  constructor(public left:ExpressionNode, public operator:Token, public right:ExpressionNode) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitBinary(this);
  }
}

class Identifier extends ExpressionNode {
  constructor(public value:string) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitIdentifier(this);
  }
}

class ObjectExpression extends ExpressionNode {
  constructor(public properties:Array<Property>) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitObjectExpression(this);
  }
}

class Property extends ExpressionNode {
  constructor(public key:string, public value:ExpressionNode) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitProperty(this);
  }
}

class ArrayExpression extends ExpressionNode {
  constructor(public elements:Array<ExpressionNode>) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitArrayExpression(this);
  }
}

class Literal extends ExpressionNode {
  constructor(public value:any) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitLiteral(this);
  }
}

class Ternary extends ExpressionNode {
  constructor(public condition:ExpressionNode, public ifTrue:ExpressionNode, public ifFalse:ExpressionNode) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitTernary(this);
  }
}

class NullishCoalescing extends ExpressionNode {
  constructor(public left:ExpressionNode, public right:ExpressionNode) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitNullishCoalescing(this);
  }
}

class MemberAccess extends ExpressionNode {
  constructor(public object:ExpressionNode, public property:string) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitMemberAccess(this);
  }
}

class ComputedMemberAccess extends ExpressionNode {
  constructor(public object:ExpressionNode, public property:ExpressionNode) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitComputedMemberAccess(this);
  }
}

class ArrayOperation extends ExpressionNode {
  constructor(public left:ExpressionNode, public operator:string, public right:ExpressionNode) {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitArrayOperation(this);
  }
}

class Current extends ExpressionNode {
  constructor() {
    super();
  }

  accept(visitor: Visitor) {
    return visitor.visitCurrent();
  }
}

abstract class Parser {
  tokens:Token[];
  current:number;

  constructor(tokens:Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }

  consume(type:TokenType, message:string) {
    if (this.check(type)) {
      return this.advance();
    }

    this.error(message);
  }

  match(...types:TokenType[]) {
    if(this.check(...types)) {
      return this.advance();
    }

    return false;
  }

  check(...types:TokenType[]):boolean {
    if (this.isAtEnd()) return false;
    return types.some(type => type === this.tokens[this.current].type);
  }

  advance() {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type == TokenType.EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  peekNext() {
    if (this.isAtEnd()) return null;
    return this.tokens[this.current + 1];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  error(message:string) {
    throw new Error(message);
  }
}

class KXLParser extends Parser {
  expression() {
    return this.ternary();
  }

  ternary() {
    let expr = this.nullishCoalescing();

    if (this.match(TokenType.QUESTION)) {
      let trueExpr = this.ternary();
      this.consume(TokenType.COLON, 'Expected : after ternary');
      let falseExpr = this.ternary();
      return new Ternary(expr, trueExpr, falseExpr);
    }

    return expr;
  }

  nullishCoalescing() {
    let expr = this.logicalOr();

    while (this.match(TokenType.DOUBLE_QUESTION)) {
      let right = this.nullishCoalescing();
      return new NullishCoalescing(expr, right);
    }

    return expr;
  }

  logicalOr() {
    let left = this.logicalAnd();

    while (this.match(TokenType.OR)) {
      let operator = this.previous();
      let right = this.logicalAnd();
      left = new Binary(left, operator, right);
    }

    return left;
  }

  logicalAnd() {
    let left = this.equality();

    while (this.match(TokenType.AND)) {
      let operator = this.previous();
      let right = this.equality();
      left = new Binary(left, operator, right);
    }

    return left;
  }

  equality() {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL, TokenType.SEARCH)) {
      let operator = this.previous();
      let right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  comparison() {
    let expr = this.addition();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      let operator = this.previous();
      let right = this.addition();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  addition() {
    let expr = this.multiplication();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      let operator = this.previous();
      let right = this.multiplication();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  multiplication() {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      let operator = this.previous();
      let right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  unary() {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      let operator = this.previous();
      let right = this.unary();
      return new Unary(operator, right);
    }

    return this.memberAccess();
  }

  memberAccess() {
    let expr = this.arrayOperation();

    while (this.match(TokenType.DOT, TokenType.LEFT_BRACKET)) {
      if (this.previous().type == TokenType.DOT) {
        let property = this.consume(TokenType.IDENTIFIER, 'Expected property name');
        expr = new MemberAccess(expr, property.lexeme);
      } else {
        let property = this.expression();
        this.consume(TokenType.RIGHT_BRACKET, 'Expected ] after property access');
        expr = new ComputedMemberAccess(expr, property);
      }
    }

    return expr;
  }

  arrayOperation() {
    let expr = this.primary();

    while(this.match(TokenType.DOUBLE_COLON)) {
      const operator = this.consume(TokenType.IDENTIFIER, 'Expected array operator after ::');
      if (['any', 'all', 'count', 'filter', 'map'].indexOf(operator.lexeme) !== -1) {
        this.consume(TokenType.LEFT_PAREN, 'Expected ( after array operator type');
        const body = this.expression();
        this.consume(TokenType.RIGHT_PAREN, 'Expected ) after array operator body');
        expr = new ArrayOperation(expr, operator.lexeme, body);
      } else {
        this.error(`Unknown array operator "${operator.lexeme}"`);
      }
    }

    return expr;
  }

  primary() {

    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NULL)) return new Literal(null);
    if (this.match(TokenType.NUMBER)) return new Literal(this.previous().literal);
    if (this.match(TokenType.STRING)) return new Literal(this.previous().literal);

    if (this.match(TokenType.CURRENT)) return new Current();

    if (this.match(TokenType.LEFT_PAREN)) {
      let expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, 'Expect ) after expression');
      return expr;
    }

    if (this.match(TokenType.LEFT_BRACKET)) {
      return this.array();
    }

    if (this.match(TokenType.LEFT_BRACE)) {
      return this.object();
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Identifier(this.previous().lexeme);
    }

    this.error(`Expect expression`);
  }


  array() {
    let elements = [];

    if (!this.check(TokenType.RIGHT_BRACKET)) {
      while (!this.check(TokenType.RIGHT_BRACKET)) {
        elements.push(this.expression());

        if (this.match(TokenType.COMMA)) {
          continue;
        }

        break;
      }
    }

    this.consume(TokenType.RIGHT_BRACKET, 'Expect ] after array');
    return new ArrayExpression(elements);
  }

  object() {
    let properties = [];

    if (!this.check(TokenType.RIGHT_BRACE)) {
      while (!this.check(TokenType.RIGHT_BRACE)) {
        let name = undefined;
        if(this.match(TokenType.IDENTIFIER)) {
          name = this.previous().lexeme;
        } else if (this.match(TokenType.STRING)) {
          name = this.previous().literal;
        } else {
          this.error(`Expect property name`);
        }

        this.consume(TokenType.COLON, 'Expect : after property name');

        let value = this.expression();

        properties.push(new Property(name, value));

        if (this.match(TokenType.COMMA)) {
          continue;
        }

        break;
      }
    }

    this.consume(TokenType.RIGHT_BRACE, 'Expect } after object');

    return new ObjectExpression(properties);
  }
}


class Interpreter implements Visitor {
  private currentStack: any[];

  constructor(public lookup:(variableName:string) => any) {
    this.currentStack = [];
  }

  visit(node:ExpressionNode) {
    return node.accept(this);
  }

  visitCurrent() {
    return this.currentStack[this.currentStack.length - 1];
  }

  visitArrayOperation(node: ArrayOperation) {
    const array = this.visit(node.left);
    if(Array.isArray(array)) {
      switch(node.operator) {
        case 'any':
          return array.some(item => {
            this.currentStack.push(item);
            const result = this.visit(node.right);
            this.currentStack.pop();
            return result;
          });
        case 'all':
          return array.every(item => {
            this.currentStack.push(item);
            const result = this.visit(node.right);
            this.currentStack.pop();
            return result;
          });
        case 'count':
          return array.reduce((count, item) => {
            this.currentStack.push(item);
            const result = this.visit(node.right);
            this.currentStack.pop();
            return result ? count + 1 : count;
          }, 0);
        case 'filter':
          return array.filter(item => {
            this.currentStack.push(item);
            const result = this.visit(node.right);
            this.currentStack.pop();
            return result;
          });
        case 'map':
          return array.map(item => {
            this.currentStack.push(item);
            const result = this.visit(node.right);
            this.currentStack.pop();
            return result;
          })
      }
    } else {
      console.info('Array operation on non-array', node, 'returning null');
      return null;
    }
  }

  visitBinary(node:Binary) {
    let left = this.visit(node.left);
    let right = this.visit(node.right);

    switch (node.operator.type) {
      case TokenType.PLUS:
        return left + right;
      case TokenType.MINUS:
        return left - right;
      case TokenType.STAR:
        return left * right;
      case TokenType.SLASH:
        return left / right;
      case TokenType.GREATER:
        return left > right;
      case TokenType.GREATER_EQUAL:
        return left >= right;
      case TokenType.LESS:
        return left < right;
      case TokenType.LESS_EQUAL:
        return left <= right;
      case TokenType.BANG_EQUAL:
        return left != right;
      case TokenType.EQUAL:
        return left == right;
      case TokenType.AND:
        return left && right;
      case TokenType.OR:
        return left || right;
      case TokenType.SEARCH:
        return this.search(left, right);
      default:
        throw new Error("Unknown operator: " + node.operator.lexeme);
    }
  }
  search(left:any, right:any) {
    if (typeof left == 'string' && typeof right == 'string') {
      return left.indexOf(right) !== -1;
    }

    if (typeof left == "number" && typeof right == "number") {
      return left % right == 0;
    }

    if (Array.isArray(left)) {
      if(Array.isArray(right)) {
        return right.every(x => left.indexOf(x) !== -1);
      } else {
        return left.indexOf(right) !== -1;
      }
    } else if (Array.isArray(right)) {
      return right.indexOf(left) !== -1;
    }

    throw new Error("Cannot search " + typeof right + " in " + typeof left);
  }
  visitArrayExpression(node:ArrayExpression) {
    return node.elements.map(e => this.visit(e));
  }
  visitLiteral(node:Literal) {
    return node.value;
  }
  visitIdentifier(node:Identifier) {
    return this.lookup(node.value);
  }
  visitNullishCoalescing(node:NullishCoalescing) {
    let left = this.visit(node.left);
    if (left) return left;
    return this.visit(node.right);
  }
  visitObjectExpression(node:ObjectExpression) {
    let obj = {};
    node.properties.forEach(p => {
      obj[p.key] = this.visit(p.value);
    });
    return obj;
  }
  visitProperty(node:Property) {
    return this.visit(node.value);
  }
  visitUnary(node:Unary) {
    let right = this.visit(node.right);

    switch (node.operator.type) {
      case TokenType.MINUS:
        return -right;
      case TokenType.BANG:
        return !right;
      default:
        throw new Error("Unknown operator: " + node.operator.lexeme);
    }
  }
  visitTernary(node:Ternary) {
    let condition = this.visit(node.condition);
    if (condition) {
      return this.visit(node.ifTrue);
    }
    return this.visit(node.ifFalse);
  }
  visitComputedMemberAccess(node:ComputedMemberAccess) {
    let object = this.visit(node.object);
    let key = this.visit(node.property);
    if(object !== undefined) {
      return object[key];
    }
    return undefined;
  }
  visitMemberAccess(node:MemberAccess) {
    let object = this.visit(node.object);
    let key = node.property;
    if(object !== undefined) {
      return object[key];
    }
    return undefined;
  }
}

export default function run(context, code) {
  const scanner = new Scanner(code);
  const tokens = scanner.scanTokens();
  const parser = new KXLParser(tokens);
  const dst = parser.expression();
  const interpreter = new Interpreter(context);
  return interpreter.visit(dst);
}
