// ============================================================
// LARP Language — Lexer
// Converts raw .larp source text into a stream of Tokens.
// Uses a two-phase approach:
//   Phase 1 — scan characters into raw tokens
//   Phase 2 — merge consecutive IDENTIFIER tokens into
//              multi-word keywords (greedy, longest-first)
// ============================================================

import { Token, TokenType } from './tokens';

// ── Error ─────────────────────────────────────────────────────────────────────
export class LexError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly col:  number,
    public readonly fix?: string
  ) {
    super(message);
    this.name = 'LexError';
  }
}

// ── Multi-word keywords (longest first for greedy match) ─────────────────────
const MULTI_WORD_KEYWORDS: Array<[string[], TokenType]> = [
  // 5 words
  [['when', 'a', 'request', 'comes', 'to'], TokenType.WHEN_REQUEST_COMES_TO],
  [['do', 'at', 'the', 'same', 'time'],     TokenType.DO_AT_THE_SAME_TIME],
  // 4 words
  [['create', 'a', 'blueprint', 'called'],  TokenType.CREATE_BLUEPRINT_CALLED],
  [['if', 'something', 'goes', 'wrong'],    TokenType.IF_SOMETHING_GOES_WRONG],
  [['start', 'app', 'on', 'port'],          TokenType.START_APP_ON_PORT],
  [['get', 'environment', 'variable'],      TokenType.GET_ENV_VAR],
  [['stop', 'the', 'outer', 'loop'],        TokenType.STOP_THE_OUTER_LOOP],
  [['stop', 'the', 'program'],              TokenType.STOP_THE_PROGRAM],
  [['command', 'line', 'argument'],          TokenType.COMMAND_LINE_ARGUMENT],
  [['as', 'a', 'number'],                   TokenType.AS_A_NUMBER],
  // 3 words
  [['create', 'a', 'server'],               TokenType.CREATE_A_SERVER],
  [['a', 'list', 'containing'],             TokenType.A_LIST_CONTAINING],
  [['a', 'map', 'containing'],              TokenType.A_MAP_CONTAINING],
  [['connect', 'to', 'database'],           TokenType.CONNECT_TO_DATABASE],
  [['post', 'request', 'to'],               TokenType.POST_REQUEST_TO],
  [['get', 'request', 'to'],                TokenType.GET_REQUEST_TO],
  [['square', 'root', 'of'],                TokenType.SQUARE_ROOT_OF],
  [['stop', 'and', 'say'],                  TokenType.STOP_AND_SAY],
  [['is', 'equal', 'to'],                   TokenType.IS_EQUAL_TO],
  [['length', 'of'],                        TokenType.LENGTH_OF],
  [['type', 'of'],                          TokenType.TYPE_OF],
  [['error', 'message'],                    TokenType.ERROR_MESSAGE],
  [['current', 'time'],                     TokenType.CURRENT_TIME],
  [['seed', 'random', 'with'],              TokenType.SEED_RANDOM_WITH],
  [['stop', 'this', 'loop'],                TokenType.STOP_THIS_LOOP],
  [['skip', 'this', 'attempt'],             TokenType.SKIP_THIS_ATTEMPT],
  // 2 words
  [['create', 'function'],                  TokenType.CREATE_FUNCTION],
  [['share', 'function'],                   TokenType.SHARE_FUNCTION],
  [['otherwise', 'if'],                     TokenType.OTHERWISE_IF],
  [['give', 'back'],                        TokenType.GIVE_BACK],
  [['for', 'each'],                         TokenType.FOR_EACH],
  [['set', 'fixed'],                        TokenType.SET_FIXED],
  [['bring', 'in'],                         TokenType.BRING_IN],
  [['wait', 'for'],                         TokenType.WAIT_FOR],
  [['based', 'on'],                         TokenType.BASED_ON],
  [['respond', 'with'],                     TokenType.RESPOND_WITH],
  [['run', 'query'],                        TokenType.RUN_QUERY],
  [['read', 'file'],                        TokenType.READ_FILE],
  [['uppercase', 'of'],                     TokenType.UPPERCASE_OF],
  [['lowercase', 'of'],                     TokenType.LOWERCASE_OF],
  [['ask', 'ai'],                           TokenType.ASK_AI],
  [['check', 'that'],                       TokenType.CHECK_THAT],
  [['with', 'body'],                        TokenType.WITH_BODY],
  [['equal', 'to'],                         TokenType.EQUAL_TO],
  [['a', 'new'],                            TokenType.A_NEW],
  [['as', 'currency'],                      TokenType.AS_CURRENCY],
  [['as', 'text'],                          TokenType.AS_TEXT],
];

