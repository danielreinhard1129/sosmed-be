const { tweetController } = require('../controllers');
const { readToken } = require('../helper/jwt');
const route = require('express').Router();
const uploader = require('../helper/uploader');

route.post('/posting', readToken, tweetController.posting)
route.get('/getalltweets', tweetController.getAllTweets)
route.post('/like', readToken, tweetController.like)
route.post('/countlike', tweetController.countLike)
route.post('/getusertweet', tweetController.getUserTweet)

module.exports = route;