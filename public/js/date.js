/* Russian locals for flatpickr */
var flatpickr = flatpickr || { l10ns: {} };
flatpickr.l10ns.ru = {};

flatpickr.l10ns.ru.firstDayOfWeek = 1; // Monday

flatpickr.l10ns.ru.weekdays = {
	shorthand: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
	longhand: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
};

flatpickr.l10ns.ru.months = {
	shorthand: ["Янв", "Фев", "Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сен", "Окт", "Ноя", "Дек"],
	longhand: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
};
if (typeof module !== "undefined") module.exports = flatpickr.l10ns;

const sel = document.querySelectorAll('.js-input-date');

const config = {
    enableTime : true,
    allowInput : true,
    minDate    : "today",
    time_24hr  : true,
    locale     : 'ru', 
    altFormat  : 'F j, Y H:i',
    dateFormat : "F j, Y H:i",
    disableMobile: "true"
}

let addFP = function () {
    return flatpickr(params, config);
}

flatpickr(sel, config);

const toggleIcon = document.querySelector('.js-threeline');
const cancelIcon = document.querySelector('.js-cancel');
const inputDate = document.querySelectorAll('.js-input-date');
const addFieldDate = document.querySelector('.js-add-field-date');
const addFieldPlace = document.querySelector('.js-add-field-place');
const formGroupTwo = document.querySelector('.js-form__group__two');
const inputPlace = document.querySelector('.js-add-place');

const formGroup = document.querySelector('.js-form__group');

toggleIcon.addEventListener('click', function () {
    let fp = flatpickr(sel, config);
    fp.open();
});

cancelIcon.addEventListener('click', function () {

    let fp = flatpickr(sel, config);
    fp.clear();

});


addFieldDate.addEventListener('click', function() {
    
	const cloneEL = formGroupTwo.cloneNode(true);
    this.before(cloneEL);
    
    flatpickr('.js-input-date', config);
});

addFieldPlace.addEventListener('click', function() {
    
    const cloneEL = inputPlace.parentNode.cloneNode(true);
    this.before(cloneEL);
}); 


