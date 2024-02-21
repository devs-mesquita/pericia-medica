import { useQuery } from "@tanstack/react-query";
import { useAuthHeader } from "react-auth-kit";
import { Requerimento } from "@/types/interfaces";
import { nanoid } from "nanoid";
import {
  FileBarChart2Icon,
  FileInputIcon,
  FilePlus2Icon,
  MailCheckIcon,
  MailXIcon,
  PaperclipIcon,
  ViewIcon,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

const IMG_EXTENSIONS = ["jpg", "jpeg", "png", "jfif", "webp", "gif", "bmp"];

export default function RequerimentoShowPage() {
  document.title = "Visualização de Requerimento";

  const authHeader = useAuthHeader();
  const { id } = useParams();

  const { data: requerimento } = useQuery({
    queryKey: ["requerimentos", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/requerimentos/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      return (await res.json()) as Requerimento;
    },
  });

  let reagendamentoIndex = 0;
  let realocacaoIndex = 0;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-md bg-slate-50 p-3 shadow shadow-black/30">
          <div className="mb-2 flex w-full items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
            <h1 className="flex flex-1 flex-col items-start md:flex-row md:items-center md:gap-2">
              <p className="flex items-center">
                <FileBarChart2Icon className="h-5 w-5" />
                <span className="ml-2">Requerimento</span>
              </p>
              {requerimento?.status === "em-analise" ? (
                <span className="rounded-full bg-slate-500 px-4 py-1 text-sm text-slate-50">
                  Em Análise
                </span>
              ) : requerimento?.status === "reagendamento-solicitado" ? (
                <span className="rounded-full bg-amber-500 px-4 py-1 text-sm text-slate-50">
                  Reagendamento Solicitado
                </span>
              ) : requerimento?.status === "aguardando-confirmacao" ? (
                <span className="rounded-full bg-blue-500 px-4 py-1 text-sm text-slate-50">
                  Aguardando Confirmação
                </span>
              ) : requerimento?.status === "confirmado" ? (
                <span className="rounded-full bg-green-500 px-4 py-1 text-sm text-slate-50">
                  Confirmado
                </span>
              ) : requerimento?.status === "realocado" ? (
                <span className="rounded-full bg-roxo-lighter px-4 py-1 text-sm text-slate-50">
                  Realocado
                </span>
              ) : requerimento?.status === "recusado" ? (
                <span className="rounded-full bg-red-500 px-4 py-1 text-sm text-slate-50">
                  Recusado
                </span>
              ) : null}
            </h1>
          </div>
          <div className="flex flex-col font-semibold">
            <p>
              Protocolo:{" "}
              <span className="font-normal">{requerimento?.protocolo}</span>
            </p>
            {requerimento?.created_at && (
              <p>
                Data/Hora de Criação:{" "}
                <span className="font-normal">
                  {format(requerimento.created_at, "dd/LL/yyyy 'às' HH:mm")}
                </span>
              </p>
            )}
            {requerimento?.last_movement_at && (
              <p>
                Última Movimentação:{" "}
                <span className="font-normal">
                  {format(
                    requerimento.last_movement_at,
                    "dd/LL/yyyy 'às' HH:mm",
                  )}
                </span>
              </p>
            )}
            <p className="flex gap-2">
              Envio de Emails:{" "}
              {requerimento?.envio_create !== null ? (
                requerimento?.envio_create === 0 ? (
                  <span title="O email inicial não foi enviado.">
                    <MailXIcon className="h-6 w-6 text-red-500" />
                  </span>
                ) : (
                  <span title="O email inicial foi enviado.">
                    <MailCheckIcon className="h-6 w-6 text-green-500" />
                  </span>
                )
              ) : null}
              {requerimento?.envio_avaliacao !== null ? (
                requerimento?.envio_avaliacao === 0 ? (
                  <span title="O email de avaliação não foi enviado.">
                    <MailXIcon className="h-6 w-6 text-red-500" />
                  </span>
                ) : (
                  <span title="O email de avaliação foi enviado.">
                    <MailCheckIcon className="h-6 w-6 text-green-500" />
                  </span>
                )
              ) : null}
              {requerimento?.envio_realocacao !== null ? (
                requerimento?.envio_realocacao === 0 ? (
                  <span title="O email de realocação não foi enviado.">
                    <MailXIcon className="h-6 w-6 text-red-500" />
                  </span>
                ) : (
                  <span title="O email de realocação foi enviado.">
                    <MailCheckIcon className="h-6 w-6 text-green-500" />
                  </span>
                )
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex flex-col rounded-md bg-slate-50 p-3 shadow shadow-black/30 md:col-start-1">
          <div className="flex flex-col gap-4 text-base font-semibold">
            <div className="flex flex-col">
              <p>
                Nome Completo:{" "}
                <span className="font-normal">{requerimento?.nome}</span>
              </p>
              <p>
                Matrícula:{" "}
                <span className="font-normal">{requerimento?.matricula}</span>
              </p>
              <p>
                Data Inicial do Atestado:{" "}
                <span className="font-normal">
                  {requerimento?.inicio_atestado_date &&
                    format(
                      `${requerimento.inicio_atestado_date} 12:00:00` || "",
                      "dd/LL/yyyy",
                    )}
                </span>
              </p>
              <p>
                Local de Lotação:{" "}
                <span className="font-normal">
                  {requerimento?.local_lotacao}
                </span>
              </p>
              <p>
                Horário de Trabalho:{" "}
                <span className="font-normal">
                  {requerimento?.inicio_expediente &&
                    requerimento.inicio_expediente.slice(0, 5)}{" "}
                  às{" "}
                  {requerimento?.fim_expediente &&
                    requerimento.fim_expediente.slice(0, 5)}
                </span>
              </p>
              <p>
                Email:{" "}
                <span className="font-normal">{requerimento?.email}</span>
              </p>
              <p>
                O servidor acumula matrícula?{" "}
                <span className="font-normal">
                  {requerimento?.acumula_matricula ? "Sim" : "Não"}
                </span>
              </p>
            </div>
            <div className="flex flex-col">
              {requerimento?.avaliado_at && (
                <p>
                  Data/Hora da Avaliação:{" "}
                  <span className="font-normal">
                    {format(
                      requerimento.avaliado_at || "",
                      "dd/LL/yyyy 'às' HH:mm",
                    )}
                  </span>
                </p>
              )}
              {requerimento?.avaliador && (
                <p>
                  Avaliador:{" "}
                  <span className="font-normal">
                    {requerimento.avaliador.name}
                  </span>
                </p>
              )}
              {requerimento?.justificativa_recusa && (
                <p>
                  Justificativa de Recusa:{" "}
                  <span className="font-normal">
                    {requerimento.justificativa_recusa}
                  </span>
                </p>
              )}
              {requerimento?.observacao_avaliador && (
                <p>
                  Observação do Avaliador:{" "}
                  <span className="font-normal">
                    {requerimento.observacao_avaliador}
                  </span>
                </p>
              )}
              {requerimento?.direcionamento && (
                <p>
                  Direcionamento:{" "}
                  <span className="font-normal">
                    {requerimento.direcionamento.name}
                  </span>
                </p>
              )}
              {requerimento?.agenda_datetime && (
                <p>
                  Data/Hora Agendada:{" "}
                  <span className="font-normal">
                    {format(
                      requerimento.agenda_datetime || "",
                      "dd/LL/yyyy 'às' HH:mm",
                    )}
                  </span>
                </p>
              )}
              {requerimento?.confirmado_at && (
                <p>
                  Data/Hora da Confirmação:{" "}
                  <span className="font-normal">
                    {format(
                      requerimento.confirmado_at || "",
                      "dd/LL/yyyy 'às' HH:mm",
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-md bg-slate-50 p-3 shadow shadow-black/30 md:col-start-2 md:row-span-2 md:row-start-1">
          <div className="mb-2 flex items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
            <h1 className="flex items-center">
              <PaperclipIcon className="h-5 w-5" />
              <span className="ml-2">Imagens e Documentos</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <p className="mb-2 pb-1 text-xs font-semibold md:text-base">
                Atestado
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {requerimento?.atestado_files.map((attachment) => {
                  return IMG_EXTENSIONS.includes(attachment.extension) ? (
                    <a
                      href={`${API_URL}/storage/atestados/${attachment.filename}`}
                      target="_blank"
                      key={nanoid()}
                      className="relative h-[100px] w-[100px] rounded border border-slate-400 bg-slate-300 p-1"
                    >
                      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded text-slate-50/60 opacity-0 hover:bg-black/25 hover:opacity-100">
                        <ViewIcon className="h-[32px] w-[32px]" />
                      </div>
                      <img
                        className="h-full w-full rounded object-contain"
                        src={`${API_URL}/storage/atestados/${attachment.filename}`}
                        alt="Atestado"
                      />
                    </a>
                  ) : (
                    <a
                      href={`${API_URL}/storage/atestados/${attachment.filename}`}
                      target="_blank"
                      key={nanoid()}
                      className="relative flex h-[100px] w-[100px] items-center justify-center rounded border border-slate-400 bg-slate-50 p-1 text-blue-500"
                    >
                      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded text-slate-50/60 opacity-0 hover:bg-black/25 hover:opacity-100">
                        <ViewIcon className="h-[32px] w-[32px]" />
                      </div>
                      <FileBarChart2Icon className="h-[64px] w-[64px]" />
                    </a>
                  );
                })}
              </div>
            </div>
            {requerimento?.afastamento_files?.length ? (
              <div className="flex flex-col">
                <p className="mb-2 pb-1 text-xs font-semibold md:text-base">
                  Comprovante de Afastamento
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {requerimento?.afastamento_files.map((attachment) => {
                    return IMG_EXTENSIONS.includes(attachment.extension) ? (
                      <a
                        href={`${API_URL}/storage/afastamentos/${attachment.filename}`}
                        target="_blank"
                        key={nanoid()}
                        className="relative h-[100px] w-[100px] rounded border border-slate-400 bg-slate-300 p-1"
                      >
                        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded text-slate-50/60 opacity-0 hover:bg-black/25 hover:opacity-100">
                          <ViewIcon className="h-[32px] w-[32px]" />
                        </div>
                        <img
                          className="h-full w-full rounded object-contain"
                          src={`${API_URL}/storage/afastamentos/${attachment.filename}`}
                          alt="Comprovante de Afastamento"
                        />
                      </a>
                    ) : (
                      <a
                        href={`${API_URL}/storage/afastamentos/${attachment.filename}`}
                        target="_blank"
                        key={nanoid()}
                        className="relative flex h-[100px] w-[100px] items-center justify-center rounded border border-slate-400 bg-slate-50 p-1 text-blue-500"
                      >
                        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded text-slate-50/60 opacity-0 hover:bg-black/25 hover:opacity-100">
                          <ViewIcon className="h-[32px] w-[32px]" />
                        </div>
                        <FileBarChart2Icon className="h-[64px] w-[64px]" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {requerimento?.reagendamentos.length
          ? requerimento.reagendamentos.map((reagendamento, i, arr) => {
              if (
                (i === 0 && requerimento?.reagendamento_solicitado_at) ||
                arr[i - 1]?.reagendamento_solicitado_at
              ) {
                reagendamentoIndex++;
              }
              if (
                (i === 0 && requerimento?.realocado_at) ||
                arr[i - 1]?.realocado_at
              ) {
                realocacaoIndex++;
              }
              return (
                <div
                  key={nanoid()}
                  className="col-span-full flex flex-col rounded-md bg-slate-50 p-3 shadow shadow-black/30"
                >
                  <div className="mb-2 flex items-center justify-between gap-1 border-b-2 border-slate-300 px-2 pb-2 text-lg font-semibold">
                    <h1 className="flex flex-1 flex-col items-start md:flex-row md:items-center md:gap-2">
                      {(i === 0 && requerimento?.reagendamento_solicitado_at) ||
                      arr[i - 1]?.reagendamento_solicitado_at ? (
                        <p className="flex items-center">
                          <FilePlus2Icon className="h-5 w-5" />
                          <span>
                            Pedido de Reagendamento {reagendamentoIndex}
                          </span>
                        </p>
                      ) : (i === 0 && requerimento?.realocado_at) ||
                        arr[i - 1]?.realocado_at ? (
                        <p className="flex items-center">
                          <FileInputIcon className="h-5 w-5" />
                          <span>Realocação {realocacaoIndex}</span>
                        </p>
                      ) : null}
                      {reagendamento.status === "em-analise" ? (
                        <span className="rounded-full bg-slate-500 px-4 py-1 text-sm text-slate-50">
                          Em Análise
                        </span>
                      ) : reagendamento.status ===
                        "reagendamento-solicitado" ? (
                        <span className="rounded-full bg-amber-500 px-4 py-1 text-sm text-slate-50">
                          Reagendamento Solicitado
                        </span>
                      ) : reagendamento.status === "aguardando-confirmacao" ? (
                        <span className="rounded-full bg-blue-500 px-4 py-1 text-sm text-slate-50">
                          Aguardando Confirmação
                        </span>
                      ) : reagendamento.status === "confirmado" ? (
                        <span className="rounded-full bg-green-500 px-4 py-1 text-sm text-slate-50">
                          Confirmado
                        </span>
                      ) : reagendamento.status === "realocado" ? (
                        <span className="rounded-full bg-roxo-lighter px-4 py-1 text-sm text-slate-50">
                          Realocado
                        </span>
                      ) : reagendamento.status === "recusado" ? (
                        <span className="rounded-full bg-red-500 px-4 py-1 text-sm text-slate-50">
                          Recusado
                        </span>
                      ) : null}
                    </h1>
                  </div>
                  <div className="flex flex-col gap-4 text-base font-semibold">
                    <div className="flex flex-col">
                      <p className="flex gap-2">
                        Envio de Emails:{" "}
                        {reagendamento?.envio_create !== null ? (
                          reagendamento?.envio_create === 0 ? (
                            <span title="O email inicial não foi enviado.">
                              <MailXIcon className="h-6 w-6 text-red-500" />
                            </span>
                          ) : (
                            <span title="O email inicial foi enviado.">
                              <MailCheckIcon className="h-6 w-6 text-green-500" />
                            </span>
                          )
                        ) : null}
                        {reagendamento?.envio_avaliacao !== null ? (
                          reagendamento?.envio_avaliacao === 0 ? (
                            <span title="O email de avaliação não foi enviado.">
                              <MailXIcon className="h-6 w-6 text-red-500" />
                            </span>
                          ) : (
                            <span title="O email de avaliação foi enviado.">
                              <MailCheckIcon className="h-6 w-6 text-green-500" />
                            </span>
                          )
                        ) : null}
                        {reagendamento?.envio_realocacao !== null ? (
                          reagendamento?.envio_realocacao === 0 ? (
                            <span title="O email de realocação não foi enviado.">
                              <MailXIcon className="h-6 w-6 text-red-500" />
                            </span>
                          ) : (
                            <span title="O email de realocação foi enviado.">
                              <MailCheckIcon className="h-6 w-6 text-green-500" />
                            </span>
                          )
                        ) : null}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      {i === 0 && requerimento?.reagendamento_solicitado_at ? (
                        <p>
                          Data/Hora do Pedido de Reagendamento:{" "}
                          <span className="font-normal">
                            {format(
                              requerimento.reagendamento_solicitado_at,
                              "dd/LL/yyyy 'às' HH:mm",
                            )}
                          </span>
                        </p>
                      ) : i > 0 && arr[i - 1]?.reagendamento_solicitado_at ? (
                        <p>
                          Data/Hora do Pedido de Reagendamento:{" "}
                          <span className="font-normal">
                            {format(
                              arr[i - 1].reagendamento_solicitado_at!,
                              "dd/LL/yyyy 'às' HH:mm",
                            )}
                          </span>
                        </p>
                      ) : null}
                      {reagendamento?.justificativa_requerente && (
                        <p>
                          Justificativa do Requerente:{" "}
                          <span className="font-normal">
                            {reagendamento.justificativa_requerente}
                          </span>
                        </p>
                      )}
                      {i === 0 && requerimento?.realocado_at ? (
                        <p>
                          Data/Hora da Realocação:{" "}
                          <span className="font-normal">
                            {format(
                              requerimento.realocado_at,
                              "dd/LL/yyyy 'às' HH:mm",
                            )}
                          </span>
                        </p>
                      ) : i > 0 && arr[i - 1]?.realocado_at ? (
                        <p>
                          Data/Hora da Realocação:{" "}
                          <span className="font-normal">
                            {format(
                              arr[i - 1].realocado_at!,
                              "dd/LL/yyyy 'às' HH:mm",
                            )}
                          </span>
                        </p>
                      ) : null}
                      {i === 0 && requerimento?.realocador ? (
                        <p>
                          Realocador:{" "}
                          <span className="font-normal">
                            {requerimento.realocador.name}
                          </span>
                        </p>
                      ) : i > 0 && arr[i - 1]?.realocado_at ? (
                        <p>
                          Realocador:{" "}
                          <span className="font-normal">
                            {arr[i - 1].realocador!.name}
                          </span>
                        </p>
                      ) : null}
                      {i === 0 && requerimento?.justificativa_realocacao ? (
                        <p>
                          Justificativa da Realocação:{" "}
                          <span className="font-normal">
                            {requerimento.justificativa_realocacao}
                          </span>
                        </p>
                      ) : i > 0 && arr[i - 1]?.justificativa_realocacao ? (
                        <p>
                          Justificativa da Realocação:{" "}
                          <span className="font-normal">
                            {arr[i - 1].justificativa_realocacao!}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col">
                      {reagendamento?.avaliado_at && (
                        <p>
                          Data/Hora da Avaliação:{" "}
                          <span className="font-normal">
                            {format(
                              reagendamento.avaliado_at,
                              "dd/LL/yyyy 'às' HH:mm",
                            )}
                          </span>
                        </p>
                      )}
                      {reagendamento?.avaliador && (
                        <p>
                          Avaliador:{" "}
                          <span className="font-normal">
                            {reagendamento.avaliador.name}
                          </span>
                        </p>
                      )}
                      {reagendamento?.justificativa_recusa && (
                        <p>
                          Justificativa de Recusa:{" "}
                          <span className="font-normal">
                            {reagendamento.justificativa_recusa}
                          </span>
                        </p>
                      )}
                      {reagendamento?.observacao_avaliador && (
                        <p>
                          Observação do Avaliador:{" "}
                          <span className="font-normal">
                            {reagendamento.observacao_avaliador}
                          </span>
                        </p>
                      )}
                      {reagendamento?.direcionamento && (
                        <p>
                          Direcionamento:{" "}
                          <span className="font-normal">
                            {reagendamento.direcionamento.name}
                          </span>
                        </p>
                      )}
                      {reagendamento?.agenda_datetime && (
                        <p>
                          Data/Hora Agendada:{" "}
                          <span className="font-normal">
                            {format(
                              reagendamento.agenda_datetime || "",
                              "dd/LL/yyyy 'às' HH:mm",
                            )}
                          </span>
                        </p>
                      )}
                      {reagendamento?.confirmado_at && (
                        <p>
                          Data/Hora da Confirmação:{" "}
                          <span className="font-normal">
                            {format(
                              reagendamento.confirmado_at || "",
                              "dd/LL/yyyy 'às' HH:mm",
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}
