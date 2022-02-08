const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const passport = require("./config/passport");
const db = require("./models");
const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({secret: "blablablabla", resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

require("./routes/api-routes.js")(app);

db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("Listening on %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    });
});
