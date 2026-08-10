import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.json({
      stdout: '',
      stderr: 'No code provided',
      exitCode: 1,
    });
  }

  const encoded = Buffer.from(code).toString('base64');

  exec(
    `node -e "eval(Buffer.from('${encoded}','base64').toString())"`,
    { timeout: 5000 },
    (error, stdout, stderr) => {
      res.json({
        stdout: stdout || '',
        stderr: stderr || error?.message || '',
        exitCode: error ? 1 : 0,
      });
    }
  );
});

app.listen(3001, () => {
  console.log('🚀 Code execution server running on http://localhost:3001');
});