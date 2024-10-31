const mongoose = require('mongoose')

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)

        const connection = mongoose.connection

        connection.on('connected', ()=>{
            console.log("Connected to database on Successfully.")
        })

        connection.on('error', (error)=>{
            console.log("Something is wrong in mongdb ",error)
        })
    } catch (error) {
        console.log("Something is wrong ",error)
    }
}

module.exports = connectDB