FROM php:8.2-fpm-alpine

# Install system deps and PHP extensions needed by Symfony
RUN set -eux; \
    apk add --no-cache --virtual .build-deps $PHPIZE_DEPS postgresql-dev icu-dev git unzip; \
    apk add --no-cache libpq icu-libs; \
    docker-php-ext-configure intl; \
    docker-php-ext-install -j$(nproc) pdo pdo_pgsql intl; \
    pecl install apcu; \
    docker-php-ext-enable apcu; \
    apk del .build-deps

WORKDIR /var/www/html

# Expose FPM port
EXPOSE 9000

# Default command
CMD ["php-fpm", "-F"]
