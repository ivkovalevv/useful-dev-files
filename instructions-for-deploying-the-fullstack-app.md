# Инструкция по деплою fullstack-приложения на VPS

## 1 - Подключаемся к серверу по ssh и добавляем нового root пользователя
```bash
adduser ivan
```

открываем файл:
```bash
visudo
```

Добавляем новую строку `ivan ALL=(ALL:ALL)ALL` после `root ALL=(ALL:ALL) ALL`

переходим на созданного пользователя командой `su - ivan`  
тестируем успешный переход командой `sudo apt-get update`


## 2 - Установка nvm, node, npm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

Установите ту же версию, что и на вашем ПК
```bash
nvm install node 21.6
```

тестируем командой `node -v` или `npm -v`


## 3 - Пуш в отдельные git-репозитории client и server части приложения
```bash
git add .
git commit -m 'Init'
git add origin
git push origin main
```


Создаем ключ для git на сервере
```bash
ssh-keygen -o -t rsa -C “ssh@github.com”
```

`ll` - для теста  
`cat id_rsa.pub` // копируем

вставляем в github аккаунте -> `Settings/SSH and GPG keys` -> `New SSH key`

На VPS:
Создаем папку проекта:  
```bash
mkdir "project-folder"
```
Устанавливаем git:
```bash
sudo apt-get install git-all
```

(измените свой URL-адрес git)
```bash
git clone git@github.com:username/front.git
git clone git@github.com:username/back.git
```


## 4 - База данных

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Открываем в терминал PostgreSQL под дефолтным пользователем postgres
```bash
sudo -u postgres psql
```

Измените имя базы данных и логин пользователя
```bash
CREATE ROLE ivan WITH LOGIN PASSWORD '123456' CREATEDB;
CREATE DATABASE your_app_db OWNER ivan;
GRANT ALL PRIVILEGES ON DATABASE your_app_db TO ivan;
```

Базовые команды:  
Список пользователей - `\du`  
Список баз данных - `\l`  
Выход - `\q`  
Зайти в конкретную базу данных - `\c name_db`  

Или сразу заходим под вашим пользлователем:
```bash
psql -U ivkovalevv -d apart_delivery_db
```

Полезные команды SQL:    
Просмотр конкретных значений в базе по строке:
```bash
SELECT * FROM public.users LIMIT 10;
```
Просмотр конкретных столбцов в таблице базы по строке:
```bash
SELECT id, email, role, "createdAt", "updatedAt", "userName", "userTel" FROM public.users LIMIT 10;
```
Удаление пользователей по email:
```bash
DELETE FROM public.users WHERE email IN ('test', '111', '123', '1234', '12345', 'qwerty');
```


## 5 - Установка переменных окружения и зависимостей

Создаем `.env` в `server` и `client` директориях командой `nano .env` 

Шаблон заполнения `.env` для `server`:
```bash
PORT=5000
DB_NAME=your_app_db
DB_USER=postgres
DB_PASSWORD=Ваш_пароль
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=random_secret_key
NODE_ENV=production
```

Шаблон заполнения `.env` для `client`:
```bash
REACT_APP_API_URL=http://адрес_сервера:5000/
NODE_ENV=production
```

Выйти и сохранить - `^x`  

// (не обязательно), если вам нужны pnpm или yarn
npm install -g pnpm
npm install -g yarn

yarn или pnpm install или npm install

Загружаем dump вашей базы данных с вашего ПК на сервер
scp C:/Users/user/files/fullstack_app_backup_01_08_2025 user@адрес_вашего сервера:/home/ivan

Копируем файл в домашнюю директорию postgres:
sudo cp /home/ivan/fullstack_app_backup_01_08_2025 /var/lib/postgresql/
sudo chown postgres:postgres /var/lib/postgresql/fullstack_app_backup_01_08_2025

Удаляем все существующие таблицы из созданной БД перед загрузкой дампа:
sudo -u postgres psql -d your_app_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

После этого загружаем наш дамп в пустую БД:
sudo -u postgres pg_restore -d your_app_db -Fc /var/lib/postgresql/apart_delivery_backup_01_08_2025

Проверяем командой sudo -u postgres psql -d your_app_db -c "\dt"

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//6 - PM 2 (процессный менеджер)

Собираем client часть приложения:
npm run build

Устанавливаем процессный менеджер pm2:
npm install pm2 -g

