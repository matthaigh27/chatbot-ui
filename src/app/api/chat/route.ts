import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from "@/utils/app/const";
import { OpenAIError, OpenAIStream } from "@/utils/server";

import { ChatBody, Message } from "@/types/chat";

import { type TiktokenModel, getEncoding, getEncodingNameForModel } from "js-tiktoken";

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  try {
    const { model, messages, key, prompt, temperature } = (await req.json()) as ChatBody;
    const encoding = getEncoding(getEncodingNameForModel(model.id as TiktokenModel));

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response("Error", { status: 500, statusText: error.message });
    } else {
      return new Response("Error", { status: 500 });
    }
  }
}
