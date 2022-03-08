const { User, User_History, Room } = require('../models')
const { Op } = require('sequelize')
const fs = require('fs')
const bcrypt = require('bcrypt')
const errorHandler = require('../utils/error')
const jwt = require('jsonwebtoken')

// controller untuk halaman home page

const Register = async (req, res, next) => {
  try {
    // check apakah password dan confirm passwordnya sama
    if (req.body.password1 !== req.body.password2) {
      return errorHandler(400, "Password yang anda masukkan tidak cocok", res)
    } else {
      // hash password user
      const hashedPassword = await bcrypt.hash(req.body.password1, 10)
      // create new user

      const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        role: req.body.role,
        password: hashedPassword
      })
      // create user history after user created
      await GameHistory.create({
        user_uuid: newUser.uuid
      })

      res.json({
        message: "User Created SuccessFully"
      })

    }
  } catch (error) {
    console.log('=============REGISTER==================');
    console.log(error);
    console.log('=============REGISTER==================');
    return errorHandler(500, error.message, res)
  }

}

const login = async (req, res, next) => {
  try {
    if (!req.body.email) {
      return errorHandler(400, "Please Insert Email", res)
    }
    // check user dengan email yang sama yang di input oleh user
    const user = await User.findOne({
      where: {
        // kasih kondisi email yang sudah dikecilin hurufnya
        email: req.body.email.toLowerCase()
      }
    }) 
    // kalau tidak ada yang sama kasih pesan error
    if (!user) {
      return errorHandler(404, "Email Not Found", res)
    }
    // check password yang di db dengan yang di input
    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
    // kalau password salah kasih error
    if (!passwordIsValid) {
      return errorHandler(400, "Incorrect Password", res)
    }
    // kunci data user menggunakan jwt
    let token = jwt.sign(
      {
        user_id: user.uuid,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400 // 24 jam
      }
    )

    res.status(200).json({
      message: `You are logged in as ${user.name}`,
      role: user.role,
      token: token
    })
  } catch (error) {
    console.log('=============LOGIN==================');
    console.log(error);
    console.log('=============LOGIN==================');
    return errorHandler(500, error.message, res)
  }
}

const CreateRoom = async (req, res, next) => {
  try {
    const roomName = req.body.room_name
    const user = req.user

    if (!roomName) {
      return errorHandler(400, "Please Input Room Name", res)
    }

    const newRoom = await Room.create({
      room_name: roomName,
      owned_by: user.user_id
    })

    res.status(201).json({
      status: "SUCCESS",
      message: "New Room Created",
      room_name: newRoom.room_name
    })

  } catch (error) {
    console.log('=============CREATEROOM==================');
    console.log(error);
    console.log('=============CREATEROOM==================');
    return errorHandler(500, error.message, res)
  }
}

const PlayGameRoom = async (req, res, next) => {
  try {
    const playerChoices = req.body.choices
    const room = req.body.room_name

    if (!playerChoices) {
      return errorHandler(400, "Please Input Your Choice", res)
    }
    // check choices dari user bentuk datanya array atau bukan
    if (!Array.isArray(playerChoices)) {
      return errorHandler(400, "Please Input Your Choice In Array", res)
    }
    // user harus milih 3 rock paper scissor dalam satu array
    if (playerChoices.length != 3) {
      return errorHandler(400, "Please Input 3 Choice", res)
    }
    // kalau room nya gak di input error
    if (!room) {
      return errorHandler(400, 'Please Insert Room Name', res)
    }

    const foundRoom = await Room.findOne({
      where: {
        room_name: room.toLowerCase()
      }
    })

    if (!foundRoom) {
      return errorHandler(404, "ROOM NOT FOUND", res)
    } else {
      // kalau player 1 slot nya masih kosong
      // maka player yang posting rps duluan jadi player 1 
      if (!foundRoom.player_1_uuid) {
        await foundRoom.update({
          player_1_choices: playerChoices,
          player_1_uuid: req.user.user_id
        })
      } else if (!foundRoom.player_2_uuid) {
        // karena player 1 udah diisi jadi player sekarang jadi player
        await foundRoom.update({
          player_2_choices: playerChoices,
          player_2_uuid: req.user.user_id
        })
      } else {
        return errorHandler(400, 'Room is already full', res)
      }
    }

    // check apakah seluruh player sudah milih rps
    if (foundRoom.player_1_choices && foundRoom.player_2_choices) {

      // user history
      const user1History = await GameHistory.findOne({
        where: {
          user_uuid: foundRoom.player_1_uuid
        }
      })
      const user2History = await GameHistory.findOne({
        where: {
          user_uuid: foundRoom.player_2_uuid
        }
      })
      // score awal player
      let player1Score = 0
      let player2Score = 0

      for (const index in foundRoom.player_1_choices) {
        // pilihan player 1 pada saat looping ke n
        const player1Choice = foundRoom.player_1_choices[index]
        const player2Choice = foundRoom.player_2_choices[index]

        // concat / gabungkan string dari pilihan kedua player contoh ROCKROCK, PAPERSCISSOR
        const playersChoice = `${player1Choice}${player2Choice}`

        switch (playersChoice) {
          case "ROCKROCK":
            player1Score += 1
            player2Score += 1
            break;
          case "ROCKPAPER":
            player2Score += 1
            break;
          case "ROCKSCISSOR":
            player1Score += 1
            break;
          case "PAPERROCK":
            player1Score += 1
            break;
          case "PAPERPAPER":
            player1Score += 1
            player2Score += 1
            break;
          case "PAPERSCISSOR":
            player2Score += 1
            break;
          case "SCISSORROCK":
            player2Score += 1
            break;
          case "SCISSORPAPER":
            player1Score += 1
            break;
          case "SCISSORSCISSOR":
            player1Score += 1
            player2Score += 1
            break;
          default:
            break;
        }
      }

      // check kondisi kemenangan berdasarkan score
      if (player1Score > player2Score) {
        // player 1 win
        // update history player satu tambah nilai win nya 1
        await user1History.update({
          win: Number(user1History.win) + 1
        })
        // update history player 2 tambah nilai lose nya 1
        await user2History.update({
          lose: Number(user2History.lose) + 1
        })
        // update hasil pertandingan ke room 
        await foundRoom.update({
          winner_uuid: foundRoom.player_1_uuid,
          loser_uuid: foundRoom.player_2_uuid,
          draw: false
        })
        res.status(200).json({
          message: "PLAYER 1 WIN"
        })
      } else if (player2Score > player1Score) {
        await user1History.update({
          lose: Number(user1History.lose) + 1
        })
        await user2History.update({
          win: Number(user2History.win) + 1
        })
        await foundRoom.update({
          winner_uuid: foundRoom.player_2_uuid,
          loser_uuid: foundRoom.player_1_uuid,
          draw: false
        })
        res.status(200).json({
          message: "PLAYER 2 WIN"
        })
      } else {
        await user1History.update({
          draw: Number(user1History.draw) + 1
        })
        await user2History.update({
          draw: Number(user2History.draw) + 1
        })
        await foundRoom.update({
          draw: true
        })
        res.status(200).json({
          message: "DRAW"
        })
      }
      // jika hanya baru satu player yang milih
    } else {
      res.status(200).json({
        message: "Your Choices Recorded, Wait For Player 2 To Choose"
      })
    }

  } catch (error) {
    console.log('=============CREATEROOM==================');
    console.log(error);
    console.log('=============CREATEROOM==================');
    return errorHandler(500, error.message, res)
  }
}


module.exports = {
  Register,
  login,
  CreateRoom,
  PlayGameRoom
}