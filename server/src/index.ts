import express from "express";
import dotenv from 'dotenv'
// import { Chat, extractTagData } from "./chat.js";
import cors from "cors";

import z from "zod";
import { Chat, GoogleGenAI } from "@google/genai";
import { SystemPrompt } from "./systemMessage.js";
import { extractTagData } from "./chat.js";

dotenv.config();

interface ChatStorage {
    chat: Chat
    id: number
}

const Chats: ChatStorage[] = []
const ai = new GoogleGenAI({

});

const port = process.env.PORT || 3000;
const app = express();
app.use(cors())
app.use(express.json());
app.use((req, _, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
})
app.post("/create", async (req, res) => {
    try {
        const { success, data } = z.object({
            text: z.string()
        }).safeParse(req.body);

        if (!success) {
            res.status(400).json({
                message: "Invalid Message"
            });
            return;
        }
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: [SystemPrompt]
            }
        })

        const chatInstance = {
            chat,
            id: Date.now()
        }
        Chats.push(chatInstance);

        const response = await chat.sendMessage({
            message: data.text
        })

        res.json({
            response: response.text,
            id: chatInstance.id
        })
    }
    catch {
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
});

app.post("/chat/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { success, data } = z.object({
            text: z.string()
        }).safeParse(req.body);

        if (!success) {
            res.status(400).json({
                message: "Invalid Message"
            });
            return;
        }

        const chat = Chats.find((chat) => chat.id == parseInt(id));
        if (!chat) {
            res.status(404).json({
                message: "Chat not found"
            });
            return;
        }
        const response =  await chat.chat.sendMessage({
            message:data.text
        });

        res.json({
            response: response.text,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
})

app.get("/messages/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const chat = Chats.find((chat) => chat.id == id);
    if (!chat) {
        res.status(404).json({
            message: "Chat not found"
        });
        return;
    }
    else {
        let messages= [...chat.chat.getHistory()]
        messages = messages.filter((m) => m.role !== "system")
        messages = messages.map((m) => {
            if (m.role === "model") {
                const newMessage : any = { ...m };

                // Process and update the new message object
                const { modifiedString: nonHeaderContent } = extractTagData(newMessage.parts[0].text, "MAIL_AI_HEADER");
                const { extractedContent: codes, modifiedString } = extractTagData(nonHeaderContent, "RESPONSE");

                newMessage.codes = codes;
                newMessage.content = modifiedString;
                newMessage.parts = undefined;

                return newMessage;
            } else {
                const newMessage : any = { ...m };

                newMessage.content = newMessage.parts[0].text;
                newMessage.parts = undefined;

                return newMessage;
            }
        });

        res.json(messages);
    }
})

app.listen(port, () => {
    console.log("Server running on PORT : ", port)
})

