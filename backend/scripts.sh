#!/bin/bash
while [ true ]
do
  php /var/www/html/artisan schedule:run --verbose --no-interaction &
  sleep 60
done &\
#php artisan key:generate --force && \
#php artisan jwt:secret --force && \
php artisan config:cache &&\
php artisan migrate --force && \
php artisan db:seed --force && \
php artisan storage:link && \
apache2ctl -D FOREGROUND