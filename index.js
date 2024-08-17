const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());



// const uri = `mongodb://localhost:27017`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2xcjib6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("ZenMarket").collection("products");

    /*****************Start*****************************/
    // Get all product data from db
    app.get(`/products`, async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get all products data from db for pagination 
    app.get("/all-products", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const filter = req.query.filter;
      const brand = req.query.brand;
      const sort = req.query.sort;
      const search = req.query.search;
      const price = req.query.price;
      const sort_newest = req.query.sort_newest;

      // console.log(size, page);

      let query = {
        name: { $regex: search, $options: "i" },
      };

      if (filter) query.category = filter;
      

      // Handle price range filtering
      if (price) {
        const [minPrice, maxPrice] = price.split("-").map(Number);
        query.price = { $gte: minPrice, $lte: maxPrice };
      }

      // Handle sorting by price high to low and low to high
      let options = {};
      if (sort) options.sort = { price: sort === "asc" ? 1 : -1 };

      // Handle sorting by newest product first show
      if (sort_newest) {
        options.sort = { createdAt: sort_newest === "dsc" ? -1 : 1 };
      }

      const result = await productCollection
        .find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray();

      res.send(result);
    });

    /*******************end***************************** */

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ZenMarket Server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
