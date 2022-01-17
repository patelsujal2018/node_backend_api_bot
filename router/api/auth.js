var express = require('express');
var router = express.Router();

/* auth controller */
var controller = require('../../controllers/auth_controller');

router.post('/login',(req,res)=>{ controller.login_process(req,res) });
router.get('/logout',(req,res)=>{ controller.logout_process(req,res) });
router.post('/register',(req,res)=>{ controller.registration_process(req,res) });
router.get('/register/verify/:email/:token',(req,res)=>{ controller.verify_registration_process(req,res) });
router.get('/check_customer_is_login',(req,res)=>{ controller.check_customer_is_login(req,res) });

router.get('/get_customer_details',(req,res)=>{ controller.get_customer_details(req,res) })
router.post('/update_customer_details',(req,res)=>{ controller.update_customer_details(req,res) });

/* export router */
module.exports = router;