import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/Users";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";

// when typing  in the search bar, it will call this function
const UserNameQuerySchema = z.object({
    username: userNameValidation
})

export async function GET(req: Request) {
    await dbConnect();

    try {
        // extracting the searchParams from URL
        const { searchParams } = new URL(req.url);
        // get() is a special method which is used to extract username from the URI
        const queryParam = {
            username: searchParams.get("username"),
        }
        // validation using zod so use safeParse()
        const result = UserNameQuerySchema.safeParse(queryParam)
        console.log(result);
        if (!result.success) {
            // result.error.format().username?._errors <- special ts type for defining errors
            const userNameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                msg: userNameErrors?.length > 0 ? userNameErrors.join(",") : "invalid query params"
            }, { status: 404 })
        }
        const { username } = result.data;
        const existingVerifiedUser = await UserModel.findOne({
            username, isVerified: true
        });
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                msg: "username is already taken "
            }, { status: 400 })
        }
        return Response.json({
            success: true,
            msg: "username is unique"
        })
    } catch (error) {
        console.error("erorr checking username", error)
        return Response.json({
            success: false,
            msg: "error checking username"
        }, { status: 500 })
    }
}