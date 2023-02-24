'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    imgprofile: DataTypes.STRING,
    role: DataTypes.STRING,
    statusId: DataTypes.INTEGER,
    attempt: DataTypes.INTEGER,
    imgbanner: DataTypes.STRING,
    bio: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'users',
  });

  users.associate = (models) => {
    users.belongsTo(models.status, { foreignKey: 'statusId'});
    users.hasMany(models.tweets, { foreignKey: 'userId'});
    users.hasMany(models.likes, { foreignKey: 'userId'});
  }
  
  return users;
};