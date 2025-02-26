const express = require('express');
const router = express.Router();

router.use(express.json());
router.get('/', (req, resp) => {
    resp.send('Register route');
});

module.exports = router;