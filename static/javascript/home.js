function controlFromSlider(fromSlider, toSlider, fromValue, minweight, maxweight) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, '#FFA500', '#0000FF', toSlider);
    if (from > to) {
        fromSlider.value = to;
        fromValue.innerHTML = to;
        minweight.value = to;
    } else {
        minweight.value = from;
        fromValue.innerHTML = from;
        fromSlider.value = from;
    }
    console.log(minweight.value);
    console.log(maxweight.value);
}

function controlToSlider(fromSlider, toSlider, toValue, minweight, maxweight) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, '#FFA500', '#0000FF', toSlider);
    setToggleAccessible(toSlider);
    if (from <= to) {
        toSlider.value = to;
        toValue.innerHTML = to;
        maxweight.value = to;
    } else {
        toValue.innerHTML = from;
        toSlider.value = from;
        maxweight.value = from;
    }
    console.log(minweight.value);
    console.log(maxweight.value);
}

function getParsed(currentFrom, currentTo) {
    const from = parseFloat(currentFrom.value);
    const to = parseFloat(currentTo.value);
    return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
    const rangeDistance = to.max - to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;
    controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition) / (rangeDistance) * 100}%,
      ${rangeColor} ${((fromPosition) / (rangeDistance)) * 100}%,
      ${rangeColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
}

function setToggleAccessible(currentTarget) {
    const toSlider = document.querySelector('#toSlider');
    if (Number(currentTarget.value) <= 0) {
        toSlider.style.zIndex = 2;
    } else {
        toSlider.style.zIndex = 0;
    }
}

const fromSlider = document.querySelector('#fromSlider');
const toSlider = document.querySelector('#toSlider');
const fromValue = document.querySelector('#fromValue');
const toValue = document.querySelector('#toValue');
const minweight = document.querySelector('#minweight');
const maxweight = document.querySelector('#maxweight');
fillSlider(fromSlider, toSlider, '#FFA500', '#0000FF', toSlider);
setToggleAccessible(toSlider);

fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromValue, minweight, maxweight);
toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toValue, minweight, maxweight);

