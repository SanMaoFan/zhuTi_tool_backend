const mysql = require("mysql2")
const connectionConfig = require("./mysql")

// 创建连接
const pool = mysql.createPool({
    ...connectionConfig.mysql
})

// 重写 pool.query 方法，只打印关键信息
const originalQuery = pool.query;
pool.query =  function (sql, params) {
  // 1. 打印 SQL 语句（去除多余空格，更整洁）
  const cleanSql = sql.replace(/\s+/g, ' ').trim();
  console.log(`\n[SQL] ${cleanSql}`);

  // 2. 打印参数（如果有的话）
  if (params && params.length > 0) {
    console.log('[Params]', params);
  }

  // 3. 执行原始查询并返回结果
  try {
    const result =  originalQuery.call(this, sql, params);
    // 可选：打印影响行数（ INSERT/UPDATE/DELETE 时有用）
    if (result[0]?.affectedRows !== undefined) {
      console.log(`[影响行数] ${result[0]?.affectedRows}`);
    }
    return result;
  } catch (error) {
    // 错误时打印 SQL 和参数，方便调试
    console.error(`[SQL 错误] ${cleanSql}`);
    console.error(`[错误信息] ${error?.message}`);
    throw error; // 继续抛出错误，不影响业务处理
  }
};

// 连接监听--创建连接时才可用，连接池时不能用
// connection.connect((err: Error) => {
//     if(err){
//         console.log('连接错误：', err)
//         return
//     }
//     console.log('数据库连接成功！');
// })

module.exports =  pool