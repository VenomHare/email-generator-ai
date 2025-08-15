// import { GoogleGenAI } from "@google/genai";
// import { SystemPrompt } from "./systemMessage.js";
export function extractTagData(inputString, tagName) {
    if (!inputString || !tagName) {
        return {
            extractedContent: [],
            modifiedString: inputString,
        };
    }
    // Construct a regular expression to find the tag and its content.
    // The 'g' flag for global search, 'i' for case-insensitive.
    const tagRegex = new RegExp(`<${tagName}>([^]*?)<\/${tagName}>`, 'gi');
    const extractedContent = [];
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
//# sourceMappingURL=chat.js.map