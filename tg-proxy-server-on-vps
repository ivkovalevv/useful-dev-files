# Настройка прокси-сервера для телеграм на собственном VPS

## 1. Генерируем секретный ключ
```bash
openssl rand -hex 16
```

## 2. Проверяем, не занят ли порт
```bash
ss -tuln | grep ':8443'
```

## 3. Устанавливаем Docker
- Обновляем пакеты:
```bash
sudo apt update
```
- Устанавливаем Docker:
```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```
- Добавляем официальный GPG-ключ Docker:
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
- Добавляем репозиторий Docker:
```bash
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
- Обновляем индекс пакетов и устанавоиваем Docker Engine:
```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io
```
- Проверяем, что Docker установлен и работает:
```bash
sudo docker --version
```

## 4. Запускаем прокси
```bash
sudo docker run -d \
  --name=telegram-proxy \
  --restart=always \
  -p 8443:443 \
  -e SECRET=YOUR_SECRET_KEY \
  telegrammessenger/proxy:latest
```

Пояснения:
- `-p 8443:443` — пробрасывает порт 8443 вашего сервера на порт 443 внутри контейнера. Ваш интернет-магазин работает на стандартных портах 80/443, поэтому мы выбрали другой порт 8443, чтобы не было конфликта.  
- `-e SECRET=...` — передаёт секретный ключ, который вы сгенерировали ранее.  
- `--restart=always` — контейнер будет автоматически запускаться при перезагрузке сервера.  

## 5. Разрешаем порт в фаерволе
```bash
sudo ufw allow 8443/tcp
```

## 6. Получаем ссылку для подключения из логов контейнера
```bash
sudo docker logs telegram-proxy
```

Находим строку, похожую на:
`tg://proxy?server=IP_ВАШЕГО_СЕРВЕРА&port=8443&secret=...`

Копируем её, отправляем себе в Telegram и нажимаем — прокси активируется.
