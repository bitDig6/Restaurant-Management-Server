require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());


const uri =  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jpi5bfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("bistroResturant");
    const menuCollection = database.collection("menus");
    const reviewCollection = database.collection("reviews");
    const cartCollection = database.collection("carts");
    const userCollection = database.collection("users");

    //users related apis



    //get all users
    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    //add a new user to db
    app.post('/users', async(req, res) => {
      const user = req.body;
      //insert email if user doesn't exist
      //techniques: 
      //email field unique (mongoose, index)
      //upsert
      //simple checking

      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);

      if(existingUser){
        return res.send({ message: 'user already exists', insertedId: null});
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    //make an user admin
    app.patch('/users/admin/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    //delete a user
    app.delete('/users/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    //menu related apis

    //get all stored menus
    //get filtered menus if query is included in the request
    app.get('/menus', async(req, res) => {
        const category = req.query?.category;

        let query = {};

        if(category){
            query = {
            category: category
        }
        };

        const result = await menuCollection.find(query).toArray();
        res.send(result);
    })

    // get all reviews
    app.get('/reviews', async(req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    //get cart items of the logged in user, we don't want cart data of all user
    app.get('/carts', async(req, res) => {
      const email = req.query.email;
      const query = {
        userEmail: email
      };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })

    //add each users' cart
    app.post('/carts', async(req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })

    //delete item from cart
    app.delete('/carts/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Bistro Boss Server');
})

app.listen(port, (req, res) => {
    console.log('Server Started at Port: ', port);
})
