import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        // Extract the `prompt` from the body of the request
        const { prompt } = await req.json();

        // Ask OpenAI for a streaming completion given the prompt
        const response = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            max_tokens: 2000,
            stream: true,
            prompt,
        });

        // Convert the response into a friendly text-stream
        const stream = OpenAIStream(response);

        // Respond with the stream
        return new StreamingTextResponse(stream);
    }
    catch (error) {
        if (error instanceof OpenAI.APIError) {
            const { name, status, headers, message } = error;
            return NextResponse.json({ name, status, headers, message }, { status });
        } else {
            console.error('An unexpected error occurred:', error);
            throw error;
        }
    }
}