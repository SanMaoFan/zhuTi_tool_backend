import type NextFunction = require("express");
import type e = require("express")

require('dotenv').config()

const express = require("express")
const app = express()

const { expressjwt: expressJWT } = require('express-jwt');



// 解析请求的 json 格式
app.use(express.json())

// 路由模块
const routerModule = require("@router/router")


// 设置路由是否响应，为了拦截路由 404 
app.use((req: e.Request, res: e.Response, next: e.NextFunction) => {
    req.routerMatched = false
    next()
})

// 校验 token
app.use(expressJWT({
    secret: process.env.SECRET_KEY, // 用刚才的密钥验Token
    algorithms: [process.env.ALGORITHM], // 用刚才的加密方法
    //   获取 token
    getToken(req: e.Request, res: e.Response) {
        const isBearer = req.headers.authorization?.split(" ")[0] === 'Bearer'
        if (req.headers.authorization && isBearer) {
            const [, token] = req.headers.authorization.split(" ")
            return token
        } else {
            return null
        }
    },
    //   token 过期处理
    onExpired: async (req: e.Request, err) => {
        if (new Date() - err.inner.expiredAt < 50000) { return }
        throw err
    }
}).unless({
    path: [
        '/api/v1/user/login', // 排除/login接口，不用验Token
    ]
}));


// 路由初始化
routerModule(app)

//  放置 express-jwt 错误处理中间件（必须在路由之后）
app.use((err: Error, req: e.Request, res: e.Response, next: e.NextFunction) => {
    console.log('报错了:', err)
    // 404 错误处理（路由未匹配）
    console.log('dangqian luyou', req.routerMatched)
    if (!req.routerMatched) {
        return res.status(404).json({ error: `找不到请求的路径: ${req.method} ${req.originalUrl}` });
    }
    if (err.name === 'UnauthorizedError') {
        // 处理 token 无效/过期的情况
        return res.status(401).send('invalid token 或 token 已过期');
    } else {
        // 其他错误交给下一个错误处理中间件
        next(err);
    }
});

// 其他通用错误处理中间件（可选）
app.use((err: Error, req: e.Request, res: e.Response, next: e.NextFunction) => {
    try {
        console.error(err.stack);
        res.status(500).send('服务器内部错误');
    } catch (e) {
        console.log('拦截错误', err.message)
    }
});


app.listen(8888, () => console.log('服务已启动，端口为 8888'))