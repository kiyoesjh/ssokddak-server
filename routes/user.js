const express = require('express');
const bcrypt = require('bcrypt');
const { User, Post } = require('../models');
const passport = require('passport');

const router = express.Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    //서버에러, 성공, 클라이언트에러
    if (error) {
      console.error(error);
      return next(error);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const userWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: Post,
          },
          {
            model: User,
            as: 'Followers',
          },
          {
            model: User,
            as: 'Followings',
          },
        ],
      });
      return res.status(200).json(userWithoutPassword);
    });
  })(req, res, next);
});

router.post('/', async (req, res, next) => {
  // signup
  try {
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (exUser) {
      return res.status(403).send('이미 사용 중인 이메일입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.status(201).send('ok');
  } catch (error) {
    console.error(error);
    next(error); //status 500
  }
});

module.exports = router;
