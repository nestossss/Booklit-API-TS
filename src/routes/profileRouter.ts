import express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
   res.send("Não implementado")
})

export { router }