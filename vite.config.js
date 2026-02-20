import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function resolveBasePath() {
  const customBase = process.env.VITE_BASE_PATH;
  if (customBase) {
    return customBase.endsWith('/') ? customBase : `${customBase}/`;
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    return '/';
  }

  const repoName = repository.split('/')[1];
  if (!repoName || repoName.endsWith('.github.io')) {
    return '/';
  }

  return `/${repoName}/`;
}

export default defineConfig({
  plugins: [react()],
  base: resolveBasePath(),
});
