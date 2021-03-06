const crypto = require('crypto')
const Sequelize = require('sequelize')
const db = require('../db')

const User = db.define('user', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName:{
    type: Sequelize.STRING
  },
  fullName: {
    type: Sequelize.VIRTUAL,
    get(){
      return this.getDataValue('firstName') + ' ' + this.getDataValue('lastName')
    }
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  profileImg: {
    type: Sequelize.STRING,
    defaultValue: 'https://i1.wp.com/www.thisblogrules.com/wp-content/uploads/2010/02/batman-for-facebook.jpg?resize=250%2C280',
    validate: {
      isUrl: true
    }
  },
  tagline: {
    type: Sequelize.STRING(100),
  },
  locationStr: {
    type: Sequelize.STRING(14)
  },
  password: {
    type: Sequelize.STRING,
    // Making `.password` act like a func hides it when serializing to JSON.
    // This is a hack to get around Sequelize's lack of a "private" option.
    get() {
      return () => this.getDataValue('password')
    }
  },
  salt: {
    type: Sequelize.STRING,
    // Making `.salt` act like a function hides it when serializing to JSON.
    // This is a hack to get around Sequelize's lack of a "private" option.
    get() {
      return () => this.getDataValue('salt')
    }
  },
  userType: {
    type: Sequelize.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  googleId: {
    type: Sequelize.STRING
  }
})

module.exports = User

/**
 * instanceMethods
 */
User.prototype.correctPassword = function(candidatePwd) {
  return User.encryptPassword(candidatePwd, this.salt()) === this.password()
}

/**
 * classMethods
 */
User.generateSalt = function() {
  return crypto.randomBytes(16).toString('base64')
}

User.encryptPassword = function(plainText, salt) {
  return crypto
    .createHash('RSA-SHA256')
    .update(plainText)
    .update(salt)
    .digest('hex')
}

/**
 * hooks
 */
const setSaltAndPassword = user => {
  if(Array.isArray(user)){
    for(let i = 0; i < user.length; i++){
      if(user[i].changed('password')){
        user[i].salt = User.generateSalt()
        user[i].password = User.encryptPassword(user[i].password(), user[i].salt())
      }
    }
  } else {
    if (user.changed('password')) {
      user.salt = User.generateSalt()
      user.password = User.encryptPassword(user.password(), user.salt())
    }
  }
}


User.beforeBulkCreate(setSaltAndPassword)
User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)
