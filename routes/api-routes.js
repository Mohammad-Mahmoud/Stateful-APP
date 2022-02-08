const db = require("../models");
const passport = require("../config/passport");
const bcrypt = require("bcryptjs")
cryptPassword = function(password, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        if (err)
            return callback(err);

        bcrypt.hash(password, salt, function(err, hash) {
            return callback(err, hash);
        });
    });
};

const comparePassword = (password, hash) => {
    let comp = bcrypt.compareSync(password, hash)
    return comp
}

module.exports = (app) =>{

    // login
    app.post("/api/login", passport.authenticate("local"), async (req, res) => {
       try {
           await res.send("Authenticated");

       } catch (err) {
           console.log(err)
       }
    });



    //sign up
    app.post("/api/signup", async (req, res) => {
       try {
           await db.User.create({
               email: req.body.email,
               password: req.body.password,
               name: req.body.name,
               mobile: req.body.mobile,
               country: req.body.country
           })
           res.send("Signed up");
       }
        catch(err) {
            console.log(err);
        };
    });

    // Route for logging user out
    app.get("/logout", async (req, res) => {
        await req.logout();
        res.send("Logged out");
    });
//
    // Route for getting some data about our user to be used client side
    app.get("/api/user_data", async (req, res) => {

        if (!req.user) {
            return res.json({});
        }
        else {

            try {
               await res.json({
                    email: req.user.email,
                    id: req.user.id,
                    name: req.user.name,
                    mobile: req.user.mobile,
                    country: req.user.country
                });
            } catch (err) {
               console.log(err)
            }
        }
    });

    // Delete a user
    app.delete("/api/delete/:id", async (req, res) => {
        if (!req.user) {
            return res.send("not logged")
        }
        else {
            try {
                await db.User.destroy({
                    where: {
                        id:req.params.id
                    }
                })
            } catch (err) {
                console.log(err);
            }
        }
    });

    // Update a user
    app.put("/api/update/:id", async (req, res) => {
        if (!req.user) {
            // The user is not logged in, send back an empty object
            return res.send("not logged")
        }
        else {
            try {
                await db.User.update({
                    name: req.body.name,
                    mobile: req.body.mobile,
                    country: req.body.country
                } ,{
                    where: {
                        id:req.params.id
                    }
                })
                res.send("Updated")
            } catch (err) {
                console.log(err);
            }
        }
    });

    // Change current password
    app.put("/api/update_password/:id", async (req, res) => {
        if (!req.user) {
            return res.send("not logged")
        }
        else {
            try {
                if(comparePassword(req.body.password,req.user.password) === false) {
                    return res.send("Wrong password")
                } else {
                    await cryptPassword(req.body.new_password, (err, hash) => {
                            db.User.update({
                            password: hash
                        } ,{
                            where: {
                                id:req.params.id
                            }
                        })
                        res.send("Password updated")
                    })
                }

            } catch (err) {
               console.log(err);
            }
        }
    });


};
