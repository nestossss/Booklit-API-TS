require('dotenv').config();
import express = require('express');
const app = express();

import { checkToken } from './util/token';

import { router as authRouter } from "./routes/authRouter";
import { router as booksRouter }  from "./routes/booksRouter";
import { router as libRouter } from "./routes/libRouter";
import { router as streakRouter } from "./routes/streakRouter";

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


// app.use("/profile", profileRouter);

app.listen(80, "0.0.0.0", () =>{
    console.log("server running, daleee");
})
