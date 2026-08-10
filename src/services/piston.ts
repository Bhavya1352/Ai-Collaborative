const LOCAL_RUNNER_URL = 'http://localhost:3001';

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

export const PISTON_LANGUAGE_MAP: Record<
  string,
  { language: string; version: string }
> = {
  javascript: {
    language: 'javascript',
    version: '18.15.0',
  },
  typescript: {
    language: 'typescript',
    version: '5.0.3',
  },
  python: {
    language: 'python',
    version: '3.10.0',
  },
  java: {
    language: 'java',
    version: '15.0.2',
  },
  cpp: {
    language: 'c++',
    version: '10.2.0',
  },
  c: {
    language: 'c',
    version: '10.2.0',
  },
  go: {
    language: 'go',
    version: '1.16.2',
  },
  rust: {
    language: 'rust',
    version: '1.50.0',
  },
  ruby: {
    language: 'ruby',
    version: '3.0.1',
  },
  php: {
    language: 'php',
    version: '8.2.3',
  },
  bash: {
    language: 'bash',
    version: '5.2.0',
  },
  sql: {
    language: 'sqlite3',
    version: '3.36.0',
  },
};

export const SUPPORTED_LANGUAGES =
  Object.keys(PISTON_LANGUAGE_MAP);

export const pistonService = {
  async executeCode(
    languageKey: string,
    code: string,
    stdin: string = '',
    args: string[] = []
  ): Promise<ExecutionResult> {
    try {
      const response = await fetch(
        `${LOCAL_RUNNER_URL}/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: languageKey,
            code,
            stdin,
            args,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Local runner error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode: data.exitCode ?? 0,
        cpuTime: data.cpuTime,
        wallTime: data.wallTime,
        error: data.error,
      };
    } catch (error: any) {
      return {
        stdout: '',
        stderr: '',
        exitCode: 1,
        error:
          error?.message ||
          'Could not connect to local runner.',
      };
    }
  },

  async getRuntimes(): Promise<PistonLanguage[]> {
    return [];
  },
};