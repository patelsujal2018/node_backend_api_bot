var express = require('express');
var router = express.Router();

/* bot controller */
var controller = require('../../controllers/bot_controller');

router.get('/get_bot_menu_list',(req,res)=>{ controller.get_bot_menu_list(req,res) })
router.get('/get_single_bot_menu/:id',(req,res)=>{ controller.get_single_bot_menu(req,res) })
router.post('/store_bot_menu',(req,res)=>{ controller.store_bot_menu(req,res) })
router.put('/update_bot_menu/:id',(req,res)=>{ controller.update_bot_menu(req,res) })
router.delete('/delete_bot_menu/:id',(req,res)=>{ controller.delete_bot_menu(req,res) })

/* export router */
module.exports = router;