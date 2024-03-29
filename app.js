const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const db = require('./models');
const passportConfig = require('./passport');

dotenv.config();
const app = express();
db.sequelize
  .sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

passportConfig();

app.use(morgan('dev'));
app.use(
  cors({
    origin: true, // or http://localhost:3000
    credentials: true, //cookie를 전달해주려면 true 로 변경해야함.
  })
);
app.use('/', express.static(path.join(__dirname, 'uploads')));
app.use(express.json()); // front에서 json 형식으로 왔을때 req.body 안으로 넣어줄 수 있도록 처리
app.use(express.urlencoded({ extended: true })); //form submit 했을 때 urlencoded 방식으로 넘어오게 됨
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);

app.listen(3065, () => {
  console.log('서버 실행중!!');
});
