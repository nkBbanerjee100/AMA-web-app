"use client"
import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/Users';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
// import { User } from '@/model/Users';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acptMsgsSchema } from '@/schemas/acptMsgSchema';

const Page = () => {
    // handling messages 
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);

    const { toast } = useToast();

    // optimistic UI
    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId))
    }
    // const { session } = useSession();
    const { data: session } = useSession();

    console.log("session is", session);

    const form = useForm({
        resolver: zodResolver(acptMsgsSchema)
    })

    const { register, watch, setValue } = form;

    // when pass nothing as argument, you are watching everything
    const acceptMsgs = watch("acceptMsgs")

    // will return a memoized version of the callback that only changes if one of the inputs has changed.
    const fetchAcptMsg = useCallback(async () => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>('/api/accept-msgs');
            setValue('acceptMsgs', response.data.isAcceptingMsgs);

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description: axiosError.response?.data.msg || "Failed to fetch msg settings",
                variant: "destructive"
            })
        }
        finally {
            setIsSwitchLoading(false)
        }
    }, [setValue]);

    // fetching the msgs
    const fetchMsgs = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true);
        setIsSwitchLoading(false);
        try {
            const response = await axios.get<ApiResponse>('/api/get-msgs');
            setMessages(response.data?.messages || [])
            if (refresh) {
                toast({
                    title: "Refreshed Feed",
                    description: 'Latest Msgs',
                })
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description: axiosError.response?.data.msg || "Failed to fetch msg settings",
                variant: "destructive"
            })
        }
        finally {
            setIsLoading(false)
            setIsSwitchLoading(false)
        }
    }, [setIsLoading, setMessages])


    useEffect(() => {
        if (!session || !session.user) return;
        fetchMsgs()
        fetchAcptMsg()
    }, [session, setValue, fetchAcptMsg, fetchMsgs])

    // handle the switch change
    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>("/api/accept-msgs", {
                acceptMsgs: !acceptMsgs
            })
            setValue("acceptMsgs", !acceptMsgs);
            toast({
                title: response.data.msg,
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description: axiosError.response?.data.msg || "Failed to fetch msg settings",
                variant: "destructive"
            })
        }
    }

    const username = session?.user as User;
    // find the baseURL
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    // profile URL
    const profileUrl = `${baseUrl}/u/${username}`
    if (!session || !session.user) {
        return <div>Please Log In First</div>
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);
        toast({
            title: 'URL Copied!',
            description: 'Profile URL has been copied to clipboard.',
        });
    };


    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...register('acceptMsgs')}
                    checked={acceptMsgs}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMsgs ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />

            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMsgs(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MessageCard
                            key={message.content}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    )
}

export default Page
