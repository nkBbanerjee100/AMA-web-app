import "next-auth";

declare module "next-auth" {
    // now i can play with all the modules that are being imported from next-auth
    // now i'm modifying the User Interface,,,If I don't do this then inside options.ts the user._id will always show an error
    interface User {
        _id?: string;
        isVerified?: boolean;
        isAcceptingMsgs?: boolean;
        username?: string;
    }
    interface Session {
        user: {
            _id?: string;
            isVerified?: boolean;
            isAcceptingMsgs?: boolean;
            username?: string;
        } & DefaultSession['user'] // this line depicts that there will always be a key named user inside session
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        _id?: string;
        isVerified?: boolean;
        isAcceptingMsgs?: boolean;
        username?: string;
    }
}                                                           