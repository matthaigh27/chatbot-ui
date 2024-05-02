import { IconCheck, IconClipboard, IconDownload } from "@tabler/icons-react";
import { Children, isValidElement, memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { generateRandomString, programmingLanguages } from "@/utils/app/codeblock";

interface Props {
  language: string;
  value: string;
}

function extractText(children: React.ReactNode): string {
  // TODO: memo or something
  if (typeof children === "string") {
    return children;
  }

  if (isValidElement(children)) {
    return extractText(children.props.children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => extractText(child)).join("");
  }

  // For other types (e.g., boolean, null, undefined), return an empty string
  return children ? children.toString() : "";
}

export const CodeBlock = memo(({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation("markdown");
  const [isCopied, setIsCopied] = useState<Boolean>(false);
  const child = Children.only(children);
  const language = isValidElement(child) ? child.props.className : "";
  const match = /language-(\w+)/.exec(language);
  const value = extractText(children);

  const copyToClipboard = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return;
    }

    navigator.clipboard.writeText(extractText(children)).then(() => {
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };
  const downloadAsFile = () => {
    const fileExtension = programmingLanguages[language] || ".file";
    const suggestedFileName = `file-${generateRandomString(3, true)}${fileExtension}`;
    const fileName = window.prompt(t("Enter file name") || "", suggestedFileName);

    if (!fileName) {
      // user pressed cancel on prompt
      return;
    }

    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="codeblock relative font-sans text-[16px] rounded-md bg-[#202123]">
      <div className="flex items-center justify-between py-1.5 px-4">
        <span className="text-xs lowercase text-white">{match ? match[1] : language}</span>

        <div className="flex items-center">
          <button
            className="flex gap-1.5 items-center rounded bg-none p-1 text-xs text-white"
            onClick={copyToClipboard}
          >
            {isCopied ? <IconCheck size={18} /> : <IconClipboard size={18} />}
            {isCopied ? t("Copied!") : t("Copy code")}
          </button>
          <button className="flex items-center rounded bg-none p-1 text-xs text-white" onClick={downloadAsFile}>
            <IconDownload size={18} />
          </button>
        </div>
      </div>

      <SyntaxHighlighter language={match ? match[1] : language} style={oneDark} customStyle={{ margin: 0 }}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
});
CodeBlock.displayName = "CodeBlock";
