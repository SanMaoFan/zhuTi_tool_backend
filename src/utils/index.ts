import type e = require("express")

const crypto = require("node:crypto")

/**
 * 
 * @param res express 的 Response 对象
 * @param param1 包含返回的状态以及返回对象数据
 * @param err mysql 的错误对象
 * @param data mysql 的数据对象
 * @returns 
 */
// mysql 统一处理错误
function mysqlCallback(
    res: e.Response,
    callback: () =>void,
    err: Error) {
    if (err) {
        // console.log('数据错误:', err.message)
        return res.status(200).json({ message: err.message, status: 500, data: null })
    }
    callback?.()
}


module.exports = {
    // 生成 hash
    getHash: () => crypto.randomUUID({ disableEntropyCache: true }),
    mysqlCallback
}