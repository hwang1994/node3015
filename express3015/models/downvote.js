const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var Downvote = sequelize.define("Downvote", {
  
        // user_id : {
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: 'Users',
        //         key: 'id'
        //     }
        // },
        // item_id: {
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: 'Items',
        //         key: 'id'
        //     }
        // }
    });
  
    return Downvote;
};