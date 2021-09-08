const db = require("../models");
const Sequelize = require('sequelize');

module.exports = function(app) {
    app.get("/recentlyviewed", function(req, res) {
        let cookie = req.cookies.recentlyViewed;
        if (cookie !== undefined) {
            let itemIdArray = cookie.split("|");
            db.Item.findAll({
                where: {
                    id: itemIdArray
                },
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
            }).then((items) => {
                items.sort(function(a, b) {
                    if (a.name===b.name && a.price===b.price) {
                        return 0;
                    }
                    else if (a.name===b.name && a.price<b.price) {
                        return 1;
                    }
                    else if (a.name===b.name && a.price>b.price) {
                        return -1;
                    }
                    else {
                        return a.name.localeCompare(b.name);
                    }
                });
                console.log('recently viewed items', items);
                res.json(items);
            }).catch((err) => {
                console.log(err);
                res.json('Error getting recently viewed items!');
            }); 
        } 
        else {
            res.json([]);
        }
    });
};