// ============================================================
// LARP Language — Token Types
// ============================================================

export enum TokenType {
  // ── Literals ──────────────────────────────────────────────
  NUMBER      = 'NUMBER',
  STRING      = 'STRING',       // includes {interpolation}
  IDENTIFIER  = 'IDENTIFIER',

  // ── Primitive values ──────────────────────────────────────
  TRUE    = 'TRUE',
  FALSE   = 'FALSE',
  NOTHING = 'NOTHING',

  // ── Variables ─────────────────────────────────────────────
  SET       = 'SET',        // set
  SET_FIXED = 'SET_FIXED',  // set fixed
  TO        = 'TO',         // to

  // ── Control flow ──────────────────────────────────────────
  IF             = 'IF',
  OTHERWISE_IF   = 'OTHERWISE_IF',   // otherwise if
  OTHERWISE      = 'OTHERWISE',
  WHILE          = 'WHILE',
  FOR_EACH       = 'FOR_EACH',       // for each
  IN             = 'IN',
  REPEAT         = 'REPEAT',
  TIMES          = 'TIMES',
  END            = 'END',
  STOP_THIS_LOOP = 'STOP_THIS_LOOP', // stop this loop
  SKIP_THIS_ATTEMPT = 'SKIP_THIS_ATTEMPT', // skip this attempt
  STOP_THE_OUTER_LOOP = 'STOP_THE_OUTER_LOOP', // stop the outer loop
  STOP_THE_PROGRAM = 'STOP_THE_PROGRAM', // stop the program
  MATCH          = 'MATCH',
  CASE           = 'CASE',

  // ── Functions ─────────────────────────────────────────────
  CREATE_FUNCTION = 'CREATE_FUNCTION',  // create function
  WITH            = 'WITH',
  AND             = 'AND',
  GIVE_BACK       = 'GIVE_BACK',        // give back
  EQUAL_TO        = 'EQUAL_TO',         // equal to  (default param value)

  // ── Error handling ────────────────────────────────────────
  TRY                      = 'TRY',
  IF_SOMETHING_GOES_WRONG  = 'IF_SOMETHING_GOES_WRONG',  // if something goes wrong
  AS                       = 'AS',
  STOP_AND_SAY             = 'STOP_AND_SAY',             // stop and say
  ERROR_MESSAGE            = 'ERROR_MESSAGE',            // error message

  // ── Blueprints ────────────────────────────────────────────
  CREATE_BLUEPRINT_CALLED = 'CREATE_BLUEPRINT_CALLED',  // create a blueprint called
  BASED_ON                = 'BASED_ON',                  // based on
  A_NEW                   = 'A_NEW',                     // a new

  // ── Modules ───────────────────────────────────────────────
  BRING_IN       = 'BRING_IN',        // bring in
  SHARE_FUNCTION = 'SHARE_FUNCTION',  // share function
  SHARE          = 'SHARE',

  // ── Output / assertions ───────────────────────────────────
  SAY        = 'SAY',
  CHECK_THAT = 'CHECK_THAT',   // check that
  IS_EQUAL_TO= 'IS_EQUAL_TO',  // is equal to

  // ── Collections ───────────────────────────────────────────
  A_LIST_CONTAINING = 'A_LIST_CONTAINING',  // a list containing
  A_MAP_CONTAINING  = 'A_MAP_CONTAINING',   // a map containing
  IS                = 'IS',
  USE               = 'USE',

  // ── Async ─────────────────────────────────────────────────
  WAIT_FOR           = 'WAIT_FOR',            // wait for
  DO_AT_THE_SAME_TIME= 'DO_AT_THE_SAME_TIME', // do at the same time

  // ── Console Input ────────────────────────────────────────
  ASK    = 'ASK',     // ask (console input)

  // ── AI ────────────────────────────────────────────────────
  ASK_AI = 'ASK_AI',  // ask ai

  // ── Server ────────────────────────────────────────────────
  CREATE_A_SERVER       = 'CREATE_A_SERVER',         // create a server
  WHEN_REQUEST_COMES_TO = 'WHEN_REQUEST_COMES_TO',   // when a request comes to
  RESPOND_WITH          = 'RESPOND_WITH',             // respond with
  START_APP_ON_PORT     = 'START_APP_ON_PORT',        // start app on port

  // ── Database ──────────────────────────────────────────────
  CONNECT_TO_DATABASE = 'CONNECT_TO_DATABASE',  // connect to database
  RUN_QUERY           = 'RUN_QUERY',             // run query

  // ── HTTP ──────────────────────────────────────────────────
  GET_REQUEST_TO  = 'GET_REQUEST_TO',   // get request to
  POST_REQUEST_TO = 'POST_REQUEST_TO',  // post request to
  WITH_BODY       = 'WITH_BODY',        // with body

  // ── Files ─────────────────────────────────────────────────
  READ_FILE  = 'READ_FILE',   // read file
  WRITE      = 'WRITE',       // write (expression) to file (expression)
  FILE_KW    = 'FILE_KW',     // file

  // ── Environment ───────────────────────────────────────────
  GET_ENV_VAR = 'GET_ENV_VAR',  // get environment variable

  // ── Stdlib helpers ────────────────────────────────────────
  SQUARE_ROOT_OF = 'SQUARE_ROOT_OF',  // square root of
  UPPERCASE_OF   = 'UPPERCASE_OF',    // uppercase of
  LOWERCASE_OF   = 'LOWERCASE_OF',    // lowercase of
  CURRENT_TIME   = 'CURRENT_TIME',    // current time
  ROUND          = 'ROUND',
  TRIM           = 'TRIM',
  SPLIT          = 'SPLIT',
  BY             = 'BY',
  JOIN           = 'JOIN',
  LENGTH_OF      = 'LENGTH_OF',       // length of
  TYPE_OF        = 'TYPE_OF',         // type of
  FORMAT         = 'FORMAT',          // format
  AS_CURRENCY    = 'AS_CURRENCY',     // as currency
  AS_A_NUMBER    = 'AS_A_NUMBER',     // as a number
  AS_TEXT        = 'AS_TEXT',         // as text
  SEED_RANDOM_WITH = 'SEED_RANDOM_WITH', // seed random with

  // ── CLI Arguments ──────────────────────────────────────────
  COMMAND_LINE_ARGUMENT = 'COMMAND_LINE_ARGUMENT', // command line argument

  // ── Logical operators ─────────────────────────────────────
  OR  = 'OR',
  NOT = 'NOT',

  // ── Symbol operators ──────────────────────────────────────
  PLUS    = 'PLUS',    // +
  MINUS   = 'MINUS',   // -
  STAR    = 'STAR',    // *
  SLASH   = 'SLASH',   // /
  PERCENT = 'PERCENT', // %
  CARET   = 'CARET',   // ^
  EQ      = 'EQ',      // ==
  NEQ     = 'NEQ',     // !=
  GT      = 'GT',      // >
  LT      = 'LT',      // <
  GTE     = 'GTE',     // >=
  LTE     = 'LTE',     // <=

  // ── Punctuation ───────────────────────────────────────────
  COLON    = 'COLON',
  COMMA    = 'COMMA',
  DOT      = 'DOT',
  LPAREN   = 'LPAREN',
  RPAREN   = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',

  // ── Special ───────────────────────────────────────────────
  NEWLINE = 'NEWLINE',
  EOF     = 'EOF',
}

export interface Token {
  type:  TokenType;
  value: string;
  line:  number;
  col:   number;
}
