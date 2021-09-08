const db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const passport = require("../config/passport");
const validator = require('../validation');
const isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app, csrfProtection) {
    app.get("/pins", isAuthenticated, function(req, res) {
        console.log('get term query parameter for pinned' + req.query.term.trim());
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
        db.Pin.findAll({
            where: {
                [Op.and]: [
                    { user_id: req.user.id },                    
                    //{ createdAt: {[Op.between]: [Date.now() - (60 * 60 * 1000), Date.now()]} },
                    searchTermStatement
                ]
            },
            raw : true,
            include: [{
                model: db.Item,
                required: true,
                attributes: [],
                include: [{
                model: db.User,
                required: true,
                attributes: []
                }]
            }],
            attributes: [
                [Sequelize.literal('Item.id'), 'id'],
                [Sequelize.literal('Item.title'), 'title'],
                [Sequelize.literal('Item.price'), 'price'],
                [Sequelize.literal('Item.description'), 'description'],
                [Sequelize.literal('Item.picture'), 'picture'],
                [Sequelize.literal('`Item->User`.email'), 'email'],
                [Sequelize.literal('`Item->User`.name'), 'name']
            ]
        }).then((pinnedItems) => {
            console.log('pinned items', pinnedItems);
            res.json(pinnedItems);
        }).catch(function (err) {
            console.log(err);
            res.json('Error getting items!');
        });
    });

    app.post("/pin", isAuthenticated, csrfProtection, function(req, res) {
        console.log('get id for pinning' + req.query.pin.trim());
        let userId = req.user.id;
        let itemId = req.query.pin.trim();
        db.Pin.findOne({
            where: {
                [Op.and]: [
                    { user_id: userId },
                    { item_id: itemId }
                ]
            }
        }).then((pinnedItem) => {
            console.log('THE PINNED ITEM', pinnedItem);
            if (pinnedItem===null) {
                db.Pin.create({
                    user_id: userId,
                    item_id: itemId
                }).then(function() {
                    res.json('Item Pinned');
                }).catch(function(err) {
                    console.log(err);
                    res.json(err);
                });
            }
            else {
                res.json('Item already pinned by user');
            }
        }).catch(function (err) {
            console.log(err);
            res.json('Error finding if item is already pinned by user');
        });
    });

    app.delete("/pin", isAuthenticated, csrfProtection, function(req, res) {
        console.log('id for unpinning' + req.query.unpin.trim());
        let userId = req.user.id;
        let itemId = req.query.unpin.trim();
        db.Pin.findOne({
            where: {
                [Op.and]: [
                    { user_id: userId },
                    { item_id: itemId }
                ]
            }
        }).then((pinnedItem) => {
            console.log('THE PINNED ITEM', pinnedItem);
            console.log('THE USER WHO PINNED THE ITEM', pinnedItem.user_id);
            if (pinnedItem!==null && pinnedItem.user_id===userId) {
                db.Pin.destroy({
                    where: {
                        [Op.and]: [
                            { user_id: userId },
                            { item_id: itemId }
                        ]
                    }
                }).then(function() {
                    res.json('Item unPinned');
                }).catch(function(err) {
                    console.log(err);
                    res.json(err);
                });
            }
            else {
                res.json('Pinned Item does not exist! unpin Failed');
            }
        }).catch(function (err) {
            console.log(err);
            res.json('Error finding if item pinned by user');
        });
    });
};