import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/Users";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVeriEmail";

// sendVerificationEmail
// function POST(request: Request): Promise<Response | undefined>
export async function POST(request: Request) {
    await dbConnect()
    try {
        const { username, email, password } = await request.json()
        // username is there along with verified status
        const existingUserVerifiedByName = await UserModel.findOne({
            username,
            isVerified: true
        })
        if (existingUserVerifiedByName) {
            return Response.json({
                // user is found so no need of registration so success is false
                success: false,
                msg: "username already exists"
            }, { status: 400 })
        }
        // find the new user by email
        const existingUserVerifiedByEMail = await UserModel.findOne({
            email
        })
        const verifyCode = Math.floor(1000000 + Math.random() * 9000000).toString()
        if (existingUserVerifiedByEMail) {
            // two cases...
            // 1st email theke registered achey but email isn't verified
            if (existingUserVerifiedByEMail.isVerified) {
                return Response.json({
                    success: false,
                    msg: "User already exists with this email"
                }, { status: 400 })
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 12);
                existingUserVerifiedByEMail.password = hashedPassword
                existingUserVerifiedByEMail.verifyCode = verifyCode
                existingUserVerifiedByEMail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserVerifiedByEMail.save()
            }
        }
        else {
            // ****1st user so register****
            // 2nd param is the number of salt rounds. The more salt rounds, the more secure the password is,The salt is a randomly generated value that is combined with the password before hashing, making it more difficult for attackers to use precomputed hash tables (rainbow tables) to crack passwords.
            const hashedPassword = await bcrypt.hash(password, 12);
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMsgs: true,
                msg: []
            })
            await newUser.save()
        }
        // send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                msg: emailResponse.msg
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            msg: "User Registered successfully.please verify your email"
        }, { status: 202 })
    } catch (error) {
        console.log("Error registering user " + error);
        return Response.json({
            success: false,
            message: "error registering user"
        }, { status: 505 })
    }
}