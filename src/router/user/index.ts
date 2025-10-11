import type e = require("express")
// express
const express = require("express")
const router = express.Router()

// mysql
const mysql = require("@db/connect/db")

// utils
const { getHash: hashUtils, mysqlCallback } = require("@utils/index")


// 要获取的列名
const columnList = ["user_id AS userId", "user_name AS userName", "user_phone AS userPhone", "create_date AS createDate", "is_del AS isDel"]

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
router.post('/add', (req: e.Request, res: e.Response) => {
    const { name, phone } = req.body || {}
    const uuid = hashUtils()
    const newName = name?.trim(), newPhone = phone?.trim()
    if (!newName || !newPhone) {
        return res.status(200).json({
            message: '名称 name 以及手机号 phone 不能为空！',
            status: 500
        })
    }
    const sql = `INSERT INTO user_table (user_id, user_name, user_phone) VALUES ("${uuid}", "${newName}",  "${newPhone}");`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        return res.status(200).json({
            message: 'success！',
            status: 200,
        })
    }, err))
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
    const sql = `UPDATE user_table SET user_name = "${newName}", user_phone = "${newPhone}" WHERE user_id = "${newId}";`

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