const express = require("express");
const generateNews = require("./routes/generateNews");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send({
    message: "This is the team Space_Invaders",
  });
});

app.get("/api/news", async (req, res) => {
  try {
    const news = await generateNews();
    res.status(200).json(news);
  } catch (error) {
    console.error(`Error fetching news: ${error}`);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
