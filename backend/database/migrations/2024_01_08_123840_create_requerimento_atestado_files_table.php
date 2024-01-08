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
        Schema::create('requerimento_atestado_files', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('extension');
            $table->timestamps();

            $table->unsignedBigInteger('requerimento_id');
            $table->foreign('requerimento_id')->references('id')->on('requerimentos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requerimento_atestado_files');
    }
};
