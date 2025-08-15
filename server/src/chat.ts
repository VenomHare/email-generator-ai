// import { GoogleGenAI } from "@google/genai";
// import { SystemPrompt } from "./systemMessage.js";

// export interface Message {
//     role: "user" | "assistant" | "system",
//     content: string
// }

// const CONFIG = {
//     model: 'llama-3.1-8b-instant',
//     temperature: 0.7,
//     max_completion_tokens: 2048,
// }


// export class Chat {

//     public id: number;
//     public messages: Message[] = [];
//     private ai = new GoogleGenAI({});

//     constructor(input: string) {
//         this.id = Date.now();
//         this.messages.push({
//             role: "system",
//             content: SystemPrompt
//         });

//         this.addUserReply(input);
//     }

//     public addUserReply(input: string) {
//         this.messages.push({
//             role: "user",
//             content: input
//         })
//     }

//     public addAssitantReply(input: string) {
//         this.messages.push({
//             role: "assistant",
//             content: input
//         })
//     }

//     public async sendRequest() {
//         const params: ChatCompletionCreateParamsNonStreaming = {
//             messages: this.messages,
//             ...CONFIG
//         }
//         console.log(this.messages);

//         const req = await this.client.chat.completions.create(params);
//         const reply = req.choices[0].message.content || "Something went wrong!! Try again!"
//         this.addAssitantReply(reply);

//         return reply;
//     }
// }


interface ExtractedData {
    extractedContent: string[];
    modifiedString: string;
}

export function extractTagData(inputString: string, tagName: string): ExtractedData {
    if (!inputString || !tagName) {
        return {
            extractedContent: [],
            modifiedString: inputString,
        };
    }

    // Construct a regular expression to find the tag and its content.
    // The 'g' flag for global search, 'i' for case-insensitive.
    const tagRegex = new RegExp(`<${tagName}>([^]*?)<\/${tagName}>`, 'gi');
    const extractedContent: string[] = [];

    let match;
    while ((match = tagRegex.exec(inputString)) !== null) {
        // The captured group at index 1 is the content inside the tags.
        extractedContent.push(match[1].trim());
    }

    // Use the same regex to replace all found tags and their content with an empty string.
    const modifiedString = inputString.replace(tagRegex, '').trim();

    return {
        extractedContent,
        modifiedString,
    };
}