import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const root = path.resolve(__dirname, 'public');

app.use(cors());

app.get('/name', (req, res) => {
  res.send("World");
});

app.use(express.static(root));
app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
