const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const groupRoutes = require('./routes/groupRoutes');
const app = express();
app.use(session({
    secret: 'facebook-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(express.json({ limit: '10mb' }));
const PORT = 3000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.log('MongoDB connection error:', error);
    });
app.get('/file.html', (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/index.html');
    }

    next();

    app.get('/groups.html', (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/index.html');
    }

    next();
});

});
app.use(express.static(__dirname));

app.get('/test', (req, res) => {
    res.send('Server is working!');
});

app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', groupRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});