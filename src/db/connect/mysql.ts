// 访问 mysql 的模板

interface MySqlObjData {
    host: string
    user: string
    password: string
    database: string
    port: number
    waitForConnections: boolean
    connectionLimit: number
    debug: boolean
}

const connection: { mysql: MySqlObjData } = {
    mysql: {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "",
        database: "zhuti_tool_database",
        waitForConnections: true,
        connectionLimit: 10,
        debug: false, // 关键：开启调试模式，自动打印 SQL
    }
}


module.exports = connection