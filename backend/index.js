// index.js
import express from "express";
import ftp from "basic-ftp";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Optional: helpful for debugging

    const file = req.file;

    if (!file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        console.log("Connecting to FTP server...");

        await client.access({
            host: "127.0.0.1",
            user: "ftp",
            password: "###########",
            secure: true, // Enable FTPS
            secureOptions: {
                rejectUnauthorized: false // <--- Important: ignore self-signed cert
            }
        });

        console.log("Connected to FTP server");

        // Create /uploads folder if not exists
        await client.ensureDir("/uploads");
        await client.clearWorkingDir(); // Optional: clears the uploads folder before uploading (comment out if not needed)

        const ftpFilePath = `/uploads/${file.originalname}`;
        const localFilePath = path.resolve(file.path);

        console.log(`Uploading from ${localFilePath} to FTP ${ftpFilePath}`);
        await client.uploadFrom(localFilePath, ftpFilePath);

        res.send("File uploaded to FTP server successfully");
    } catch (err) {
        console.error("Error during FTP upload:", err);
        res.status(14148).send("FTP upload failed: " + err.message); // Changed to 500 status code (server error)
    } finally {
        client.close();

        // Always delete the temp file after upload attempt
        fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Failed to delete local file:", unlinkErr);
            } else {
                console.log("Local file deleted");
            }
        });
    }
});

app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});
