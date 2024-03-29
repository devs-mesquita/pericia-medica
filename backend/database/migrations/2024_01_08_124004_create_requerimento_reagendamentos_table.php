<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('requerimento_reagendamentos', function (Blueprint $table) {
            $table->id();

            $table->string('justificativa_requerente')->nullable();
            $table->boolean('envio_create')->nullable();
            $table->enum('status', ['em-analise', 'aguardando-confirmacao', 'recusado', 'realocado', 'reagendamento-solicitado', 'confirmado']);
            $table->dateTime('avaliado_at')->nullable();
            $table->dateTime('agenda_datetime')->nullable();
            $table->text('observacao_avaliador')->nullable();
            $table->text('justificativa_recusa')->nullable();
            $table->text('justificativa_realocacao')->nullable();
            $table->dateTime('realocado_at')->nullable();
            $table->boolean('envio_avaliacao')->nullable();
            $table->boolean('envio_realocacao')->nullable();
            $table->dateTime('confirmado_at')->nullable();
            $table->boolean('presenca')->nullable();
            $table->dateTime('reagendamento_solicitado_at')->nullable();

            $table->unsignedBigInteger('requerimento_id');
            $table->foreign('requerimento_id')->references('id')->on('requerimentos')->onDelete('cascade');

            $table->unsignedBigInteger('direcionamento_id')->nullable();
            $table->foreign('direcionamento_id')->references('id')->on('requerimento_direcionamentos')->onDelete('cascade');

            $table->unsignedBigInteger('avaliador_id')->nullable();
            $table->foreign('avaliador_id')->references('id')->on('users')->onDelete('cascade');

            $table->unsignedBigInteger('realocador_id')->nullable();
            $table->foreign('realocador_id')->references('id')->on('users')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requerimento_reagendamentos');
    }
};
