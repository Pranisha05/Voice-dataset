const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() }); // ← store in memory first

app.post("/upload", upload.single("audio"), (req, res) => {
  const { age, province, district } = req.body;

  if (!req.file || !age || !province || !district) {
    return res.status(400).send("Missing fields");
  }

  // ✅ Create folder uploads/ProvinceName if not exists
  const folderPath = path.join(__dirname, "uploads", province, district);
  fs.mkdirSync(folderPath, { recursive: true });

  // ✅ Create unique filename
  const filename = Date.now() + "-" + Math.floor(Math.random() * 1e6) + ".wav";
  const filePath = path.join(folderPath, filename);

  // ✅ Write audio file manually
  fs.writeFileSync(filePath, req.file.buffer);

  // ✅ Save metadata
  const metadataFile = "metadata.json";
  let metadata = [];

  try {
    if (fs.existsSync(metadataFile)) {
      const data = fs.readFileSync(metadataFile, "utf8");
      metadata = JSON.parse(data || "[]");
    }
  } catch (err) {
    console.error("Error reading metadata:", err);
  }

  const newCount = metadata.length + 1;

  const newEntry = {
    count: newCount,
    filename,
    age,
    province,
    district,
    timestamp: new Date().toISOString(),
  };

  metadata.push(newEntry);
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
