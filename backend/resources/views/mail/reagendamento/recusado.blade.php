<p>Olá {{ substr($requerimento->nome, 0, strpos($requerimento->nome, ' ')) }}, o seu requerimento foi recusado após a análise de nosso departamento.</p>
@if ($reagendamento->justificativa_recusa == "Documento Ilegível")
<ul>
    <li><b>Motivo de Recusa:</b> {{ $reagendamento->justificativa_recusa }}</li>
    @if ($reagendamento->observacao_avaliador)
      <li><b>Observação do Avaliador:</b> {{ $reagendamento->observacao_avaliador }}</li>
    @endif
    <li><b>Este é o protocolo do seu requerimento:</b> {{ $requerimento->protocolo }}</li>
</ul>
<p>Por favor, faça um novo requerimento e certifique-se de que os documentos inseridos estão legíveis.</p>
@elseif ($reagendamento->justificativa_recusa == "Prazo Expirado")
    <ul>
        <li><b>Motivo de Recusa:</b> {{ $reagendamento->justificativa_recusa }}</li>
        @if ($reagendamento->observacao_avaliador)
          <li><b>Observação do Avaliador:</b> {{ $reagendamento->observacao_avaliador }}</li>
        @endif
        <li><b>Este é o protocolo do seu requerimento:</b> {{ $requerimento->protocolo }}</li>
    </ul>
    <p>O servidor interessado deve soliticar o agendamento no prazo de 2 (dois) dias úteis.</p>
@else
    <ul>
        <li><b>Motivo de Recusa:</b> {{$reagendamento->justificativa_recusa}}</li>
        @if ($reagendamento->observacao_avaliador)
          <li><b>Observação do Avaliador:</b> {{ $reagendamento->observacao_avaliador }}</li>
        @endif
        <li><b>Este é o protocolo do seu requerimento:</b> {{$requerimento->protocolo}}</li>
    </ul>
@endif