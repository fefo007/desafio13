const express =require('express')
const {Router}=require( 'express')
const Api = require('../container/apiPord')
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const session = require('express-session')
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
const routerLog=new Router()
const api = new Api()

const usuarios=[]

passport.use('register', new LocalStrategy({passReqToCallback: true}, (req, username, password, done) => {

    const { direccion } = req.body
    const usuario = usuarios.find(usuario => usuario.username == username)
    if (usuario) {
    return done('usuario ya existente')
    }

    const user = {
        username,
        password,
        direccion,
    }
    usuarios.push(user)

    return done(null, user)
}));

passport.use('login', new LocalStrategy((username, password, done) => {

    const user = usuarios.find(usuario => usuario.username == username)

    if (!user) {
        return done(null, false)
    }

    if (user.password != password) {
        return done(null, false)
    }

    user.contador = 0
    return done(null, user);
}));

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    const usuario = usuarios.find(usuario => usuario.username == username)
    done(null, usuario);
});

routerLog.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://fracaroFederico:fracaroFederico@cluster0.viv6icy.mongodb.net/?retryWrites=true&w=majority',
        mongoOptions: advancedOptions
    }),
    secret: 'shhhhhhhhhhhhhhhhhhhhh',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge:100000}
}))

routerLog.use(passport.initialize());
routerLog.use(passport.session());

routerLog.use(express.json())
routerLog.use(express.urlencoded({ extended: true }))


routerLog.get('/',(req,res)=>{
    if (req.isAuthenticated()) {
        res.redirect('/produc')
    } else {
        res.redirect("/login");
    }
})
routerLog.get('/register',(req,res)=>{
    res.render('register')
})

routerLog.post('/register', passport.authenticate('register', { failureRedirect: '/registerError', successRedirect: '/login' }))

routerLog.get('/registerError',(req,res)=>{
    res.render('registerError')
})

routerLog.get('/produc',(req,res)=>{
    let completeList=api.getAll()
    let user =usuarios.find(usuario => usuario.username == req.user.username)
    res.render("form",{completeList,user})
})

routerLog.post('/produc',(req,res)=>{
    api.save(req.body)
    res.redirect("/produc")
})
routerLog.get('/login',(req,res)=>{
    res.render('index')
})
routerLog.post('/login', passport.authenticate('login', { failureRedirect: '/loginError', successRedirect: '/produc' }))
routerLog.get('/loginError',(req,res)=>{
    res.render('loginError')
})
routerLog.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login')
})

module.exports=routerLog