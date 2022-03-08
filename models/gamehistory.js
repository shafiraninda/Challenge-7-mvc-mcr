"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GameHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GameHistory.belongsTo(models.User, {
        foreignKey: 'user_uuid',
        as: 'user'
      })
    }
  }
  GameHistory.init(
    {
      uuid: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      win: {
        type: DataTypes.INTEGER(32),
        defaultValue: 0
      },
      draw: {
        type: DataTypes.INTEGER(32),
        defaultValue: 0
      },
      lose: {
        type: DataTypes.INTEGER(32),
        defaultValue: 0
      },
      user_uuid: {
        type: DataTypes.UUID,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: "GameHistory",
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      freezeTableName: true
    }
  );
  return GameHistory;
};
