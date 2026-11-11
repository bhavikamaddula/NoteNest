
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/notenest")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const Note = mongoose.model("Note", {
  title: String,
  subject: String,
  content: String
});

const PDF = mongoose.model("PDF", {
  name: String,
  filename: String
});

const upload = multer({
  dest: path.join(__dirname, "uploads/"),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf")
      cb(null, true);
    else
      cb(new Error("Only PDF files allowed"));
  }
});

// Get Notes
app.get("/notes", async (req, res) => {
  res.json(await Note.find());
});

// Add Note
app.post("/notes", async (req, res) => {
  res.json(await Note.create(req.body));
});

// Delete Note
app.delete("/notes/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Note deleted" });
});

// Upload PDF
app.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file)
    return res.status(400).send("Select a PDF file");

  const pdf = await PDF.create({
    name: req.file.originalname,
    filename: req.file.filename
  });

  res.json(pdf);
});

// Get PDFs
app.get("/pdfs", async (req, res) => {
  res.json(await PDF.find());
});

// View PDF
app.get("/pdfs/:id/view", async (req, res) => {
  const pdf = await PDF.findById(req.params.id);

  if (!pdf) return res.status(404).send("PDF not found");

  res.type("application/pdf");
  res.sendFile(path.join(__dirname, "uploads", pdf.filename));
});

// Download PDF
app.get("/pdfs/:id/download", async (req, res) => {
  const pdf = await PDF.findById(req.params.id);

  if (!pdf) return res.status(404).send("PDF not found");

  res.download(
    path.join(__dirname, "uploads", pdf.filename),
    pdf.name
  );
});

// Delete PDF
app.delete("/pdfs/:id", async (req, res) => {
  const pdf = await PDF.findById(req.params.id);

  if (!pdf) return res.status(404).send("PDF not found");

  await fs.promises.unlink(
    path.join(__dirname, "uploads", pdf.filename)
  ).catch(() => {});

  await PDF.findByIdAndDelete(req.params.id);

  res.json({ message: "PDF deleted successfully" });
});

app.listen(5000, () => {
  console.log("Server running on 5000");
});
