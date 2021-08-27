const validator = require('validator');
const db = require("./models");
const Sequelize = require('sequelize');

exports.checkEmail = function(email) {
    return validator.isEmail(email);
}

exports.checkName = function(name) {
    return /^[a-z]([a-z]|\'|-)*([a-z]|\')$/i.test(name);
}

exports.checkPassword = function(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password);
}

exports.checkTitle = function(title) {
    return /^([a-z]|[0-9])([a-z]|[0-9]|\'|-| )*([a-z]|[0-9]|\')$/i.test(title);
}

exports.checkPrice = function(price) {
    return /^[0-9][0-9]*\.?[0-9]{0,2}$/i.test(price);
}

exports.checkDescription = function(description) {
    return /(?=.*[<>|])/.test(description);
}

exports.checkTerm = function(term) {
    return /(?=.*[<>|])/.test(term);
}

exports.isPinnedByUser = async function(itemId, userId) {
    let pinnedItem = await db.Pin.findOne({
        where: { 
            item_id: itemId,
            user_id: userId
        },
    }).catch(function (err) {
        return false;
    });
    if (pinnedItem!==null) {
        return true;
    }
    else {
        return false;
    }
}