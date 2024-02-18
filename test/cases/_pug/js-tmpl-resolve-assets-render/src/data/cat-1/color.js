const Color = function () {};
Color.colors = [];

Color.colorize = function (text, colorName = '') {
  const color = Color.find(colorName);
  const hex = color.hex || '';
  return `<span style="color: ${hex}">${text}</span>`;
};

Color.getData = function () {
  return Color.colors;
};

Color.add = function (colors) {
  Color.colors = colors;
};

Color.find = function (name) {
  return Color.colors.find((item) => item.name === name);
};

module.exports = Color;
