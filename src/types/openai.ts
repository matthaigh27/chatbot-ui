export interface OpenAIModel {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
}

export enum OpenAIModelID {
  GPT_3_5 = "gpt-3.5-turbo",
  GPT_3_5_AZ = "gpt-35-turbo",
  GPT_4 = "gpt-4-turbo",
  GPT_4O = "gpt-4o",
  GPT_4O_MINI = "gpt-4o-mini",
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.GPT_4O_MINI;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.GPT_3_5]: {
    id: OpenAIModelID.GPT_3_5,
    name: "GPT-3.5",
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_3_5_AZ]: {
    id: OpenAIModelID.GPT_3_5_AZ,
    name: "GPT-3.5",
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_4]: {
    id: OpenAIModelID.GPT_4,
    name: "GPT-4",
    maxLength: 384000,
    tokenLimit: 128000,
  },
  [OpenAIModelID.GPT_4O]: {
    id: OpenAIModelID.GPT_4O,
    name: "GPT-4o",
    maxLength: 384000,
    tokenLimit: 128000,
  },
  [OpenAIModelID.GPT_4O_MINI]: {
    id: OpenAIModelID.GPT_4O_MINI,
    name: "GPT-4o-mini",
    maxLength: 384000,
    tokenLimit: 128000,
  },
};
