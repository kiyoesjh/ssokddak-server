const passport = require('passport');
const local = require('./local');
const { User } = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => {
    // 백엔드 서버에서는 아이디만 저장 할 수 있도록
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    //아이디를 가지고 db에서 정보를 가져옴
    try {
      const user = await User.findOne({
        where: { id },
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  local();
};
