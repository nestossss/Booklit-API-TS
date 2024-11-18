require('dotenv').config();
import express = require('express');
const app = express();

import { checkToken } from '../src/util/token';

import { router as authRouter } from "../src/routes/authRouter";
import { router as booksRouter }  from "../src/routes/booksRouter";
import { router as libRouter } from "../src/routes/libRouter";
import { router as streakRouter } from "../src/routes/streakRouter";
import { router as profileRouter} from "../src/routes/profileRouter";

// const booksRoutes = require("./routes/books");

app.use(express.urlencoded({ 
    extended: true
}))
app.get("/", (req, res)=>{
    res.send("As rotas são /user \n(Até o momento)");
})
app.use("/auth", authRouter);
app.use("/books", checkToken, booksRouter);
app.use("/streak", checkToken, streakRouter);
app.use("/lib", checkToken, libRouter);
app.use("/profile", checkToken, profileRouter);

app.listen( () => {
    console.log("listening")
})

export default app;