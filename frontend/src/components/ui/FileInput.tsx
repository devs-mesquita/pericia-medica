import { FileInputIcon, XIcon } from "lucide-react";
import React from "react";

type FileInputProps = {
  fileTypes?: string[];
  maxFileSizeKb?: number;
  inputName: string;
};

const errorMessages = {
  maxSize: "Arquivo ultrapassa o limite de tamanho permitido:",
  fileType: "Tipo de arquivo inválido, insira apenas imagem ou documento:",
} as const;

export default function FileInput({
  maxFileSizeKb = 8000,
  fileTypes = [
    "image",
    "png",
    "jpg",
    "jpeg",
    "doc",
    "docx",
    "xml",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "pdf",
  ],
  inputName,
}: FileInputProps) {
  const [errorMessageKey, setErrorMessageKey] = React.useState<
    "" | "maxSize" | "fileType"
  >("");

  const [files, setFiles] = React.useState<File[]>([]);
  const [failedFilenames, setFailedFilenames] = React.useState<string[]>([
    "teste.exe",
  ]);

  const handleChange = (evt: React.ChangeEvent) => {
    evt.preventDefault();
    // todo: handle input file logic (check against max size, file types, add to the files list).
  };

  return (
    <div className="flex flex-col justify-start">
      <div className="mb-2 flex">
        <label
          htmlFor={inputName}
          className="flex items-center justify-center gap-2 rounded bg-blue-500 px-2 py-1 text-white"
          role="button"
        >
          <FileInputIcon className="h-5 w-5" />
          Adicionar Arquivo
        </label>
        <input
          onChange={handleChange}
          type="file"
          name="atestado[]"
          id="atestado"
          className="invisible absolute"
          accept={fileTypes.join(",")}
        />
      </div>
      {failedFilenames.length > 0 && (
        <div>
          <div className="text-red-500">
            {errorMessageKey && errorMessages[errorMessageKey]}
            {failedFilenames.map((failedFilename) => (
              <div className="flex items-center gap-2 rounded border border-red-600 px-2 py-1">
                {failedFilename} <XIcon className="h-4 w-4" />
              </div>
            ))}
            <p className="mb-2 text-xs text-red-500">
              * Atenção: Os arquivos destacados em vermelho não serão enviados.
            </p>
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div
          id="atestados-list"
          className="rounded border border-slate-300 bg-slate-200 p-2"
        >
          {files.map((file) => (
            <div className="flex items-center gap-2 rounded border border-slate-300 px-2 py-1">
              {file.name} <XIcon className="h-4 w-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
