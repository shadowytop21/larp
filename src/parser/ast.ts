// ============================================================
// LARP Language — AST Node Types
// Every node carries line/col info for error messages.
// ============================================================

export interface Position { line: number; col: number; }

// ── Program ──────────────────────────────────────────────────────────────────
export interface Program { kind: 'Program'; body: Statement[]; }

// ── Statements ───────────────────────────────────────────────────────────────
export type Statement =
  | SetStatement
  | SayStatement
  | IfStatement
  | WhileStatement
  | ForEachStatement
  | RepeatStatement
  | FunctionDeclaration
  | BlueprintDeclaration
  | ReturnStatement
  | TryStatement
  | StopAndSayStatement
  | CheckStatement
  | WriteStatement
  | BringInStatement
  | ShareStatement
  | ServerBlock
  | RouteHandler
  | RespondStatement
  | StartServerStatement
  | ConnectDatabaseStatement
  | RunQueryStatement
  | BreakStatement
  | ContinueStatement
  | MatchStatement
  | StopProgramStatement
  | ExpressionStatement;

export interface SetStatement {
  kind:      'SetStatement';
  name:      string;
  value:     Expression;
  constant:  boolean;  // true = set fixed
  pos:       Position;
}

export interface SayStatement {
  kind:  'SayStatement';
  value: Expression;
  pos:   Position;
}

export interface IfStatement {
  kind:       'IfStatement';
  condition:  Expression;
  then:       Statement[];
  elseIfs:    Array<{ condition: Expression; body: Statement[] }>;
  otherwise:  Statement[] | null;
  pos:        Position;
}

export interface WhileStatement {
  kind:      'WhileStatement';
  condition: Expression;
  body:      Statement[];
  pos:       Position;
}

export interface ForEachStatement {
  kind:     'ForEachStatement';
  variable: string;
  iterable: Expression;
  body:     Statement[];
  pos:      Position;
}

export interface RepeatStatement {
  kind:  'RepeatStatement';
  count: Expression;
  body:  Statement[];
  pos:   Position;
}

export interface Parameter {
  name:         string;
  defaultValue: Expression | null;
}

export interface FunctionDeclaration {
  kind:      'FunctionDeclaration';
  name:      string;
  params:    Parameter[];
  body:      Statement[];
  isAsync:   boolean;
  pos:       Position;
}

export interface BlueprintDeclaration {
  kind:      'BlueprintDeclaration';
  name:      string;
  parent:    string | null;  // based on
  fields:    string[];       // with field1, field2, ...
  methods:   FunctionDeclaration[];
  pos:       Position;
}

export interface ReturnStatement {
  kind:  'ReturnStatement';
  value: Expression;
  pos:   Position;
}

export interface TryStatement {
  kind:      'TryStatement';
  body:      Statement[];
  errorVar:  string | null;
  handler:   Statement[];
  pos:       Position;
}

export interface StopAndSayStatement {
  kind:    'StopAndSayStatement';
  message: Expression;
  pos:     Position;
}

export interface CheckStatement {
  kind:     'CheckStatement';
  actual:   Expression;
  expected: Expression;
  pos:      Position;
}

export interface WriteStatement {
  kind:    'WriteStatement';
  content: Expression;
  path:    Expression;
  pos:     Position;
}

export interface BringInStatement {
  kind:   'BringInStatement';
  path:   string;           // the string literal path
  alias:  string | null;    // as name
  pos:    Position;
}

export interface ShareStatement {
  kind: 'ShareStatement';
  name: string;
  pos:  Position;
}

// ── Server statements ─────────────────────────────────────────────────────────
export interface ServerBlock {
  kind: 'ServerBlock';
  pos:  Position;
}

export interface RouteHandler {
  kind:    'RouteHandler';
  method:  'GET' | 'POST' | 'PUT' | 'DELETE';
  path:    Expression;
  body:    Statement[];
  reqVar:  string | null;   // optional "as request" binding
  pos:     Position;
}

export interface RespondStatement {
  kind:  'RespondStatement';
  value: Expression;
  pos:   Position;
}

export interface StartServerStatement {
  kind: 'StartServerStatement';
  port: Expression;
  pos:  Position;
}

// ── Database ──────────────────────────────────────────────────────────────────
export interface ConnectDatabaseStatement {
  kind:      'ConnectDatabaseStatement';
  url:       Expression;
  varName:   string;         // "set db to connect to database ..."
  pos:       Position;
}

export interface RunQueryStatement {
  kind:    'RunQueryStatement';
  sql:     Expression;
  params:  Expression | null;
  varName: string | null;
  pos:     Position;
}

// ── Expression statement ──────────────────────────────────────────────────────
export interface ExpressionStatement {
  kind:       'ExpressionStatement';
  expression: Expression;
  pos:        Position;
}

// ── Loop Control & Match ──────────────────────────────────────────────────────
export interface BreakStatement {
  kind: 'BreakStatement';
  target: 'inner' | 'outer';
  pos: Position;
}

export interface ContinueStatement {
  kind: 'ContinueStatement';
  pos: Position;
}

export interface MatchCase {
  value: Expression;
  body: Statement[];
}

export interface MatchStatement {
  kind: 'MatchStatement';
  value: Expression;
  cases: MatchCase[];
  otherwise: Statement[] | null;
  pos: Position;
}

