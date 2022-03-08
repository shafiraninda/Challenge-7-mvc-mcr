const router = require("express").Router();
const isLoggedIn = require('../middleware/authMiddleware')
const verifyToken = require('../middleware/verifyToken')
const { 
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
 } = require("../controller/mvc_controller");
const {
    Register,
    login,
    CreateRoom,
    PlayGameRoom
} = require("../controller/mcr_controller")

// untuk render halaman home page
router.get("/", Main);

router.get("/home/:id", isLoggedIn, Home);
// untuk render halaman create portfolio
router.get("/signup", createUser);
// untuk post data ke database
router.post("/signup", createUserFunction);

router.get('/login', Login);

router.post('/login', loginFunction);

router.get('/play', isLoggedIn, Play);

router.get('/play/inputresult/:id', isLoggedIn, inputGameResult);

router.post('/play/inputresult/:id', isLoggedIn, inputGameResultFunction);

router.get("/dashboard", isLoggedIn, Dashboard);

router.post("/edit/:id", isLoggedIn, EditProfile);

router.post("/delete", DeleteUser);

router.post("/logout", Logout);

//superadmin route
router.get("/admin/signup", createSuperAdmin);
// untuk post data ke database
router.post("/admin/signup", createSuperAdminFunction);

router.get('/admin/login', loginAdmin);

router.post('/admin/login', loginAdminFunction);

router.get("/admin/dashboard", isLoggedIn, dashboardAdmin);

router.get("/admin/edit/:id", isLoggedIn, adminEditProfile);

router.post("/admin/edit/:id", isLoggedIn, adminEditProfileFunction);



//router mcr
router.post('/register', Register)
// untuk fungsi login
router.post('/login', login)
// untuk create room baru
// panggil verifyToken Middleware untuk verifikasi token
// dan juga agar controller create room bisa mengakses data user yang login
// lewat req.user
router.post('/room/create', verifyToken, CreateRoom)
// route untuk main game
router.post('/room/play', verifyToken, PlayGameRoom)

module.exports = router;
