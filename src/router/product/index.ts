import type e = require("express")
import type nodeSqlite = require("node:sqlite")
// express
const express = require("express")
const router = express.Router()

// mysql
const mysql = require("@db/connect/db")

// utils
const { getHash: hashUtils, mysqlCallback } = require("@utils/index")



interface TypeParamsInterface {
    page: number
    pageNo: number
    productId: string
    productName: string
    startDate: string
    endDate: string
    parentId: string
    isDel: number
    date: boolean | string
}


// 要获取的列名
const columnList = ["product_id AS productId", "product_name AS productName", "create_date AS createDate", "product_descript AS productDescript", "parent_id AS parentId", "is_del AS isDel"]

// 分页
router.post('/', async (req: e.Request, res: e.Response) => {
    try {
        req.routerMatched = true
        const { page = 1, pageNo = 10, productId,
            productName,
            startDate,
            endDate,
            parentId,
            isDel = 0 }: Partial<TypeParamsInterface> = req.body || {}

        let newStartDate, newEndDate
        // 判断 开始日期 与 结束日期 是否有成对
        if ((startDate && !endDate) || (!startDate && endDate)) {
            return res.status(200).json({
                message: "开始日期 startDate 必须与结束日期 endDate 一起存在！",
                status: 500
            })
        } else {
            newStartDate = new Date(startDate as string).toLocaleString('zh')
            newEndDate = new Date(endDate as string).toLocaleString('zh')
        }

        const objParams: { [key: string]: string | number | undefined | boolean } = {
            productId,
            productName,
            parentId,
            date: true,
            isDel
        }
        const objCondition: { [key: string]: string } = {
            productId: `product_id = "${productId}"`,
            productName: `product_Name LIKE "%${productName}%"`,
            date: `(create_date BETWEEN "${newStartDate}" AND "${newEndDate}")`,
            parentId: `parent_id = "${parentId}"`,
            isDel: `is_del = ${isDel}`
        }

        // 组合条件
        const queryList: string[] = []
        for (const i in objParams) {
            if (i === "date") {
                if (startDate && endDate) {
                    queryList.push(objCondition.date as string)
                }
            } else if (undefined !== objParams[i]) {
                queryList.push(objCondition[i] as string)
            }
        }
        const sql = `SELECT ${columnList.join(',')}, (SELECT COUNT(*) FROM product_table WHERE ${queryList.join(' AND ')}) AS total FROM  product_table WHERE ${queryList.join(' AND ')} ORDER BY create_date DESC LIMIT ?, ?;`
        const [result] = await mysql.query(sql, [page as number - 1, pageNo])

        if (result) {
            let total = 0
            const newData = result.map(item => {
                total = item.total
                delete item.totoal
                return item
            })
            return res.status(200).json({
                message: 'success！',
                status: 200,
                data: {
                    list: newData,
                    curPage: page,
                    count: newData.length,
                    total
                }
            })
        } else {
            return res.status(200).json({
                message: '数据库获取数据不正常',
                status: 500
            })
        }
    } catch (e) {
        mysqlCallback(res, () => { }, e)
        throw e
    }
})

// 新增
router.post('/add', async (req: e.Request, res: e.Response) => {
        req.routerMatched = true
    try {
        const { name, parentId, descript } = req.body || {}
        const uuid = hashUtils()
        const newName = name?.trim(), newId = parentId?.trim(), newDescript = descript?.trim()
        if (!newName || !newId) {
            return res.status(200).json({
                message: '名称 name 以及父 id 不能为空！',
                status: 500
            })
        }
        const sql = `INSERT INTO product_table (product_id, product_name, product_descript, parent_id) VALUES (?, ?, ?, ?);`
        const [result] = await mysql.query(sql, [uuid, newName, newDescript ? newDescript : null, newId])
        if (result) {
            return res.status(200).json({
                message: 'success！',
                status: 200,
            })
        } else {
            return res.status(200).json({
                message: '数据库获取数据不正常',
                status: 500
            })
        }
    } catch (e) {
        mysqlCallback(res, () => { }, e)
        throw e
    }
})

// 更改
router.put("/:id", async (req: e.Request, res: e.Response) => {
        req.routerMatched = true
    try {
        const { id } = req.params
        const { name, descript, parentId } = req.body || {}
        const newName = name?.trim(), newDescript = descript?.trim(), newParentId = parentId?.trim(), newId = id?.trim()

        if (!newName || !newId || !newParentId) {
            return res.status(200).json({
                message: '商品 id 、名称 name 以及父 id 不能为空！',
                status: 500
            })
        }
        const sql = `UPDATE product_table SET product_name = ?, product_descript = ?, parent_id = ? WHERE product_id = ?;`
        const [result] = await mysql.query(sql, [newName, newDescript ? newDescript : null, newParentId, newId])
        if (result) {
            return res.status(200).json({
                message: 'success！',
                status: 200
            })
        } else {
            return res.status(200).json({
                message: '数据库获取数据不正常',
                status: 500
            })
        }
    } catch (e) {
        mysqlCallback(res, () => { }, e)
        throw e
    }
})

// 详情
router.get('/:id', async (req: e.Request, res: e.Response) => {
        req.routerMatched = true
    try {
        const { id } = req.params
        const newId = id?.trim()
        if (!newId) {
            return res.status(200).json({
                message: "id 参数不能为空！",
                status: 500
            })
        }
        const newColumnList = columnList.map(item => {
            return 'p.' + item
        })
        const sql = `SELECT t.type_name AS parentName, ${newColumnList.join(',')}
        FROM product_table p
        JOIN 
        type_table AS t
        ON p.parent_id = t.type_id
        WHERE p.product_id = ?;`

        const [result] = await mysql.query(sql, [newId])
        if (result) {
            return res.status(200).json({
                message: "success！",
                status: 200,
                data: { ...result[0] }
            })
        } else {
            return res.status(200).json({
                message: '数据库获取数据不正常',
                status: 500
            })
        }
    } catch (e) {
        mysqlCallback(res, () => { }, e)
        throw e
    }

})


// 删除
router.delete('/:id', async (req: e.Request, res: e.Response) => {
        req.routerMatched = true
    try {
        const { id } = req.params
        const newId = id?.trim()
        if (!newId) {
            return res.status(200).json({
                message: '缺少 id 参数！',
                status: 500,
            })
        }

        const sql = `UPDATE product_table SET is_del = 1 WHERE product_id = ?`

        const [result] = await mysql.query(sql, [newId])
        if (result) {
            return res.status(200).json({
                message: "success！",
                status: 200
            })
        } else {
            return res.status(200).json({
                message: '数据库获取数据不正常',
                status: 500
            })
        }
    } catch (e) {
        mysqlCallback(res, () => { }, e)
        throw e
    }

})




module.exports = router