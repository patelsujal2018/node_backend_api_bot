const customerModel = require('../models/customer_model');
const { check, validationResult } = require('express-validator');
const transporter = require('../services/nodemailer');
const jwt_token_decode = require('../services/jwt_token_decode');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const saltRounds = 10;
var jwtKey = process.env.JWT_SECRET;
var expiresTime = "1d";

class auth_controller {
    constructor() {
    }

    async login_process(req,res){
        await check('email')
            .notEmpty().withMessage('email is required')
            .isLength({ max:190 }).withMessage('email is not more than 100 character')
            .run(req);
        await check('password')
            .notEmpty().withMessage('password is required')
            .isLength({ min:8, max:30 }).withMessage('password is not lessthan 8 and not morethan 30 character')
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
            customerModel.findOne({
                where:{
                    email:req.body.email
                }
            }).then(customer => {
                var result = bcrypt.compareSync(req.body.password, customer.password);
                if(result){
                    if(customer.status === 1){
                        if(customer.login_status === 0){
                            jwt.sign({
                                id: customer.id,
                                first_name: customer.first_name,
                                last_name: customer.last_name,
                                gender: customer.gender,
                                email: customer.email,
                                mobile_no: customer.mobile_no,
                                profile_url: customer.profile_image
                            },jwtKey,{expiresIn:expiresTime},(err,token)=>{

                                customer.update({
                                    login_status: 1,
                                    token: token
                                },{
                                    where:{
                                        id:customer.id
                                    }
                                }).then(result => {
                                    res.status(200).json({
                                        message: "customer login successfully",
                                        success: true,
                                        data: {
                                            token:token
                                        },
                                    });
                                });
                            });
                        } else {
                            res.status(200).json({
                                message: "customer login successfully",
                                success: true,
                                data: {
                                    token:customer.token
                                },
                            });
                        }
                    } else if(customer.status === 0){
                        res.status(200).json({
                            message: "please verify your email first",
                            success: true,
                            data: {},
                        });
                    } else if(customer.status === 2){
                        res.status(200).json({
                            message: "your account is deactivated",
                            success: true,
                            data: {},
                        });
                    }
                }
            }).catch(err => {
                res.status(400).json({
                    message: "some problem to login customer",
                    success: false,
                    data: {},
                });
            });
        }
    }

    async logout_process(req, res){
        var customer = jwt_token_decode(req);

        if(customer){
            customerModel.findOne({
                where:{
                    email:customer.email
                }
            }).then(customer => {

                customer.update({
                    login_status: 0,
                    token: null
                },{
                    where:{
                        id:customer.id
                    }
                }).then(result => {
                    res.status(200).json({
                        message: "customer logout successfully",
                        success: true,
                        data: {},
                    });
                });

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

    async registration_process(req,res){
        await check('first_name')
            .notEmpty().withMessage('first_name is required')
            .isAlpha().withMessage('first_name is only alphabetic')
            .isLength({ max:100 }).withMessage('first_name is not more than 100 character')
            .run(req);
        await check('last_name')
            .notEmpty().withMessage('last_name is required')
            .isAlpha().withMessage('last_name is only alphabetic')
            .isLength({ max:100 }).withMessage('last_name is not more than 100 character')
            .run(req);
        await check('gender')
            .notEmpty().withMessage('gender is required')
            .isInt().withMessage('gender is only numeric')
            .isLength({ max:1 }).withMessage('gender is not more than 1 character')
            .run(req);
        await check('email')
            .notEmpty().withMessage('email is required')
            .isLength({ max:190 }).withMessage('email is not more than 100 character')
            .custom(value => {
                if(value){
                    return customerModel.findOne({
                        where:{
                            email:value
                        }
                    }).then(customer => {
                        if (customer){
                            return Promise.reject('email is already registered');
                        }
                        return true;
                    });
                }
            })
            .run(req);
        await check('mobile_no')
            .notEmpty().withMessage('mobile no is required')
            .isInt().withMessage('mobile no is only numeric')
            .isLength({ max:10 }).withMessage('mobile no is not more than 10 character')
            .custom(value => {
                if(value){
                    return customerModel.findOne({
                        where:{
                            mobile:value
                        }
                    }).then(customer => {
                        if (customer){
                            return Promise.reject('mobile no is already registered');
                        }
                        return true;
                    });
                }
            })
            .run(req);
        await check('password')
            .notEmpty().withMessage('password is required')
            .isLength({ min:8, max:30 }).withMessage('password is not less than 8 and not more than 30 character')
            .run(req);
        await check('confirm_password')
            .notEmpty().withMessage('confirm password is required')
            .isLength({ min:8, max:30 }).withMessage('confirm password is not less than 8 and not more than 30 character')
            .custom(value => {
                if(value){
                    if(value !== req.body.password){
                        return Promise.reject('confirm password does not match password');
                    }
                    return true;
                }
            })
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
            var token = Math.floor(Math.random() * 1000000000);
            customerModel.create({
                first_name:req.body.first_name,
                last_name:req.body.last_name,
                gender:req.body.gender,
                email:req.body.email,
                mobile:req.body.mobile_no,
                password: bcrypt.hashSync(req.body.password, saltRounds),
                token: token
            }).then(customer => {

                let verify_link = `${process.env.APP_URL}/auth/register/verify/${req.body.email}/${token}`
                var mailOptions = {
                    from: process.env.MAIL_FROM_ADDRESS,
                    to: customer.email,
                    subject: 'registration completed successfully',
                    html: `<p>${process.env.APP_NAME} is Welcome you to our Family</p> <br/> <a href="${verify_link}">Verify Me</a>`
                };

                transporter.sendMail(mailOptions, function(error, success){
                    if (error) {
                        res.status(200).json({
                            message: "customer register successfully but mail is not send",
                            success: true,
                            data: {},
                        });
                    } else {
                        res.status(200).json({
                            message: "customer register successfully. please check your inbox for verify email",
                            success: true,
                            data: {},
                        });
                    }
                });

            }).catch(err => {
                res.status(400).json({
                    message: "some problem to create new customer",
                    success: false,
                    data: {},
                });
            });
        }
    }

    async verify_registration_process(req,res){
        await check('email')
            .notEmpty().withMessage('email is required')
            .custom(value => {
                if(value){
                    return customerModel.findOne({
                        where:{
                            email:value
                        }
                    }).then(customer => {
                        if (!customer){
                            return Promise.reject('email is not exist in our database');
                        }
                        return true;
                    });
                }
            })
            .run(req);
        await check('token')
            .notEmpty().withMessage('token is required')
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
            const {email, token} = req.params
            customerModel.findOne({
                where:{
                    email: email,
                }
            }).then(customer => {
                if(customer.token !== "" && customer.token === token){
                    customer.update({
                        email_verified_at: new Date(),
                        status: 1,
                        token: ""
                    },{
                        where:{
                            id:customer.id
                        }
                    }).then(result => {
                        if(result){
                            var mailOptions = {
                                from: process.env.MAIL_FROM_ADDRESS,
                                to: customer.email,
                                subject: 'registration verification is completed successfully',
                                text: `Hello ${result.first_name} ${result.last_name}, Your email id is now verified. Thank You For Verify Your Email.`
                            };

                            transporter.sendMail(mailOptions, function(error, success){
                                if (success) {
                                    res.send(`${customer.first_name} ${customer.last_name} Your email id is now verified successfully`);
                                }
                            });
                        }
                    });
                } else {
                    res.send('token is expired');
                }
            })
        }
    }

    async check_customer_is_login(req,res){
        var customer = jwt_token_decode(req);

        if(customer){
            res.status(200).json({
                message: "customer is currently logged in",
                success: true,
                data: {
                    customer: {
                        "first_name": customer.first_name,
                        "last_name": customer.last_name,
                        "gender": customer.gender,
                        "email": customer.email,
                        "profile_url": customer.profile_url,
                    }
                },
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

    async get_customer_details(req,res){
        var customer = jwt_token_decode(req);

        if(customer){
            customerModel.findOne({
                attributes:['first_name','last_name','gender','email','mobile','bot_token','bot_name','profile_image'],
                where:{
                    id: customer.id,
                    email: customer.email
                }
            }).then( result => {
                if(result){
                    res.status(200).json({
                        message: "customer is details",
                        success: true,
                        data: {
                            customer: result
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

    async update_customer_details(req,res){
        var customerToken = jwt_token_decode(req);
        if(customerToken){
            await check('first_name')
                .notEmpty().withMessage('first_name is required')
                .isAlpha().withMessage('first_name is only alphabetic')
                .isLength({ max:100 }).withMessage('first_name is not more than 100 character')
                .run(req);
            await check('last_name')
                .notEmpty().withMessage('last_name is required')
                .isAlpha().withMessage('last_name is only alphabetic')
                .isLength({ max:100 }).withMessage('last_name is not more than 100 character')
                .run(req);
            await check('gender')
                .notEmpty().withMessage('gender is required')
                .isInt().withMessage('gender is only numeric')
                .isLength({ max:1 }).withMessage('gender is not more than 1 character')
                .run(req);
            await check('email')
                .notEmpty().withMessage('email is required')
                .isLength({ max:190 }).withMessage('email is not more than 100 character')
                .run(req);
            await check('mobile')
                .notEmpty().withMessage('mobile no is required')
                .isInt().withMessage('mobile no is only numeric')
                .isLength({ max:10 }).withMessage('mobile no is not more than 10 character')
                .run(req);
            await check('bot_token')
                .notEmpty().withMessage('bot_token is required')
                .run(req);
            await check('bot_name')
                .notEmpty().withMessage('bot_name is required')
                .run(req);
            await check('profile_image')
                .notEmpty().withMessage('profile_image is required')
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
                console.log(req.body);
                customerModel.findOne({
                    where:{
                        id: customerToken.id,
                        email: customerToken.email,
                    }
                }).then(customer => {
                    customer.update({
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        gender: req.body.gender,
                        email: req.body.email,
                        mobile: req.body.mobile,
                        bot_token: req.body.bot_token,
                        bot_name: req.body.bot_name
                    },{
                        where:{
                            id:customer.id
                        }
                    }).then(result => {
                        if(result){
                            res.status(200).json({
                                message: "user details updated successfully.",
                                success: true,
                                data: {},
                            });
                        }
                    }).catch(err => {
                        res.status(200).json({
                            message: "facing some problem to update user details.",
                            success: false,
                            data: {},
                        });
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

module.exports = new auth_controller();