const express = require('express')
// untuk bisa terhubung dengan mysql
const mysql = require('mysql2')
// untuk mendapatkan data dari body
const bodyParser = require('body-parser')


// untuk mengkoneksikan backend dengan mysql
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'testing'
})
// untuk mengecheck koneksi
connection.connect((err) => {
  if(err){
    console.log(err)
  }else{
    console.log("connection success")
  }
})

const app = express()
app.use(bodyParser.json())

// req / request = menangkap data dari user ke backend
// res / response = respon dari backend ke user

const router = express.Router()
router
.get('/', (req, res) => {
  const result = {
    message: "Success"
  }
  res.json(result)
})
.get('/users', (req, res) => {
  try{
    // query parameter
    const query = req.query
    // search === undefined -> const search = ""
    // search !== undefined -> const search = query.search
    const search = query.search === undefined ? "" : query.search

    // field mana yg mau di sorting
    const field = query.field === undefined ? "id" : query.field
    // keterangan
    // query.field === undefined -> const field = "id"
    // query.field !== undefined -> const field = query.field

    // type sort (ASC/DESC)
    const typeSort = query.sort === undefined ? "ASC" : query.sort
    // keterangan
    // query.sort === undefined -> const typeSort = "ASC"
    // query.sort !== undefined -> const typeSort = query.sort

    const limit = query.limit === undefined ? 10 : query.limit
    const offset = query.page === undefined || query.page == 1 ? 0 : (query.page-1)*limit

    connection.query(`
      SELECT * FROM users 
      WHERE name LIKE "%${search}%" 
      ORDER BY ${field} ${typeSort}
      LIMIT ${limit} OFFSET ${offset}
    `, async (err, result) => {
      if(err){
        console.log(err)
      }else{
        const total = await new Promise((resolve, reject) => {
          connection.query(`SELECT * FROM users`, (err, result) => {
            resolve(result.length)
          })
        })
        const totalPage = Math.ceil(total/limit) // Math.ceil = built in function pembulatan keatas
        // console.log(totalPage)
        const output = {
          data: result,
          totalPage: totalPage,
          search: search,
          limit: limit,
          page: offset
        }
        res.json(output)
      }
    })
  } catch (err) {
    console.log(err)
  }
})
// url parameter
.get('/users/:id', (req, res) => {
  try {
    const id = req.params.id
    connection.query(`SELECT * FROM users WHERE id='${id}'`, (err, result) => {
      if(err){
        console.log(err)
      }else{
        res.json(result) 
      }
    })
  } catch (err) {
    console.log(err)
  }
})
.post('/users', (req, res) => {
  try {
    const body = req.body
    const name = body.name
    const address = body.address
    const email = body.email

    connection.query(`INSERT INTO users (name, address, email) VALUE ('${name}','${address}','${email}')`, (err, result) => {
      if(err){
        console.log(err)
      }else{
        res.json(result) 
      }
    })
  } catch (err) {
    console.log(err)
  }
})
.put('/users/:id', (req, res) => {
  try {
    const id = req.params.id
    const body = req.body
    const name = body.name
    const address = body.address
    const email = body.email
    connection.query(`UPDATE users SET name="${name}", email="${email}", address="${address}" WHERE id='${id}'`, (err, result) => {
      if(err){
        console.log(err)
      }else{
        res.json(result) 
      }
    })
  } catch (err) {
    console.log(err)
  }
})
.delete('/users/:id', (req, res) => {
  try {
    const id = req.params.id
    connection.query(`DELETE FROM users WHERE id='${id}'`, (err, result) => {
      if(err){
        console.log(err)
      }else{
        res.json(result) 
      }
    })
  } catch (err) {
    console.log(err)
  }
})

// app / express menggunakan router
app.use(router)

// express berjalan di port 3000
app.listen(3000, () => {
  console.log("Server running on port 3000")
})