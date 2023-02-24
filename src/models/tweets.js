'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tweets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tweets.init({
    userId: DataTypes.INTEGER,
    tweet: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tweets',
  });

  tweets.associate = (models) => {
    tweets.belongsTo(models.users, { foreignKey: 'userId'});
    tweets.hasMany(models.likes, { foreignKey: 'tweetId'});
  }
  return tweets;
};