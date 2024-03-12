import jsonServer from "json-server";
import cors from "cors";
import { port } from "./Config";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(cors());
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
