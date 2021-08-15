const db = require("./models");

const setAssociations = function() {
    db.User.hasMany(db.Item, {onDelete: 'cascade', foreignKey: {allowNull: false, sourceKey: 'id', name: 'user_id'}});
    db.Item.belongsTo(db.User, { foreignKey:  { allowNull: false, name: 'user_id', targetKey: 'id'} });

    db.User.hasMany(db.Pin, {onDelete: 'cascade', foreignKey: {allowNull: false, sourceKey: 'id', name: 'user_id'}});
    db.Item.hasMany(db.Pin, {onDelete: 'cascade', foreignKey: {allowNull: false, sourceKey: 'id', name: 'item_id'}});
    db.Pin.belongsTo(db.User, { foreignKey:  { allowNull: false, name: 'user_id', targetKey: 'id'} });
    db.Pin.belongsTo(db.Item, { foreignKey:  { allowNull: false, name: 'item_id', targetKey: 'id'} });

    db.User.hasMany(db.Downvote, {onDelete: 'cascade', foreignKey: {allowNull: false, sourceKey: 'id', name: 'user_id'}});
    db.Item.hasMany(db.Downvote, {onDelete: 'cascade', foreignKey: {allowNull: false, sourceKey: 'id', name: 'item_id'}});
    db.Downvote.belongsTo(db.User, { foreignKey:  { allowNull: false, name: 'user_id', targetKey: 'id'} });
    db.Downvote.belongsTo(db.Item, { foreignKey:  { allowNull: false, name: 'item_id', targetKey: 'id'} });
}

module.exports = setAssociations;