import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse"; // this line is required bcz i'm working with ts so type safety is much needed

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Mystry Message | Verification code',
            react: VerificationEmail({ username, otp: verifyCode })
        });
        return { success: true, msg: "verification email sent successfully" }

    } catch (emailError) {
        console.error("Error sending verification Email");
        return { success: false, msg: "Failed to send verification email" }
    }
}