// ── Single-word reserved keywords ────────────────────────────────────────────
const SINGLE_KEYWORDS: Record<string, TokenType> = {
  set:       TokenType.SET,
  if:        TokenType.IF,
  otherwise: TokenType.OTHERWISE,
  while:     TokenType.WHILE,
  repeat:    TokenType.REPEAT,
  times:     TokenType.TIMES,
  end:       TokenType.END,
  try:       TokenType.TRY,
  say:       TokenType.SAY,
  and:       TokenType.AND,
  or:        TokenType.OR,
  not:       TokenType.NOT,
  true:      TokenType.TRUE,
  false:     TokenType.FALSE,
  nothing:   TokenType.NOTHING,
  in:        TokenType.IN,
  to:        TokenType.TO,
  with:      TokenType.WITH,
  as:        TokenType.AS,
  is:        TokenType.IS,
  write:     TokenType.WRITE,
  file:      TokenType.FILE_KW,
  by:        TokenType.BY,
  join:      TokenType.JOIN,
  split:     TokenType.SPLIT,
  round:     TokenType.ROUND,
  trim:      TokenType.TRIM,
  share:     TokenType.SHARE,
  match:     TokenType.MATCH,
  case:      TokenType.CASE,
  use:       TokenType.USE,
  format:    TokenType.FORMAT,
  ask:       TokenType.ASK,
};

// ── Lexer ─────────────────────────────────────────────────────────────────────
export class Lexer {
  private pos  = 0;
  private line = 1;
  private col  = 1;

  constructor(private readonly source: string) {}

  // ── Public entry point ──────────────────────────────────────────────────────
  tokenize(): Token[] {
    const raw = this.scanPhase();
    return this.mergePhase(raw);
  }

  // ── Phase 1: character scanning ─────────────────────────────────────────────
  private scanPhase(): Token[] {
    const tokens: Token[] = [];

    while (!this.atEnd()) {
      const c = this.peek();

      // ── Whitespace (spaces / tabs / carriage returns) ─────────────────────
      if (c === ' ' || c === '\t' || c === '\r') { this.advance(); continue; }

      // ── Newlines ─────────────────────────────────────────────────────────
      if (c === '\n') {
        const last = tokens[tokens.length - 1];
        if (last && last.type !== TokenType.NEWLINE) {
          tokens.push(this.makeToken(TokenType.NEWLINE, '\n'));
        }
        this.advance();
        continue;
      }

      // ── String literal ────────────────────────────────────────────────────
      if (c === '"') { tokens.push(this.scanString()); continue; }

      // ── Number ────────────────────────────────────────────────────────────
      if (this.isDigit(c)) { tokens.push(this.scanNumber()); continue; }

      // ── Word (keyword or identifier) ──────────────────────────────────────
      if (this.isAlpha(c)) {
        const wordTok = this.scanWord();
        // Handle inline comment: if the word is "note" and next char is ':'
        if (wordTok.value.toLowerCase() === 'note' && this.peek() === ':') {
          this.advance(); // consume ':'
          while (!this.atEnd() && this.peek() !== '\n') this.advance();
          continue;
        }
        // Handle multi-line comment: "note starts" ... "note ends"
        if (wordTok.value.toLowerCase() === 'note') {
          // Peek ahead to see if next word is "starts"
          const savedPos = this.pos;
          const savedLine = this.line;
          const savedCol = this.col;
          // skip whitespace (not newlines)
          while (!this.atEnd() && (this.peek() === ' ' || this.peek() === '\t')) this.advance();
          let nextWord = '';
          while (!this.atEnd() && this.isAlphaNum(this.peek())) nextWord += this.advance();
          if (nextWord.toLowerCase() === 'starts') {
            // Multi-line comment: skip until "note ends"
            this.skipUntilNoteEnds();
            continue;
          } else {
            // Not a multi-line comment — rewind
            this.pos = savedPos;
            this.line = savedLine;
            this.col = savedCol;
          }
        }
        tokens.push(wordTok);
        continue;
      }

      // ── Operators and punctuation ─────────────────────────────────────────
      const op = this.scanOperator();
      if (op) { tokens.push(op); continue; }

      throw new LexError(
        `Unexpected character: '${c}'`,
        this.line, this.col,
        `Remove the character '${c}' at line ${this.line}, column ${this.col}.`
      );
    }

    tokens.push(this.makeToken(TokenType.EOF, ''));
    return tokens;
  }

