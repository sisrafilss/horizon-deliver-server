const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middlewire
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.quv1r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        
        const database = client.db('services');
        const serviceCollection = database.collection('service');

        // GET API (Services)
        app.get('/services', async (req, res) => {

            const cursor = serviceCollection.find({});
            if(cursor) {
                const result = await cursor.toArray();
                console.log(result);
                res.json(result);
            }
        });

        // POST API (add Service)
        app.post('/services', async(req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            console.log(result);
            res.json(result);

        });

        // Delete API
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(query);
            res.json(result);
        })

        // console.log(result);
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Horizon Server Running.");
});

app.listen(port, () => {
  console.log("Server has started at port:", port);
});
