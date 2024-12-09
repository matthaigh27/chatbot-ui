import { useCallback, useMemo } from "react";

import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from "@/utils/app/const";

import { ChatBody, Message } from "@/types/chat";

import { OpenAI } from "openai";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export default function useLLM({ apiKey }: { apiKey: string }) {
  const openai = useMemo(() => new OpenAI({ apiKey, dangerouslyAllowBrowser: true }), [apiKey]);

  const call = useCallback(
    async ({
      model,
      messages,
      prompt,
      temperature,
    }: ChatBody): Promise<
      [false, string] | [true, { ok: true; body: ReadableStream<any> }] | [true, { ok: false; statusText: string }]
    > => {
      try {
        const promptToSend = prompt ?? DEFAULT_SYSTEM_PROMPT;
        const temperatureToUse = model.supportsTemperature ? (temperature ?? DEFAULT_TEMPERATURE) : undefined;
        const canStream = model.supportsStreaming ?? true;
        const messagesToSend = (
          model.supportsSystemPrompt ? [{ role: "system", content: promptToSend }, ...messages] : messages
        ) as Message[];

        if (!canStream) {
          const response = await openai.chat.completions.create({
            model: model.id,
            messages: messagesToSend,
            temperature: temperatureToUse,
          });
          return [canStream, response.choices[0].message.content as string];
        }

        const response = await openai.chat.completions.create({
          model: model.id,
          messages: messagesToSend,
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

        return [canStream, { ok: true, body: contentStream }];
      } catch (error: any) {
        console.error(error);
        return [true, { ok: false, statusText: error.message }];
      }
    },
    [openai],
  );

  const output = useMemo(() => ({ call }) as const, [call]);

  return output;
}
