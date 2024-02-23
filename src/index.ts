import express from "express";
import http from "node:http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose, { ConnectOptions } from "mongoose";
import router from "./router";

const PORT = 8000;
const MONGO_URL =
  "mongodb+srv://alyson:alyson@cluster0.qkjkyjp.mongodb.net/?retryWrites=true&w=majority";
const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const clientOptions: ConnectOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const run = async () => {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(MONGO_URL, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.log("Error to load the DB", error);
    await mongoose.disconnect();
  } finally {
    // Ensures that the client will close when you finish/error
  }
};
run().catch(console.dir);

const server = http.createServer(app);
server.listen(PORT);
server.on("listening", () => {
  console.log(`connection established on: ${PORT}`);
});

app.use("/api", router());
