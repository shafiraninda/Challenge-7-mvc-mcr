'use strict';
const database = require("mime-db");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      // define association here
      User.hasMany(models.GameHistory, {
        foreignKey: 'user_uuid',
        as: 'game_result'
      })
      User.hasMany(models.Room, {
        foreignKey: 'owned_by',
        as: 'room'
      })

      User.hasMany(models.Room, {
        foreignKey: 'player_1_uuid',
        as: 'room_player_1_uuid'
      })

      User.hasMany(models.Room, {
        foreignKey: 'player_2_uuid',
        as: 'room_player_2_uuid'
      })

      User.hasMany(models.Room, {
        foreignKey: 'winner_uuid',
        as: 'winner_room'
      })

      User.hasMany(models.Room, {
        foreignKey: 'loser_uuid',
        as: 'loser_room'
      })

     }
  }
  User.init({
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Username Is Already Used'
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: "Email Sudah Digunakan"
      }
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'PLAYER'),
      allowNull: false,
      defaultValue: 'PLAYER'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'User',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    freezeTableName: true
  });

  // hooks untuk ubah email jadi huruf kecil sebelum dibuat
  User.beforeCreate((user) => {
    user.email = user.email.toLowerCase()
  })
  User.beforeUpdate(() => {
    user.email = user.email.toLowerCase()
  })
  return User;
};