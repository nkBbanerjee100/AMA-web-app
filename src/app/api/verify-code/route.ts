import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/Users";
import { userNameValidation } from "@/schemas/signUpSchema";

export async function POST(req: Request) {
    await dbConnect();
    try {
        // req.json() returns a lot of values out of those I'm extracting only username and the code
        const { username, code } = await req.json();
        // decodeURIComponent() is a func which is used to decode the URIs 
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return Response.json({
                success: false,
                msg: "User not found"
            }, { status: 500 })
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()
            return Response.json({
                success: true,
                msg: "User Verified Successfully"
            }, { status: 200 })
        }
        else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                msg: "Code has expired,,,do get a new code by signUp"
            }, { status: 400 })
        }
        else {
            return Response.json({
                success: false,
                msg: "Incorrect verification Code"
            }, { status: 400 })
        }
    } catch (error) {
        console.error("error verifying user", error)
        return Response.json({
            success: false,
            msg: "error verifying user"
        }, { status: 500 })
    }
}