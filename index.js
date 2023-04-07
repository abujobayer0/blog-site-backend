import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
const PORT = 8000;

const app = express();
const Path = path.dirname(new URL(import.meta.url).pathname);
const updatedPath = Path.replace(/^\/([A-Z]:)/, "$1");
const __dirname = updatedPath;
//
mongoose
  .connect(
    "mongodb+srv://muna700064:yMWNEC5S5sJxUcRk@cluster0.bmyau3a.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

// Enable CORS for all routes
app.use(cors());

// Set up Multer for file uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpg");
  },
});

const upload = multer({ storage: storage });

// Define the schema for the Article model
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  article: {
    type: String,
    required: true,
  },
  image1: {
    type: String,
    required: true,
  },

  urls: {
    type: String,
    required: true,
  },
});
app.use(express.static(path.join(__dirname, "public")));
// Create the Article model using the schema
const Article = mongoose.model("Article", articleSchema);
app.use(express.static(__dirname + "/uploads"));
// API endpoint for creating a new article
app.post(
  "/articles",
  upload.fields([{ name: "image1", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, article, urls } = req.body;
      const image1 = req.files["image1"][0].filename;

      const newArticle = new Article({
        title,
        article,
        image1,
        urls,
      });
      await newArticle.save();
      res.status(201).json(newArticle);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// API endpoint for getting all articles
app.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find();
    const reversedArticles = articles.reverse();
    res.json(reversedArticles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this middleware to handle errors that are not caught by the above code
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server started successfully:${PORT}`);
});
