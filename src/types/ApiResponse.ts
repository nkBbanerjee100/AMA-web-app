import { Message } from "@/model/Users";
// whenevr i'm defining types most of the time interfaces are there
export interface ApiResponse {
    success: boolean;
    msg: string;
    // i make it optional as everytime this is not required as e.g at the time of signUp
    isAcceptingMsgs?: boolean;
    messages?: Array<Message>
};