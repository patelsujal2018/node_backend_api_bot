const botMenuModel = require('../models/bot_menu_model');
const { check, validationResult } = require('express-validator');
const transporter = require('../services/nodemailer');
const { Op } = require('sequelize');
const jwt_token_decode = require('../services/jwt_token_decode');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const saltRounds = 10;
var jwtKey = process.env.JWT_SECRET;
var expiresTime = "1d";

class bot_controller {
    constructor() {
    }

    async get_bot_menu_list(req,res){
        var customerToken = jwt_token_decode(req);

        if(customerToken){
            botMenuModel.findAll({
                attributes:['id','command','command_response_text'],
                where:{
                    customer_id: customerToken.id
                }
            }).then( result => {
                if(result){
                    res.status(200).json({
                        message: "get bot menu list successfully",
                        success: true,
                        data: {
                            bot_menu_list: result
                        },
                    });
                }
            })
        } else {
            res.status(400).json({
                message: "token is expired",
                success: false,
                data: {
                    errors: 'token is expired'
                },
            });
        }
    }

    async get_single_bot_menu(req,res){
        var customerToken = jwt_token_decode(req);

        if(customerToken){
            botMenuModel.findOne({
                attributes:['id','command','command_response_text'],
                where:{
                    id: req.params.id,
                    customer_id: customerToken.id
                }
            }).then( result => {
                if(result){
                    res.status(200).json({
                        message: "get bot menu successfully",
                        success: true,
                        data: {
                            bot_menu: result
                        },
                    });
                } else {
                    res.status(200).json({
                        message: "bot menu not found",
                        success: false,
                        data: {},
                    });
                }
            });
        } else {
            res.status(400).json({
                message: "token is expired",
                success: false,
                data: {
                    errors: 'token is expired'
                },
            });
        }
    }

    async store_bot_menu(req,res){
        var customerToken = jwt_token_decode(req);

        if(customerToken){
            await check('command')
                .notEmpty().withMessage('command is required')
                .isInt().withMessage('command is only numeric')
                .isLength({ max:10 }).withMessage('command is not more than 10 digits')
                .custom(value => {
                    if(value){
                        return botMenuModel.findOne({
                            where:{
                                customer_id: customerToken.id,
                                command: value
                            }
                        }).then(customer => {
                            if (customer){
                                return Promise.reject('command is already registered');
                            }
                            return true;
                        });
                    }
                })
                .run(req);
            await check('command_response_text')
                .notEmpty().withMessage('command response text is required')
                .isLength({ min:1, max:100 }).withMessage('command response text is not less than 1 and not more than 100 character')
                .run(req);

            const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
                return `${msg}`;
            };
            const result = validationResult(req).formatWith(errorFormatter);

            if(!result.isEmpty()){
                res.status(200).json({
                    message: "validation failed",
                    success: false,
                    data: {
                        errors: result.mapped()
                    },
                });
            } else {
                botMenuModel.create({
                    command: req.body.command,
                    command_response_text: req.body.command_response_text,
                    customer_id: customerToken.id
                }).then(botMenu => {
                    res.status(200).json({
                        message: "bot menu is created successfully.",
                        success: true,
                        data: {},
                    });
                }).catch(err => {
                    res.status(400).json({
                        message: "some problem to create new bot menu.",
                        success: false,
                        data: {},
                    });
                });
            }
        } else {
            res.status(400).json({
                message: "token is expired",
                success: false,
                data: {
                    errors: 'token is expired'
                },
            });
        }
    }

    async update_bot_menu(req,res){
        var customerToken = jwt_token_decode(req);

        if(customerToken){
            await check('command')
                .notEmpty().withMessage('command is required')
                .isInt().withMessage('command is only numeric')
                .isLength({ max:10 }).withMessage('command is not more than 10 digits')
                .custom(value => {
                    if(value){
                        return botMenuModel.findOne({
                            where:{
                                customer_id: customerToken.id,
                                command: value,
                                id: {
                                    [Op.ne] : req.params.id
                                }
                            },
                            whereNot:{
                                id: customerToken.id,
                            }
                        }).then(customer => {
                            if (customer){
                                return Promise.reject('command is already registered');
                            }
                            return true;
                        });
                    }
                })
                .run(req);
            await check('command_response_text')
                .notEmpty().withMessage('command response text is required')
                .isLength({ min:1, max:100 }).withMessage('command response text is not less than 1 and not more than 100 character')
                .run(req);
            await check('id')
                .notEmpty().withMessage('id is required')
                .run(req);

            const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
                return `${msg}`;
            };
            const result = validationResult(req).formatWith(errorFormatter);

            if(!result.isEmpty()){
                res.status(200).json({
                    message: "validation failed",
                    success: false,
                    data: {
                        errors: result.mapped()
                    },
                });
            } else {
                botMenuModel.update({
                    command: req.body.command,
                    command_response_text: req.body.command_response_text,
                },{
                    where: {
                        id: req.params.id,
                        customer_id: customerToken.id,
                    }
                }).then(botMenu => {
                    res.status(200).json({
                        message: "bot menu is updated successfully.",
                        success: true,
                        data: {},
                    });
                }).catch(err => {
                    res.status(400).json({
                        message: "some problem to update bot menu.",
                        success: false,
                        data: {},
                    });
                });
            }
        } else {
            res.status(400).json({
                message: "token is expired",
                success: false,
                data: {
                    errors: 'token is expired'
                },
            });
        }
    }

    async delete_bot_menu(req,res){
        var customerToken = jwt_token_decode(req);

        if(customerToken){
            await check('id')
                .notEmpty().withMessage('command id is required')
                .isInt().withMessage('command id is only numeric')
                .run(req);

            const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
                return `${msg}`;
            };
            const result = validationResult(req).formatWith(errorFormatter);

            if(!result.isEmpty()){
                res.status(200).json({
                    message: "validation failed",
                    success: false,
                    data: {
                        errors: result.mapped()
                    },
                });
            } else {
                botMenuModel.destroy({
                    where: {
                        id: req.params.id,
                        customer_id: customerToken.id,
                    }
                }).then(botMenu => {
                    res.status(200).json({
                        message: "bot menu is deleted successfully.",
                        success: true,
                        data: {},
                    });
                }).catch(err => {
                    res.status(400).json({
                        message: "some problem to delete bot menu.",
                        success: false,
                        data: {},
                    });
                });
            }
        } else {
            res.status(400).json({
                message: "token is expired",
                success: false,
                data: {
                    errors: 'token is expired'
                },
            });
        }
    }

}

module.exports = new bot_controller();