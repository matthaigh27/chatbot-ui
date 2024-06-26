import { OpenAIModelID, fallbackModelID } from "@/types/openai";

import Home from "@/app/api/home/home";

export default async function Index() {
  // There used to be { locale }

  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(process.env.DEFAULT_MODEL as OpenAIModelID) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;
  const serverSidePluginKeysSet = !!googleApiKey && !!googleCSEId;

  return (
    <Home
      defaultModelId={defaultModelId as OpenAIModelID}
      serverSidePluginKeysSet={serverSidePluginKeysSet}
      serverSideApiKeyIsSet={!!process.env.OPENAI_API_KEY}
    />
  );

  //   return {
  //     props: {
  //       serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
  //       defaultModelId,
  //       serverSidePluginKeysSet,
  //       ...(await serverSideTranslations(locale ?? 'en', [
  //         'common',
  //         'chat',
  //         'sidebar',
  //         'markdown',
  //         'promptbar',
  //         'settings',
  //       ])),
  //     },
  //   };
}
