import type e = require("express")
// express
const express = require("express")
const router = express.Router()
const jwt = require('jsonwebtoken');


// mysql
const mysql = require("@db/connect/db")

// utils
const { getHash: hashUtils, mysqlCallback } = require("@utils/index")




// 要获取的列名
const columnList = ["user_id AS userId", "user_name AS userName", "user_phone AS userPhone", "create_date AS createDate", "is_del AS isDel"]



// 登录
router.post('/login', async (req: e.Request, res: e.Response) => {

    try {
        const { userPhone, userPwd } = req.body || {}
        const newUserPhone = userPhone?.trim()
        const newUserPwd = userPwd?.trim()
        if (!newUserPhone || !newUserPwd) {
            return res.status(200).json({
                status: 500,
                message: '请传入用户手机号 userPhone 以及密码 userPwd！'
            })
        }
        // 查询user_id
        const queryUserExistSql = `SELECT * FROM user_table WHERE user_phone = ? AND user_pwd = ?`
        const [result, fields] = await mysql.query(queryUserExistSql, [newUserPhone, newUserPwd])

        if (0 === result.length) {
            return res.status(200).json({
                message: '找不到该用户！',
                status: 404
            })
        } else if (result[0].user_pwd === newUserPwd && newUserPhone === result[0].user_phone) {
            const [{ user_id, user_phone }] = result
            const token = jwt.sign(
                // 存用户身份信息（
                { userId: user_id, userPhone: user_phone },
                // 用服务器密钥加密
                process.env.SECRET_KEY,
                // 配置（Token有效期1小时）
                {
                    expiresIn: '24h',
                    algorithm: process.env.ALGORITHM
                }
            );
            if (token) {
                return res.status(200).json({
                    message: '登录成功！',
                    status: 200,
                    data: {
                        userPhone: user_phone,
                        token
                    }
                })
            } else {
                return res.status(200).json({
                    message: 'token 处理错误！',
                    status: 500
                })
            }
        } else {
            // 用户密码不对
            return res.status(200).json({
                status: 500,
                message: '用户账号或者密码不对！'
            })
        }

    } catch (e) {
        console.log('user login error: ', e)
        return res.status(200).json({
            message: '处理错误，请重试！',
            status: 500
        })
    }
})

// 分页
router.post('/', (req: e.Request, res: e.Response) => {
    const { page = 1, pageNo = 10 } = req.body || {}
    const sql = `SELECT ${columnList.join(',')} FROM  user_table WHERE is_del = 0 LIMIT ${page as number - 1}, ${pageNo}`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        return res.status(200).json({
            message: 'success！',
            status: 200,
            data: { list: data, curPage: page, pageNo }
        })
    }, err))
})

// 新增
router.post('/add', async (req: e.Request, res: e.Response) => {
    try {
        const { userPwd, userPhone } = req.body || {}
        const uuid = hashUtils()
        const newPwd = userPwd?.trim(), newPhone = userPhone?.trim()
        if (!newPwd || !newPhone) {
            return res.status(200).json({
                message: '手机号 userPhone 以及密码 userPwd 不能为空！',
                status: 500
            })
        }
        const sql = `INSERT INTO user_table (user_id, user_name, user_pwd, user_phone) VALUES (?, ?, ?, ?);`
        const [result, fields] = await mysql.query(sql, [uuid, userPhone, newPwd, newPhone])
        if (result) {
            return res.status(200).json({
                message: 'success！',
                status: 200,
            })
        } else {
            return res.status(200).json({
                message: '添加用户失败',
                status: 500,
            })
        }
    } catch (e) {
        console.log('user add error: ', e)
        return res.status(200).json({
            message: '处理错误，请重试！',
            status: 500
        })
    }

})

// 更改
router.put("/:id", (req: e.Request, res: e.Response) => {
    const { id } = req.params
    const { name, phone } = req.body || {}
    const newName = name?.trim, newPhone = phone.trim(), newId = id?.trim()

    if (!newName || !newPhone || !newId) {
        return res.status(200).json({
            message: '用户名 name、用户 id 以及手机号 phone 不能为空！',
            status: 500
        })
    }
    const sql = `UPDATE user_table SET user_name = "${newName}", user_phone = "${newPhone}", update_user_id = ? WHERE user_id = "${newId}";`

    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        return res.status(200).json({
            message: 'success！',
            status: 200
        })
    }, err))
})

// 详情
router.get('/:id', (req: e.Request, res: e.Response) => {
    const { id } = req.params
    const newId = id?.trim()
    if (!newId) {
        return res.status(200).json({
            message: "id 参数不能为空！",
            status: 500
        })
    }
    const sql = `SELECT ${columnList.join(',')} FROM user_id WHERE user_id = "${newId}"`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        return res.status(200).json({
            message: "success！",
            status: 200,
            data: data[0]
        })
    }, err))
})


// 删除
router.delete('/:id', (req: e.Request, res: e.Response) => {
    const { id } = req.params
    const newId = id?.trim()
    if (!newId) {
        return res.status(200).json({
            message: '缺少 id 参数！',
            status: 500,
        })
    }
    const sql = `UPDATE user_table SET is_del = 1 WHERE user_id = "${newId}"`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        return res.status(200).json({
            message: "success！",
            status: 200
        })
    }, err))
})




module.exports = router