import type e = require("express")

// 引入路由模块
const userRouter = require("./user")
const typeRouter = require("./type")
const productRouter = require("./product")


module.exports = function (app: e.Express) {
    app.use('/api/v1/user', userRouter)
    app.use('/api/v1/type', typeRouter)
    app.use('/api/v1/product', productRouter)
}

