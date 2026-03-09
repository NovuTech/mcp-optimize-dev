import ts from "typescript";
import type { CandidateFile } from "../shared/types.js";

const getMatchedSymbols = (content: string, terms: string[]): string[] => {
  const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const matched = new Set<string>();

  const matchIdentifier = (identifier: string): void => {
    const lower = identifier.toLowerCase();
    for (const term of terms) {
      if (lower.includes(term)) {
        matched.add(identifier);
      }
    }
  };

  const walk = (node: ts.Node): void => {
    if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name) {
      matchIdentifier(node.name.text);
    }
    if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
      matchIdentifier(node.name.text);
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      matchIdentifier(node.name.text);
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      matchIdentifier(node.moduleSpecifier.text);
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      matchIdentifier(node.moduleSpecifier.text);
    }

    node.forEachChild(walk);
  };

  walk(sourceFile);
  return [...matched];
};

export const rerankCandidates = (candidates: CandidateFile[], queryTerms: string[]): CandidateFile[] => {
  return candidates
    .map((candidate) => {
      const matchedSymbols = getMatchedSymbols(candidate.content, queryTerms);
      const symbolBoost = matchedSymbols.length * 4;
      const exactBoost = queryTerms.some((term) => candidate.path.toLowerCase().includes(term)) ? 2 : 0;

      return {
        ...candidate,
        score: candidate.score + symbolBoost + exactBoost,
        reasons: [...candidate.reasons, `symbol-boost:${symbolBoost}`, `exact-path-boost:${exactBoost}`],
        matchedSymbols,
      };
    })
    .sort((left, right) => right.score - left.score);
};
