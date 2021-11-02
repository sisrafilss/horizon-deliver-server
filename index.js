const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewire
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.quv1r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB Run function
async function run() {
  try {
    await client.connect();

    const database = client.db("horizon");
    const serviceCollection = database.collection("services"); // All Services
    const blogsCollection = database.collection("blogs"); // All blogs data
    const ordersCollection = database.collection("orders"); // User orders with their detail

    // GET API (Services)
    app.get("/highlighted-services", async (req, res) => {
      const cursor = serviceCollection.find({});
      if (cursor) {
        const result = await cursor.toArray();
        res.json(result);
      }
    });

    // GET API (All Order)
    app.get("/manage-all-orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      if (cursor) {
        const result = await cursor.toArray();
        res.json(result);
      }
    });

    // GET API (Blogs)
    app.get("/latest-blogs", async (req, res) => {
      const cursor = blogsCollection.find({});
      if (cursor) {
        const result = await cursor.limit(3).toArray();
        res.json(result);
      }
    });

    // GET API (A service based on _id - for an order details)
    app.get("/placeOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.json(result);
    });

    // PATCH API - Update Order Status
    app.patch("/manage-all-orders/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: false };
      const updateDoc = { $set: status };

      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });

    // POST API (Add a new service by admin)
    app.post("/add-a-new-service", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.json(result);
    });

    // POST API (A service based on _id - for an order details)
    app.post("/my-orders", async (req, res) => {
      const userEmail = req.body.email;
      // // Finding Matched orders using user email
      const query = { email: userEmail };
      const cursor = ordersCollection.find(query);
      if (cursor) {
        const result = await cursor.toArray();
        res.json(result);
      }
    });

    //  POST API (Place an order by user)
    app.post("/placeOrder/:id", async (req, res) => {
      const userOrderInfo = req.body;
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const matchedService = await serviceCollection.findOne(query);

      userOrderInfo.status = "Pending";
      userOrderInfo.orderedService = matchedService;
      const result = await ordersCollection.insertOne(userOrderInfo);
      res.json(result);
    });

    // Delete API (delete an order by user)
    app.delete("/my-orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // Delete API (delete an order by ADMIN from all orders collection)
    app.delete("/manage-all-orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
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
