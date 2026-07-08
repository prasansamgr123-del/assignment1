// Load environment variables from the .env file into process.env.
// This must run FIRST, before we try to read process.env.MONGO_URI below.
// Keeping the connection string in .env (not in code) keeps secrets out of git.
require("dotenv").config();

// Import the Express library — a framework that makes building web servers easy.
const express = require("express");
// Import Mongoose — the library that lets us talk to MongoDB using JavaScript objects.
const mongoose = require("mongoose");
// Import our Professional model. This replaces the old in-memory array;
// now our data lives in the database and we read/write it through this model.
const Professional = require("./models/professional");

// Create an Express application instance. `app` is our server.
const app = express();

// Middleware: automatically parse incoming JSON request bodies so we can read req.body.
app.use(express.json());

// ---- CONNECT TO THE DATABASE ----
// mongoose.connect() opens a connection to MongoDB using the URL from our .env file.
// It returns a Promise, so we use .then() (success) and .catch() (failure) to react.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// NOTE: Talking to a database takes time (it happens over the network), so every
// database call returns a Promise. We use `async` on the route function and `await`
// in front of each database call to "wait" for the result before continuing.
// Anything that can fail (bad query, database down) is wrapped in try/catch.

// ---- READ ALL ----
app.get("/api/professionals", async (req, res) => {
  try {
    // Professional.find() with no filter returns ALL documents in the collection.
    const professionals = await Professional.find();
    res.status(200).json(professionals);
  } catch (error) {
    // Log the real error to the terminal so YOU can debug it...
    console.error(error);
    // ...but send the client a simple, safe message with 500 (server error).
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ---- READ ONE (by id) ----
// Heads up: ids are different now. Before, ids were numbers (1, 2, 3). MongoDB gives
// every document a unique "_id" that looks like "665f1c...e2a" (a 24-character string).
// So the URL is /api/professionals/665f1c...e2a, not /api/professionals/1.
app.get("/api/professionals/:id", async (req, res) => {
  try {
    // findById() looks up a single document by its _id.
    const professional = await Professional.findById(req.params.id);
    // If nothing matched, findById returns null — so that id doesn't exist.
    if (professional === null) {
      return res.status(404).json({ message: "Professional not found" });
    }
    res.status(200).json(professional);
  } catch (error) {
    // If you pass an id that isn't a valid ObjectId shape (e.g. the old "1"),
    // Mongoose throws here and we land in catch → 500. That's a simplification;
    // a real app would validate the id and return 404/400 instead.
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ---- CREATE ----
app.post("/api/professionals", async (req, res) => {
  try {
    // Read the values the client sent in the request body.
    const name = req.body.name;
    const category = req.body.category;

    // Validation: reject the request if either field is missing or empty.
    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Name and category are required" });
    }

    // Professional.create() builds a new document AND saves it to the database.
    // Notice we no longer set an id ourselves — MongoDB generates the _id for us.
    const newProfessional = await Professional.create({ name, category });
    // 201 = Created. Send back the saved document (now including its new _id).
    res.status(201).json(newProfessional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ---- UPDATE ----
app.put("/api/professionals/:id", async (req, res) => {
  try {
    const name = req.body.name;
    const category = req.body.category;

    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Name and category are required" });
    }

    // findByIdAndUpdate() finds the document by _id and applies the changes.
    // Arg 1: which document (the _id from the URL).
    // Arg 2: what to change (the new field values).
    // Arg 3: options — { new: true } tells Mongoose to return the UPDATED document.
    //        Without it, you'd get the OLD version back, which is confusing.
    //        { runValidators: true } tells Mongoose to enforce the schema rules on the update.
    const updatedProfessional = await Professional.findByIdAndUpdate(
      req.params.id,
      { name, category },
      { new: true, runValidators: true },
    );

    // If no document had that _id, we get null back → 404 Not Found.
    if (updatedProfessional === null) {
      return res.status(404).json({ message: "Professional not found" });
    }

    res.status(200).json(updatedProfessional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ---- DELETE ----
app.delete("/api/professionals/:id", async (req, res) => {
  try {
    // findByIdAndDelete() removes the matching document and returns it.
    const deletedProfessional = await Professional.findByIdAndDelete(
      req.params.id,
    );

    // If nothing was found to delete, it returns null → 404 Not Found.
    if (deletedProfessional === null) {
      return res.status(404).json({ message: "Professional not found" });
    }

    res.status(200).json({ message: "Professional deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// The port number our server will listen on.
const PORT = 3000;
// Start the server and keep it running. The callback runs once the server is ready.
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
