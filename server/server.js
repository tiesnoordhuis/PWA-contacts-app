import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT ?? 6789;

app.use(cors());
app.use(express.json());

app.use(express.static('../public'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});