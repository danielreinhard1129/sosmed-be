const model = require('../models');
const sequelize = require('sequelize');

module.exports = {
    posting: async (req, res, next) => {
        try {
            let post = await model.tweets.create({
                userId: req.decript.id,
                tweet: req.body.tweet
            });
            res.status(200).send({
                success: true,
                message: 'Posting Success'
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getAllTweets: async (req, res, next) => {
        try {
            let get = await model.tweets.findAll({
                include: [
                    { model: model.users, attributes: ['username', 'imgprofile'] },
                    { model: model.likes,include: [{ model: model.users, attributes: ['username'] }]},
                ],
                order: [['id', 'DESC']]
            });
            let newData = get.map((val) => {
                return { ...val.dataValues, countLike: val.dataValues.likes.filter((value) => value.isLiked == true).length }
            });
            console.log('get all tweets', get)
            console.log('new data', newData)
            res.status(200).send(newData)
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    getUserTweet: async (req, res, next) => {
        try {
            let get = await model.tweets.findAll({
                include: [
                    { model: model.users, where: { username: req.body.username }, attributes: ['username', 'imgprofile'] },
                    { model: model.likes, include: [{ model: model.users, attributes: ['username'] }] }
                ],
                order: [['id', 'DESC']]
            });
            let newData = get.map((val) => {
                return { ...val.dataValues, countLike: val.dataValues.likes.filter((value) => value.isLiked == true).length }
            });
            res.status(200).send(newData)
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    like: async (req, res, next) => {
        try {
            console.log(req.body.tweetId);
            let get = await model.likes.findAll({
                where: {
                    userId: req.decript.id,
                    tweetId: req.body.tweetId
                }
            });


            console.log("dari get like", get)
            if (get.length == 0) {
                let like = await model.likes.create({
                    tweetId: req.body.tweetId,
                    userId: req.decript.id,
                    isLiked: true
                })

                let hitung = await model.likes.count({
                    where: {
                        tweetId: req.body.tweetId,
                        isLiked: true
                    }
                });
                res.status(200).send({
                    isLiked: true,
                    count: hitung
                });

            } else {
                let unlike = await model.likes.update({
                    isLiked: get[0].dataValues.isLiked ? false : true
                }, {
                    where: {
                        userId: req.decript.id,
                        tweetId: req.body.tweetId
                    }
                })

                let hitung = await model.likes.count({
                    where: {
                        tweetId: req.body.tweetId,
                        isLiked: true
                    }
                });
                res.status(200).send({
                    isLiked: get[0].dataValues.isLiked ? false : true,
                    count: hitung
                });
            }

        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    countLike: async (req, res, next) => {
        try {
            let hitung = await model.likes.count({
                where: {
                    tweetId: req.body.tweetId,
                    isLiked: true
                }
            });
            console.log("hitung", hitung)
            res.status(200).send({
                count: hitung
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}