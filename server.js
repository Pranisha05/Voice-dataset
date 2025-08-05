const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() }); // ← store in memory first

app.post(
  "/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "consentAudio", maxCount: 1 },
  ]),
  (req, res) => {
    const recording = req.files.audio[0];
    const consent = req.files.consentAudio[0];
    const { age, province, district, gender } = req.body;

    if (
      !req.files ||
      !req.files?.audio?.[0] ||
      !req.files?.consentAudio?.[0] ||
      !age ||
      !province ||
      !district ||
      !gender
    ) {
      return res.status(400).send("Missing fields");
    }

    //  Create folder uploads/ProvinceName if not exists
    const folderPath = path.join(__dirname, "uploads", province, district);
    fs.mkdirSync(folderPath, { recursive: true });

    //  Create consent folder uploads/consents if not exists
    const consentfolderPath = path.join(
      __dirname,
      "uploads",
      "consents",
      province,
      district
    );
    fs.mkdirSync(consentfolderPath, { recursive: true });

    //  Create unique filename
    const filename =
      Date.now() + "-" + Math.floor(Math.random() * 1e6) + ".wav";
    const filePath = path.join(folderPath, filename);

    //  Create consent filename [consent-<filename>]
    const consentfilename = "consent-" + filename;
    const consentfilePath = path.join(consentfolderPath, consentfilename);

    //  Write audio file manually
    fs.writeFileSync(filePath, recording.buffer); // ← save audio file
    fs.writeFileSync(consentfilePath, consent.buffer); // ← save consent audio file

    //  Save metadata
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
      consentfilename,
      age,
      gender,
      province,
      district,
      timestamp: new Date().toISOString(),
    };

    metadata.push(newEntry);
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

    res.sendStatus(200);
  }
);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
