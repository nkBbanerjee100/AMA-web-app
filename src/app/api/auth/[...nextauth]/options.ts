import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/Users";
import dbConnect from "@/lib/dbConnect";



export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "nkBanerjee@gmail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any, req): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })
                    if (!user) {
                        throw new Error("No user found")
                    }
                    if (!user.isVerified) {
                        throw new Error("please verify your account  first")
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        return user;
                    }
                    else {
                        throw new Error("please enter correct pasword")
                    }
                } catch (error: any) {
                    throw new Error(error);
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMsgs = user.isAcceptingMsgs;
                token.username = user.username;
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMsgs = token.isAcceptingMsgs;
                session.user.username = token.username;
            }
            return session;
        },
    },
    pages: {
        signIn: '/sign-in',
    },
    session: {
        // those who have the jwt token only they can register
        strategy: 'jwt'
    },
    secret: process.env.NEXT_AUTH_SECRET_KEY,

}