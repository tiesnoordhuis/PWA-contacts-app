import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT ?? 6789;
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.fxtst7f.mongodb.net/?appName=Cluster0`;

app.use(cors());
app.use(express.json());

app.use(express.static('../public'));

const client = new MongoClient(uri);
await client.connect()

app.get('/api/profile', async (req, res) => {
    const collection = client.db('application_database').collection('profile');
    const profiles = await collection.find({}).toArray();
    res.json(profiles);
});

app.post('/api/profile', async (req, res) => {
    const collection = client.db('application_database').collection('profile');
    const newProfile = req.body;
    const result = await collection.insertOne(newProfile);
    res.status(201).json(result);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});