#!/bin/bash
source .env
currentDate=`date +%Y_%m_%d_%H-%M`
DUMP_FILE="vpn_db_$currentDate.backup"

PGPASSWORD="$DB_PWD" pg_dump --file "$DUMP_FILE" -U "$DB_USER" --host "$DB_HOST" --port "$DB_PORT" -d "$DB_NAME" --format=c --blobs --encoding "UTF8" --verbose --schema "public" 

echo "Заменить локальную базу данных? Y/y для подтверждения, N/n для отказа"
read -r choice

replace() {
    PGPASSWORD="$DB_PWD" psql -h localhost -p 54333 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" -U "$DB_USER" -d "$DB_NAME"
    PGPASSWORD="$DB_PWD" pg_restore -h localhost -p 54333 -U "$DB_USER" -d "$DB_NAME" --clean --create "$DUMP_FILE" 
}

# Приводим ввод к нижнему регистру
choice=$(echo "$choice" | tr '[:upper:]' '[:lower:]')
if [[ "$choice" == "y" ]]; then
    echo "Начат процесс замены локальной базы данных."
    replace
elif [[ "$choice" == "n" ]]; then
    echo "Локальная база данных остаётся без изменений."
else
    echo "Некорректный ввод. Локальная база данных остаётся без изменений"
fi

echo "Завершение работы скрипта"


