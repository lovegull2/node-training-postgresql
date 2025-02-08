const { DataSource, EntitySchema } = require("typeorm")

const dbEntityName_CreditPackage = 'CreditPackage';
const dbEntityName_Skill = 'Skill';

/** 組合包 */
const CreditPackage = new EntitySchema({
    name: dbEntityName_CreditPackage,
    tableName: "CREDIT_PACKAGE",
    columns: {
        id: {
            primary: true, // 主鍵
            type: "uuid",
            generated: "uuid", // 自動產生
            nullable: false // 不能為 null
        },
        name: {
            type: "varchar",
            length: 50,
            nullable: false,
            unique: true // 唯一
        },
        credit_amount: {
            type: "integer",
            nullable: false
        },
        price: {
            type: "numeric",
            precision: 10,
            scale: 2, // 小數點
            nullable: false
        },
        createdAt: {
            type: "timestamp",
            createDate: true, // 建立時間
            name: "created_at",
            nullable: false
        }
    }
})

/** 技能 */
const Skill = new EntitySchema({
    name: dbEntityName_Skill,
    tableName: "SKILL",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
            nullable: false
        },
        name: {
            type: "varchar",
            length: 50,
            nullable: false,
            unique: true
        },
        createdAt: {
            type: "timestamp",
            createDate: true,
            name: "created_at",
            nullable: false
        }
    }
})

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "test",
    database: process.env.DB_DATABASE || "test",
    entities: [CreditPackage, Skill],
    synchronize: true
})


// 透過 entities 陣列將所有 EntitySchema 加入。

// 啟動時 TypeORM 會根據這些設定自動建立或更新表結構（若 synchronize: true）。

// 之後就能使用 AppDataSource.getRepository("CreditPackage") 或 AppDataSource.getRepository("Skill") 進行 CRUD。

module.exports = {
    AppDataSource,
    dbEntityName_CreditPackage,
    dbEntityName_Skill
}