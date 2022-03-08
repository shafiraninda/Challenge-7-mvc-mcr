'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // hubungan antara user dan room sebagai yang buat room
      Room.belongsTo(models.User, {
        foreignKey: 'owned_by',
        as: 'owner'
      })
      // hubungan antara user dan room sebagai player 1
      Room.belongsTo(models.User, {
        foreignKey: 'player_1_uuid',
        as: 'player_1'
      })
      // hubungan antara user dan room sebagai player 2
      Room.belongsTo(models.User, {
        foreignKey: 'player_2_uuid',
        as: 'player_2'
      })
      // hubungan antara user dan room sebagai pemenang di dalam room
      Room.belongsTo(models.User, {
        foreignKey: 'winner_uuid',
        as: 'winner'
      })
      // hubungan antara user dan room sebagai yang kalah di dalam room
      Room.belongsTo(models.User, {
        foreignKey: 'loser_uuid',
        as: 'loser'
      })
    }
  }
  Room.init({
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    room_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Room Name Is Already Used'
      }
    },
    owned_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    player_1_choices: {
      type: DataTypes.ARRAY(DataTypes.ENUM('ROCK', 'PAPER', 'SCISSOR')),
    },
    player_1_uuid: {
      type: DataTypes.UUID,
    },
    player_2_choices: {
      type: DataTypes.ARRAY(DataTypes.ENUM('ROCK', 'PAPER', 'SCISSOR')),
    },
    player_2_uuid: {
      type: DataTypes.UUID,
    },
    winner_uuid: {
      type: DataTypes.UUID,
    },
    loser_uuid: {
      type: DataTypes.UUID,
    },
    draw: {
      type: DataTypes.BOOLEAN
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Room',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    freezeTableName: true
  });

  Room.beforeCreate((room) => {
    room.room_name = room.room_name.toLowerCase()
  })

  Room.beforeUpdate((room) => {
    room.room_name = room.room_name.toLowerCase()
  })
  return Room;
};