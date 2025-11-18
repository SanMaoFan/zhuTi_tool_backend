import type e = require("express")
// const routerListPlugins = require('express-list-endpoints');

// 引入路由模块
const userRouter = require("./user")
const typeRouter = require("./type")
const productRouter = require("./product")


module.exports = async function (app: e.Express) {
    await app.use('/api/v1/user', userRouter)
    await app.use('/api/v1/type', typeRouter)
    await app.use('/api/v1/product', productRouter)
    // 想打印出所有接口，但是失败
    // console.log('??', routerListPlugins(app))   
}

