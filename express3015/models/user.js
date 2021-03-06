var bcrypt = require("bcrypt-nodejs");

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  return User;
};