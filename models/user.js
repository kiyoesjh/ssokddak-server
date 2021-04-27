const DataTypes = require('sequelize');
const { Model } = DataTypes;
module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
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
        modelName: 'User',
        tableName: 'users',
        charset: 'utf8',
        collate: 'utf8_general_ci', //한글 저장
        sequelize,
      }
    );
  }

  static associate(db) {
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
  }
};
