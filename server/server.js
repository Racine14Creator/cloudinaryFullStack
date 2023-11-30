require("dotenv").config()
const express = require('express'),
    mongoose = require('mongoose');
const multer = require('multer'),
    filUpload = require("express-fileupload");
const { v2: cloudinary } = require('cloudinary');

const app = express();
const PORT = process.env.PORT || 3001,
    MONGO = process.env.MONGO;

app.use(filUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 2024 * 1024 }
}))


// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/apiFile", async (req, res) => {
    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `img-${Date.now()}`,
        resource_type: "auto",
        folder: "images"
    })
    res.json(result)
})

// Route to handle image upload
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'));
        // Handle result (e.g., store public_id in a database)
        res.json({ imageUrl: result.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const Server = async () => {
    mongoose.connect(MONGO)
        .then(_ => {
            console.log("Connected to mongodb")
            app.listen(PORT, (err) => {
                if (err) throw err
                console.log(`Server run on Port: localhost:${PORT}`);
            })
        })
        .catch(err => console.log(err))
}

Server()
