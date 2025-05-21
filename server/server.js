import express from 'express';
import webpush from 'web-push';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT ?? 6789;
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.fxtst7f.mongodb.net/?appName=Cluster0`;

// check if vapid keys are provided
if (!(process.env.VAPID_PRIVATE_KEY && process.env.VAPID_PUBLIC_KEY)) {
    const newVapidKeys = webpush.generateVAPIDKeys();
    console.error('no VAPID keys found in env, perhaps use these');
    console.error('public key', newVapidKeys.publicKey);
    console.error('private key', newVapidKeys.privateKey);
    process.exit()
}
webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
)

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

app.get('/api/applicationServerKey', (req, res) => {
    res.json({applicationServerKey: process.env.VAPID_PUBLIC_KEY})
})

app.post('/api/register', async (req, res) => {
    try {
        const subscription = req.body;

        const collection = client.db('application_database').collection('subscriptions')

        await collection.updateOne(
            { endpoint: subscription.endpoint },  // Use endpoint as a unique identifier
            { $set: subscription },
            { upsert: true }
        );

        res.status(201).json({ message: 'Subscription stored' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to store subscription' });
    }
})

app.get('/api/test-push', async (req, res) => {
    try {
        const collection = client.db('application_database').collection('subscriptions')

        const subscriptions = await collection.find().toArray();

        const notificationPayload = JSON.stringify({
            title: 'Test Notification',
            body: 'This is a test push message',
        });

        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                webpush.sendNotification(sub, notificationPayload)
            )
        );

        res.json({
            sent: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send test notifications' });
    }
});

app.delete('/api/unregister-all', async (req, res) => {
    try {
        const collection = client.db('application_database').collection('subscriptions');
        await collection.deleteMany({});
        res.status(200).json({ message: 'All subscriptions removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove subscriptions' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});