// webpack-merge предоставляет функцию слияния, которая объединяет массивы и объединяет объекты, создавая новый объект. Если встречаются функции, он выполнит их, прогонит результаты через алгоритм, а затем снова обернет возвращенные значения в функцию.
// Источник: https://github.com/survivejs/webpack-merge
const { merge } = require('webpack-merge');

// Базовые(Пользовательские) конфигурации webpack.
const common = require('./webpack.common');

// Пользовательские зависимости.

// Временная переменная, которая определяет режим сборки.
const { NODE_ENV } = process.env;

const config = {
  mode: 'production',
  output: {
    clean: true,
  },
};

module.exports = merge(common, config);
