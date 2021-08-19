const db = require("../models");
const Sequelize = require('sequelize');

module.exports = function(app) {
    app.get("/getitem", function(req, res) {
        console.log('get id for delete' + req.query.id.trim());
        let itemId = req.query.id.trim();
        db.Item.findOne({
            where: {
                id: itemId
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
        }).then((item) => {
            console.log('THE PRODUCT', item);
            if (item!==null) {
                var cookie = req.cookies.recentlyViewed;
                if (cookie === undefined) {
                    // no: set a new cookie
                    res.cookie('recentlyViewed', itemId, { maxAge: 60 * 60 * 1000, httpOnly: true });
                    console.log('cookie created successfully');
                } 
                else {
                    let itemIdArray = cookie.split("|");
                    console.log(itemIdArray.includes(itemId));
                    if (!itemIdArray.includes(itemId) && itemIdArray.length<4) {
                        let itemIds = itemId;
                        for (let i = 0; i < itemIdArray.length; i++) {
                            itemIds +='|'+itemIdArray[i];
                        }
                        res.cookie('recentlyViewed', itemIds, { maxAge: 60 * 60 * 1000, httpOnly: true });
                    }
                    else if (!itemIdArray.includes(itemId) && itemIdArray.length>=4) {
                        let itemIds = itemId + '|'+ itemIdArray[0]+ '|'+ itemIdArray[1]+ '|'+ itemIdArray[2];
                        res.cookie('recentlyViewed', itemIds, { maxAge: 60 * 60 * 1000, httpOnly: true });
                    }
                    console.log('the cookie', cookie);
                }
                res.json(item);
            }
            else {
                res.json('Product does not exist!');
            }
        }).catch(function (err) {
            console.log(err);
            res.json('Error finding Product');
        });
    });
};