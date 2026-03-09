import ts from "typescript";
import type { FileScanResult, RetrievalIndexEntry } from "../shared/types.js";
import { tokenize, uniqueTerms } from "./keywords.js";

const extractImportTerms = (sourceFile: ts.SourceFile): string[] => {
  const terms: string[] = [];

  sourceFile.forEachChild((node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      terms.push(...tokenize(node.moduleSpecifier.text));
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      terms.push(...tokenize(node.moduleSpecifier.text));
    }
  });

  return uniqueTerms(terms);
};

const extractSymbolTerms = (sourceFile: ts.SourceFile): string[] => {
  const terms: string[] = [];

  const pushName = (name: ts.PropertyName | ts.BindingName | ts.DeclarationName | undefined): void => {
    if (!name) {
      return;
    }
    if (ts.isIdentifier(name)) {
      terms.push(...tokenize(name.text));
    }
  };

  const walk = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      pushName(node.name);
    }
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => pushName(decl.name));
    }
    if (ts.isMethodDeclaration(node)) {
      pushName(node.name);
    }
    if (ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
      pushName(node.name);
    }

    node.forEachChild(walk);
  };

  walk(sourceFile);
  return uniqueTerms(terms);
};

export const buildRetrievalIndex = (files: FileScanResult[]): RetrievalIndexEntry[] => {
  return files.map((file) => {
    const sourceFile = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const filenameTerms = uniqueTerms(tokenize(file.path));
    const contentTerms = uniqueTerms(tokenize(file.content));
    const importTerms = extractImportTerms(sourceFile);
    const symbolTerms = extractSymbolTerms(sourceFile);

    return {
      path: file.path,
      filenameTerms,
      contentTerms,
      importTerms,
      symbolTerms,
    };
  });
};