  // ── String literal (with {interpolation} support) ────────────────────────────
  private scanString(): Token {
    const sl = this.line, sc = this.col;
    this.advance(); // consume opening "
    let value = '';
    let hasInterp = false;

    while (!this.atEnd() && this.peek() !== '"') {
      if (this.peek() === '\n') {
        throw new LexError(
          'A string was not closed before the end of the line.',
          sl, sc,
          `Add a closing " at the end of your string on line ${sl}.`
        );
      }
      if (this.peek() === '{') {
        hasInterp = true;
        value += '{';
        this.advance();
        while (!this.atEnd() && this.peek() !== '}') {
          if (this.peek() === '\n') throw new LexError('Missing } in string interpolation.', sl, sc, 'Close the { with a }.');
          value += this.advance();
        }
        if (this.atEnd()) throw new LexError('Missing } in string interpolation.', sl, sc, 'Close the { with a }.');
        value += '}';
        this.advance();
      } else if (this.peek() === '\\') {
        this.advance();
        const esc = this.advance();
        switch (esc) {
          case 'n':  value += '\\n'; break;
          case 't':  value += '\\t'; break;
          case '"':  value += '"';   break;
          case '\\': value += '\\\\'; break;
          default:   value += '\\' + esc;
        }
      } else {
        value += this.advance();
      }
    }

    if (this.atEnd()) {
      throw new LexError('String was not closed.', sl, sc, `Add a closing " at the end of your string on line ${sl}.`);
    }
    this.advance(); // consume closing "

    return { type: TokenType.STRING, value: hasInterp ? `__INTERP__${value}` : value, line: sl, col: sc };
  }

  // ── Number literal ────────────────────────────────────────────────────────────
  private scanNumber(): Token {
    const sl = this.line, sc = this.col;
    let v = '';
    while (!this.atEnd() && this.isDigit(this.peek())) v += this.advance();
    if (!this.atEnd() && this.peek() === '.' && this.isDigit(this.peekNext())) {
      v += this.advance();
      while (!this.atEnd() && this.isDigit(this.peek())) v += this.advance();
    }
    return { type: TokenType.NUMBER, value: v, line: sl, col: sc };
  }

  // ── Word (identifier / potential keyword) ────────────────────────────────────
  private scanWord(): Token {
    const sl = this.line, sc = this.col;
    let v = '';
    while (!this.atEnd() && (this.isAlphaNum(this.peek()) || this.peek() === '_')) v += this.advance();
    return { type: TokenType.IDENTIFIER, value: v, line: sl, col: sc };
  }

  // ── Operators and punctuation ─────────────────────────────────────────────────
  private scanOperator(): Token | null {
    const sl = this.line, sc = this.col;
    const c = this.peek();
    const c2 = c + (this.source[this.pos + 1] || '');

    switch (c2) {
      case '==': this.advance(); this.advance(); return { type: TokenType.EQ,  value: '==', line: sl, col: sc };
      case '!=': this.advance(); this.advance(); return { type: TokenType.NEQ, value: '!=', line: sl, col: sc };
      case '>=': this.advance(); this.advance(); return { type: TokenType.GTE, value: '>=', line: sl, col: sc };
      case '<=': this.advance(); this.advance(); return { type: TokenType.LTE, value: '<=', line: sl, col: sc };
    }

    switch (c) {
      case '+': this.advance(); return { type: TokenType.PLUS,     value: '+', line: sl, col: sc };
      case '-': this.advance(); return { type: TokenType.MINUS,    value: '-', line: sl, col: sc };
      case '*': this.advance(); return { type: TokenType.STAR,     value: '*', line: sl, col: sc };
      case '/': this.advance(); return { type: TokenType.SLASH,    value: '/', line: sl, col: sc };
      case '%': this.advance(); return { type: TokenType.PERCENT,  value: '%', line: sl, col: sc };
      case '^': this.advance(); return { type: TokenType.CARET,    value: '^', line: sl, col: sc };
      case '>': this.advance(); return { type: TokenType.GT,       value: '>', line: sl, col: sc };
      case '<': this.advance(); return { type: TokenType.LT,       value: '<', line: sl, col: sc };
      case ':': this.advance(); return { type: TokenType.COLON,    value: ':', line: sl, col: sc };
      case ',': this.advance(); return { type: TokenType.COMMA,    value: ',', line: sl, col: sc };
      case '.': this.advance(); return { type: TokenType.DOT,      value: '.', line: sl, col: sc };
      case '(': this.advance(); return { type: TokenType.LPAREN,   value: '(', line: sl, col: sc };
      case ')': this.advance(); return { type: TokenType.RPAREN,   value: ')', line: sl, col: sc };
      case '[': this.advance(); return { type: TokenType.LBRACKET, value: '[', line: sl, col: sc };
      case ']': this.advance(); return { type: TokenType.RBRACKET, value: ']', line: sl, col: sc };
    }
    return null;
  }

