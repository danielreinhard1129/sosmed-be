const model = require('../models');
const sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const { createToken } = require('../helper/jwt');
const transporter = require('../helper/nodemailer');
const hbs = require('nodemailer-express-handlebars');
const fs = require('fs')
let salt = bcrypt.genSaltSync(10);

module.exports = {
    register: async (req, res, next) => {

        try {
            let checkUser = await model.users.findAll({
                where: {
                    [sequelize.Op.or]: [
                        { email: req.body.email },
                        { username: req.body.username }
                    ]
                }
            })
            console.log("check user exist", checkUser);
            if (checkUser.length == 0) {
                if (req.body.password == req.body.confirmpassword) {
                    delete req.body.confirmpassword;
                    console.log("check data before create", req.body);

                    req.body.password = bcrypt.hashSync(req.body.password, salt)
                    console.log("check data after hash password : ", req.body);

                    let regist = await model.users.create(req.body);

                    let token = createToken({
                        id: regist.dataValues.id,
                        email: regist.dataValues.email
                    }, '24h')

                    // mengirimkan emailverifikasi
                    await transporter.use('compile', hbs({
                        viewEngine: { extname: '.html', partialsDir: './src/helper', layoutsDir: './src/helper', defaultLayout: 'verifyacc.html' },
                        viewPath: './src/helper',
                        extName: '.html'
                    }));
                    await transporter.sendMail({
                        from: 'Tracker admin',
                        to: req.body.email,
                        subject: 'Verifikasi Akun',
                        template: 'verifyacc',
                        context: {
                            link: `http://localhost:3000/verify/${token}`
                        }
                    })
                    return res.status(200).send({
                        success: true,
                        data: regist
                    });
                } else {
                    return res.status(400).send({
                        success: false,
                        message: "password not match"
                    })
                }
            } else {
                return res.status(401).send({
                    success: false,
                    message: "email/username exist"
                })
            }
        } catch (error) {
            next(error)
        }
    },
    login: async (req, res, next) => {
        try {
            console.log("Data dari req.body : ", req.body);
            let get = await model.users.findAll({
                where: sequelize.or(
                    { email: req.body.email },
                    { username: req.body.username }),
                include: [{ model: model.status, attributes: ['status'] }]
            }); // WHERE password='req.body.password' AND (email='' or phone='' or username='') --> yg di kurung yg lebih dulu di eksekusi
            if (get.length > 0) { // berhasil login

                // pencocokan password
                let check = bcrypt.compareSync(req.body.password, get[0].dataValues.password)
                if (check && get[0].dataValues.statusId != 3) {
                    await model.users.update({ attempt: 0 }, {
                        where: {
                            id: get[0].dataValues.id
                        }
                    })
                    console.log("cek result get", get[0].dataValues);
                    // delete get[0].dataValues.password;
                    get[0].dataValues.status = get[0].dataValues.status.status;
                    let { id, username, email, role, status, imgprofile, imgbanner } = get[0].dataValues;
                    let token = createToken({ id, role, status })
                    return res.status(200).send({ username, email, role, status, token, imgprofile, imgbanner })
                } else {
                    if (get[0].dataValues.attempt < 3) { // update col attempt jika salah password
                        await model.users.update({ attempt: get[0].dataValues.attempt + 1 }, {
                            where: {
                                id: get[0].dataValues.id
                            }
                        })
                        return res.status(400).send({
                            success: false,
                            message: `Wrong password ${get[0].dataValues.attempt}`
                        })
                    } else { // kalo sudah suspended
                        await model.users.update({ statusId: 3 }, {
                            where: {
                                id: get[0].dataValues.id
                            }
                        })
                        return res.status(400).send({
                            success: false,
                            message: `Account suspended, please reset your password`
                        })
                    }
                }
            } else { // jika tidak berhasil login
                return res.status(404).send({
                    success: false,
                    message: "Accont not Found"
                })
            }
            console.log("dari variable get : ", get[0].dataValues);
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    verify: async (req, res, next) => {
        try {
            console.log("data setelah di middleware read token : ", req.decript);
            await model.users.update({ statusId: 2 }, {
                where: {
                    id: req.decript.id
                }
            })
            res.status(200).send({
                success: true,
                message: 'Your account is verified'
            })
        } catch (error) {
            next(error)
        }
    },
    keepLogin: async (req, res, next) => {
        try {
            // flow keeplogin ambil data dulu filter dari req.decript middleware sebelumnya
            // 
            console.log("decript token : ", req.decript);
            let get = await model.users.findAll({
                where: {
                    id: req.decript.id
                },
                include: [{ model: model.status, attributes: ['status'] }]
            });
            get[0].dataValues.status = get[0].dataValues.status.status
            let { id, username, email, role, status, imgprofile, imgbanner } = get[0].dataValues;
            let token = createToken({ id, role, status })
            return res.status(200).send({ username, email, role, status, token, imgprofile, imgbanner })

        } catch (error) {
            next(error)
        }
    },
    forget: async (req, res, next) => {
        try {
            console.log(req.body)
            let get = await model.users.findAll({
                where: {
                    email: req.body.email
                }
            });
            console.log("darii gett", get)
            if (get.length > 0) {
                let { id, email } = get[0].dataValues
                let token = createToken({ id, email })

                await transporter.use('compile', hbs({
                    viewEngine: { extname: '.html', partialsDir: './src/helper', layoutsDir: './src/helper', defaultLayout: 'resetpassword.html' },
                    viewPath: './src/helper',
                    extName: '.html'
                }));
                await transporter.sendMail({
                    from: 'SOSMED',
                    to: req.body.email,
                    subject: 'New Password',
                    template: 'resetpassword',
                    context: {
                        link: `http://localhost:3000/newpassword/${token}`
                    }
                })

                return res.status(200).send({
                    success: true,
                    token: token
                })
            } else {
                return res.status(404).send({
                    success: false,
                    message: "Email is wrong"
                })
            }
        } catch (error) {
            next(error)
        }
    },
    newpassword: async (req, res, next) => {
        try {
            console.log(req.body.password)
            console.log(req.decript)
            await model.users.update({ password: bcrypt.hashSync(req.body.password, salt), statusId: 2 }, {
                where: {
                    id: req.decript.id
                }
            })
            res.status(200).send({
                success: true
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getalluser: async (req, res, next) => {
        let get = await model.users.findAll({
            order: [
                sequelize.fn('RAND')
            ], limit: 4
        })
        // console.log("get all data user",get);
        res.status(200).send(get)
    },
    getdatauser: async (req, res, next) => {
        let get = await model.users.findAll({
            where: {
                username: req.body.username
            }
        })
        // console.log(get);
        res.status(200).send(get[0].dataValues)
    },
    updatePhotoProfile: async (req, res, next) => {
        try {
            console.log("cek file data req : ", req.files);
            console.log(req.decript)
            let get = await model.users.findAll({ // 1. mengambil data profile yang lama
                where: { id: req.decript.id }, //WHERE
                attributes: ['imgprofile'] // SELECT table apa
            })

            await model.users.update({ // 3. memperbaharui kolom imgProfile dengan gambar yang baru
                imgprofile: `/imgProfile/${req.files[0].filename}`
            }, {
                where: {
                    id: req.decript.id
                }
            });

            if (fs.existsSync(`./src/public${get[0].dataValues.imgprofile}`) && !get[0].dataValues.imgprofile.includes('default')) { //exist = untuk mengetahui file itu ada atau tidak
                fs.unlinkSync(`./src/public${get[0].dataValues.imgprofile}`); // 2. menghapus gambar lama berdasarkan data profile sebelumnya.
            }

            res.status(200).send({
                success: true,
                message: 'Profile picture changed'
            })
        } catch (error) {
            fs.unlinkSync(`./src/public/imgProfile/${req.files[0].filename}`); // menghapus file kalo ada error
            console.log(error);
            next(error)
        }
    },
    updateBanner: async (req, res, next) => {
        try {
            console.log("cek file data req : ", req.files);
            console.log(req.decript)
            let get = await model.users.findAll({ // 1. mengambil data profile yang lama
                where: { id: req.decript.id }, //WHERE
                attributes: ['imgbanner'] // SELECT table apa
            });

            await model.users.update({ // 3. memperbaharui kolom imgbanner dengan gambar yang baru
                imgbanner: `/imgBanner/${req.files[0].filename}`
            }, {
                where: {
                    id: req.decript.id
                }
            });

            if (fs.existsSync(`./src/public${get[0].dataValues.imgbanner}`) && !get[0].dataValues.imgbanner.includes('default')) { //exist = untuk mengetahui file itu ada atau tidak
                fs.unlinkSync(`./src/public${get[0].dataValues.imgbanner}`); // 2. menghapus gambar lama berdasarkan data profile sebelumnya.
            };

            res.status(200).send({
                success: true,
                message: 'Profile banner changed'
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}



