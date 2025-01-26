export interface CodeAnalysisRequest {
    code: string;
    language: string;
    context?: string;
    focus?: Array<'security' | 'performance' | 'architecture' | 'style'>;
}

export interface CodeAnalysisResponse {
    analysis: {
        issues: Array<{
            type: string;
            description: string;
            severity: 'high' | 'medium' | 'low';
            location?: {
                line: number;
                column: number;
            };
            suggestion?: string;
        }>;
        metrics: {
            complexity: number;
            maintainability: number;
            testability: number;
        };
        suggestions: Array<{
            type: string;
            description: string;
            priority: 'high' | 'medium' | 'low';
            effort: 'small' | 'medium' | 'large';
        }>;
    };
    summary: string;
}

export interface CodeGenerationRequest {
    prompt: string;
    context?: {
        projectStructure?: string;
        dependencies?: Record<string, string>;
        existingCode?: string;
        requirements?: string[];
    };
    constraints?: {
        language: string;
        framework?: string;
        style?: string;
        maxTokens?: number;
    };
}

export interface CodeGenerationResponse {
    code: string;
    explanation: string;
    dependencies?: Record<string, string>;
    tests?: string;
    documentation?: string;
}

export interface TestGenerationRequest {
    code: string;
    type: 'unit' | 'integration' | 'e2e';
    framework?: string;
    coverage?: {
        statements?: number;
        branches?: number;
        functions?: number;
        lines?: number;
    };
}

export interface TestGenerationResponse {
    tests: string;
    setup?: string;
    mocks?: Record<string, any>;
    coverage: {
        estimated: {
            statements: number;
            branches: number;
            functions: number;
            lines: number;
        };
    };
} 