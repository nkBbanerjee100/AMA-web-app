import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/model/Users";


export async function POST(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    // if any error comes then I need assertion session?.user as User
    const user: User = session?.user as User;
    try {
        if (!session || !session.user) {
            return Response.json({
                success: false,
                msg: "Not Authanticated",
            }, { status: 401 })
        }
        const userId = user._id;
        const { acceptMsgs } = await req.json();
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMsgs: acceptMsgs },
            { new: true }
        )
        if (!updatedUser) {
            return Response.json({
                success: false,
                msg: "Failed to update user status to acpt msgs",
            }, { status: 401 })
        }
        return Response.json({
            success: true,
            msg: "Successfully updated user status to acpt msgs",
            updatedUser
        }, { status: 200 })

    } catch (error) {
        console.error("Failed to update user status to acpt msgs");
        return Response.json({
            success: false,
            msg: "Failed to update user status to acpt msgs",
        }, { status: 500 })
    }
}

export async function GET(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !user) {
        return Response.json({
            success: false,
            msg: "Not Authanticated",
        }, { status: 401 })
    }
    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json({
                success: false,
                msg: "User Not Found!!!",
            }, { status: 404 })
        }
        return Response.json({
            success: true,
            isAcceptingMsgs: foundUser.isAcceptingMsgs
        }, { status: 200 })
    }
    catch (error) {
        console.error("Error in getting msg acptance stts");
        return Response.json({
            success: false,
            msg: "Error in getting msg acptance stts",
        }, { status: 500 })
    }
}