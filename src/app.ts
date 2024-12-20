import express from 'express';
import { getLogLines } from '../src/controllers/logController';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:3001', // Allow specific origin (React app)
  })
);

app.get('/logs', getLogLines);

app.listen(PORT, () => {
  console.log(`Log monitoring service running on http://localhost:${PORT}`);
});
