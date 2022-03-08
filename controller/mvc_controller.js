const { User, GameHistory } = require("../models");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// controller untuk render home page
const Main = (req, res) => {
  res.render('main', {
    pageTitle: "Main Page",
    addStyle:"null",
    user: null,
    username: null
  });
};

const Home = async (req, res) => {
  console.log(req.params.id)
  const dataUser = await User.findOne({
    where: {
      uuid: req.params.id
    }
  });
  console.log(dataUser)
  try {
    // const response = await axios.get(`http://localhost:3000/api/user/${req.params.username}`);
    res.render('main', {
        pageTitle: "Main Page",
        addStyle: null,
        datauser: dataUser
    })
  } catch (error) {
    console.error(error);
  }
};

// controller untuk render halaman create user atau signup
const createUser = (req, res) => {
  res.render('signup', {
    pageTitle: "Sign Up",
    addStyle:"/css/signupStyle.css"
  });
};

// untuk function create new user
const createUserFunction = async (req, res) => {
  const { username, email, password } = req.body;

  const newUser = await User.create({
    username,
    email,
    password: bcrypt.hashSync(req.body.password, 10)
  })
  GameHistory.create({
    user_uuid : newUser.uuid
  })
    .then((data) => {
      res.redirect("/");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/signup");
    });
};

const Login = (req, res) => {
  const {status}=req.query
  res.render('login', {
    pageTitle: "Login",
    addStyle:"/css/signupStyle.css",
    status
  });
};

const loginFunction = async (req, res) => {
    const { username , password }=req.body
    //const response = await axios.get(`http://localhost:3000/api/user/${username}`);
    const userMatch = await User.findOne({
      where: {
        username: username,
      },
    });
    console.log(userMatch)
    // const userMatch = response.data.data
    if(!userMatch){
            res.redirect('/login?status=usernotfound')
        }
    else{
        const matchPassword = bcrypt.compareSync(password.trim(), userMatch.password)
        if(matchPassword){
                const token = jwt.sign({
                username : userMatch.username,
                id: userMatch.uuid}, 'secret', {
                    expiresIn : 60 * 60 *24
                })
                res.cookie('jwt', token, { maxAge: 1000* 60 * 60 * 24})
                
                res.redirect(`/home/${userMatch.uuid}`) 
        }else {
            res.redirect('/login?status=wrongpassword')
        }
    }
};

const Play = async(req, res) => {
  if(!req.query.id){
    res.redirect('/login')
  }else{
    const player = await User.findOne({
      where: {
        uuid: req.query.id
      }
    })
    res.render('play', {
      pageTitle: "ROCK PAPER SCISSORS",
      username: player.username
    });
  }
};

const inputGameResult = async (req, res) => {
  
  const userHistory = await GameHistory.findOrCreate({
    where: 
      {user_uuid : req.params.id},
      defaults: {
        win:0,
        draw: 0,
        lose: 0
      }
  });
  console.log(userHistory)
  res.render('inputResult', {
    pageTitle: "Input Game Result",
    addStyle: null,
    userHistory : userHistory
  });
};

const inputGameResultFunction = async(req, res) => {
  const gameResultToUpdate = await GameHistory.findOne({
    where: {
      user_uuid: req.params.id
    }
  })
  const {win, draw, lose} = req.body
  gameResultToUpdate.update({
    win,
    draw,
    lose,
  })
    .then((data) => {
      res.redirect(`/dashboard?id=${req.params.id}`);
    })
    .catch((error) => {
      console.log(error);
      res.redirect(`/play/${req.params.id}/inputresult`);
    });
};


const Dashboard = async (req, res) => {
  if(!req.query.id){
    res.redirect('/login')
  }else{
    const users = await User.findAll();
    const userProfile = await User.findOne({
        where: {
          uuid: req.query.id
        },
    });
    const gameHistory = await GameHistory.findAll();
    

  res.render('dashboard', {
    pageTitle: "Dashboard",
    addStyle: null,
    data_players : users,
    datauser : userProfile,
    allUserGameHistory : gameHistory
  });
  }
};

const EditProfile = async (req, res) => {
    const userToUpdate = await User.findOne({
      where: {
        uuid: req.query.id
      }
    })
    userToUpdate.update({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    })
    .then((data) => {
      res.redirect(`/home/${req.query.id}`);
    })
    .catch((error) => {
      console.log(error);
      res.redirect(`/dashboard?id=${req.query.id}`);
    });
};

