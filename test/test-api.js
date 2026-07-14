/**
 * Simple API test script for the Professionals CRUD API.
 *
 * This is NOT a unit-test framework — it's a plain Node script that calls the
 * real running server the same way Postman or a frontend would, then checks the
 * responses. Great for learning what each endpoint actually returns.
 *
 * HOW TO RUN:
 *   1. Start the server in one terminal:   npm run dev   (or: npm start)
 *   2. Run this script in another terminal: node test-api.js
 *
 * Requires Node 18+ (for the built-in `fetch`). No extra packages needed.
 */

// Where the server is running. Override with: BASE_URL=http://... node test-api.js
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API = `${BASE_URL}/api/professionals`;

// --- Tiny test helpers -----------------------------------------------------

let passed = 0;
let failed = 0;

// check(label, condition) — records and prints a single assertion result.
function check(label, condition) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    failed++;
    console.log(`  \x1b[31m✗ ${label}\x1b[0m`);
  }
}

// request(method, path, body) — sends a JSON request and returns { status, data }.
async function request(method, path = "", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Some responses (or errors) may not be JSON — guard against that.
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, data };
}

// --- The tests -------------------------------------------------------------

async function run() {
  console.log(`\nTesting API at ${API}\n`);

  let createdId; // we'll remember the id of the professional we create

  // 1. CREATE — a valid professional should return 201 and the new document.
  console.log("POST /api/professionals (valid)");
  {
    const { status, data } = await request("POST", "", {
      name: "Ada Lovelace",
      category: "Developer",
    });
    check("returns 201 Created", status === 201);
    check("response has an _id", Boolean(data && data._id));
    check("name is saved correctly", data && data.name === "Ada Lovelace");
    check("category is saved correctly", data && data.category === "Developer");
    createdId = data && data._id;
  }

  // 2. CREATE — missing fields should be rejected with 400.
  console.log("\nPOST /api/professionals (missing fields)");
  {
    const { status } = await request("POST", "", { name: "No Category" });
    check("returns 400 Bad Request", status === 400);
  }

  // 3. READ ALL — should return 200 and an array containing our new record.
  console.log("\nGET /api/professionals");
  {
    const { status, data } = await request("GET");
    check("returns 200 OK", status === 200);
    check("response is an array", Array.isArray(data));
    check(
      "array includes the created professional",
      Array.isArray(data) && data.some((p) => p._id === createdId),
    );
  }

  // 4. READ ONE — fetching by the id we created should return that document.
  console.log("\nGET /api/professionals/:id");
  {
    const { status, data } = await request("GET", `/${createdId}`);
    check("returns 200 OK", status === 200);
    check("returns the matching document", data && data._id === createdId);
  }

  // 5. READ ONE — a valid-looking but non-existent id should return 404.
  console.log("\nGET /api/professionals/:id (not found)");
  {
    const fakeId = "000000000000000000000000"; // valid ObjectId format, no match
    const { status } = await request("GET", `/${fakeId}`);
    check("returns 404 Not Found", status === 404);
  }

  // 6. UPDATE — changing a field should return 200 and the updated document.
  console.log("\nPUT /api/professionals/:id");
  {
    const { status, data } = await request("PUT", `/${createdId}`, {
      name: "Ada Lovelace",
      category: "Manager",
    });
    check("returns 200 OK", status === 200);
    check("category was updated", data && data.category === "Manager");
  }

  // 7. DELETE — removing our record should return 200.
  console.log("\nDELETE /api/professionals/:id");
  {
    const { status } = await request("DELETE", `/${createdId}`);
    check("returns 200 OK", status === 200);
  }

  // 8. DELETE confirmation — the record should now be gone (404).
  console.log("\nGET /api/professionals/:id (after delete)");
  {
    const { status } = await request("GET", `/${createdId}`);
    check("returns 404 Not Found", status === 404);
  }

  // --- Summary -------------------------------------------------------------
  console.log(`\n${"-".repeat(40)}`);
  console.log(`Passed: ${passed}   Failed: ${failed}`);
  console.log(`${"-".repeat(40)}\n`);

  // Exit with code 1 if anything failed (useful for CI / npm scripts).
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error("\nCould not run tests. Is the server running?");
  console.error(error.message);
  process.exit(1);
});
