# При изменении МОДЕЛИ Базы Данных необходимо выполнить её миграцию

## Настройка конфигурации

Сначала убедитесь, что файлы `.sequelizerc` и `config.json` существуют и заполнены правильно.

Если их нет или они заполнены неверно, создаём и заполняем по следующей логике:

### Создаем файл `.sequelizerc`

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('config.json'),
  'models-path': path.resolve('models'),
  'migrations-path': path.resolve('migrations'),
  'seeders-path': path.resolve('seeders')
}
```

### Создаем файл `config.json` cо следующим описанием:
```JSON
{
  "development": {
    "username": "user",
    "password": "123456",
    "database": "apart_delivery_db",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres",
    "logging": false
  },
  "production": {
    "username": "user",
    "password": "123456",
    "database": "apart_delivery_db",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres",
    "logging": false
  }
}
```

## Процесс миграции

### Генерация нового файла миграции:
```bash
npx sequelize-cli migration:generate --name add-new-fields
```

где `add-new-fields` название для новой миграции

Sequelize сгенерирует новый JavaScript файл с именем типа `XXXXXXXXXXXXXX-add-user-orders-history.js`, где `XXXXXXXXXXXXXX` - дата и время создания.

### Описание миграции

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

/**-------------------------- ОПИСАНИЕ ИЗМЕНЕНИЙ В БД -------------------------------*/
    await queryInterface.addColumn('users', 'image', {
      type: Sequelize.STRING,
      defaultValue: 'default-image.png'    
    });
/**----------------------- КОНЕЦ ОПИСАНИЯ ИЗМЕНЕНИЙ В БД ----------------------------*/

  },

  async down(queryInterface, Sequelize) {

/**---------------- ОПИСАНИЕ ОТМЕНЫ ИЗМЕНЕНИЙ В БД (для отката) ---------------------*/
    await queryInterface.removeColumn('users', 'image');
/**-------------------- КОНЕЦ ОПИСАНИЯ ОТМЕНЫ ИЗМЕНЕНИЙ В БД ------------------------*/

  }
};
```

### Применение миграции

```bash
npx sequelize-cli db:migrate
```

Sequelize сам определяет какую именно миграцию применять, фильтруя имеющиеся миграциии в папке `migrations/` по дате создания



## Дополнительные команды

### Проверка статуса миграций
```bash
npx sequelize-cli db:migrate:status
```

### Откат миграции
```bash
npx sequelize-cli db:migrate:undo
```






