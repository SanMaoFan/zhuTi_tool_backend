// 类型路由模块
import type e = require("express")

// express router
const express = require("express")
const router = express.Router()

// mysql
const mysql = require("@db/connect/db")

// utils
const { getHash: hashUtils, mysqlCallback } = require('@utils/index')


interface TypeColumnInterface {
    typeId: string
    typeName: string
    createDate: string
    typeDescript: string
    isDel: string
    page: number
    pageNo: number
    date: boolean | string
}

// 要获取的列
const columnList = ['type_id AS typeId', "type_name AS typeName", "create_date AS createDate", "type_descript AS typeDescript", "is_del AS isDel"]

// 获取分页
router.post('/', (req: e.Request, res: e.Response) => {
    // 获取分页和条数参数
    const { page = 1, pageNo = 10, typeId,
        typeName,
        startDate,
        endDate,
        isDel = 0 } = req.body || {}
    // 判断 开始日期 与 结束日期 是否有成对
    if ((startDate && !endDate) || (!startDate && endDate)) {
        return res.status(200).json({
            message: "开始日期 startDate 必须与结束日期 endDate 一起存在！",
            status: 500
        })
    }
    const objParams: { [key: string]: string | number | boolean | undefined } = {
        typeId,
        typeName,
        isDel,
        date: true
    }

    const objCondition: { [key: string]: string } = {
        typeId: `type_id = "${typeId}"`,
        typeName: `type_name LIKE "%${typeName}%"`,
        isDel: `is_del = ${isDel}`,
        date: `BETWEEN "${startDate}" AND "${endDate}"`
    }

    const conditionList: string[] = []

    for (const i in objParams) {
        if ('date' === i) {
            if (startDate && endDate) {
                conditionList.push(objCondition[i] as string)
            }
        } else if (undefined !== objParams[i]) {
            conditionList.push(objCondition[i] as string)
        }
    }

    const columnStr = columnList.join(',')
    const sql = `SELECT ${columnStr} FROM type_table WHERE ${conditionList.join(" AND ")} LIMIT ${(page as number) - 1},${pageNo};`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        res.status(200).send({ message: 'success', status: 200, data: { list: data, curPage: page, pageNo } })
    }, err)
    )
})


// 新增
router.post('/add', (req: e.Request, res: e.Response) => {
    const { name, descript } = req.body || {}
    const newName = name?.trim()
    const newDescript = descript?.trim()
    if (!newName) {
        return res.status(200).json({
            message: 'name 参数需要传入值！',
            status: 500,
        })
    }
    // 数据库新增数据
    const uuid = hashUtils()
    const sql = `INSERT INTO type_table (type_id, type_name, type_descript) VALUES ("${uuid}", "${newName}", ${newDescript ? ('"' + newDescript + '"') : null})`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        res.status(200).json({
            message: 'success！',
            status: 200,
        })
    }, err)
    )
})

// 获取详情
router.get('/:id', (req: e.Request, res: e.Response) => {
    const { id } = req.params
    if (!id) {
        return res.status(200).json({
            message: "缺少查询的 id！",
            status: 500,
        })
    }

    const sql = `SELECT ${columnList.join(',')}  FROM type_table WHERE type_id = "${id}"`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        res.status(200).json({
            message: "success！",
            status: 200,
            data: data[0]
        })
    }, err))
})

// 更改
router.put('/:id', (req: e.Request, res: e.Response) => {
    const { id } = req.params
    const { name, descript } = req.body || {}
    const newName = name?.trim()
    const newDescript = descript?.trim()
    if (!newName) {
        return res.status(200).json({
            message: 'name 参数不能为空！',
            status: 500,
        })
    }
    const sql = `UPDATE type_table SET type_name = "${name}", type_descript = ${newDescript ? ('"' + newDescript + '"') : null} WHERE type_id = "${id}"`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        res.status(200).json({
            message: 'success！',
            status: 200,
        })
    }, err)
    )
})

// 删除--逻辑删除
router.delete('/:id', (req: e.Request, res: e.Response) => {
    const { id } = req.params
    const newId = id?.trim()
    if (!newId) {
        return res.status(200).json({
            message: '缺少 id 参数！',
            status: 500,
        })
    }
    const sql = `UPDATE type_table SET is_del = 1 WHERE type_id = "${newId}"`
    mysql.query(sql, (err: Error, data: any) => mysqlCallback(res, () => {
        res.status(200).json({
            message: 'success！',
            status: 200
        })
    }, err))
})



module.exports = router