const db = require("../models");
const passport = require("../config/passport");
const bcrypt = require("bcrypt-nodejs");
const multer  = require('multer');
const upload = multer();
const validator = require('../validation');

module.exports = function(app) {
    app.post("/login", upload.none(), passport.authenticate("local"), function(req, res) {
        res.json(["Logged In!"]);
    });

    app.post("/signup", upload.none(), function(req, res) {
        console.log(req.body);
        let firstName = req.body.firstname;
        let lastName = req.body.lastname;
        let email = req.body.email;
        let password = req.body.password;
        let verifyPassword = req.body.verify_password;
        let errorList = [];

        //validation
        if (firstName=='' || !validator.checkName(firstName.trim())) {
            errorList.push('Invalid first name. ');
        }
        if (lastName=='' || !validator.checkName(lastName.trim())) {
            errorList.push('Invalid first name. ');
        }
        if (!validator.checkEmail(email)) {
            errorList.push('Invalid Email. ');
        }
        if (password!='' && password==verifyPassword) {
            if (!validator.checkPassword(password)) {
            errorList.push('Invalid password. ');
            }
        }
        else {
            errorList.push('Invalid password or verify password does not match. ');
        }
        if (errorList.length>0) {
            res.json(errorList);
        }
        else {
            db.User.create({
                name: firstName[0].toUpperCase() + firstName.substring(1).trim() + ' ' + lastName[0].toUpperCase() + lastName.substring(1).trim(),
                email: req.body.email,
                password: bcrypt.hashSync(password)
            }).then(function() {
                passport.authenticate('local')(req, res, function () {
                    res.json(['Signed Up!']);
                })
            }).catch(function(err) {
                console.log(err);
                res.json(err);
            });
        }
    });

    app.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    });

    app.get("/islogin", function(req, res) {
        if (!req.user) {
            res.json(['Not logged in']);
        }
        else {
            res.json({
                email: req.user.email,
                status: true
            });
        }
    });
};