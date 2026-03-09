const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    
    // This tells you EXACTLY which database you're connected to
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`✅ Database Name: ${conn.connection.name}`)  // ← add this

  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB