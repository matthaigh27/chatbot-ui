export interface OpenAIModel {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
  supportsStreaming?: boolean;
  supportsSystemPrompt?: boolean;
  supportsTemperature?: boolean;
}

export enum OpenAIModelID {
  GPT_4 = "gpt-4-turbo",
  GPT_4O = "gpt-4o",
  GPT_4O_MINI = "gpt-4o-mini",
  O1_PREVIEW = "o1-preview",
  O1_MINI = "o1-mini",
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.GPT_4O_MINI;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.GPT_4O_MINI]: {
    id: OpenAIModelID.GPT_4O_MINI,
    name: "GPT-4o-mini",
    maxLength: 384000,
    tokenLimit: 128000,
  },
  [OpenAIModelID.GPT_4O]: {
    id: OpenAIModelID.GPT_4O,
    name: "GPT-4o",
    maxLength: 384000,
    tokenLimit: 128000,
  },
  [OpenAIModelID.GPT_4]: {
    id: OpenAIModelID.GPT_4,
    name: "GPT-4",
    maxLength: 384000,
    tokenLimit: 128000,
  },
  [OpenAIModelID.O1_MINI]: {
    id: OpenAIModelID.O1_MINI,
    name: "o1-mini",
    maxLength: 384000,
    tokenLimit: 128000,
    supportsSystemPrompt: false,
    supportsTemperature: false,
  },
  [OpenAIModelID.O1_PREVIEW]: {
    id: OpenAIModelID.O1_PREVIEW,
    name: "o1-preview",
    maxLength: 384000,
    tokenLimit: 128000,
    supportsSystemPrompt: false,
    supportsTemperature: false,
  },
};
