# Резервное копирование базы данных PostgreSQL

## Создание бэкапа базы данных

```bash
sudo -u postgres pg_dump -F c -f /tmp/apart_delivery_db_backup_$(date +%d_%m_%Y).dump apart_delivery_db
```

## Копирование в нужную директорию:
```bash
cp /tmp/apart_delivery_db_backup_*.dump ~/
```

## Копирование бэкапа на ПК (Windows) - команда выполняется на локальноп ПК:
```bash
pscp -r user@адрес_вашего сервера:/home/user/db_backups "C:\Users\user\files\прочее"
```
