// ============================================================
// LARP Language — Parser
// Recursive-descent parser. Produces a typed AST.
// Every error message follows the spec:
//   what was being done + why it failed + suggested fix.
// ============================================================

import { Token, TokenType } from '../lexer/tokens';
import * as AST from './ast';

// ── Error ─────────────────────────────────────────────────────────────────────
export class ParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly col:  number,
    public readonly fix?: string
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

// ── Parser ────────────────────────────────────────────────────────────────────
export class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  // ── Entry point ─────────────────────────────────────────────────────────────
  parse(): AST.Program {
    const body: AST.Statement[] = [];
    this.skipNewlines();
    while (!this.check(TokenType.EOF)) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    return { kind: 'Program', body };
  }

  // ── Statements ──────────────────────────────────────────────────────────────
  private parseStatement(): AST.Statement {
    const tok = this.current();

    switch (tok.type) {
      // set / set fixed
      case TokenType.SET:       return this.parseSet(false);
      case TokenType.SET_FIXED: return this.parseSet(true);

      // output
      case TokenType.SAY:            return this.parseSay();
      case TokenType.STOP_AND_SAY:   return this.parseStopAndSay();

      // control flow
      case TokenType.IF:             return this.parseIf();
      case TokenType.WHILE:          return this.parseWhile();
      case TokenType.FOR_EACH:       return this.parseForEach();
      case TokenType.REPEAT:         return this.parseRepeat();
      case TokenType.STOP_THIS_LOOP: return this.parseBreak('inner');
      case TokenType.STOP_THE_OUTER_LOOP: return this.parseBreak('outer');
      case TokenType.SKIP_THIS_ATTEMPT: return this.parseContinue();
      case TokenType.MATCH:          return this.parseMatch();
      case TokenType.STOP_THE_PROGRAM: return this.parseStopProgram();

      // functions
      case TokenType.CREATE_FUNCTION:          return this.parseFunctionDecl(false);
      case TokenType.GIVE_BACK:                return this.parseReturn();

      // error handling
      case TokenType.TRY:            return this.parseTry();

      // blueprints
      case TokenType.CREATE_BLUEPRINT_CALLED:  return this.parseBlueprint();

      // modules
      case TokenType.BRING_IN:       return this.parseBringIn();
      case TokenType.SHARE_FUNCTION: return this.parseShare();
      case TokenType.SHARE:          return this.parseShareVar();

      // testing
      case TokenType.CHECK_THAT:     return this.parseCheck();

      // file I/O
      case TokenType.WRITE:          return this.parseWrite();

      // server
      case TokenType.CREATE_A_SERVER:       return this.parseCreateServer();
      case TokenType.WHEN_REQUEST_COMES_TO: return this.parseRouteHandler();
      case TokenType.RESPOND_WITH:          return this.parseRespond();
      case TokenType.START_APP_ON_PORT:     return this.parseStartServer();

      // database (handled inside expression too but also as statement)
      case TokenType.CONNECT_TO_DATABASE:   return this.parseConnectDb();
      case TokenType.RUN_QUERY:             return this.parseRunQuery();

      default:
        return this.parseExpressionStatement();
    }
  }

  // ── set / set fixed ──────────────────────────────────────────────────────────
  private parseSet(constant: boolean): AST.SetStatement {
    const pos = this.pos_(this.consume());   // eat SET / SET_FIXED
    const nameTok = this.expect(TokenType.IDENTIFIER, 'a variable name', 'set name to value');
    this.expect(TokenType.TO, '"to"', 'set name to value  ← the word "to" goes here');
    const value = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'SetStatement', name: nameTok.value, value, constant, pos };
  }

  // ── say ─────────────────────────────────────────────────────────────────────
  private parseSay(): AST.SayStatement {
    const pos = this.pos_(this.consume());
    const value = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'SayStatement', value, pos };
  }

  // ── stop and say ─────────────────────────────────────────────────────────────
  private parseStopAndSay(): AST.StopAndSayStatement {
    const pos = this.pos_(this.consume());
    const message = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'StopAndSayStatement', message, pos };
  }

  // ── if / otherwise if / otherwise / end ─────────────────────────────────────
  private parseIf(): AST.IfStatement {
    const pos = this.pos_(this.consume()); // IF
    const condition = this.parseExpression();
    this.expect(TokenType.COLON, '":"', 'if condition:');
    this.skipNewlines();

    const then: AST.Statement[] = [];
    while (!this.checkAny(TokenType.OTHERWISE_IF, TokenType.OTHERWISE, TokenType.END, TokenType.EOF)) {
      then.push(this.parseStatement());
      this.skipNewlines();
    }

    const elseIfs: Array<{ condition: AST.Expression; body: AST.Statement[] }> = [];
    while (this.check(TokenType.OTHERWISE_IF)) {
      this.consume(); // OTHERWISE_IF
      const c = this.parseExpression();
      this.expect(TokenType.COLON, '":"', 'otherwise if condition:');
      this.skipNewlines();
      const body: AST.Statement[] = [];
      while (!this.checkAny(TokenType.OTHERWISE_IF, TokenType.OTHERWISE, TokenType.END, TokenType.EOF)) {
        body.push(this.parseStatement());
        this.skipNewlines();
      }
      elseIfs.push({ condition: c, body });
    }

    let otherwise: AST.Statement[] | null = null;
    if (this.check(TokenType.OTHERWISE)) {
      this.consume();
      this.expect(TokenType.COLON, '":"', 'otherwise:');
      this.skipNewlines();
      otherwise = [];
      while (!this.checkAny(TokenType.END, TokenType.EOF)) {
        otherwise.push(this.parseStatement());
        this.skipNewlines();
      }
    }

    this.expectEnd('if');
    return { kind: 'IfStatement', condition, then, elseIfs, otherwise, pos };
  }

  // ── while ────────────────────────────────────────────────────────────────────
  private parseWhile(): AST.WhileStatement {
    const pos = this.pos_(this.consume());
    const condition = this.parseExpression();
    this.expect(TokenType.COLON, '":"', 'while condition:');
    const body = this.parseBlock('while');
    return { kind: 'WhileStatement', condition, body, pos };
  }

  // ── for each ─────────────────────────────────────────────────────────────────
  private parseForEach(): AST.ForEachStatement {
    const pos = this.pos_(this.consume());
    const varTok = this.expect(TokenType.IDENTIFIER, 'a variable name', 'for each item in myList:');
    this.expect(TokenType.IN, '"in"', 'for each item in myList:');
    const iterable = this.parseExpression();
    this.expect(TokenType.COLON, '":"', 'for each item in myList:');
    const body = this.parseBlock('for each');
    return { kind: 'ForEachStatement', variable: varTok.value, iterable, body, pos };
  }

  // ── repeat N times ───────────────────────────────────────────────────────────
  private parseRepeat(): AST.RepeatStatement {
    const pos = this.pos_(this.consume());
    const count = this.parseExpression();
    this.expect(TokenType.TIMES, '"times"', 'repeat 5 times:');
    this.expect(TokenType.COLON, '":"', 'repeat 5 times:');
    const body = this.parseBlock('repeat');
    return { kind: 'RepeatStatement', count, body, pos };
  }

  // ── loop control ─────────────────────────────────────────────────────────────
  private parseBreak(target: 'inner' | 'outer'): AST.BreakStatement {
    const pos = this.pos_(this.consume());
    this.expectNewlineOrEof();
    return { kind: 'BreakStatement', target, pos };
  }

  private parseContinue(): AST.ContinueStatement {
    const pos = this.pos_(this.consume());
    this.expectNewlineOrEof();
    return { kind: 'ContinueStatement', pos };
  }

  // ── stop the program ─────────────────────────────────────────────────────────
  private parseStopProgram(): AST.StopProgramStatement {
    const pos = this.pos_(this.consume());
    this.expectNewlineOrEof();
    return { kind: 'StopProgramStatement', pos };
  }

  // ── match ────────────────────────────────────────────────────────────────────
  private parseMatch(): AST.MatchStatement {
    const pos = this.pos_(this.consume());
    const value = this.parseExpression();
    this.expect(TokenType.COLON, '":"', 'match value:');
    this.skipNewlines();
    
    const cases: AST.MatchCase[] = [];
    while (this.check(TokenType.CASE)) {
      this.consume();
      const caseVal = this.parseExpression();
      this.expect(TokenType.COLON, '":"', 'case value:');
      this.skipNewlines();
      const body: AST.Statement[] = [];
      while (!this.checkAny(TokenType.CASE, TokenType.OTHERWISE, TokenType.END, TokenType.EOF)) {
        body.push(this.parseStatement());
        this.skipNewlines();
      }
      cases.push({ value: caseVal, body });
    }

    let otherwise: AST.Statement[] | null = null;
    if (this.check(TokenType.OTHERWISE)) {
      this.consume();
      this.expect(TokenType.COLON, '":"', 'otherwise:');
      this.skipNewlines();
      otherwise = [];
      while (!this.checkAny(TokenType.END, TokenType.EOF)) {
        otherwise.push(this.parseStatement());
        this.skipNewlines();
      }
    }

    this.expectEnd('match');
    return { kind: 'MatchStatement', value, cases, otherwise, pos };
  }

  // ── create function ──────────────────────────────────────────────────────────
  private parseFunctionDecl(isAsync: boolean): AST.FunctionDeclaration {
    const pos = this.pos_(this.consume()); // CREATE_FUNCTION
    const nameTok = this.expect(TokenType.IDENTIFIER, 'a function name', 'create function myFunc:');
    const params: AST.Parameter[] = [];

    if (this.check(TokenType.WITH)) {
      this.consume();
      params.push(...this.parseParamList());
    }

    this.expect(TokenType.COLON, '":"', 'create function name with params:');
    const body = this.parseBlock('create function');
    return { kind: 'FunctionDeclaration', name: nameTok.value, params, body, isAsync, pos };
  }

  // Param list: "name1 and name2 and name3" or "name1 and name2 equal to default"
  private parseParamList(): AST.Parameter[] {
    const params: AST.Parameter[] = [];

    while (this.check(TokenType.IDENTIFIER)) {
      const name = this.consume().value;
      let defaultValue: AST.Expression | null = null;

      if (this.check(TokenType.EQUAL_TO)) {
        this.consume();
        defaultValue = this.parsePrimary(); // only simple defaults
      }

      params.push({ name, defaultValue });

      if (this.check(TokenType.AND)) {
        this.consume(); // consume 'and'
      } else if (this.check(TokenType.COMMA)) {
        this.consume();
      } else {
        break;
      }
    }

    return params;
  }

  // ── give back ────────────────────────────────────────────────────────────────
  private parseReturn(): AST.ReturnStatement {
    const pos = this.pos_(this.consume());
    const value = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'ReturnStatement', value, pos };
  }

  // ── try / if something goes wrong ────────────────────────────────────────────
  private parseTry(): AST.TryStatement {
    const pos = this.pos_(this.consume()); // TRY
    this.expect(TokenType.COLON, '":"', 'try:');
    this.skipNewlines();

    const body: AST.Statement[] = [];
    while (!this.checkAny(TokenType.IF_SOMETHING_GOES_WRONG, TokenType.END, TokenType.EOF)) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    let errorVar: string | null = null;
    const handler: AST.Statement[] = [];

    if (this.check(TokenType.IF_SOMETHING_GOES_WRONG)) {
      this.consume();
      if (this.check(TokenType.AS)) {
        this.consume();
        const ev = this.expect(TokenType.IDENTIFIER, 'an error variable name', 'if something goes wrong as error:');
        errorVar = ev.value;
      }
      this.expect(TokenType.COLON, '":"', 'if something goes wrong:');
      this.skipNewlines();
      while (!this.checkAny(TokenType.END, TokenType.EOF)) {
        handler.push(this.parseStatement());
        this.skipNewlines();
      }
    }

    this.expectEnd('try');
    return { kind: 'TryStatement', body, errorVar, handler, pos };
  }

  // ── create a blueprint called ────────────────────────────────────────────────
  private parseBlueprint(): AST.BlueprintDeclaration {
    const pos = this.pos_(this.consume()); // CREATE_BLUEPRINT_CALLED
    const nameTok = this.expect(TokenType.IDENTIFIER, 'a blueprint name', 'create a blueprint called Dog:');

    let parent: string | null = null;
    if (this.check(TokenType.BASED_ON)) {
      this.consume();
      parent = this.expect(TokenType.IDENTIFIER, 'a parent blueprint name', 'create a blueprint called Poodle based on Dog:').value;
    }

    const fields: string[] = [];
    if (this.check(TokenType.WITH)) {
      this.consume();
      while (this.check(TokenType.IDENTIFIER)) {
        fields.push(this.consume().value);
        if (this.check(TokenType.COMMA)) this.consume();
        else if (this.check(TokenType.AND)) this.consume();
        else break;
      }
    }

    this.expect(TokenType.COLON, '":"', 'create a blueprint called Name with fields:');
    this.skipNewlines();

    const methods: AST.FunctionDeclaration[] = [];
    while (!this.checkAny(TokenType.END, TokenType.EOF)) {
      if (this.check(TokenType.CREATE_FUNCTION)) {
        methods.push(this.parseFunctionDecl(false) as AST.FunctionDeclaration);
      } else {
        this.error('Only "create function" is allowed inside a blueprint.', 'create a blueprint called Name:\n    create function ...\nend');
      }
      this.skipNewlines();
    }

    this.expectEnd('create a blueprint called');
    return { kind: 'BlueprintDeclaration', name: nameTok.value, parent, fields, methods, pos };
  }

  // ── bring in ─────────────────────────────────────────────────────────────────
  private parseBringIn(): AST.BringInStatement {
    const pos = this.pos_(this.consume());
    const pathTok = this.expect(TokenType.STRING, 'a module path in quotes', 'bring in "math"');
    let alias: string | null = null;
    if (this.check(TokenType.AS)) {
      this.consume();
      alias = this.expect(TokenType.IDENTIFIER, 'an alias name', 'bring in "math" as m').value;
    }
    this.expectNewlineOrEof();
    return { kind: 'BringInStatement', path: pathTok.value, alias, pos };
  }

  // ── share function / share ────────────────────────────────────────────────────
  private parseShare(): AST.ShareStatement {
    const pos = this.pos_(this.consume()); // SHARE_FUNCTION
    const nameTok = this.expect(TokenType.IDENTIFIER, 'a function name', 'share function myFunc');
    this.expectNewlineOrEof();
    return { kind: 'ShareStatement', name: nameTok.value, pos };
  }

  private parseShareVar(): AST.ShareStatement {
    const pos = this.pos_(this.consume()); // SHARE
    const nameTok = this.expect(TokenType.IDENTIFIER, 'a name to share', 'share myThing');
    this.expectNewlineOrEof();
    return { kind: 'ShareStatement', name: nameTok.value, pos };
  }

  // ── check that ────────────────────────────────────────────────────────────────
  private parseCheck(): AST.CheckStatement {
    const pos = this.pos_(this.consume()); // CHECK_THAT
    const actual = this.parseExpression();
    this.expect(TokenType.IS_EQUAL_TO, '"is equal to"', 'check that result is equal to 42');
    const expected = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'CheckStatement', actual, expected, pos };
  }

  // ── write ─────────────────────────────────────────────────────────────────────
  private parseWrite(): AST.WriteStatement {
    const pos = this.pos_(this.consume()); // WRITE
    const content = this.parseExpression();
    this.expect(TokenType.TO, '"to"', 'write "hello" to file "out.txt"');
    this.expect(TokenType.FILE_KW, '"file"', 'write "hello" to file "out.txt"');
    const path = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'WriteStatement', content, path, pos };
  }

  // ── server ────────────────────────────────────────────────────────────────────
  private parseCreateServer(): AST.ServerBlock {
    const pos = this.pos_(this.consume());
    this.expectNewlineOrEof();
    return { kind: 'ServerBlock', pos };
  }

  private parseRouteHandler(): AST.RouteHandler {
    const pos = this.pos_(this.consume()); // WHEN_REQUEST_COMES_TO
    const pathExpr = this.parseExpression();
    let method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
    let reqVar: string | null = null;

    // optional: "with method POST"
    if (this.check(TokenType.WITH)) {
      this.consume();
      if (this.check(TokenType.IDENTIFIER) && this.current().value === 'method') {
        this.consume(); // consume 'method'
      }
      const m = this.expect(TokenType.IDENTIFIER, 'HTTP method (GET, POST, PUT, DELETE)', '');
      method = m.value.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE';
    }
    // optional: "as request"
    if (this.check(TokenType.AS)) {
      this.consume();
      reqVar = this.expect(TokenType.IDENTIFIER, 'request variable name', '').value;
    }

    this.expect(TokenType.COLON, '":"', 'when a request comes to "/path":');
    const body = this.parseBlock('when a request comes to');
    return { kind: 'RouteHandler', method, path: pathExpr, body, reqVar, pos };
  }

  private parseRespond(): AST.RespondStatement {
    const pos = this.pos_(this.consume());
    const value = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'RespondStatement', value, pos };
  }

  private parseStartServer(): AST.StartServerStatement {
    const pos = this.pos_(this.consume());
    const port = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'StartServerStatement', port, pos };
  }

  // ── database ──────────────────────────────────────────────────────────────────
  private parseConnectDb(): AST.ConnectDatabaseStatement {
    const pos = this.pos_(this.consume());
    const url = this.parseExpression();
    this.expectNewlineOrEof();
    // varName handled by SET wrapping — this is rarely standalone
    return { kind: 'ConnectDatabaseStatement', url, varName: '__db', pos };
  }

  private parseRunQuery(): AST.RunQueryStatement {
    const pos = this.pos_(this.consume());
    const sql = this.parseExpression();
    let params: AST.Expression | null = null;
    if (this.check(TokenType.WITH)) {
      this.consume();
      params = this.parseExpression();
    }
    this.expectNewlineOrEof();
    return { kind: 'RunQueryStatement', sql, params, varName: null, pos };
  }

  // ── Expression statement ──────────────────────────────────────────────────────
  private parseExpressionStatement(): AST.ExpressionStatement {
    const pos = this.pos_(this.current());
    const expression = this.parseExpression();
    this.expectNewlineOrEof();
    return { kind: 'ExpressionStatement', expression, pos };
  }

  // ── Expressions (Pratt / recursive descent) ───────────────────────────────────
  private parseExpression(): AST.Expression {
    return this.parseOr();
  }

  private parseOr(): AST.Expression {
    let left = this.parseAnd();
    while (this.check(TokenType.OR)) {
      const op = this.consume().value;
      const right = this.parseAnd();
      left = { kind: 'BinaryExpression', op, left, right, pos: left.pos };
    }
    return left;
  }

  private parseAnd(): AST.Expression {
    let left = this.parseEquality();
    while (this.check(TokenType.AND)) {
      const op = this.consume().value;
      const right = this.parseEquality();
      left = { kind: 'BinaryExpression', op, left, right, pos: left.pos };
    }
    return left;
  }

  private parseEquality(): AST.Expression {
    let left = this.parseComparison();
    while (this.checkAny(TokenType.EQ, TokenType.NEQ)) {
      const op = this.consume().value;
      const right = this.parseComparison();
      left = { kind: 'BinaryExpression', op, left, right, pos: left.pos };
    }
    return left;
  }

  private parseComparison(): AST.Expression {
    let left = this.parseAddition();
    while (this.checkAny(TokenType.GT, TokenType.LT, TokenType.GTE, TokenType.LTE)) {
      const op = this.consume().value;
      const right = this.parseAddition();
      left = { kind: 'BinaryExpression', op, left, right, pos: left.pos };
    }
    return left;
  }

  private parseAddition(): AST.Expression {
    let left = this.parseMultiplication();
    while (this.checkAny(TokenType.PLUS, TokenType.MINUS)) {
      const op = this.consume().value;
      const right = this.parseMultiplication();
      
      if (
        (left.kind === 'StringLiteral' && right.kind === 'NumberLiteral') ||
        (left.kind === 'NumberLiteral' && right.kind === 'StringLiteral') ||
        (left.kind === 'BooleanLiteral' && right.kind === 'NumberLiteral') ||
        (left.kind === 'NumberLiteral' && right.kind === 'BooleanLiteral') ||
        (left.kind === 'BooleanLiteral' && right.kind === 'StringLiteral') ||
        (left.kind === 'StringLiteral' && right.kind === 'BooleanLiteral')
      ) {
         throw new ParseError(`Cannot use '${op}' between different types directly.`, left.pos.line, left.pos.col, "Convert them first.");
      }

      left = { kind: 'BinaryExpression', op, left, right, pos: left.pos };
    }
    return left;
  }

  private parseMultiplication(): AST.Expression {
    let left = this.parsePower();
    while (this.checkAny(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const op = this.consume().value;
      const right = this.parsePower();
      left = { kind: 'BinaryExpression', op, left, right, pos: left.pos };
    }
    return left;
  }

  private parsePower(): AST.Expression {
    let left = this.parseUnary();
    if (this.check(TokenType.CARET)) {
      this.consume();
      const right = this.parsePower(); // right-associative
      return { kind: 'BinaryExpression', op: '^', left, right, pos: left.pos };
    }
    return left;
  }

  private parseUnary(): AST.Expression {
    if (this.check(TokenType.NOT)) {
      const pos = this.pos_(this.consume());
      return { kind: 'UnaryExpression', op: 'not', expr: this.parseUnary(), pos };
    }
    if (this.check(TokenType.MINUS)) {
      const pos = this.pos_(this.consume());
      return { kind: 'UnaryExpression', op: '-', expr: this.parseUnary(), pos };
    }
    return this.parseCallChain();
  }

  // ── Call / member / index chaining ───────────────────────────────────────────
  private parseCallChain(): AST.Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.check(TokenType.DOT)) {
        this.consume();
        const prop = this.expect(TokenType.IDENTIFIER, 'a property or method name', 'object.property');
        const methodName = prop.value.toLowerCase();
        // List operations that take a single argument without 'with'
        const listMethodsWithArg = ['add', 'remove', 'contains', 'at'];
        if (this.check(TokenType.WITH) || this.check(TokenType.LPAREN)) {
          const args = this.parseCallArgs();
          expr = { kind: 'MethodCallExpression', object: expr, method: prop.value, args, pos: expr.pos };
        } else if (listMethodsWithArg.includes(methodName) && !this.checkAny(TokenType.NEWLINE, TokenType.EOF, TokenType.COLON, TokenType.RPAREN, TokenType.RBRACKET, TokenType.COMMA)) {
          // Parse the next expression as the single argument
          const arg = this.parsePrimary();
          expr = { kind: 'MethodCallExpression', object: expr, method: prop.value, args: [arg], pos: expr.pos };
        } else if (methodName === 'sorted') {
          // sorted takes no arguments
          expr = { kind: 'MethodCallExpression', object: expr, method: 'sorted', args: [], pos: expr.pos };
        } else {
          expr = { kind: 'MemberExpression', object: expr, property: prop.value, pos: expr.pos };
        }
      } else if (this.check(TokenType.LBRACKET)) {
        this.consume();
        const index = this.parseExpression();
        this.expect(TokenType.RBRACKET, '"]"', 'list[0]');
        expr = { kind: 'IndexExpression', object: expr, index, pos: expr.pos };
      } else if (expr.kind === 'Identifier' && this.check(TokenType.WITH)) {
        // bare function call: "myFunc with arg1, arg2"
        const args = this.parseCallArgs();
        expr = { kind: 'CallExpression', callee: expr, args, pos: expr.pos };
      } else if (this.check(TokenType.LPAREN)) {
        this.consume();
        const args: AST.Expression[] = [];
        if (!this.check(TokenType.RPAREN)) {
          args.push(this.parseExpression());
          while (this.check(TokenType.COMMA)) { this.consume(); args.push(this.parseExpression()); }
        }
        this.expect(TokenType.RPAREN, '")"', 'func(args)');
        expr = { kind: 'CallExpression', callee: expr, args, pos: expr.pos };
      } else if (this.check(TokenType.AS_A_NUMBER)) {
        this.consume();
        expr = { kind: 'AsNumberExpression', value: expr, pos: expr.pos };
      } else if (this.check(TokenType.AS_TEXT)) {
        this.consume();
        expr = { kind: 'AsTextExpression', value: expr, pos: expr.pos };
      } else if (this.check(TokenType.IDENTIFIER) && this.current().value === 'length') {
        this.consume();
        expr = { kind: 'MemberExpression', object: expr, property: 'length', pos: expr.pos };
      } else {
        break;
      }
    }

    return expr;
  }

  private parseCallArgs(): AST.Expression[] {
    // "with arg1, arg2"  or  "with arg1 and arg2"
    if (this.check(TokenType.WITH)) this.consume();
    const args: AST.Expression[] = [];
    if (this.check(TokenType.COLON) || this.check(TokenType.NEWLINE) || this.check(TokenType.EOF)) return args;
    args.push(this.parseExpression());
    while (this.check(TokenType.COMMA) || this.check(TokenType.AND)) {
      this.consume();
      if (this.check(TokenType.COLON) || this.check(TokenType.NEWLINE) || this.check(TokenType.EOF)) break;
      args.push(this.parseExpression());
    }
    return args;
  }

  // ── Primary expressions ───────────────────────────────────────────────────────
  private parsePrimary(): AST.Expression {
    const tok = this.current();
    const pos = this.pos_(tok);

    // Literals
    if (tok.type === TokenType.NUMBER) {
      this.consume();
      return { kind: 'NumberLiteral', value: parseFloat(tok.value), pos };
    }
    if (tok.type === TokenType.STRING) {
      this.consume();
      const interp = tok.value.startsWith('__INTERP__');
      const raw    = interp ? tok.value.slice('__INTERP__'.length) : tok.value;
      return { kind: 'StringLiteral', value: raw, interpolated: interp, pos };
    }
    if (tok.type === TokenType.TRUE)    { this.consume(); return { kind: 'BooleanLiteral', value: true,  pos }; }
    if (tok.type === TokenType.FALSE)   { this.consume(); return { kind: 'BooleanLiteral', value: false, pos }; }
    if (tok.type === TokenType.NOTHING) { this.consume(); return { kind: 'NothingLiteral', pos }; }

    // Grouping
    if (tok.type === TokenType.LPAREN) {
      this.consume();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN, '")"', '(expression)');
      return expr;
    }

    // Collections
    if (tok.type === TokenType.A_LIST_CONTAINING) {
      this.consume();
      const elements: AST.Expression[] = [];
      if (!this.checkAny(TokenType.NEWLINE, TokenType.EOF, TokenType.COLON)) {
        elements.push(this.parseExpression());
        while (this.check(TokenType.COMMA)) { this.consume(); elements.push(this.parseExpression()); }
      }
      return { kind: 'ListLiteral', elements, pos };
    }

    if (tok.type === TokenType.A_MAP_CONTAINING) {
      this.consume();
      const entries: Array<{ key: AST.Expression; value: AST.Expression }> = [];
      if (!this.checkAny(TokenType.NEWLINE, TokenType.EOF, TokenType.COLON)) {
        entries.push(this.parseMapEntry());
        while (this.check(TokenType.COMMA)) { this.consume(); entries.push(this.parseMapEntry()); }
      }
      return { kind: 'MapLiteral', entries, pos };
    }

    // "a new Blueprint with field1 val1, field2 val2"
    if (tok.type === TokenType.A_NEW) {
      this.consume();
      const nameTok = this.expect(TokenType.IDENTIFIER, 'a blueprint name', 'a new Dog with name "Rex"');
      const args: Array<{ field: string; value: AST.Expression }> = [];
      if (this.check(TokenType.WITH)) {
        this.consume();
        while (this.check(TokenType.IDENTIFIER)) {
          const field = this.consume().value;
          const value = this.parsePrimary();
          args.push({ field, value });
          if (this.check(TokenType.COMMA)) this.consume();
          else break;
        }
      }
      return { kind: 'NewBlueprintExpression', name: nameTok.value, args, pos };
    }

    // Built-in expressions
    if (tok.type === TokenType.ASK_AI) {
      this.consume();
      return { kind: 'AskAiExpression', prompt: this.parseExpression(), pos };
    }
    if (tok.type === TokenType.WAIT_FOR) {
      this.consume();
      return { kind: 'AwaitExpression', inner: this.parseExpression(), pos };
    }
    if (tok.type === TokenType.READ_FILE) {
      this.consume();
      return { kind: 'ReadFileExpression', path: this.parseExpression(), pos };
    }
    if (tok.type === TokenType.GET_REQUEST_TO) {
      this.consume();
      return { kind: 'GetRequestExpression', url: this.parseExpression(), pos };
    }
    if (tok.type === TokenType.POST_REQUEST_TO) {
      this.consume();
      const url = this.parseExpression();
      let body: AST.Expression | null = null;
      if (this.check(TokenType.WITH_BODY)) { this.consume(); body = this.parseExpression(); }
      return { kind: 'PostRequestExpression', url, body, pos };
    }
    if (tok.type === TokenType.GET_ENV_VAR) {
      this.consume();
      return { kind: 'GetEnvVarExpression', name: this.parseExpression(), pos };
    }
    if (tok.type === TokenType.SQUARE_ROOT_OF) {
      this.consume();
      return { kind: 'SquareRootExpression', value: this.parsePrimary(), pos };
    }
    if (tok.type === TokenType.UPPERCASE_OF) {
      this.consume();
      return { kind: 'UppercaseExpression', value: this.parsePrimary(), pos };
    }
    if (tok.type === TokenType.LOWERCASE_OF) {
      this.consume();
      return { kind: 'LowercaseExpression', value: this.parsePrimary(), pos };
    }
    if (tok.type === TokenType.LENGTH_OF) {
      this.consume();
      return { kind: 'LengthOfExpression', value: this.parsePrimary(), pos };
    }
    if (tok.type === TokenType.TYPE_OF) {
      this.consume();
      return { kind: 'TypeOfExpression', value: this.parsePrimary(), pos };
    }
    if (tok.type === TokenType.ROUND) {
      this.consume();
      return { kind: 'RoundExpression', value: this.parsePrimary(), pos };
    }
    if (tok.type === TokenType.TRIM) {
      this.consume();
      return { kind: 'TrimExpression', value: this.parsePrimary(), pos };
    }
    if (tok.type === TokenType.CURRENT_TIME) {
      this.consume();
      return { kind: 'CurrentTimeExpression', pos };
    }
    if (tok.type === TokenType.USE) {
      this.consume();
      const left = this.parseExpression();
      this.expect(TokenType.OTHERWISE, '"otherwise"', 'use X otherwise Y');
      const right = this.parseExpression();
      return { kind: 'NullCoalesceExpression', left, right, pos };
    }
    if (tok.type === TokenType.FORMAT) {
      this.consume();
      const value = this.parseExpression();
      this.expect(TokenType.AS_CURRENCY, '"as currency"', 'format 100 as currency');
      return { kind: 'FormatCurrencyExpression', value, pos };
    }
    if (tok.type === TokenType.SEED_RANDOM_WITH) {
      this.consume();
      return { kind: 'SeedRandomExpression', value: this.parsePrimary(), pos };
    }
    if (tok.type === TokenType.CONNECT_TO_DATABASE) {
      this.consume();
      return { kind: 'GetEnvVarExpression', name: this.parseExpression(), pos }; // reuse as DB url
    }
    // "split text by delim" — parsed as expression when part of larger expr
    if (tok.type === TokenType.SPLIT) {
      this.consume();
      const value = this.parsePrimary();
      this.expect(TokenType.BY, '"by"', 'split myText by ","');
      const delimiter = this.parsePrimary();
      return { kind: 'SplitExpression', value, delimiter, pos };
    }
    // "join list with delim"
    if (tok.type === TokenType.JOIN) {
      this.consume();
      const list = this.parsePrimary();
      if (this.check(TokenType.WITH)) this.consume();
      const delimiter = this.parsePrimary();
      return { kind: 'JoinExpression', list, delimiter, pos };
    }
    // "do at the same time: expr, expr end"
    if (tok.type === TokenType.DO_AT_THE_SAME_TIME) {
      this.consume();
      this.expect(TokenType.COLON, '":"', 'do at the same time:');
      this.skipNewlines();
      const tasks: AST.Expression[] = [];
      while (!this.checkAny(TokenType.END, TokenType.EOF)) {
        tasks.push(this.parseExpression());
        this.skipNewlines();
      }
      this.expectEnd('do at the same time');
      return { kind: 'DoAtSameTimeExpression', tasks, pos };
    }

    // ask (console input)
    if (tok.type === TokenType.ASK) {
      this.consume();
      return { kind: 'AskExpression', prompt: this.parsePrimary(), pos };
    }

    // command line argument
    if (tok.type === TokenType.COMMAND_LINE_ARGUMENT) {
      this.consume();
      const name = this.parsePrimary();
      let fallback: AST.Expression | null = null;
      if (this.check(TokenType.OTHERWISE)) {
        this.consume();
        fallback = this.parsePrimary();
      }
      return { kind: 'CommandLineArgumentExpression', name, fallback, pos };
    }

    // Identifier
    if (tok.type === TokenType.IDENTIFIER) {
      this.consume();
      return { kind: 'Identifier', name: tok.value, pos };
    }

    // ERROR_MESSAGE — "error message" (access .message on error variable)
    if (tok.type === TokenType.ERROR_MESSAGE) {
      this.consume();
      return { kind: 'ErrorMessageExpression', target: { kind: 'Identifier', name: '__err', pos }, pos };
    }

    this.error(
      `Unexpected token "${tok.value}" — I was expecting a value (a number, text, true/false, a variable name, or an expression).`,
      'Examples of valid values: 42, "hello", true, myVariable, a list containing 1, 2, 3'
    );
  }

  private parseMapEntry(): { key: AST.Expression; value: AST.Expression } {
    const key = this.parseExpression();
    this.expect(TokenType.IS, '"is"', '"key" is value');
    const value = this.parseExpression();
    return { key, value };
  }

  // ── Block helpers ────────────────────────────────────────────────────────────
  private parseBlock(ctx: string): AST.Statement[] {
    this.skipNewlines();
    const stmts: AST.Statement[] = [];
    while (!this.checkAny(TokenType.END, TokenType.EOF)) {
      stmts.push(this.parseStatement());
      this.skipNewlines();
    }
    this.expectEnd(ctx);
    return stmts;
  }

  private expectEnd(ctx: string): void {
    if (!this.check(TokenType.END)) {
      const tok = this.current();
      throw new ParseError(
        `I was reading a "${ctx}" block and reached "${tok.value}" before finding "end".`,
        tok.line, tok.col,
        `Add "end" on its own line to close the "${ctx}" block.`
      );
    }
    this.consume();
  }

  // ── Token utilities ───────────────────────────────────────────────────────────
  private current(): Token { return this.tokens[this.pos] || this.tokens[this.tokens.length - 1]; }
  private consume(): Token { return this.tokens[this.pos++] || this.tokens[this.tokens.length - 1]; }
  private check(t: TokenType): boolean { return this.current().type === t; }
  private checkAny(...types: TokenType[]): boolean { return types.includes(this.current().type); }

  private skipNewlines(): void {
    while (this.check(TokenType.NEWLINE)) this.consume();
  }

  private expectNewlineOrEof(): void {
    if (this.checkAny(TokenType.NEWLINE, TokenType.EOF)) { if (this.check(TokenType.NEWLINE)) this.consume(); }
    // if something else follows on the same line, it's handled by the caller
  }

  private expect(type: TokenType, description: string, example: string): Token {
    if (this.current().type !== type) {
      const tok = this.current();
      throw new ParseError(
        `Expected ${description} but found "${tok.value}".`,
        tok.line, tok.col,
        example ? `Example: ${example}` : undefined
      );
    }
    return this.consume();
  }

  private pos_(tok: Token): AST.Position { return { line: tok.line, col: tok.col }; }

  private error(message: string, fix?: string): never {
    const tok = this.current();
    throw new ParseError(message, tok.line, tok.col, fix);
  }
}

export function parse(tokens: Token[]): AST.Program {
  return new Parser(tokens).parse();
}
