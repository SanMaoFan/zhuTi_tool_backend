const mysql = require("mysql")
const connectionConfig = require("./mysql")

// 创建连接
const connection = mysql.createPool({
    ...connectionConfig.mysql
})

// 连接监听--创建连接时才可用，连接池时不能用
// connection.connect((err: Error) => {
//     if(err){
//         console.log('连接错误：', err)
//         return
//     }
//     console.log('数据库连接成功！');
// })

module.exports =  connection