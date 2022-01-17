const { Sequelize, DataTypes, Model } = require('sequelize');
const con = require('../connections/sequelize_mysql');


class bot_menu_model extends Model {}

bot_menu_model.init({
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    command: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    command_response_text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
},{
    sequelize: con,
    tableName: 'bot_menu',
    modelName: 'bot_menu_model',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

// bot_menu_model.sync({
//     force:true
// })

module.exports = bot_menu_model;