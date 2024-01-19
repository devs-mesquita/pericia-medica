<p>Olá {{ substr($requerimento->nome, 0, strpos($requerimento->nome, ' ')) }}, o seu requerimento foi recusado após a análise de nosso departamento.</p>
@if ($requerimento->justificativa_recusa == "Documento Ilegível")
  <ul>
    <li><b>Motivo de Recusa:</b> {{ $requerimento->justificativa_recusa }}</li>
    @if ($requerimento->observacao_avaliador)
      <li><b>Observação do Avaliador:</b> {{ $requerimento->observacao_avaliador }}</li>
    @endif
    <li><b>Este é o protocolo do seu requerimento:</b> {{ $requerimento->protocolo }}</li>
  </ul>
  <p>Por favor, faça um novo requerimento e certifique-se de que os documentos inseridos estão legíveis.</p>
@elseif ($requerimento->justificativa_recusa == "Prazo Expirado")
  <ul>
    <li><b>Motivo de Recusa:</b> {{ $requerimento->justificativa_recusa }}</li>
    @if ($requerimento->observacao_avaliador)
      <li><b>Observação do Avaliador:</b> {{ $requerimento->observacao_avaliador }}</li>
    @endif
      <li><b>Este é o protocolo do seu requerimento:</b> {{ $requerimento->protocolo }}</li>
  </ul>
  <p>O servidor interessado deve soliticar o agendamento no prazo de 2 (dois) dias úteis.</p>
@else
  <ul>
      <li><b>Motivo de Recusa:</b> {{$requerimento->justificativa_recusa}}</li>
      @if ($requerimento->observacao_avaliador)
        <li><b>Observação do Avaliador:</b> {{ $requerimento->observacao_avaliador }}</li>
      @endif
      <li><b>Este é o protocolo do seu requerimento:</b> {{$requerimento->protocolo}}</li>
  </ul>
@endif