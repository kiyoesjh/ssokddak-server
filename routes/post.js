const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Image, User } = require('../models');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();

// uploads 폴더가 있는 지 확인
try {
  fs.accessSync('uploads');
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      //하드디스크 저장(추후 aws)
      done(null, 'uploads');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname); //파일 확장자 추출(ex. .png)
      const basename = path.basename(file.originalname, ext);
      done(null, basename + new Date().getTime() + ext);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, //20MB
});

router.get('/:postId', async (req, res, next) => {
  //하나의 게시글 불러오기
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    const resultPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Image,
        },
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
        {
          model: User,
          as: 'Likers',
          attributes: ['id'],
        },
      ],
    });
    res.status(200).json(resultPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (req.body.image && Array.isArray(req.body.image)) {
      const images = await Promise.all(
        req.body.image.map((img) => Image.create({ src: img }))
      );
      await post.addImages(images);
    } else if (req.body.image && typeof req.body.image === 'string') {
      const image = await Image.create({ src: req.body.image });
      await post.addImages(image);
    }
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Image,
        },
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
        {
          model: User,
          as: 'Likers',
          attributes: ['id'],
        },
      ],
    });
    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    await post.addLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
  // DELETE /post/1/like
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    await post.removeLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId', isLoggedIn, async (req, res, next) => {
  try {
    await Post.destroy({
      where: { id: req.params.postId, UserId: req.user.id },
    });
    res.status(200).json({ postId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/images', isLoggedIn, upload.array('image'), (req, res, next) => {
  try {
    res.json(req.files.map((v) => v.filename));
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
