import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import milestoneSuggestionsRouter from './routes/milestoneSuggestions.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/milestone-suggestions', milestoneSuggestionsRouter);

app.listen(port, () => {
  console.log(`Kindling server listening on port ${port}`);
});

export { app };
