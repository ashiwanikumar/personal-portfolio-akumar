// ** APP ** //
const app = require("./app");

// ** LIBS ** //
const mongoose = require("mongoose");
const http = require("http");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

// Port
const PORT = process.env.API_PORT;
const useCluster =
  process.env.NODE_ENV === "production" && process.env.ENABLE_CLUSTER === "true";

if (!PORT) {
  throw new Error("API_PORT NOT SET!");
}

// Check for auth MongoDB URI
if (!process.env.ATLAS_URI) {
  throw new Error("MONGO URI NOT SET!");
}

// db
mongoose
  .connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`DB connection error - ${err}`));

let server;
function startServer() {
  server = http.createServer(app);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Server
if (useCluster && cluster.isMaster) {
  console.log(`Number of CPUs is ${numCPUs}`);
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ WORKER_ID: i });
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  startServer();
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed");
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  }
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed");
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  }
});
