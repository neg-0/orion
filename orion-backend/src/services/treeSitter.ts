import fs from 'fs';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import Python from 'tree-sitter-python';
import TypeScript from 'tree-sitter-typescript';

export type SupportedLanguage = 'javascript' | 'typescript' | 'python';

interface ParseResult {
    ast: any;
    metrics: CodeMetrics;
    issues: CodeIssue[];
}

interface CodeMetrics {
    linesOfCode: number;
    functions: number;
    classes: number;
    complexity: number;
}

interface CodeIssue {
    type: string;
    message: string;
    line: number;
    column: number;
    severity: 'error' | 'warning' | 'info';
}

export class TreeSitterService {
    private parser: Parser;
    private languages: Map<SupportedLanguage, any>;

    constructor() {
        this.parser = new Parser();
        this.languages = new Map([
            ['javascript', JavaScript],
            ['typescript', TypeScript.typescript],
            ['python', Python]
        ]);
    }

    async parseFile(filePath: string, language?: SupportedLanguage): Promise<ParseResult> {
        // Detect language from file extension if not provided
        if (!language) {
            language = this.detectLanguage(filePath);
        }

        const languageModule = this.languages.get(language);
        if (!languageModule) {
            throw new Error(`Unsupported language: ${language}`);
        }

        this.parser.setLanguage(languageModule);
        const source = await fs.promises.readFile(filePath, 'utf8');
        const tree = this.parser.parse(source);

        return {
            ast: tree.rootNode,
            metrics: this.calculateMetrics(tree.rootNode, source),
            issues: this.detectIssues(tree.rootNode, source)
        };
    }

    async parseCode(code: string, language: SupportedLanguage): Promise<ParseResult> {
        const languageModule = this.languages.get(language);
        if (!languageModule) {
            throw new Error(`Unsupported language: ${language}`);
        }

        this.parser.setLanguage(languageModule);
        const tree = this.parser.parse(code);

        return {
            ast: tree.rootNode,
            metrics: this.calculateMetrics(tree.rootNode, code),
            issues: this.detectIssues(tree.rootNode, code)
        };
    }

    private detectLanguage(filePath: string): SupportedLanguage {
        const ext = filePath.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
            case 'jsx':
                return 'javascript';
            case 'ts':
            case 'tsx':
                return 'typescript';
            case 'py':
                return 'python';
            default:
                throw new Error(`Unsupported file extension: ${ext}`);
        }
    }

    private calculateMetrics(rootNode: any, source: string): CodeMetrics {
        const metrics: CodeMetrics = {
            linesOfCode: source.split('\n').length,
            functions: 0,
            classes: 0,
            complexity: 0
        };

        // Count functions and classes
        this.traverseTree(rootNode, (node) => {
            switch (node.type) {
                case 'function':
                case 'function_declaration':
                case 'arrow_function':
                    metrics.functions++;
                    break;
                case 'class':
                case 'class_declaration':
                    metrics.classes++;
                    break;
                // Calculate cyclomatic complexity
                case 'if':
                case 'while':
                case 'for':
                case 'switch':
                case '&&':
                case '||':
                    metrics.complexity++;
                    break;
            }
        });

        return metrics;
    }

    private detectIssues(rootNode: any, source: string): CodeIssue[] {
        const issues: CodeIssue[] = [];

        // Example issues to detect
        this.traverseTree(rootNode, (node) => {
            // Detect long functions
            if (
                (node.type === 'function' || node.type === 'function_declaration') &&
                node.endPosition.row - node.startPosition.row > 30
            ) {
                issues.push({
                    type: 'long-function',
                    message: 'Function is too long (> 30 lines)',
                    line: node.startPosition.row + 1,
                    column: node.startPosition.column,
                    severity: 'warning'
                });
            }

            // Add more issue detection rules here
        });

        return issues;
    }

    private traverseTree(node: any, callback: (node: any) => void) {
        callback(node);
        if (node.children) {
            for (const child of node.children) {
                this.traverseTree(child, callback);
            }
        }
    }
} 