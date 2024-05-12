import mongoose from "mongoose";

type ConnectionObject = {
    // isConnected? meaning fconnection may be there or may not be...if exists then it returns a number
    isConnected?: number
}

// the type of connection is ConnectionObject and because i've given the qstn mark so i can initialize it as empty object else i cannot do it...i did it so that i can use the name connection from now.
const connection: ConnectionObject = {};

// Promise<void> meaning it is not concerned with what type of value it is returning...
async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("database already connected");
        return;
    }
    try {
        const cnct = await mongoose.connect(process.env.MONGODB_URI || '', {})
        connection.isConnected = cnct.connections[0].readyState; // number
        console.log(`Database Connected Successfully at ${cnct.connection.host}`);
    } catch (error) {
        console.log("error", error);
        process.exit(1);

    }
}


export default dbConnect