// ── Expressions ───────────────────────────────────────────────────────────────
export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NothingLiteral
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MethodCallExpression
  | IndexExpression
  | MemberExpression
  | ListLiteral
  | MapLiteral
  | NewBlueprintExpression
  | AskAiExpression
  | AwaitExpression
  | ReadFileExpression
  | GetRequestExpression
  | PostRequestExpression
  | GetEnvVarExpression
  | SplitExpression
  | JoinExpression
  | RoundExpression
  | TrimExpression
  | UppercaseExpression
  | LowercaseExpression
  | SquareRootExpression
  | LengthOfExpression
  | TypeOfExpression
  | CurrentTimeExpression
  | DoAtSameTimeExpression
  | FormatCurrencyExpression
  | SeedRandomExpression
  | NullCoalesceExpression
  | ErrorMessageExpression
  | AskExpression
  | AsNumberExpression
  | AsTextExpression
  | CommandLineArgumentExpression;

export interface NumberLiteral  { kind: 'NumberLiteral';  value: number; pos: Position; }
export interface StringLiteral  { kind: 'StringLiteral';  value: string; interpolated: boolean; pos: Position; }
export interface BooleanLiteral { kind: 'BooleanLiteral'; value: boolean; pos: Position; }
export interface NothingLiteral { kind: 'NothingLiteral'; pos: Position; }
export interface Identifier     { kind: 'Identifier'; name: string; pos: Position; }

export interface BinaryExpression {
  kind:  'BinaryExpression';
  op:    string;
  left:  Expression;
  right: Expression;
  pos:   Position;
}

export interface UnaryExpression {
  kind: 'UnaryExpression';
  op:   'not' | '-';
  expr: Expression;
  pos:  Position;
}

export interface CallExpression {
  kind:   'CallExpression';
  callee: Expression;
  args:   Expression[];
  pos:    Position;
}

export interface MethodCallExpression {
  kind:   'MethodCallExpression';
  object: Expression;
  method: string;
  args:   Expression[];
  pos:    Position;
}

export interface IndexExpression {
  kind:   'IndexExpression';
  object: Expression;
  index:  Expression;
  pos:    Position;
}

export interface MemberExpression {
  kind:     'MemberExpression';
  object:   Expression;
  property: string;
  pos:      Position;
}

export interface ListLiteral {
  kind:     'ListLiteral';
  elements: Expression[];
  pos:      Position;
}

export interface MapLiteral {
  kind:    'MapLiteral';
  entries: Array<{ key: Expression; value: Expression }>;
  pos:     Position;
}

export interface NewBlueprintExpression {
  kind:   'NewBlueprintExpression';
  name:   string;
  // Named args: "with field1 val1, field2 val2"
  args:   Array<{ field: string; value: Expression }>;
  pos:    Position;
}

export interface AskAiExpression {
  kind:   'AskAiExpression';
  prompt: Expression;
  pos:    Position;
}

export interface AwaitExpression {
  kind:  'AwaitExpression';
  inner: Expression;
  pos:   Position;
}

export interface ReadFileExpression  { kind: 'ReadFileExpression';  path: Expression; pos: Position; }
export interface GetRequestExpression  { kind: 'GetRequestExpression';  url: Expression; pos: Position; }
export interface PostRequestExpression { kind: 'PostRequestExpression'; url: Expression; body: Expression | null; pos: Position; }
export interface GetEnvVarExpression   { kind: 'GetEnvVarExpression';   name: Expression; pos: Position; }

export interface SplitExpression   { kind: 'SplitExpression';   value: Expression; delimiter: Expression; pos: Position; }
export interface JoinExpression    { kind: 'JoinExpression';    list: Expression;  delimiter: Expression; pos: Position; }
export interface RoundExpression   { kind: 'RoundExpression';   value: Expression; pos: Position; }
export interface TrimExpression    { kind: 'TrimExpression';    value: Expression; pos: Position; }
export interface UppercaseExpression { kind: 'UppercaseExpression'; value: Expression; pos: Position; }
export interface LowercaseExpression { kind: 'LowercaseExpression'; value: Expression; pos: Position; }
export interface SquareRootExpression { kind: 'SquareRootExpression'; value: Expression; pos: Position; }
export interface LengthOfExpression  { kind: 'LengthOfExpression';  value: Expression; pos: Position; }
export interface TypeOfExpression    { kind: 'TypeOfExpression';    value: Expression; pos: Position; }
export interface CurrentTimeExpression { kind: 'CurrentTimeExpression'; pos: Position; }
export interface ErrorMessageExpression { kind: 'ErrorMessageExpression'; target: Expression; pos: Position; }

export interface DoAtSameTimeExpression {
  kind:  'DoAtSameTimeExpression';
  tasks: Expression[];
  pos:   Position;
}

export interface FormatCurrencyExpression { kind: 'FormatCurrencyExpression'; value: Expression; pos: Position; }
export interface SeedRandomExpression { kind: 'SeedRandomExpression'; value: Expression; pos: Position; }
export interface NullCoalesceExpression { kind: 'NullCoalesceExpression'; left: Expression; right: Expression; pos: Position; }

// ── Stop program ────────────────────────────────────────────────────────────
export interface StopProgramStatement {
  kind: 'StopProgramStatement';
  pos:  Position;
}

// ── Console input ───────────────────────────────────────────────────────────
export interface AskExpression {
  kind:   'AskExpression';
  prompt: Expression;
  pos:    Position;
}

// ── Type conversion ─────────────────────────────────────────────────────────
export interface AsNumberExpression {
  kind:  'AsNumberExpression';
  value: Expression;
  pos:   Position;
}

export interface AsTextExpression {
  kind:  'AsTextExpression';
  value: Expression;
  pos:   Position;
}

// ── Command-line arguments ──────────────────────────────────────────────────
export interface CommandLineArgumentExpression {
  kind:     'CommandLineArgumentExpression';
  name:     Expression;
  fallback: Expression | null;
  pos:      Position;
}
