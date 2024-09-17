const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');

const indexRouter = require('../routes');
const usersRouter = require('../routes/users');

const index = express();

// Enable CORS
index.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://akuma10901:tmwLYXtCwS5Iq4j3@dailyblogdata.s30xe0d.mongodb.net/?retryWrites=true&w=majority&appName=dailyBlogData')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });

// Mongoose models
const Job = require('../models/Job');
const File = require('../models/File');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware to parse JSON and URL-encoded data
index.use(express.json());
index.use(express.urlencoded({ extended: false }));

// Other middleware
index.use(logger('dev'));
index.use(cookieParser());
index.use(express.static(path.join(__dirname, '../public')));

// Routes
index.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

index.post('/jobs', async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is missing' });
        }

        const jobData = req.body;
        jobData.estimatedAmount = parseFloat(jobData.estimatedAmount);
        if (!jobData.receivedDate) {
            jobData.receivedDate = new Date();
        }
        if (!jobData.deadline) {
            jobData.deadline = null;
        }
        const newJob = new Job(jobData);
        await newJob.save();
        res.status(201).json(newJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

index.put('/jobs/:id', async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(updatedJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

index.delete('/jobs/:id', async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);
        if (!deletedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

index.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const newFile = new File({
            filePath: req.file.path,
            originalName: req.file.originalname
        });
        await newFile.save();
        res.json(newFile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// view engine setup
index.set('views', path.join(__dirname, '../views'));
index.set('view engine', 'pug');

index.use('/', indexRouter);
index.use('/users', usersRouter);

// catch 404 and forward to error handler
index.use(function (req, res, next) {
    next(createError(404));
});

// error handler
index.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
const PORT = process.env.PORT || 3000;

index.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = index;