  // ── Phase 2: merge IDENTIFIER sequences into multi-word keywords ──────────────
  private mergePhase(tokens: Token[]): Token[] {
    const out: Token[] = [];
    let i = 0;

    while (i < tokens.length) {
      const tok = tokens[i];

      if (tok.type !== TokenType.IDENTIFIER) {
        out.push(tok);
        i++;
        continue;
      }

      let matched = false;
      for (const [words, kwType] of MULTI_WORD_KEYWORDS) {
        if (this.matchWords(tokens, i, words)) {
          out.push({ type: kwType, value: words.join(' '), line: tok.line, col: tok.col });
          i += words.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        const kw = SINGLE_KEYWORDS[tok.value.toLowerCase()];
        out.push(kw !== undefined ? { ...tok, type: kw } : tok);
        i++;
      }
    }

    return out;
  }

  // Check if tokens[start..start+words.length] match the given word list
  private matchWords(tokens: Token[], start: number, words: string[]): boolean {
    for (let j = 0; j < words.length; j++) {
      const t = tokens[start + j];
      if (!t || t.type !== TokenType.IDENTIFIER) return false;
      if (t.value.toLowerCase() !== words[j]) return false;
    }
    return true;
  }

  // ── Multi-line comment scanner ────────────────────────────────────────────────
  private skipUntilNoteEnds(): void {
    // Skip everything until we find "note" followed by "ends"
    while (!this.atEnd()) {
      // Skip to the next word boundary
      if (!this.isAlpha(this.peek())) {
        this.advance();
        continue;
      }
      // Read a word
      let word = '';
      const wPos = this.pos;
      const wLine = this.line;
      const wCol = this.col;
      while (!this.atEnd() && this.isAlphaNum(this.peek())) word += this.advance();
      if (word.toLowerCase() === 'note') {
        // Check if next word is "ends"
        const savedPos2 = this.pos;
        const savedLine2 = this.line;
        const savedCol2 = this.col;
        while (!this.atEnd() && (this.peek() === ' ' || this.peek() === '\t')) this.advance();
        let nextWord = '';
        while (!this.atEnd() && this.isAlphaNum(this.peek())) nextWord += this.advance();
        if (nextWord.toLowerCase() === 'ends') {
          return; // Done — comment block closed
        }
        // Not "ends" — rewind to after "note"
        this.pos = savedPos2;
        this.line = savedLine2;
        this.col = savedCol2;
      }
    }
    // If we reach EOF without "note ends", that's fine — treat rest as comment
  }

  // ── Primitives ────────────────────────────────────────────────────────────────
  private peek():     string { return this.source[this.pos]     || ''; }
  private peekNext(): string { return this.source[this.pos + 1] || ''; }
  private atEnd():    boolean { return this.pos >= this.source.length; }

  private advance(): string {
    const c = this.source[this.pos++];
    if (c === '\n') { this.line++; this.col = 1; } else { this.col++; }
    return c;
  }

  private makeToken(type: TokenType, value: string): Token {
    return { type, value, line: this.line, col: this.col };
  }

  private isDigit(c: string):    boolean { return c >= '0' && c <= '9'; }
  private isAlpha(c: string):    boolean { return /[a-zA-Z_]/.test(c); }
  private isAlphaNum(c: string): boolean { return /[a-zA-Z0-9_]/.test(c); }
}

export function tokenize(source: string): Token[] {
  return new Lexer(source).tokenize();
}
