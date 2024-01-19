<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Config;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
      date_default_timezone_set('America/Sao_Paulo');

      URL::forceRootUrl(Config::get('app.url'));
      if (Config::get('app.env') === 'production') {
          URL::forceScheme('https');
      }
    }
}
