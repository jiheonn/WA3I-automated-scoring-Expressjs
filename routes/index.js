const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('mainpage/index');
});

router.get('/introduce', (req, res, next) => {
  res.render('mainpage/introduce');
});

module.exports = router;
