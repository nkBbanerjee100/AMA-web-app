'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
// useDebounceValue -> checks whenever user types its name simultaneously checking for the uniqueness
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
const Page = () => {
    const [username, setUsername] = useState('');
    const [usernameMsg, setUsernameMsg] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debounced = useDebounceCallback(setUsername, 300);
    const { toast } = useToast()
    const router = useRouter()

    //zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        },
    })

    useEffect(() => {
        const checkUserNameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true)
                setUsernameMsg("")
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    let message = response.data.msg;
                    setUsernameMsg(message)
                } catch (error) {
                    // handling axios error
                    const axiosError = error as AxiosError<ApiResponse>;
                    let msg = axiosError.response?.data.msg?.toLocaleString();
                    setUsernameMsg(msg ?? "Error checking username")
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }
        checkUserNameUnique()
    }, [username])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>(`/api/signUp`, data)

            toast({
                title: 'Success',
                description: response.data.msg?.toLocaleString(),
            })
            router.replace(`/verify/${username}`)
        } catch (error) {
            console.log("error is ", error);
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.msg?.toLocaleString() || "An unexpected error occurred."
            toast({
                title: "Signup Failed",
                description: errorMessage,
                variant: "destructive" // side e red color e details ashbe
            })
        }
        finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join Mystry Message
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>
                {/* this {...form is coming from form at line 27} */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter username" {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                debounced(e.target.value)
                                            }} />

                                    </FormControl>
                                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                                    {!isCheckingUsername && usernameMsg && (
                                        <p
                                            className={`text-sm ${usernameMsg === 'username is unique'
                                                ? 'text-green-500'
                                                : 'text-red-500'
                                                }`}
                                        >
                                            {usernameMsg}
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                                    </>
                                ) : ("SignUp")
                            }
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>Already a member?{''}
                        <Link href="/sign-in" className="text-blue-500 hover:text-blue-1000">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Page
