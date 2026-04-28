const mongoose = require('mongoose');

const uri = "mongodb://mrpmai7647_db_user:J95T0V9IzlNmdoKS@ac-nzmr10j-shard-00-00.txdnov7.mongodb.net:27017,ac-nzmr10j-shard-00-01.txdnov7.mongodb.net:27017,ac-nzmr10j-shard-00-02.txdnov7.mongodb.net:27017/digital_atelier?ssl=true&replicaSet=atlas-nzmr10j-shard-0&authSource=admin&retryWrites=true&w=majority";

async function test() {
  console.log("Connecting...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

test();
