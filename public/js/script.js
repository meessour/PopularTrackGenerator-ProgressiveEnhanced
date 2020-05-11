const gradeElement = document.getElementById('rangeinput');

if (gradeElement) {
    gradeElement.type = 'range';

    const grade = gradeElement.value;

    gradeElement.insertAdjacentHTML('afterend', `<output id="rangevalue">${grade}</output>`);
}