require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Professional = require("./models/professional");

const app = express();
app.use(express.json());



const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.get("/api/professionals", async (req, res) => {
  try {
    const professionals = await Professional.find();
    res.status(200).json(professionals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

app.get("/api/professionals/:id", async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    if (professional === null) {
      return res.status(404).json({ message: "Professional not found" });
    }
    res.status(200).json(professional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

app.post("/api/professionals", async (req, res) => {
  try {
    const name = req.body.name;
    const category = req.body.category;

    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Name and category are required" });
    }


    const newProfessional = await Professional.create({ name, category });
    res.status(201).json(newProfessional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

app.put("/api/professionals/:id", async (req, res) => {
  try {
    const name = req.body.name;
    const category = req.body.category;

    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Name and category are required" });
    }

    const updatedProfessional = await Professional.findByIdAndUpdate(
      req.params.id,
      { name, category },
      { new: true, runValidators: true },
    );

    if (updatedProfessional === null) {
      return res.status(404).json({ message: "Professional not found" });
    }

    res.status(200).json(updatedProfessional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

app.delete("/api/professionals/:id", async (req, res) => {
  try {
    const deletedProfessional = await Professional.findByIdAndDelete(
      req.params.id,
    );

    if (deletedProfessional === null) {
      return res.status(404).json({ message: "Professional not found" });
    }

    res.status(200).json({ message: "Professional deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

const authController = require("./controller/authController");
app.post("/api/register", authController.register);
app.post("/api/login", authController.login);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
