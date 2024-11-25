const timer = function (selector) {
  const elm = document.querySelector(selector);
  let time = 0;

  const onTick = () => {
    let m = parseInt(time / 60 + '', 10) + '';
    let s = (time % 60) + '';

    m = m.padStart(2, '0');
    s = s.padStart(2, '0');

    elm.innerText = `${m}:${s}`;
    time++;
  };

  onTick();
  setInterval(onTick, 1000);
};

export default timer;
