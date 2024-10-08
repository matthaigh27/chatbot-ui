"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useCreateReducer } from "@/hooks/useCreateReducer";

import { cleanConversationHistory, cleanSelectedConversation } from "@/utils/app/clean";
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from "@/utils/app/const";
import { saveConversation, saveConversations, updateConversation } from "@/utils/app/conversation";
import { saveFolders } from "@/utils/app/folders";
import { savePrompts } from "@/utils/app/prompts";
import { getSettings } from "@/utils/app/settings";

import { Conversation } from "@/types/chat";
import { KeyValuePair } from "@/types/data";
import { FolderInterface, FolderType } from "@/types/folder";
import { OpenAIModelID, OpenAIModels } from "@/types/openai";
import { Prompt } from "@/types/prompt";

import { Chat } from "@/components/Chat/Chat";
import { Chatbar } from "@/components/Chatbar/Chatbar";
import Promptbar from "@/components/Promptbar";

import HomeContext from "./home.context";
import { HomeInitialState, initialState } from "./home.state";

import { useMediaQuery } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({ serverSideApiKeyIsSet, serverSidePluginKeysSet, defaultModelId }: Props) => {
  const { t } = useTranslation("chat");
  const isSm = useMediaQuery("(max-width: 640px)");

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: { lightMode, showChatbar, showPromptbar, folders, conversations, selectedConversation, prompts },
    dispatch,
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      dispatch({
        field: "selectedConversation",
        value: conversation,
      });

      saveConversation(conversation);
    },
    [dispatch],
  );

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = useCallback(
    (name: string, type: FolderType) => {
      const newFolder: FolderInterface = {
        id: uuidv4(),
        name,
        type,
      };

      const updatedFolders = [...folders, newFolder];

      dispatch({ field: "folders", value: updatedFolders });
      saveFolders(updatedFolders);
    },
    [dispatch, folders],
  );

  const handleDeleteFolder = useCallback(
    (folderId: string) => {
      const updatedFolders = folders.filter((f) => f.id !== folderId);
      dispatch({ field: "folders", value: updatedFolders });
      saveFolders(updatedFolders);

      const updatedConversations: Conversation[] = conversations.map((c) => {
        if (c.folderId === folderId) {
          return {
            ...c,
            folderId: null,
          };
        }

        return c;
      });

      dispatch({ field: "conversations", value: updatedConversations });
      saveConversations(updatedConversations);

      const updatedPrompts: Prompt[] = prompts.map((p) => {
        if (p.folderId === folderId) {
          return {
            ...p,
            folderId: null,
          };
        }

        return p;
      });

      dispatch({ field: "prompts", value: updatedPrompts });
      savePrompts(updatedPrompts);
    },
    [conversations, dispatch, folders, prompts],
  );

  const handleUpdateFolder = useCallback(
    (folderId: string, name: string) => {
      const updatedFolders = folders.map((f) => {
        if (f.id === folderId) {
          return {
            ...f,
            name,
          };
        }

        return f;
      });

      dispatch({ field: "folders", value: updatedFolders });

      saveFolders(updatedFolders);
    },
    [dispatch, folders],
  );

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = useCallback(() => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: uuidv4(),
      name: t("New Conversation"),
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
      folderId: null,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({ field: "selectedConversation", value: newConversation });
    dispatch({ field: "conversations", value: updatedConversations });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    dispatch({ field: "loading", value: false });
  }, [conversations, defaultModelId, dispatch, t]);

  const handleUpdateConversation = useCallback(
    (conversation: Conversation, data: KeyValuePair) => {
      const updatedConversation = {
        ...conversation,
        [data.key]: data.value,
      };

      const { single, all } = updateConversation(updatedConversation, conversations);

      dispatch({ field: "selectedConversation", value: single });
      dispatch({ field: "conversations", value: all });
    },
    [conversations, dispatch],
  );

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: "showChatbar", value: false });
    }
  }, [dispatch, selectedConversation]);

  useEffect(() => {
    defaultModelId && dispatch({ field: "defaultModelId", value: defaultModelId });
    serverSideApiKeyIsSet &&
      dispatch({
        field: "serverSideApiKeyIsSet",
        value: serverSideApiKeyIsSet,
      });
    serverSidePluginKeysSet &&
      dispatch({
        field: "serverSidePluginKeysSet",
        value: serverSidePluginKeysSet,
      });
  }, [defaultModelId, dispatch, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: "lightMode",
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem("apiKey");

    if (serverSideApiKeyIsSet) {
      dispatch({ field: "apiKey", value: "" });

      localStorage.removeItem("apiKey");
    } else if (apiKey) {
      dispatch({ field: "apiKey", value: apiKey });
    }

    const pluginKeys = localStorage.getItem("pluginKeys");
    if (serverSidePluginKeysSet) {
      dispatch({ field: "pluginKeys", value: [] });
      localStorage.removeItem("pluginKeys");
    } else if (pluginKeys) {
      dispatch({ field: "pluginKeys", value: pluginKeys });
    }

    if (window.innerWidth < 640) {
      dispatch({ field: "showChatbar", value: false });
      dispatch({ field: "showPromptbar", value: false });
    }

    const showChatbar = localStorage.getItem("showChatbar");
    if (showChatbar) {
      dispatch({ field: "showChatbar", value: showChatbar === "true" });
    }

    const showPromptbar = localStorage.getItem("showPromptbar");
    if (showPromptbar) {
      dispatch({ field: "showPromptbar", value: showPromptbar === "true" });
    }

    const folders = localStorage.getItem("folders");
    if (folders) {
      dispatch({ field: "folders", value: JSON.parse(folders) });
    }

    const prompts = localStorage.getItem("prompts");
    if (prompts) {
      dispatch({ field: "prompts", value: JSON.parse(prompts) });
    }

    const conversationHistory = localStorage.getItem("conversationHistory");
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] = JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(parsedConversationHistory);

      dispatch({ field: "conversations", value: cleanedConversationHistory });
    }

    const selectedConversation = localStorage.getItem("selectedConversation");
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation = JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(parsedSelectedConversation);

      dispatch({
        field: "selectedConversation",
        value: cleanedSelectedConversation,
      });
    } else {
      const lastConversation = conversations[conversations.length - 1];
      dispatch({
        field: "selectedConversation",
        value: {
          id: uuidv4(),
          name: t("New Conversation"),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });
    }
  }, [defaultModelId, dispatch, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  const context = useMemo(
    () => ({
      ...contextValue,
      handleNewConversation,
      handleCreateFolder,
      handleDeleteFolder,
      handleUpdateFolder,
      handleSelectConversation,
      handleUpdateConversation,
    }),
    [
      contextValue,
      handleNewConversation,
      handleCreateFolder,
      handleDeleteFolder,
      handleUpdateFolder,
      handleSelectConversation,
      handleUpdateConversation,
    ],
  );

  return (
    <HomeContext.Provider value={context}>
      {selectedConversation && (
        <main className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}>
          <div className="h-full w-full pt-0">
            <div className={showPromptbar ? "hidden sm:block" : ""}>
              <Chatbar />
            </div>

            <div
              className={`${showChatbar || showPromptbar ? "pointer-events none blur-sm sm:blur-none" : ""} ${showChatbar ? "md:ml-[260px]" : "" } ${showPromptbar ? "md:mr-[260px]" : ""} transition-[margin] h-full`}
              onClick={
                (showChatbar || showPromptbar) && isSm
                  ? () => {
                      if (showChatbar) {
                        dispatch({ field: "showChatbar", value: false });
                      }

                      if (showPromptbar) {
                        dispatch({ field: "showPromptbar", value: false });
                      }
                    }
                  : undefined
              }
            >
              <Chat stopConversationRef={stopConversationRef} />
            </div>

            <div className={showChatbar ? "hidden sm:block" : ""}>
              <Promptbar />
            </div>
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};
export default Home;
