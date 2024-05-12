import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/model/Users";
import mongoose from "mongoose"
import { log } from "console";

export async function GET(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    log("session is ", session)
    const user = await session?.user;
    log("user is ", user)
    if (!session || !user) {
        return Response.json({
            success: false,
            msg: "Not Authenticated"
        }, { status: 401 })
    }
    // for aggregation pipeline the same old coding style will not be applicable i.e., const userId = user._id;
    const userId = new mongoose.Types.ObjectId(user.id);

    try {
        // i want all the msgs to come here
        // I have to make a lot of users...so I make users by using Aggregation Pipeline
        const users = await UserModel.aggregate([
            { $match: { id: userId } }, // first pipeline
            // unwinding the arrays
            { $unwind: '$msg' }, // 2nd pipeline
            { $sort: { 'msg.createdAt': -1 } }, // descending order sorting //3rd pipeline
            { $group: { _id: '$_id', msg: { $push: '$msg' } } } // grouping
        ])
        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                msg: "User not found",
            }, { status: 401 })
        }
        return Response.json({
            success: true,
            msg: user[0].msg,
        }, { status: 200 })
    } catch (error) {
        console.error("Unexpected Error Occured", error)
        return Response.json({
            success: false,
            msg: "Unexpected Error!!!while getting msgs",
        }, { status: 500 })
    }
}