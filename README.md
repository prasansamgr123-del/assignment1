# Professionals API — A Beginner's Express.js Demo

A small REST API built with [Express.js](https://expressjs.com/) that manages a
list of professionals. This project is meant for **learning** — it shows the four
basic operations of almost every backend app, often called **CRUD**:

| CRUD word  | What it means | HTTP method used here |
| ---------- | ------------- | --------------------- |
| **C**reate | Add new data  | `POST`                |
| **R**ead   | Get data      | `GET`                 |
| **U**pdate | Change data   | _(not in this demo)_  |
| **D**elete | Remove data   | `DELETE`              |

---

## What is this app?

A **web server** that stores a list of professionals (name + category) and lets a
client (a browser, mobile app, or a tool like Postman) view, add, and remove them
by sending HTTP requests.

The data lives in memory (a plain JavaScript array in
[`data/professional.js`](data/professional.js)), so **any changes are lost when the
server restarts**. There is no database — that keeps the focus on how the API works.

---

## Project structure

```
demo1/
├── server.js              # The web server and all the API routes
├── data/
│   └── professional.js    # The list of professionals (our "database")
├── package.json           # Project info and dependencies
└── README.md              # This file
```

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the server

```bash
npm run dev     # auto-restarts when you save a file (uses nodemon)
# or
npm start       # runs once with plain node
```

You should see:

```
Server live on port 3000
```

The server is now running at **http://localhost:3000**.

---

## The API endpoints

An **endpoint** is a URL + HTTP method the server knows how to respond to.
Base URL: `http://localhost:3000`

### 1. Get all professionals

```
GET /api/professionals
```

Returns the full list.

**Response — `200 OK`**

```json
[
  { "id": 1, "name": "Aaryan Bhusal", "category": "Engineer" },
  { "id": 2, "name": "Aayush Shrestha", "category": "Doctor" }
]
```

### 2. Get one professional by id

```
GET /api/professionals/:id
```

The `:id` is a **route parameter** — you replace it with a real id, e.g.
`/api/professionals/2`.

**Response — `200 OK`**

```json
{ "id": 2, "name": "Aayush Shrestha", "category": "Doctor" }
```

**If the id doesn't exist — `404 Not Found`**

```json
{ "message": "Professional not found" }
```

### 3. Add a new professional

```
POST /api/professionals
```

Send the new data as JSON in the **request body**:

```json
{ "name": "Jane Doe", "category": "Engineer" }
```

**Response — `201 Created`**

```json
{ "id": 32, "name": "Jane Doe", "category": "Engineer" }
```

**If `name` or `category` is missing — `400 Bad Request`**

```json
{ "message": "Name and category are required" }
```

### 4. Delete a professional

```
DELETE /api/professionals/:id
```

Example: `DELETE /api/professionals/2`

**Response — `200 OK`**

```json
{ "message": "Professional deleted successfully" }
```

**If the id doesn't exist — `404 Not Found`**

```json
{ "message": "Professional not found" }
```

---

## Try it out

Once the server is running, open a **second terminal** and use `curl`:

```bash
# Get everyone
curl http://localhost:3000/api/professionals

# Get one person
curl http://localhost:3000/api/professionals/2

# Add a new person
curl -X POST http://localhost:3000/api/professionals \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Doe", "category": "Engineer" }'

# Delete a person
curl -X DELETE http://localhost:3000/api/professionals/2
```

> Tip: You can also use a GUI tool like **Postman** or the **Thunder Client**
> VS Code extension instead of `curl`.

---

## Key concepts to understand

- **Express** — a framework that makes it simple to define routes and send responses.
- **Middleware** — `app.use(express.json())` runs on every request; here it reads the
  JSON body so we can access it via `req.body`.
- **`req` (request)** — information _coming in_ from the client (URL params, body, etc.).
- **`res` (response)** — what we _send back_ to the client.
- **Route parameter (`:id`)** — a dynamic value inside the URL. It always arrives as a
  **string**, which is why we call `parseInt()` before comparing it to numeric ids.
- **HTTP status codes** — a number that tells the client what happened:
  - `200 OK` — success
  - `201 Created` — a new resource was created
  - `400 Bad Request` — the client sent invalid/incomplete data
  - `404 Not Found` — the requested item doesn't exist
- **Array methods used**
  - `.find()` — returns the first matching item, or `undefined`.
  - `.findIndex()` — returns the position of the first match, or `-1`.
  - `.push()` — adds an item to the end of the array.
  - `.splice(index, 1)` — removes 1 item at the given position.

---

## Ideas to extend this (practice exercises)

- Add an **update** route (`PUT /api/professionals/:id`) to complete the CRUD set.
- Replace the length-based id with a safer unique id (deleting then adding can create
  duplicate ids — can you see why?).
- Add filtering, e.g. `GET /api/professionals?category=Doctor`.
- Connect a real database (like SQLite or MongoDB) so data survives restarts. (We will do this in next workshop)
