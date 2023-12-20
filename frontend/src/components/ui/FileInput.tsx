import { FileInputIcon, XIcon } from "lucide-react";
import { nanoid } from "nanoid";
import React from "react";

type FileInputProps = {
  fileTypes?: string[];
  maxFileSizeKb?: number;
  inputName: string;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  disabled?: boolean;
  className?: string;
};

export default function FileInput({
  maxFileSizeKb = 8000,
  files,
  setFiles,
  fileTypes = [
    "image/*",
    ".png",
    ".jpg",
    ".jpeg",
    ".doc",
    ".docx",
    ".xml",
    ".pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  inputName,
  disabled,
  className,
}: FileInputProps) {
  const [errorMessages, setErrorMessages] = React.useState<
    Set<"maxSize" | "fileType">
  >(new Set([]));

  const [failedFilenames, setFailedFilenames] = React.useState<string[]>([]);

  const ERROR_MESSAGES = {
    maxSize: `O arquivo ultrapassa o limite de tamanho permitido (${
      maxFileSizeKb / 1000
    }Mb).`,
    fileType: "O tipo do arquivo é inválido.",
  } as const;

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    if (!evt.target.files || !evt.target.files[0]) return;

    // Check against max size
    // Check allowed file types
    // Append to the files list
    setErrorMessages(new Set([]));
    for (let file of evt.target.files) {
      if (file.size > maxFileSizeKb * 1000) {
        setFailedFilenames((st) => [...st, file.name]);
        setErrorMessages((st) => {
          return new Set([...st, "maxSize"]);
        });
        continue;
      }
      if (
        !fileTypes.some((fileType) => {
          return file.type.match(fileType);
        })
      ) {
        setFailedFilenames((st) => [...st, file.name]);
        setErrorMessages((st) => {
          return new Set([...st, "fileType"]);
        });
        continue;
      }
      setFiles((st) => [...st, file]);
    }
  };

  const removeFileAt = (idx: number) => {
    setFiles((st) => st.filter((_v, i) => idx !== i));
    setErrorMessages(new Set([]));
  };
  const removeFailedFileAt = (idx: number) => {
    setFailedFilenames((st) => st.filter((_v, i) => idx !== i));
    setErrorMessages(new Set([]));
  };

  return (
    <div className="flex flex-col justify-start">
      <div className="flex">
        <label
          htmlFor={inputName}
          className={`${
            className || ""
          } flex items-center justify-center gap-2 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600`}
          role="button"
        >
          <FileInputIcon className="h-5 w-5" />
          Adicionar Arquivo
        </label>
        <input
          disabled={disabled}
          onChange={handleChange}
          type="file"
          name="atestado[]"
          id={inputName}
          className="invisible absolute"
          accept={fileTypes.join(",")}
        />
      </div>
      {[...errorMessages.entries()].length > 0 && (
        <>
          {[...errorMessages.values()].map((msg) => (
            <span
              key={nanoid()}
              className="my-2 rounded bg-red-200 p-2 text-sm text-red-500"
            >
              {ERROR_MESSAGES[msg]}
            </span>
          ))}
        </>
      )}
      {failedFilenames.length > 0 && (
        <p className="text-xs text-red-500">
          * Atenção: Os arquivos destacados em vermelho não serão enviados.
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        {files.length > 0 && (
          <>
            {files.map((file, i) => (
              <span
                key={nanoid()}
                className="flex items-center gap-2 rounded border border-slate-400 p-1 pl-2 text-sm"
              >
                {file.name.slice(0, 10)}...
                {file.name.split(".")[file.name.split(".").length - 1]}{" "}
                <button
                  onClick={() => removeFileAt(i)}
                  type="button"
                  className="rounded p-1 hover:bg-slate-300"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </>
        )}
        {failedFilenames.length > 0 && (
          <>
            {failedFilenames.map((failedFilename, i) => (
              <span
                key={nanoid()}
                className="flex items-center gap-2 rounded border border-red-600 p-1 pl-2 text-sm text-red-500"
              >
                {failedFilename.slice(0, 10)}...
                {
                  failedFilename.split(".")[
                    failedFilename.split(".").length - 1
                  ]
                }{" "}
                <button
                  onClick={() => removeFailedFileAt(i)}
                  type="button"
                  className="rounded p-1 hover:bg-red-200"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
