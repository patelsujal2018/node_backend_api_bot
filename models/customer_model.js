const { Sequelize, DataTypes, Model } = require('sequelize');
const con = require('../connections/sequelize_mysql');


class customer_model extends Model {}

customer_model.init({
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    gender: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '0=female,1=male,2=other'
    },
    email: {
        type: DataTypes.STRING(190),
        allowNull: false,
        unique: true
    },
    email_verified_at: {
        type: DataTypes.DATE
    },
    password:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    mobile: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    mobile_verified_at: {
        type: DataTypes.DATE
    },
    bot_token: {
        type: DataTypes.TEXT
    },
    bot_name: {
        type: DataTypes.TEXT
    },
    profile_image: {
        type: DataTypes.TEXT
    },
    token: {
        type: DataTypes.TEXT
    },
    status : {
        type : DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '0=inactive,1=active,2=deactivated'
    },
    login_status : {
        type : DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '0=not login,1=login'
    }
},{
    sequelize: con,
    tableName: 'customers',
    modelName: 'customer_model',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

// customer_model.sync({
//     force:true
// })

module.exports = customer_model;