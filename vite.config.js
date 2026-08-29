import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(projectDir, 'data');
const stateFile = path.join(dataDir, 'app-state.json');
const previousStateFile = path.join(dataDir, 'app-state.previous.json');

async function readStateFile() {
  try {
    const content = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function stateCounts(payload) {
  const state = payload?.state || payload || {};
  return {
    workbooks: Array.isArray(state.workbooks) ? state.workbooks.length : 0,
    problems: Array.isArray(state.problems) ? state.problems.length : 0,
  };
}

function isEmptyState(payload) {
  const counts = stateCounts(payload);
  return counts.workbooks === 0 && counts.problems === 0;
}

async function writeStateFile(payload) {
  await fs.mkdir(dataDir, { recursive: true });
  const current = await readStateFile();
  if (current && !isEmptyState(current) && isEmptyState(payload)) {
    const counts = stateCounts(current);
    const message = `Refused to overwrite saved data with an empty state. Existing data: ${counts.workbooks} workbooks, ${counts.problems} problems.`;
    const error = new Error(message);
    error.statusCode = 409;
    throw error;
  }
  if (current) {
    try {
      await fs.writeFile(previousStateFile, JSON.stringify(current, null, 2), 'utf8');
    } catch (error) {
      console.warn(`Could not update previous backup: ${error.message}`);
    }
  }
  await fs.writeFile(stateFile, JSON.stringify(payload, null, 2), 'utf8');
}

function localStateApi() {
  return {
    name: 'mathfarm-local-state-api',
    configureServer(server) {
      server.middlewares.use('/api/state', async (req, res) => {
        try {
          if (req.method === 'GET') {
            const payload = await readStateFile();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(payload || null));
            return;
          }

          if (req.method === 'PUT') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                await writeStateFile(JSON.parse(body || 'null'));
                res.statusCode = 204;
                res.end();
              } catch (error) {
                res.statusCode = error.statusCode || 500;
                res.end(error.message);
              }
            });
            req.on('error', (error) => {
              res.statusCode = 500;
              res.end(error.message);
            });
            return;
          }

          res.statusCode = 405;
          res.end('Method Not Allowed');
        } catch (error) {
          res.statusCode = error.statusCode || 500;
          res.end(error.message);
        }
      });
    },
    configurePreviewServer(server) {
      this.configureServer(server);
    },
  };
}

export default defineConfig({
  plugins: [react(), localStateApi()],
  cacheDir: 'vite-cache-local',
});
