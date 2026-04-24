"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY
});
function testGroq() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('[TEST] Calling Groq with model: llama-3.1-8b-instant');
            const response = yield groq.chat.completions.create({
                messages: [{ role: 'user', content: 'Hello, can you respond?' }],
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 100,
            });
            console.log('[SUCCESS] Groq response:', JSON.stringify(response, null, 2));
        }
        catch (error) {
            console.log('[ERROR] Full error object:', error);
            if (error instanceof Error) {
                console.log('[ERROR] Message:', error.message);
                console.log('[ERROR] Name:', error.name);
                console.log('[ERROR] Stack:', error.stack);
            }
        }
        process.exit(0);
    });
}
testGroq();
