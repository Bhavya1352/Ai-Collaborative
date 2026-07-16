// GitHub REST API — No auth required for public data (60 req/hr unauthenticated)
// For higher rate limits, set VITE_GITHUB_TOKEN in .env

const GITHUB_BASE = 'https://api.github.com';

const getHeaders = (): HeadersInit => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  return token
    ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    : { Accept: 'application/vnd.github+json' };
};

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  open_issues_count: number;
}

export interface GithubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
}

// GitHub language colors (subset of the most common)
export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

export const githubService = {
  // Fetch trending repos using GitHub search API (sorted by stars, created last 7 days)
  async getTrendingRepos(language?: string, since: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<GithubRepo[]> {
    const daysMap = { daily: 1, weekly: 7, monthly: 30 };
    const days = daysMap[since];
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString().split('T')[0];

    const langQuery = language ? `+language:${language}` : '';
    const url = `${GITHUB_BASE}/search/repositories?q=created:>${dateStr}${langQuery}&sort=stars&order=desc&per_page=6`;

    try {
      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const data = await response.json();
      return data.items || [];
    } catch (err) {
      console.error('Failed to fetch trending repos:', err);
      return [];
    }
  },

  // Search repositories
  async searchRepos(query: string, perPage: number = 6): Promise<GithubRepo[]> {
    if (!query.trim()) return [];
    try {
      const response = await fetch(
        `${GITHUB_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const data = await response.json();
      return data.items || [];
    } catch (err) {
      console.error('Failed to search repos:', err);
      return [];
    }
  },

  // Get specific repo info
  async getRepo(owner: string, repo: string): Promise<GithubRepo | null> {
    try {
      const response = await fetch(`${GITHUB_BASE}/repos/${owner}/${repo}`, { headers: getHeaders() });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  // Format star count for display (1234 → 1.2k)
  formatStars(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return `${count}`;
  },
};
