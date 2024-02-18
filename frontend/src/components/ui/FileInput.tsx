import { FileInputIcon, XIcon } from "lucide-react";
import { nanoid } from "nanoid";
import React from "react";

type FileInputProps = {
  fileTypes?: string[];
  maxFileSizeKb?: number;
  id: string;
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
  id,
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
    for (const file of evt.target.files) {
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
    <div className="flex flex-col items-start justify-start">
      <div
        className={`${
          className || ""
        } flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-blue-600 bg-blue-600 px-2 py-1 text-white focus-within:border-black hover:border-blue-700 hover:bg-blue-700`}
      >
        <FileInputIcon className="h-5 w-5" />
        <label htmlFor={id} className="cursor-pointer font-semibold">
          Adicionar Arquivo
        </label>
        <input
          disabled={disabled}
          onChange={handleChange}
          type="file"
          name="atestado[]"
          id={id}
          className="absolute left-0 h-[1px] w-[1px]"
          accept={fileTypes.join(",")}
        />
      </div>
      {[...errorMessages.entries()].length > 0 && (
        <>
          {[...errorMessages.values()].map((msg) => (
            <span
              key={nanoid()}
              className="my-2 rounded bg-red-200 p-2 text-sm text-red-800"
            >
              {ERROR_MESSAGES[msg]}
            </span>
          ))}
        </>
      )}
      {failedFilenames.length > 0 && (
        <p className="text-xs text-red-700">
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
                {file.name.length >= 12 ? (
                  <>
                    {file.name.slice(0, 10)}...
                    {file.name.split(".")[file.name.split(".").length - 1]}{" "}
                  </>
                ) : (
                  file.name
                )}
                <button
                  title="Remover arquivo."
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
                className="flex items-center gap-2 rounded border border-red-600 p-1 pl-2 text-sm text-red-700"
              >
                {failedFilename.slice(0, 10)}...
                {
                  failedFilename.split(".")[
                    failedFilename.split(".").length - 1
                  ]
                }{" "}
                <button
                  title="Remover arquivo."
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
