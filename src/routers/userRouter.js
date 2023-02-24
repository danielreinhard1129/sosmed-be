const { userController } = require('../controllers'); // di ambil dari index.js controller
const route = require('express').Router();
const { readToken } = require('../helper/jwt');
const { checkUser } = require('../helper/validator');
const uploader = require('../helper/uploader');



route.post('/auth', checkUser, userController.login);
route.post('/register', checkUser, userController.register); // check user dari file validator.js di helper
route.patch('/verify', readToken, userController.verify);
route.get('/keeplogin', readToken, userController.keepLogin);
route.post('/forgot', userController.forget); 
route.patch('/newpassword', readToken, userController.newpassword);
route.get('/getalluser', userController.getalluser);
route.post('/getdatauser', userController.getdatauser); 
route.patch('/profilepicture', readToken, uploader('/imgProfile', 'PRF').array('images', 1), userController.updatePhotoProfile); // array('images, 1) = images = property yg menampung, 1 = jumlah max file yg bisa di upload
route.patch('/banner', readToken, uploader('/imgBanner', 'BNR').array('images', 1), userController.updateBanner); // array('images, 1) = images = property yg menampung, 1 = jumlah max file yg bisa di upload

module.exports = route;