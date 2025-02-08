require('dotenv').config()
const http = require('http')
const { AppDataSource, dbEntityName_CreditPackage, dbEntityName_Skill } = require("./db")

function isUndefined(value) {
    return value === undefined
}

function isNotValidSting(value) {
    return (
        typeof value !== 'string' || value.trim().length === 0 || value === ''
    )
}

function isNotValidInteger(value) {
    return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

const sendResponse = (res, code, data) => {
    const headers = {
        'Access-Control-Allow-Headers':
            'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json',
    }
    res.writeHead(code, headers)

    let status = 'success'
    switch (code) {
        case 400:
        case 409:
            status = 'failed'
            break
        case 500:
            status = 'error'
            break
    }

    const writeData = { status }

    if (code === 200) {
        if (data)
            writeData.data = data
    } else
        writeData.message = data

    res.write(JSON.stringify(writeData))
    res.end()
}

const requestListener = async (req, res) => {
    let body = ''
    req.on('data', (chunk) => {
        body += chunk
    })

    if (req.url === '/api/credit-package' && req.method === 'GET') {
        try {
            const packages = await AppDataSource.getRepository(dbEntityName_CreditPackage).find({
                select: ['id', 'name', 'credit_amount', 'price'],
            })
            sendResponse(res, 200, packages)
        } catch (error) {
            sendResponse(res, 500, '伺服器錯誤')
        }
    } else if (req.url === '/api/credit-package' && req.method === 'POST') {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body)
                if (isUndefined(data.name) || isNotValidSting(data.name) ||
                    isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
                    isUndefined(data.price) || isNotValidInteger(data.price)) {
                    sendResponse(res, 400, '欄位未填寫正確')
                    return
                }

                const creditPackageRepo = await AppDataSource.getRepository(dbEntityName_CreditPackage)
                const existPackage = await creditPackageRepo.find({
                    where: { name: data.name, },
                })

                if (existPackage.length > 0) {
                    sendResponse(res, 409, '資料重複')
                    return
                }

                const newPackage = await creditPackageRepo.create({
                    name: data.name,
                    credit_amount: data.credit_amount,
                    price: data.price,
                })
                const result = await creditPackageRepo.save(newPackage)
                sendResponse(res, 200, result)
            } catch (error) {
                console.error(error)
                sendResponse(res, 500, '伺服器錯誤')
            }
        })
    } else if (req.url.startsWith('/api/credit-package/') && req.method === 'DELETE') {
        try {
            const packageId = req.url.split('/').pop()
            if (isUndefined(packageId) || isNotValidSting(packageId)) {
                sendResponse(res, 400, 'ID錯誤')
                return
            }

            const result = await AppDataSource.getRepository(dbEntityName_CreditPackage).delete(packageId)
            if (result.affected === 0) {
                sendResponse(res, 400, 'ID錯誤')
                return
            }

            sendResponse(res, 200, null)
        } catch (error) {
            console.error(error)
            sendResponse(res, 500, '伺服器錯誤')
        }
    } else if (req.url === '/api/coaches/skill' && req.method === 'GET') {
        try {
            const skills = await AppDataSource.getRepository(dbEntityName_Skill).find({
                select: ['id', 'name'],
            })
            sendResponse(res, 200, skills)
        } catch (error) {
            sendResponse(res, 500, '伺服器錯誤')
        }
    } else if (req.url === '/api/coaches/skill' && req.method === 'POST') {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body)
                if (isUndefined(data.name) || isNotValidSting(data.name)) {
                    sendResponse(res, 400, '欄位未填寫正確')
                    return
                }

                const skillRepo = await AppDataSource.getRepository(dbEntityName_Skill)
                const existSkill = await skillRepo.find({
                    where: { name: data.name, },
                })

                if (existSkill.length > 0) {
                    sendResponse(res, 409, '資料重複')
                    return
                }

                const newSkill = await skillRepo.create({ name: data.name })
                const result = await skillRepo.save(newSkill)
                sendResponse(res, 200, result)
            } catch (error) {
                console.error(error)
                sendResponse(res, 500, '伺服器錯誤')
            }
        })
    } else if (req.url.startsWith('/api/coaches/skill/') && req.method === 'DELETE') {
        try {
            const skillId = req.url.split('/').pop()
            if (isUndefined(skillId) || isNotValidSting(skillId)) {
                sendResponse(res, 400, 'ID錯誤')
                return
            }

            const result = await AppDataSource.getRepository(dbEntityName_Skill).delete(skillId)
            if (result.affected === 0) {
                sendResponse(res, 400, 'ID錯誤')
                return
            }

            sendResponse(res, 200, null)
        } catch (error) {
            console.error(error)
            sendResponse(res, 500, '伺服器錯誤')
        }
    } else if (req.method === 'OPTIONS') {
        sendResponse(res, 200, null)
    } else {
        sendResponse(res, 404, null)
    }
}

const server = http.createServer(requestListener)

async function startServer() {
    await AppDataSource.initialize()
    console.log('資料庫連接成功')
    server.listen(process.env.PORT)
    console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
    return server
}

module.exports = startServer()
