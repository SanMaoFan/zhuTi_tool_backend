// 访问 mysql 的模板

interface MySqlObjData {
    host: string
    user: string
    password: string
    database: string
    port: number
}

const connection: { mysql: MySqlObjData } = {
    mysql: {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "",
        database: "zhuti_tool_database"
    }
}


module.exports = connection