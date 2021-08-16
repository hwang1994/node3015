const Sequelize = require('sequelize');
const User = require("./user");

module.exports = function(sequelize, DataTypes) {
    var Item = sequelize.define("Item", {
  
        // user_id : {
        //      type: Sequelize.INTEGER,
        //     // allowNull: false,
        //     // references: {
        //     //     model: 'Users',
        //     //     key: 'id'
        //     // }
        //     associate : function(models) {
        //         Item.belongsTo(models.User)
        //     },
        // },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
  
    return Item;
};