// Import the Express library — a framework that makes building web servers easy.
const express = require("express");
// Import our data — an array of professional objects from the ./data/professional file.
const professionals = require("./data/professional");

// Create an Express application instance. `app` is our server.
const app = express();

// Middleware: this tells Express to automatically parse incoming JSON request bodies,
// so we can read data sent by the client via req.body.
app.use(express.json());

// ---- READ ALL ----
// Handle GET requests to "/api/professionals" — returns the whole list.
app.get("/api/professionals", (req, res) => {
  // res.status(200) sets the HTTP status code (200 = OK).
  // .json(...) sends the data back to the client as JSON.
  res.status(200).json(professionals);
});

// ---- READ ONE (by id) ----
// The ":id" part is a route parameter — a placeholder for a value in the URL,
// e.g. GET /api/professionals/2  ->  id = "2".
app.get("/api/professionals/:id", (req, res) => {
  // Route parameters always arrive as strings, so read it first...
  const id = req.params.id;
  // ...then convert it to a number so we can compare it with the numeric ids in our data.
  const idInNumber = parseInt(id);
  // .find() loops through the array and returns the FIRST item that matches the condition.
  const foundProfessional = professionals.find(
    (professional) => professional.id === idInNumber,
  );
  // If .find() found nothing, it returns undefined — so no professional with that id exists.
  if (foundProfessional === undefined) {
    // 404 = Not Found. Send an error message and stop here with `return`.
    return res.status(404).json({ message: "Professional not found" });
  }
  // Otherwise, send back the matching professional with status 200 (OK).
  res.status(200).json(foundProfessional);
});

// ---- CREATE ----
// Handle POST requests — used to add a new professional. The new data comes in req.body.
app.post("/api/professionals", (req, res) => {
  // Read the values the client sent in the request body.
  const name = req.body.name;
  const category = req.body.category;

  // Validation: if either field is missing, reject the request.
  if (name === undefined || category === undefined) {
    // 400 = Bad Request (the client sent invalid/incomplete data).
    return res.status(400).json({ message: "Name and category are required" });
  }
  // Build the new professional object. We generate a simple id from the array length.
  const newProfessional = {
    id: professionals.length + 1,
    name: name,
    category: category,
  };
  // .push() adds the new object to the end of our array.
  professionals.push(newProfessional);
  // 201 = Created. Send back the newly created item so the client can see the result.
  res.status(201).json(newProfessional);
});

// ---- UPDATE ----
// Handle PUT requests — used to update an existing professional identified by its id.
app.put("/api/professionals/:id", (req, res) => {
  // Read the id from the URL and convert it to a number (same pattern as GET-by-id).
  const id = req.params.id;
  const idInNumber = parseInt(id);
  // Find the professional we want to update. .find() returns the object itself,
  // so changing it here also changes it inside the array (objects are shared by reference).
  const foundProfessional = professionals.find(
    (professional) => professional.id === idInNumber,
  );

  // If no professional has that id, .find() returns undefined — respond with 404 Not Found.
  if (foundProfessional === undefined) {
    return res.status(404).json({ message: "Professional not found" });
  }

  // Read the new values the client sent in the request body.
  const name = req.body.name;
  const category = req.body.category;

  // Validation: both fields are required for a full update (that's what PUT means).
  // !name is true for any "falsy" value — undefined, null, empty string "" — so this
  // also rejects blank inputs, not just missing ones.
  if (!name || !category) {
    // 400 = Bad Request (the client sent invalid/incomplete data).
    return res.status(400).json({ message: "Name and category are required" });
  }

  // Overwrite the old values with the new ones. This mutates the object in the array.
  foundProfessional.name = name;
  foundProfessional.category = category;
  // Send back the updated professional with status 200 (OK).
  res.status(200).json(foundProfessional);
});

// ---- DELETE ----
// Handle DELETE requests to remove a professional by id.
app.delete("/api/professionals/:id", (req, res) => {
  // Read the id from the URL and convert it to a number (same pattern as GET-by-id).
  const id = req.params.id;
  const idInNumber = parseInt(id);
  // .findIndex() returns the POSITION (index) of the first match, or -1 if none is found.
  const index = professionals.findIndex((p) => p.id === idInNumber);

  // If no match was found, index is -1 — respond with 404 Not Found.
  if (index === -1) {
    return res.status(404).json({ message: "Professional not found" });
  }

  // .splice(index, 1) removes 1 item starting at that index — this deletes it from the array.
  professionals.splice(index, 1);
  // Confirm success to the client.
  res.status(200).json({ message: "Professional deleted successfully" });
});

// The port number our server will listen on.
const PORT = 3000;
// Start the server and keep it running. The callback runs once the server is ready.
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