// старт проекта в режиме РАЗРАБОТЧИКА
pm2 start npm --name client -- start (смотрите скрипт для запуска в package.json)
pm2 start npm --name server -- run dev (смотрите скрипт для запуска в package.json)

// старт проекта в ПРОДАКШЕН режиме
pm2 start npm --name server -- run dev (смотрите скрипт для запуска в package.json)
// установливаем serve 
npm install -g serve
// запускаем build
pm2 start serve --name client -- -s -l 3000 build

!!! Если есть проблема с аутентификацией при подключении к БД при запуске сервера:
Проверяем логин и пароль в .env

Выдаём права на схему public (от имени postgres):
sudo -u postgres psql -c "ALTER SCHEMA public OWNER TO ваш_пользователь; GRANT ALL ON SCHEMA public TO ваш_пользователь;"

Перезапускаем приложение:
pm2 restart all

Полезные команды:
// автоматизируем запуск
pm2 startup ubuntu

// для созранения
pm2 save

// команда ля проверки
pm2 log

// показать список процессов
pm2 list

// интерактивный мониторинг
pm2 monit 

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//7 - Nginx (веб-сервер)

Установка:
sudo apt-get install nginx

Заходжим для настройки конфига:
sudo nano /etc/nginx/sites-available/default

Шаблон:
server {
  location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

location /{
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

location /static/ {
        alias /home/ваш_пользователь/ваш_проект/подпапка(если есть)/static/;
        include /etc/nginx/mime.types;
        expires 30d;
    }
}

Заходжим для настройки конфига:
sudo nano /etc/nginx/sites-available/apart-delivery.ru (имя вашего домена)

Шаблон для сайта с доменом без ssl-сертификата на http:
server {
    listen 80;
    server_name apart-delivery.ru www.apart-delivery.ru;

    location / {
        proxy_pass http://localhost:3000;  # Добавьте это для фронтенда
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

Шаблон для сайта с ssl-сертификатом (на https):
# HTTP → HTTPS редирект (порт 80)
server {
    listen 80;
    server_name apart-delivery.ru www.apart-delivery.ru 217.114.11.161;

    # Перенаправляем все HTTP-запросы на HTTPS
    return 301 https://apart-delivery.ru$request_uri;
}

# Основной HTTPS-сервер (порт 443)
server {
    listen 443 ssl;
    server_name apart-delivery.ru www.apart-delivery.ru;

    # SSL-настройки Certbot
    ssl_certificate /etc/letsencrypt/live/apart-delivery.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apart-delivery.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Сжатие скриптов
    gzip on;
    gzip_types application/javascript;
    gzip_comp_level 6;


    # Проксирование API
    location /api {

      # Проверяем наличие специального заголовка чтобы разрешать только запросы с сайта
        if ($http_referer !~* (apart-delivery.ru)) {
            return 403;
        }

        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Проксирование изображений
    location ~ ^/([a-z0-9-]+\.(png|jpg|jpeg|gif))$ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Фронтенд
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket проксирование
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400; # Для долгих WS-сессий
    }
}

// Тестируем правильный ли config с точки зрения синтаксиса
sudo nginx -t

// Перезапускаем Nginx
sudo service nginx restart

// Если 80 порт занят >>>
Ищем процесс, который слушает 80 порт:
sudo ss -tulnp | grep ':80'

// Если порт занят apache:
Открываем конфиг Apache:
sudo nano /etc/apache2/ports.conf

Заменяем Listen 80 на:
Listen 8080

Обновляем виртуальные хосты Apache (если есть):
sudo nano /etc/apache2/sites-enabled/000-default.conf
Заменяем <VirtualHost *:80> на <VirtualHost *:8080>.

Перезапускаеим Apache:
sudo systemctl restart apache2


Теперь порт 80 свободен, и Nginx можно запустить:
sudo systemctl start nginx

// есть есть статические папки
location /public {
    include /etc/nginx/mime.types;
    root /home/....;
}

Если есть ошибка "Не удается получить доступ к сайту - ERR_CONNECTION_TIMED_OUT", нужно проверить разрешены ли порты.
Чтобы разрешить порт пользуемся командой:
sudo ufw allow 3000/tcp

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//8 - Bonus SSL

sudo apt install certbot python3-certbot-nginx
sudo systemctl reload nginx

//change domain
sudo certbot --nginx -d test.com

sudo systemctl status certbot.timer

//check for errors
sudo certbot renew --dry-run

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

If u update files, you should on server:


git pull && pnpm run build && pm2 reload all
	
