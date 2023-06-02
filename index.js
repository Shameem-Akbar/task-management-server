const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dmqu4oo.mongodb.net/?retryWrites=true&w=majority`;

//middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("taskDB");
        const taskCollection = database.collection("task");

        //create task
        app.post("/tasks", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        })

        //get all data of tasks
        app.get("/tasks", async (req, res) => {
            const cursor = taskCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        //update task
        app.put('/update-task/:id', async (req, res) => {
            const updatedTask = req.body;
            console.log(updatedTask);
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: updatedTask.title,
                }
            }
            const result = await taskCollection.updateOne(filter, updateDoc, options)
            res.send(result);
        })

        //delete task
        app.delete('/delete-task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task Management Running');
})

app.listen(port, () => {
    console.log(`Task Management Running on Port ${port}`);
})