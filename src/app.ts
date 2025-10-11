import type e = require("express")

const express = require("express")
const app = express()


// 解析请求的 json 格式
app.use(express.json())

// 路由模块
const routerModule = require("@router/router")

routerModule(app)


// 路由 404 处理
// app.all('*', (req: e.Request, res: e.Response) => {
//     res.status(200).send({
//         message: '接口 404，请确认接口是否正确',
//         status: 404
//     })
// })


app.listen(8888, () => console.log('服务已启动，端口为 8888'))