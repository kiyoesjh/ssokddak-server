module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      //MySQL에는 users로 저장됨
      email: {
        type: DataTypes.STRING(50),
        allowNull: false, //필수
        unique: true, //고유한 값
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false, //필수
      },
      password: {
        type: DataTypes.STRING(100), //암호화를 하기 때문에 길이가 길어질 것을 대비해 100글자로 제한
        allowNull: false, //필수
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci', //한글 저장
    }
  );

  // through: 테이블 이름을 바꿔주는 것, foreignKey: 컬럼 이름을(id) 바꿔주는 것
  User.associate = (db) => {
    db.User.hasMany(db.Post);
    db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' });
    db.User.belongsToMany(db.User, {
      through: 'Follow',
      as: 'Followers',
      foreignKey: 'FollowingId',
    });
    db.User.belongsToMany(db.User, {
      through: 'Follow',
      as: 'Followings',
      foreignKey: 'FollowerId',
    });
  };
  return User;
};
