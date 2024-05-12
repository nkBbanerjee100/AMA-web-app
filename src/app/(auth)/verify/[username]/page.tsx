'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '@/schemas/verifySchema';

const VerifyAccount = () => {
    const router = useRouter();
    const params = useParams<{ username: string }>();
    const { toast } = useToast()

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
        // defaultValues: {
        //     code: '',
        // },
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            // as verify-code/ er under eo POST method i chiloh
            const response = await axios.post(`/api/verify-code`, {
                username: params.username,
                code: data.code
            });

            toast({
                title: "Success",
                description: response.data.msg
            })
            router.replace("/sign-in")
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.msg || "An unexpected error occurred."
            toast({
                title: "Signup Failed",
                description: errorMessage,
                variant: "destructive" // side e red color e details ashbe
            })
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Please Verify Your Account
                    </h1>
                    <p className="mb-4">Enter the Verification Code</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="enter the verification code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default VerifyAccount
