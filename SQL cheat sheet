# Основные ключевые слова в SQL, или Structured Query Language (англ. «язык структурированных запросов»)

## 1. Структура запроса в SQL

Запрос на выгрузку данных начинают со слова SELECT (англ. «выбрать»). Всё, что мы напишем после этого слова, отобразится в итоговом результате.
```SQL
SELECT 'Здравствуйте, я ваш первый запрос!'; // Здравствуйте, я ваш первый запрос!
```

При помощи SELECT можно решать арифметические примеры: например, к восьми прибавить два и результат разделить на пять. 
При этом сохраняется приоритет арифметических операторов. Первыми выполняют умножение и деление, затем — сложение и вычитание. 
Скобки имеют наивысший приоритет.
```SQL
SELECT (8+2)/5; // 2
```

Запрос к базе данных может выглядеть так:
```SQL
select sp.advertising_id,sp.install_date,sp.session_num,sp.payer,sp.last_active as last_date, DATE_DIFF(sp.last_active, install_date, day) as max_play from players as sp where sp.date = '2021-02-28' and sp.install_date between '2021-02-01' and '2021-02-26';
```

А так выглядит тот же запрос, написанный по правилам:
```SQL
SELECT sp.advertising_id,
       sp.install_date,
       sp.session_num,
       sp.payer,
       sp.last_active AS last_date,
       DATE_DIFF(sp.last_active, install_date, DAY) AS max_play
FROM players AS sp
WHERE sp.date = '2021-02-28'
  AND sp.install_date BETWEEN '2021-02-01' AND '2021-02-26';
```
