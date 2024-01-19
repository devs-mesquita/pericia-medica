<p>Olá {{ substr($requerimento->nome, 0, strpos($requerimento->nome, ' ')) }}, o seu requerimento foi reagendado pelo nosso setor.</p>

<p>Por favor, confirme o recebimento deste e-mail inserindo o seu protocolo em nossa <a target="_blank" rel="noopener noreferrer" href="https://periciamedica.mesquita.rj.gov.br/confirmar">página de confirmação</a>, e siga as demais instruções deste e-mail.</p>

<b>Página de Confirmação:</b> https://periciamedica.mesquita.rj.gov.br/confirmar

<h3 style="margin-bottom: 5px;">Requerimento Reagendado</h3>
<ul style="margin-top: 0;">
    <li><b>Protocolo do seu requerimento:</b> {{ $requerimento->protocolo }}</li>
    @if($reagendamento->observacao_reagenda)
    <li><b>Observação do avaliador: </b> {{ $reagendamento->observacao_reagenda }}
    @endif
    <li><b>Direcionamento:</b> {{ $reagendamento->direcionamento->name }}</li>
    <li><b>Data/Hora Reagendada:</b> {{ date('d/m/Y', strtotime($reagendamento->agenda_datetime)) }} às {{ date('H:i', strtotime($reagendamento->agenda_datetime)) }} horas.</li>
    <li><b>Endereço:</b> Subsecretaria de Administração (segundo andar) — Prefeitura Municipal de Mesquita.
        <ul>
            <li>
                Rua Arthur Oliveira Vechi, 120 - Centro, Mesquita - RJ
            </li>
        </ul>
    </li>
</ul>

<p>* Atenção: Para confirmar a presença no dia e horário reagendado o servidor precisa confirmar o recebimento deste e-mail, inserindo o protocolo do agendamento em nossa <a target="_blank" rel="noopener noreferrer" href="https://periciamedica.mesquita.rj.gov.br/confirmar">página de confirmação</a>.</p>

<p>I - No dia e no horário agendado o servidor deverá estar munido do atestado do médico assistente ou odontológico original, contendo informações que constatem a incapacidade laborativa do servidor, conforme preconiza a resolução do Conselho Federal de Medicina nº 1851/2008 (D.O.U. 18/08/2008);</p>

<p>II - Trazer laudos e exames complementares;</p>

<p>III - Prescrição médica que comprovem tratamento medicamentoso e, caso o servidor tenha acompanhamento fisioterápico, fonoaudiólogo, psicoterápico comprovando a regularidade e o tratamento do servidor;</p>

<p>IV - Caso necessário a prorrogação da licença médica, o servidor terá que trazer nova documentação médica que fundamente a decisão pericial, cabendo ao perito a deliberação técnica acerca da renovação da licença ou readaptação.</p>