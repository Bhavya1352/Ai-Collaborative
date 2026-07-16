// Piston API — Free code execution engine (no API key required)
// Docs: https://github.com/engineer-man/piston

const PISTON_BASE_URL = 'https://emkc.org/api/v2/piston';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  cpuTime?: number;
  wallTime?: number;
  error?: string;
}

export interface PistonLanguage {
  language: string;
  version: string;
  aliases: string[];
}

// Map of common language names to Piston language identifiers
export const PISTON_LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.50.0' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
  bash: { language: 'bash', version: '5.2.0' },
  sql: { language: 'sqlite3', version: '3.36.0' },
};

export const SUPPORTED_LANGUAGES = Object.keys(PISTON_LANGUAGE_MAP);

export const pistonService = {
  async executeCode(
    languageKey: string,
    code: string,
    stdin: string = '',
    args: string[] = []
  ): Promise<ExecutionResult> {
    const langConfig = PISTON_LANGUAGE_MAP[languageKey.toLowerCase()];

    if (!langConfig) {
      return {
        stdout: '',
        stderr: `Language "${languageKey}" is not supported.`,
        exitCode: 1,
        error: 'Unsupported language',
      };
    }

    try {
      const response = await fetch(`${PISTON_BASE_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langConfig.language,
          version: langConfig.version,
          files: [{ content: code }],
          stdin,
          args,
          compile_timeout: 10000,
          run_timeout: 5000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        stdout: data.run?.stdout || '',
        stderr: data.run?.stderr || data.compile?.stderr || '',
        exitCode: data.run?.code ?? 0,
        cpuTime: data.run?.cpu_time,
        wallTime: data.run?.wall_time,
      };
    } catch (err: any) {
      return {
        stdout: '',
        stderr: err.message || 'Failed to connect to execution engine',
        exitCode: 1,
        error: err.message,
      };
    }
  },

  async getRuntimes(): Promise<PistonLanguage[]> {
    try {
      const response = await fetch(`${PISTON_BASE_URL}/runtimes`);
      if (!response.ok) throw new Error('Failed to fetch runtimes');
      return await response.json();
    } catch {
      return [];
    }
  },
};
