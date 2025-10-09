import "dotenv/config";
import cors from "cors";
import express from "express";
import employeesRoutes from "./routes/employeesRoutes.js";


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/employees", employeesRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});