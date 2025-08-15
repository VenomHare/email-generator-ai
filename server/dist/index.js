var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import dotenv from 'dotenv';
// import { Chat, extractTagData } from "./chat.js";
import cors from "cors";
import z from "zod";
import { GoogleGenAI } from "@google/genai";
import { SystemPrompt } from "./systemMessage.js";
import { extractTagData } from "./chat.js";
dotenv.config();
const Chats = [];
const ai = new GoogleGenAI({});
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, _, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        });
        const chatInstance = {
            chat,
            id: Date.now()
        };
        Chats.push(chatInstance);
        const response = yield chat.sendMessage({
            message: data.text
        });
        res.json({
            response: response.text,
            id: chatInstance.id
        });
    }
    catch (_a) {
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}));
app.post("/chat/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield chat.chat.sendMessage({
            message: data.text
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
}));
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
        let messages = [...chat.chat.getHistory()];
        messages = messages.filter((m) => m.role !== "system");
        messages = messages.map((m) => {
            if (m.role === "model") {
                const newMessage = Object.assign({}, m);
                // Process and update the new message object
                const { modifiedString: nonHeaderContent } = extractTagData(newMessage.parts[0].text, "MAIL_AI_HEADER");
                const { extractedContent: codes, modifiedString } = extractTagData(nonHeaderContent, "RESPONSE");
                newMessage.codes = codes;
                newMessage.content = modifiedString;
                newMessage.parts = undefined;
                return newMessage;
            }
            else {
                const newMessage = Object.assign({}, m);
                newMessage.content = newMessage.parts[0].text;
                newMessage.parts = undefined;
                return newMessage;
            }
        });
        res.json(messages);
    }
});
app.listen(port, () => {
    console.log("Server running on PORT : ", port);
});
//# sourceMappingURL=index.js.map