//untuk delete portfolio
const DeleteUser = async (req, res) => {
  try {
    await GameHistory.destroy({
      where: {
        user_uuid: req.query.id
      }
    });
    await User.destroy({
      where: {
        uuid: req.query.id
      },
      include: ['game_result']
    });
    
    const allhistory = await GameHistory.findAll()
    console.log(allhistory)
    // if (userToDelete.game_result.length > 0) {
    //     for (const gameResultToDelete of userToDelete.game_result) {
    //       await gameHistory.destroy({
    //         where: {
    //           user_uuid: userToDelete.uuid
    //         }
    //       })
    //       //fs.rmSync(__dirname + '/../public' + userToDelete.file_url)
    //     }
    // }
    const userToDelete = await User.findOne({
      where: {
        uuid: req.query.id
      }
    });
    const historyToDelete = await GameHistory.findOne({
      where: {
        user_uuid: req.query.id
      }
    })
    if (!userToDelete && !historyToDelete) {
      res.redirect('/')
    } else{
      res.redirect(`/dashboard?id=${req.query.id}`)
    }
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
      res.redirect('/')
    }
};

//superadmin

const createSuperAdmin = (req, res) => {
  res.render('signupAdmin', {
    pageTitle: "Sign Up Admin",
    addStyle:"/css/signupStyle.css"
  });
};

// untuk function create new user
const createSuperAdminFunction = async (req, res) => {
  const { username, email, role, password } = req.body;

  const newUser = await User.create({
    username,
    email,
    role: "ADMIN",
    password: bcrypt.hashSync(req.body.password, 10)
  })
  GameHistory.create({
    user_uuid : newUser.uuid
  })
    .then((data) => {
      res.redirect("/admin/login");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/admin/signup");
    });
};

const loginAdmin = (req, res) => {
  const {status}=req.query
  res.render('loginAdmin', {
    pageTitle: "Login Administrator",
    addStyle:"/css/signupStyle.css",
    status
  });
};

const loginAdminFunction = async (req, res) => {
    const { username , password }=req.body
    //const response = await axios.get(`http://localhost:3000/api/user/${username}`);
    const userMatch = await User.findOne({
      where: {
        username: username,
      },
    });
    console.log(userMatch)
    // const userMatch = response.data.data
    if(!userMatch){
            res.redirect('/admin/login?status=usernotfound')
        }
    else{
        const matchPassword = bcrypt.compareSync(password.trim(), userMatch.password)
        if(matchPassword){
                const token = jwt.sign({
                username : userMatch.username,
                id: userMatch.uuid}, 'secret', {
                    expiresIn : 60 * 60 *24
                })
                res.cookie('jwt', token, { maxAge: 1000* 60 * 60 * 24})
                
                res.redirect(`/admin/dashboard?id=${userMatch.uuid}`) 
        }else {
            res.redirect('/admin/login?status=wrongpassword')
        }
    }
};

const dashboardAdmin = async (req, res) => {
  if(!req.query.id){
    res.redirect('/login')
  }else{
    const users = await User.findAll();
    const userProfile = await User.findOne({
        where: {
          uuid: req.query.id
        },
    });
    const gameHistory = await GameHistory.findAll();
    

  res.render('dashboardAdmin', {
    pageTitle: "Dashboard Admin",
    addStyle: null,
    data_players : users,
    datauser : userProfile,
    allUserGameHistory : gameHistory
  });
  }
};

const adminEditProfile = async (req, res) => {
  const userProfile = await User.findOne({
    where: {
      uuid: req.query.id
    },
});
  res.render('editAdmin', {
    pageTitle: "Admin Edit Data",
    addStyle: null,
    datauser : userProfile
  });
};

const adminEditProfileFunction = async (req, res) => {
  const userToUpdate = await User.findOne({
    where: {
      uuid: req.query.id
    }
  })
  userToUpdate.update({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  })
  .then((data) => {
    res.redirect(`/admin/dashboard/${req.query.id}`);
  })
  .catch((error) => {
    console.log(error);
    res.redirect(`/admin/edit/${user}`);
  });
};


const Logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 5000 })
  res.redirect('/')
}

// const createMessage = async(req, res) => {
//   const { name, email, phone, message } = req.body;
//   try {
//     const newMessage = await Message.create({
//       name,
//       email,
//       phone,
//       message,
//     })
  
//       if (newMessage) {
//         res.redirect("/?status=messagesentsuccessfully");
//       }
//     } catch (error) {
//       console.log('====================================');
//       console.log(error);
//       console.log('====================================');
//       res.redirect("/?status=messagesentfailed");
//     }
  
//     .then((message_data) => {
//       res.redirect("/?status=messagesentsuccessfully");
//     })
//     .catch((error) => {
//       console.log(error);
//       res.redirect("/?status=messagesentfailed");
//     });
// };

module.exports = {
  Main,
  Home,
  createUser,
  createUserFunction,
  Login,
  loginFunction,
  Play,
  inputGameResult,
  inputGameResultFunction,
  Dashboard,
  EditProfile,
  DeleteUser,
  Logout,
  createSuperAdmin,
  createSuperAdminFunction,
  loginAdmin,
  loginAdminFunction,
  dashboardAdmin,
  adminEditProfile,
  adminEditProfileFunction
};
