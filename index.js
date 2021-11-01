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
        
        const database = client.db('horizon');
        const serviceCollection = database.collection('services');
        const blogsCollection = database.collection('blogs');

        // GET API (Services)
        app.get('/highlighted-services', async (req, res) => {
            const cursor = serviceCollection.find({});
            if(cursor) {
                const result = await cursor.limit(6).toArray();
                res.json(result);
            }
        });

        // GET API (Blogs)
        app.get('/latest-blogs', async (req, res) => {
          const cursor = blogsCollection.find({});
          if(cursor) {
              const result = await cursor.limit(3).toArray();
              res.json(result);
          }
      });

        // POST API (add Service)
        // app.post('/services', async(req, res) => {
        //     const service = req.body;
        //     const result = await serviceCollection.insertOne(service);
        //     console.log(result);
        //     res.json(result);

        // });

        // Delete API
        // app.delete('/services/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) }
        //     const result = await serviceCollection.deleteOne(query);
        //     res.json(result);
        // })

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
