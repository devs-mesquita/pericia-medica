import React from "react";
import InputMask from "react-input-mask";
import Footer from "@/components/partials/Footer";

type RequerimentoForm = {
  nome: string;
  matricula: string;
  lotacao: string;
  email: string;
  inicio_expediente: string;
  fim_expediente: string;
  data_atestado: string;
  acumula_matricula: string;
};

export default function RequerimentoCreate() {
  const [form, setForm] = React.useState<RequerimentoForm>({
    nome: "",
    lotacao: "",
    inicio_expediente: "",
    fim_expediente: "",
    email: "",
    data_atestado: "",
    matricula: "",
    acumula_matricula: "",
  });

  const handleChange = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((st) => ({ ...st, [evt.target.name]: evt.target.value }));
  };

  return (
    <div className="flex min-h-[100vh] flex-col">
      <header
        id="navbar"
        className="relative z-20 flex items-center justify-between bg-slate-100 p-2 text-xs shadow-[1px_2px_2px_0px_rgb(0,0,0,0.75)] shadow-black/20 md:text-sm"
      >
        <div className="flex w-1/2 justify-center md:w-1/3">
          <img
            src="/banner192x64.png"
            alt="Banner da Prefeitura de Mesquita"
            className="rounded-lg shadow shadow-black/20"
          />
        </div>
        <div className="flex w-1/2 justify-center md:w-1/3">
          <a
            href="#"
            className="rounded-3xl bg-sky-500 p-2 text-base text-white shadow-md shadow-black/20 hover:bg-sky-600"
          >
            Manual de Utilização
          </a>
        </div>
        <div className="md:w-1/3"></div>
      </header>
      <div id="notifications" />
      <main
        id="content"
        className="flex flex-1 items-start justify-center bg-slate-100 py-6"
      >
        <form className="flex w-[325px] flex-col rounded-lg shadow-sm shadow-black/30 md:w-[850px]">
          <div className="rounded-t-md border border-b-0 border-black/20 bg-slate-200 p-2">
            <h1 className="text-center text-xl font-thin text-black">
              Requerimento de Perícia Médica
            </h1>
          </div>
          <div className="flex flex-col gap-4 border border-black/20 bg-slate-100 px-3 py-2 md:gap-5">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="">Nome Completo:</label>
                <input
                  onChange={handleChange}
                  className="rounded border border-slate-300 p-2 outline-none focus:border-slate-500"
                  type="text"
                  name="nome"
                  placeholder="Nome Completo do Servidor"
                  required
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="">Matrícula (6 dígitos):</label>
                <InputMask
                  onChange={handleChange}
                  maskChar=""
                  name="matricula"
                  className="rounded border border-slate-300 p-2 outline-none focus:border-slate-500"
                  mask="999.999"
                  type="text"
                  placeholder="000.000"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="lotacao">Local de Lotação</label>
                <select
                  name="lotacao"
                  id="lotacao"
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-slate-500"
                  onChange={handleChange}
                  required
                >
                  <option value="" selected>
                    Selecione a Unidade Organizacional
                  </option>
                  <option value="Arquivo Público Municipal">
                    Arquivo Público Municipal
                  </option>
                  <option value="Comissão Permanente de Licitação">
                    Comissão Permanente de Licitação
                  </option>
                  <option value="Conselho Municipal de Assistência Social">
                    Conselho Municipal de Assistência Social
                  </option>
                  <option value="Conselho Tutelar">Conselho Tutelar</option>
                  <option value="Controladoria Geral do Município">
                    Controladoria Geral do Município
                  </option>
                  <option value="Coordenadoria de Comunicação Social">
                    Coordenadoria de Comunicação Social
                  </option>
                  <option value="Coordenadoria de Ordem Pública">
                    Coordenadoria de Ordem Pública
                  </option>
                  <option value="Coordenadoria de Políticas para Mulheres">
                    Coordenadoria de Políticas para Mulheres
                  </option>
                  <option value="Departamento de Compras">
                    Departamento de Compras
                  </option>
                  <option value="Departamento de Contabilidade">
                    Departamento de Contabilidade
                  </option>
                  <option value="Departamento de Cultura">
                    Departamento de Cultura
                  </option>
                  <option value="Departamento de Defesa Civil">
                    Departamento de Defesa Civil
                  </option>
                  <option value="Departamento de Dívida Ativa">
                    Departamento de Dívida Ativa
                  </option>
                  <option value="Departamento de Material e Patrimônio">
                    Departamento de Material e Patrimônio
                  </option>
                  <option value="Departamento de Orçamento e Finanças">
                    Departamento de Orçamento e Finanças
                  </option>
                  <option value="Departamento de Pagamento">
                    Departamento de Pagamento
                  </option>
                  <option value="Departamento de Planejamento e Análise Econômica">
                    Departamento de Planejamento e Análise Econômica
                  </option>
                  <option value="Departamento de Projetos">
                    Departamento de Projetos
                  </option>
                  <option value="Departamento de Recursos Humanos">
                    Departamento de Recursos Humanos
                  </option>
                  <option value="Departamento de Serviços Públicos">
                    Departamento de Serviços Públicos
                  </option>
                  <option value="Departamento de Trânsito">
                    Departamento de Trânsito
                  </option>
                  <option value="Gabinete do Prefeito">
                    Gabinete do Prefeito
                  </option>
                  <option value="Gabinete do Secretário de Governança">
                    Gabinete do Secretário de Governança
                  </option>
                  <option value="Gabinete do Secretário de Infraestrutura, Mobilidade e Serviços Públicos">
                    Gabinete do Secretário de Infraestrutura, Mobilidade e
                    Serviços Públicos
                  </option>
                  <option value="Gabinete do Subsecretário de Obras">
                    Gabinete do Subsecretário de Obras
                  </option>
                  <option value="Gabinete do Subsecretário de Trabalho, Desenvolvimento Econômico">
                    Gabinete do Subsecretário de Trabalho, Desenvolvimento
                    Econômico
                  </option>
                  <option value="Gabinete do Vice-Prefeito">
                    Gabinete do Vice-Prefeito
                  </option>
                  <option value="Guarda Civil Municipal">
                    Guarda Civil Municipal
                  </option>
                  <option value="Junta de Alistamento Militar">
                    Junta de Alistamento Militar
                  </option>
                  <option value="PROCON - Órgão Municipal de Proteção, Orientação e Defesa do Consumidor">
                    PROCON - Órgão Municipal de Proteção, Orientação e Defesa do
                    Consumidor
                  </option>
                  <option value="Procuradoria Geral">Procuradoria Geral</option>
                  <option value="Secretaria Municipal de Educação">
                    Secretaria Municipal de Educação
                  </option>
                  <option value="Secretaria Municipal de Saúde">
                    Secretaria Municipal de Saúde
                  </option>
                  <option value="Setor de Meio Ambiente">
                    Setor de Meio Ambiente
                  </option>
                  <option value="Setor de Protocolo Geral">
                    Setor de Protocolo Geral
                  </option>
                  <option value="Setor de Urbanismo">Setor de Urbanismo</option>
                  <option value="Subsecretaria de Fazenda">
                    Subsecretaria de Fazenda
                  </option>
                  <option value="Subsecretaria de Tecnologia da Informação">
                    Subsecretaria de Tecnologia da Informação
                  </option>
                  <option value="Subsecretaria Municipal de Administração">
                    Subsecretaria Municipal de Administração
                  </option>
                  <option value="Subsecretaria Municipal de Assistência Social">
                    Subsecretaria Municipal de Assistência Social
                  </option>
                  <option value="Subsecretaria Municipal de Planejamento Estratégico e Gestão">
                    Subsecretaria Municipal de Planejamento Estratégico e Gestão
                  </option>
                  <option value="Superintendência de Arrecadação Mercantil e Fiscalização">
                    Superintendência de Arrecadação Mercantil e Fiscalização
                  </option>
                </select>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="">Horário de Trabalho no Município:</label>
                <div className="flex flex-col gap-2 md:flex-row">
                  <select
                    name="inicio_expediente"
                    required
                    className="w-full rounded border border-slate-300 p-2 outline-none focus:border-slate-500"
                    onChange={handleChange}
                  >
                    <option value="">Início do Expediente</option>
                    <option value="00:00">00:00</option>
                    <option value="01:00">01:00</option>
                    <option value="02:00">02:00</option>
                    <option value="03:00">03:00</option>
                    <option value="04:00">04:00</option>
                    <option value="05:00">05:00</option>
                    <option value="06:00">06:00</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                    <option value="23:00">23:00</option>
                  </select>
                  <select
                    name="fim_expediente"
                    required
                    className="w-full rounded border border-slate-300 p-2 outline-none focus:border-slate-500"
                    onChange={handleChange}
                  >
                    <option value="">Fim do Expediente</option>
                    <option value="00:00">00:00</option>
                    <option value="01:00">01:00</option>
                    <option value="02:00">02:00</option>
                    <option value="03:00">03:00</option>
                    <option value="04:00">04:00</option>
                    <option value="05:00">05:00</option>
                    <option value="06:00">06:00</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                    <option value="23:00">23:00</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="">Data Inicial do Atestado:</label>
                <input
                  onChange={handleChange}
                  name="data_atestado"
                  className="rounded border border-slate-300 p-2 outline-none focus:border-slate-500"
                  type="date"
                  placeholder="dd/mm/aaaa"
                  required
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="">E-mail:</label>
                <input
                  onChange={handleChange}
                  name="email"
                  type="email"
                  placeholder="E-mail para contato"
                  required
                  className="rounded border border-slate-300 p-2 outline-none focus:border-slate-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label htmlFor="">Imagem/Documento do Atestado Médico:</label>
                <span className="text-xs text-red-500">
                  * Certifique-se de que a foto/documento do atestado é legível.
                </span>
                <input type="file" name="" id="" />
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:gap-8">
                <label htmlFor="">
                  Possui outro vínculo, ou acumula matrícula em outro local?
                </label>
                <div className="flex gap-8">
                  <div className="flex gap-2">
                    <input
                      onChange={handleChange}
                      type="radio"
                      id="acumua_matricula_nao"
                      name="acumula_matricula"
                      checked={form.acumula_matricula === "nao"}
                      value="nao"
                    />
                    <label htmlFor="acumua_matricula_nao">Não</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      onChange={handleChange}
                      value="sim"
                      type="radio"
                      id="acumua_matricula_sim"
                      name="acumula_matricula"
                      checked={form.acumula_matricula === "sim"}
                    />
                    <label htmlFor="acumua_matricula_sim">Sim</label>
                  </div>
                </div>
              </div>
              {form.acumula_matricula === "sim" && (
                <div className="flex flex-col">
                  <label htmlFor="">
                    Imagem/Documento do Comprovante de Afastamento:
                  </label>
                  <span className="text-xs text-red-500">
                    * Caso o servidor possua outro vínculo ou acumule matrícula,
                    incluir comprovante de afastamento.
                  </span>
                  <input type="file" name="" id="" />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center rounded-b-md border border-t-0 border-black/20 bg-slate-200 p-2">
            <button className="rounded-lg bg-green-600 px-3 py-1 text-lg font-light text-white hover:bg-green-700">
              Enviar Requerimento
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
