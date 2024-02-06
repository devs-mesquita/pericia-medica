import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Requerimento } from "@/types/interfaces";

type RequerimentoToPDFParams = {
  requerimentos: Requerimento[];
  from: Date;
  to: Date;
};

export default function requerimentoToPDF({
  requerimentos,
  from,
  to,
}: RequerimentoToPDFParams) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4",
  });

  doc.setFont("Helvetica", "normal", "bold");
  doc.setFontSize(28);
  doc.text("REQUERIMENTOS AGENDADOS", doc.internal.pageSize.width / 2 - 5, 35, {
    align: "center",
  });

  doc.setFontSize(16);
  doc.setFont("Helvetica", "normal", "bold");
  doc.text(
    `INTERVALO: ${format(from, "dd/LL/yyyy")} — ${format(to, "dd/LL/yyyy")}`,
    255,
    52,
    {
      align: "center",
    },
  );

  doc.addImage("/banner192x64.png", "PNG", 15, 16, 120, 40);

  autoTable(doc, {
    theme: "striped",
    margin: 15,
    columnStyles: {
      1: {
        minCellWidth: 75,
      },
    },
    startY: 70,
    headStyles: {
      cellPadding: 6,
      lineWidth: 1,
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
    },
    bodyStyles: {
      halign: "center",
      valign: "middle",
      lineWidth: 1,
      textColor: [30, 30, 30],
    },
    head: [
      [
        "Nº",
        "NOME",
        "MATRÍCULA",
        "ACUMULA MATRÍCULA?",
        "EMAIL",
        "DIRECIONAMENTO",
        "PROTOCOLO",
        "AGENDAMENTO",
        "PRESENÇA",
      ],
    ],
    body: requerimentos.map((requerimento, i) => [
      i + 1,
      requerimento.nome,
      requerimento.matricula,
      requerimento.acumula_matricula ? "Sim" : "Não",
      requerimento.email,
      requerimento.reagendamentos.length > 0
        ? requerimento.reagendamentos[requerimento.reagendamentos.length - 1]
            .direcionamento?.name || ""
        : requerimento.direcionamento?.name || "",
      requerimento.protocolo,
      requerimento.reagendamentos.length > 0
        ? format(
            requerimento.reagendamentos[requerimento.reagendamentos.length - 1]
              .agenda_datetime || new Date(),
            "dd/LL/yyyy",
          )
        : format(requerimento.agenda_datetime || new Date(), "dd/LL/yyyy"),
      requerimento.reagendamentos.length > 0
        ? requerimento.reagendamentos[requerimento.reagendamentos.length - 1]
            .presenca === null
          ? ""
          : requerimento.reagendamentos[requerimento.reagendamentos.length - 1]
                .presenca
            ? "Presente"
            : "Ausente"
        : requerimento.presenca === null
          ? ""
          : requerimento.presenca
            ? "Presente"
            : "Ausente",
    ]),
  });

  const canvasWidth = 400;
  const canvasHeight = 422;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = (pageWidth - canvasWidth) / 2;
  const marginY = (pageHeight - canvasHeight) / 2;

  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.addImage(
      "/logo-transparent.png",
      "PNG",
      marginX,
      marginY,
      canvasWidth,
      canvasHeight,
    );

    const pageCurrent = doc.getCurrentPageInfo().pageNumber; //Current Page
    doc.setFontSize(12);
    doc.text(
      "Página: " + pageCurrent + "/" + pageCount,
      15,
      doc.internal.pageSize.height - 15,
    );
  }

  doc.output("dataurlnewwindow", {
    filename: `${format(from, "yyyyLLdd")}-${format(
      to,
      "yyyyLLdd",
    )}-requerimentos-agendados.pdf`,
  });
}
