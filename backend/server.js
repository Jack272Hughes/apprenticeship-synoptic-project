const app = require("express")();
const upload = require("multer")();
const cors = require("cors");

app.use(upload.array());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);

app.get("/quizes", (req, res) => {
  res.end();
});

app.listen(8080);
