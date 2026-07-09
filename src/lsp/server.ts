import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocumentChangeEvent } from 'vscode-languageserver';

import { tokenize } from '../lexer/lexer';
import { parse } from '../parser/parser';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Add completionProvider, hoverProvider capabilities if needed later
    }
  };
  return result;
});

documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];

  try {
    const tokens = tokenize(text);
    parse(tokens); // We only care about syntax errors for now
  } catch (err: any) {
    if (err.line !== undefined && err.col !== undefined) {
      // LARP lines and cols are 1-indexed, LSP is 0-indexed
      const line = Math.max(0, err.line - 1);
      const col = Math.max(0, err.col - 1);
      
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line, character: col },
          end: { line, character: col + 1 } // Highlight 1 character for now
        },
        message: err.message + (err.fix ? `\nFix: ${err.fix}` : ''),
        source: 'larp'
      };
      diagnostics.push(diagnostic);
    }
  }

  // Send the computed diagnostics to VSCode
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
