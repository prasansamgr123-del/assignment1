const express = require('express');
const app = express();
app.use(express.json());

const professionals = require('./Data/professionals');

app.get('/api/professionals', (req, res) => {
  return res.status(200).json(professionals);
});

app.get('/api/professionals/:id', (req, res) => {
  const id = req.params.id;
  const idInNumber = parseInt(id);
  const foundProfessional = professionals.find(
    (professional) => professional.id == idInNumber,
  );
  return res.status(200).json(foundProfessional);
});

app.put('/api/professionals/:id', (req, res) => {
  const id = req.params.id;
  const idInNumber = parseInt(id);
  const foundProfessional = professionals.find(
    (professional) => professional.id == idInNumber,
  );

  if (!foundProfessional) {
    return res.status(404).json({ message: "Professional not found" });
  }

  const { name, category } = req.body;

  if (name !== undefined) {
    foundProfessional.name = name;
  }
  if (category !== undefined) {
    foundProfessional.category = category;
  }

  return res.status(200).json(foundProfessional);
});

app.post("/api/professionals", (req, res) => {
  const name = req.body.name;
  const category = req.body.category;

  if (name === undefined || category === undefined) {
    return res.status(400).json({ message: "Name and category are required" });
  }

  const newProfessional = {
    id: professionals.length + 1,
    name: name,
    category: category,
  };

  professionals.push(newProfessional);
  return res.status(201).json(newProfessional);
});

app.delete("/api/professionals/:id", (req, res) => {
  const id = req.params.id;
  const idInNumber = parseInt(id);
  const index = professionals.findIndex((p) => p.id === idInNumber);

  if (index === -1) {
    return res.status(404).json({ message: "Professional not found" });
  }

  professionals.splice(index, 1);
  return res.status(200).json({ message: "Professional deleted successfully" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
