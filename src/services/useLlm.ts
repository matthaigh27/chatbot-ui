import { useCallback, useMemo } from "react";

import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from "@/utils/app/const";

import { ChatBody, Message } from "@/types/chat";

import { type TiktokenModel, getEncoding, getEncodingNameForModel } from "js-tiktoken";
import { OpenAI } from "openai";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export default function useLLM({ apiKey }: { apiKey: string }) {
  const openai = useMemo(() => new OpenAI({ apiKey, dangerouslyAllowBrowser: true }), [apiKey]);

  const call = useCallback(
    async ({ model, messages, prompt, temperature }: ChatBody) => {
      try {
        const encoding = getEncoding(getEncodingNameForModel(model.id as TiktokenModel));

        const promptToSend = prompt ?? DEFAULT_SYSTEM_PROMPT;
        const temperatureToUse = temperature ?? DEFAULT_TEMPERATURE;
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

        const response = await openai.chat.completions.create({
          model: model.id,
          messages: [{ role: "system", content: promptToSend }, ...messagesToSend],
          temperature: temperatureToUse,
          stream: true,
        });

        const stream = response.toReadableStream();

        const transformer = new TransformStream({
          transform(chunk, controller) {
            const decoded = decoder.decode(chunk);
            const parsed = JSON.parse(decoded);
            const text = parsed.choices?.[0].delta?.content || "";
            const encoded = encoder.encode(text);
            controller.enqueue(encoded);
          },
        });

        const contentStream = stream.pipeThrough(transformer);

        return { ok: true, body: contentStream };
      } catch (error: any) {
        console.error(error);
        return { ok: false, statusText: error.message };
      }
    },
    [openai],
  );

  const output = useMemo(() => ({ call }) as const, [call]);

  return output;
}
