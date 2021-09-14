const db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const passport = require("../config/passport");
const multer  = require('multer');
const validator = require('../validation');
const path = require('path');
const isAuthenticated = require("../config/middleware/isAuthenticated");
const fs = require('fs');

const storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, 'public/pictures')
    },
    filename: function (req, file, cb) {
        let datetimestamp = Date.now();
        cb(null, file.fieldname + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

const upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.bmp' && ext !== '.svg' && ext !== '.webp') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 4 * 1024 * 1024
    }
}).single('file');

function deleteItem(itemId, pictureFile, req, res) {
    db.Item.destroy({
        where: {
            id: itemId
        }
    }).then(function() {
        fs.unlinkSync('public/pictures/'+pictureFile);
        let cookie = req.cookies.recentlyViewed;
        if (cookie !== undefined) {
            let itemIdArray = cookie.split("|");
            console.log('does cookie includes delete id? '+itemIdArray.includes(itemId));
            if (itemIdArray.includes(itemId)) {
                let index = itemIdArray.indexOf(itemId);
                let newCookieIds = itemIdArray[0];
                if (index == 0) {
                    newCookieIds = itemIdArray[1] + '|' + itemIdArray[2] + '|' + itemIdArray[3];
                }
                else {
                    for (let i = 0; i < itemIdArray.length; i++) {
                        if (i !== index)
                        {
                            newCookieIds += '|' + itemIdArray[i];
                        }
                    }
                }
                res.cookie('recentlyViewed', newCookieIds, { maxAge: 60 * 60 * 1000, httpOnly: true });
            }
        } 
        res.json('Item deleted!');
    }).catch(function(err) {
        console.log(err);
        res.json(err);
    });
}

