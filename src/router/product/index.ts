import type e = require("express")
// express
const express = require("express")
const router = express.Router()

// mysql
const mysql = require("@db/connect/db")

// utils
const { getHash: hashUtils, mysqlCallback } = require("@utils/index")


// 要获取的列名
const columnList = ["product_id AS productId", "product_name AS productName", "create_date AS createDate", "product_descript AS productDescript", "parent_id AS parentId", "is_del AS isDel"]

// 分页
router.post('/', (req: e.Request, res: e.Response) => {
    const { page = 1, pageNo = 10 } = req.body || {}
// 分页逻辑


    const sql = `SELECT ${columnList.join(',')} FROM  product_table WHERE is_del = 0 LIMIT ${page as number - 1}, ${pageNo}`
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
    const { name, parentId, descript } = req.body || {}
    const uuid = hashUtils()
    const newName = name?.trim(), newId = parentId?.trim(), newDescript = descript?.trim()
    if (!newName || !newId) {
        return res.status(200).json({
            message: '名称 name 以及父 id 不能为空！',
            status: 500
        })
    }
    const sql = `INSERT INTO product_table (product_id, product_name, product_descript, parent_id) VALUES ("${uuid}", "${newName}", ${newDescript ? ('"' + newDescript + '"') : null}, "${newId}");`
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
    const { name, descript, parentId } = req.body || {}
    const newName = name?.trim, newDescript = descript.trim(), newParentId = parentId?.trim(), newId = id?.trim()

    if (!newName || !newId || !newParentId) {
        return res.status(200).json({
            message: '商品 id 、名称 name 以及父 id 不能为空！',
            status: 500
        })
    }
    const sql = `UPDATE product_table SET product_name = "${newName}", product_descript = "${newDescript}", parent_id = "${newParentId}" WHERE product_id = "${newId}";`

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
    const sql = `SELECT ${columnList.join(',')} FROM product_id WHERE product_id = "${newId}"`
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
    const sql = `UPDATE product_table SET is_del = 1 WHERE product_id = "${newId}"`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        return res.status(200).json({
            message: "success！",
            status: 200
        })
    }, err))
})




module.exports = router