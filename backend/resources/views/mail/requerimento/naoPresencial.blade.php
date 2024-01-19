<p>Olá {{ substr($requerimento->nome, 0, strpos($requerimento->nome, ' ')) }}, o seu requerimento foi aprovado e não necessita de atendimento presencial para a comprovação da incapacidade laborativa.</p>

<h3 style="margin-bottom: 5px;">Requerimento Finalizado</h3>
<ul style="margin-top: 0;">
    <li><b>Protocolo do seu requerimento:</b> {{ $requerimento->protocolo }}</li>
    <li><b>Direcionamento:</b> {{ $requerimento->direcionamento->name }}</li>
    @if($requerimento->observacao_avaliador)
    <li><b>Observação do avaliador:</b> {{ $requerimento->observacao_avaliador }}
    @endif
</ul>