module.exports = function(app, csrfProtection) {
    app.post("/item", isAuthenticated, csrfProtection, function(req, res) {
        upload(req, res, function (err) {
            let errorList = [];
            if (err){
                console.log('error saving file ',JSON.stringify(err));
                errorList.push('Failed saving image due to invalid file extension');
                res.json(errorList);
            } 
            else if (req.user) {
                console.log(req.body);
                if (req.file) {
                    console.log('The filename is ' + res.req.file.filename);
                    let title = req.body.title;
                    let price = req.body.price;
                    let description = req.body.description;
                    let file = res.req.file.filename;
    
                    //validation
                    if (!title || !validator.checkTitle(title.trim())) {
                        errorList.push('Invalid title. ');
                    }
                    if (!price || !validator.checkPrice(price.trim())) {
                        errorList.push('Invalid price. ');
                    }
                    if (!description || validator.checkDescription(description.trim())) {
                        errorList.push('Invalid Description. ');
                    }
                    if (errorList.length>0) {
                        fs.unlinkSync(req.file.path); // delete the upload
                        res.json(errorList);
                    }
                    else {
                        db.Item.create({
                            user_id: req.user.id,
                            title: title[0].toUpperCase() + title.substring(1).trim(),
                            price: price.trim(),
                            description: description.trim(),
                            picture: file
                        }).then(function() {
                            res.json('Item Uploaded');
                        }).catch(function(err) {
                            console.log(err);
                            res.json(err);
                        });
                    }
                }
                else {
                    res.json('No file uploaded!');
                }
            }
        })
    });

    app.get("/items", function(req, res) {
        //console.log('get term query parameter ' + req.query.term.trim());
        let searchTermStatement;
        if (req.query.term && req.query.term.trim()!=='' && !validator.checkTerm(req.query.term.trim())) {
            searchTermStatement = {
                [Op.or]: [
                    Sequelize.where(Sequelize.fn('lower', Sequelize.col('title')), { [Op.substring]: req.query.term.toLowerCase().trim() }),
                    Sequelize.where(Sequelize.fn('lower', Sequelize.col('price')), { [Op.substring]: req.query.term.toLowerCase().trim() }),
                    Sequelize.where(Sequelize.fn('lower', Sequelize.col('description')), { [Op.substring]: req.query.term.toLowerCase().trim() }), 
                    Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), { [Op.substring]: req.query.term.toLowerCase().trim() }),
                ]
            }
        }
        let whereStatement;
        if (req.user) {
            whereStatement = {
                [Op.and]: [
                    Sequelize.literal("(NOT EXISTS (SELECT * FROM Pins WHERE user_id="+req.user.id+" AND item_id=`Item`.`id`))"),
                    //{ createdAt: {[Op.between]: [Date.now() - (60 * 60 * 1000), Date.now()]} },
                    searchTermStatement
                ]
            }
        }
        else {
            whereStatement = {
                [Op.and]: [                 
                    //{ createdAt: {[Op.between]: [Date.now() - (60 * 60 * 1000), Date.now()]} },
                    searchTermStatement
                ]
            }
        }
        db.Item.findAll({
            where: whereStatement,
            raw : true,
            include: [{
                model: db.User,
                required: true,
                attributes: []
            }],
            attributes: [
                "id",
                "user_id", 
                "title", 
                "price", 
                "description",
                "picture",
                [Sequelize.literal('User.email'), 'email'],
                [Sequelize.literal('User.name'), 'name']
            ]
        }).then((unPinnedItems) => {
            console.log('user unpinnedItem', unPinnedItems);
            res.json(unPinnedItems);
        }).catch((err) => {
            console.log(err);
            res.json('Error getting items!');
        });
    });

    app.post("/downvote", isAuthenticated, csrfProtection, function(req, res) {
        console.log('get id for downvote' + req.query.downvote.trim());
        let userId = req.user.id;
        let itemId = req.query.downvote.trim();
        db.Downvote.findOne({
            where: {
                [Op.and]: [
                    { user_id: userId },
                    { item_id: itemId }
                ]
            }
        }).then((downVotedItem) => {
            console.log('THE DOWNVOTED ITEM', downVotedItem);
            if (downVotedItem===null) {
                db.Downvote.count ({
                    where : { item_id: req.query.downvote.trim()}
                }).then((count)=> {
                    if (count>=4) {
                        db.Item.findOne({
                            where: {
                                id: itemId
                            }
                        }).then((item) => {
                            console.log('THE ITEM FOR DELETION', item);
                            let pictureFile = item.picture;
                            if (item!==null) {
                                deleteItem(itemId, pictureFile, req, res);
                            }
                            else {
                                res.json('Item does not exist! Delete Failed');
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.json('Error finding item for deletion');
                        });
                    }
                    else {
                        db.Downvote.create({
                            user_id: userId,
                            item_id: itemId
                        }).then(function() {
                            res.json('Downvoted!');
                        }).catch(function(err) {
                            console.log(err);
                            res.json(err);
                        });
                    }
                });
            }
            else {
                res.json('No downvoting more than once on same product!');
            }
        }).catch(function (err) {
            console.log(err);
            res.json('Error finding if item is already downvoted by user');
        });
    });

    app.delete("/item", isAuthenticated, csrfProtection, function(req, res) {
        console.log('id for deletetion ' + req.query.delete.trim());
        let userId = req.user.id;
        let itemId = req.query.delete.trim();
        db.Item.findOne({
            where: {
                [Op.and]: [
                    { user_id: userId },
                    { id: itemId }
                ]
            }
        }).then((item) => {
            console.log('THE ITEM FOR DELETION', item);
            let pictureFile = item.picture;
            if (item!==null && item.user_id===userId) {
                deleteItem(itemId, pictureFile, req, res);
            }
            else {
                res.json('Item does not exist or invalid deletion! Delete Failed');
            }
        }).catch(function (err) {
            console.log(err);
            res.json('Error finding item for deletion');
        });
    });

    app.get("/expire", function(req, res) { // delete items that are older than an hour and expire cookie
        db.Item.findAll({
            where: {
                createdAt: {
                    [Op.notBetween]: [Date.now() - (60 * 60 * 1000), Date.now()]
                }
            },
        }).then((items) => {
            console.log('THE ITEMS TO EXPIRE', items);
            if (items!==null) {
                let pictureFiles = [];
                let itemIdsForDeletion = [];
                items.forEach(function(item, index, object) {
                    console.log('created at '+item.createdAt);
                    pictureFiles.push(item.picture);
                    itemIdsForDeletion.push(item.id);
                });
                db.Item.destroy({
                    where: {
                        createdAt: {
                            [Op.notBetween]: [Date.now() - (60 * 60 * 1000), Date.now()]
                        }
                    },                   
                }).then(function() {
                    for (let i = 0; i < pictureFiles.length; i++) {
                        fs.unlinkSync('public/pictures/'+pictureFiles[i]);
                    }
                    res.clearCookie('recentlyViewed'); // expire cookie
                    res.json('Old Items Expired');
                }).catch(function(err) {
                    console.log(err);
                    res.json(err);
                });
            }
            else {
                res.json('Items do not exist! Expire Failed');
            }
        }).catch(function (err) {
            console.log(err);
            res.json('Error finding item for expiration');
        });
    });
};