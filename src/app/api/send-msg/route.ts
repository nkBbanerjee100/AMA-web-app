import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/Users";
import { Message } from "@/model/Users";

export async function POST(req: Request) {
    await dbConnect();
    const { username, content } = await req.json();
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return Response.json({
                success: false,
                msg: "User Not Found"
            }, { status: 404 })
        }
        if (!user.isAcceptingMsgs) {
            return Response.json({
                success: false,
                msg: "User Not accepting msgs"
            }, { status: 403 })
        }
        const newMsg = { content, createdAt: new Date() };
        user.msg.push(newMsg as Message);
        await user.save()
        return Response.json({
            success: true,
            msg: "Msg sent successfully"
        }, { status: 200 })
    } catch (error) {
        console.error("Error occured", error)
        return Response.json({
            success: false,
            msg: "error Occured while sending msgs"
        }, { status: 500 })
    }
}