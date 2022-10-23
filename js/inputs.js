/*
    Здесь находятся классы input'ов с их инициализацией (которые происходят с помощью методов из scripts.js, поэтому этот скрипт ОБЯЗАТЕЛЬНО должен быть подключен ПОСЛЕ scripts.js)
*/

/* =============================__ОБЫЧНЫЕ INPUT__===================================== */

class TextInput {
    constructor(inpContainer) {
        this.toggleClearButton = this.toggleClearButton.bind(this);
        this.clearInput = this.clearInput.bind(this);

        this.inpContainer = observeNodeBeforeInit(inpContainer);
        this.input = this.inpContainer.querySelector("input.text-input__input");
        this.wrapper = this.inpContainer.querySelector(".text-input__wrapper");
        this.autocompleteList = this.inpContainer.querySelector(".text-input__autocomplete");
        this.clearButton = this.inpContainer.querySelector(".text-input__close-icon");
        if (this.clearButton) this.clearButton.type = "button";

        this.toggleClearButton();
        this.input.addEventListener("input", this.toggleClearButton);
        this.clearButton.addEventListener("click", this.clearInput);
        if (this.autocompleteList) this.initAutocomplete();
    }
    initAutocomplete() {
        this.autocompleteList.classList.add("__removed");
        this.input.addEventListener("input", () => {
            if (this.input.value.length > 0) this.toggleAutocompleteList(true);
            else this.toggleAutocompleteList(false);
        });
        this.input.addEventListener("blur", () => this.toggleAutocompleteList(false));
    }
    toggleAutocompleteList(show = false) {
        if (show) {
            this.inpContainer.ariaExpanded = true;
            this.autocompleteList.classList.remove("__removed");
        }
        if (!show) {
            this.inpContainer.ariaExpanded = false;
            this.autocompleteList.classList.add("__removed");
        }
    }
    toggleClearButton() {
        if (this.input.value.length < 1) this.clearButton.classList.add("__removed");
        else this.clearButton.classList.remove("__removed");
    }
    clearInput() {
        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
    }
}
class Dropdown {
    constructor(container) {
        this.toggleList = this.toggleList.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onRadioChange = this.onRadioChange.bind(this);

        this.input = observeNodeBeforeInit(container);
        this.button = this.input.querySelector(".dropdown__button");
        this.list = this.input.querySelector(".dropdown__list");
        this.radioButtons = Array.from(this.list.querySelectorAll("input[type='radio']"));
        this.text = this.input.querySelector(".dropdown__text");

        this.toggleList(false);
        this.button.addEventListener("click", this.toggleList);
        document.addEventListener("click", this.onDocumentClick);
        this.radioButtons.forEach(inp => inp.addEventListener("change", this.onRadioChange));
    }
    toggleList(show = "define") {
        if (!this.button.disabled) {
            if (typeof show !== "boolean") {
                const isShown = this.input.classList.contains("__shown");
                this.toggleList(!isShown);
            }
            if (typeof show === "boolean") {
                if (show) this.input.classList.add("__shown");
                if (!show) this.input.classList.remove("__shown");
            }
        }
    }
    onDocumentClick(event) {
        const doClose = event.target !== this.button
            && !event.target.closest(".dropdown__button");
        if (doClose) this.toggleList(false);
    }
    destroy() {
        this.button.removeEventListener("click", this.toggleList);
        document.removeEventListener("click", this.onDocumentClick);
    }
    onRadioChange(event){
        const inp = event.target;
        const value = inp.value;
        this.text.innerHTML = value;
    }
}
class JobsFilter {
    constructor(filter) {
        this.filter = observeNodeBeforeInit(filter);
        setTimeout(() => {
            const groups = Array.from(this.filter.querySelectorAll(".jobs-filter__dropdown"));
            // собрать группу, открывающую ее кнопку, ее input'ы с типом checkbox и radio
            this.groupsData = groups.map(group => {
                const checkboxes = group.querySelectorAll("input[type='checkbox']");
                const radio = group.querySelectorAll("input[type='radio']");
                const inputButtons = Array.from(checkboxes).concat(Array.from(radio));
                const groupButton = group.querySelector(".jobs-filter__group-button");
                return { group, inputButtons, groupButton, checkedInputs: [] };
            });
            // инициализировать группу (повесить обработчики на radio&checkbox)
            this.initGroupsData();
            // инициализировать все input, чтобы записывать количество checked в кнопку показа фильтра
            this.initAllInputs();
        }, 250);
    }
    initGroupsData() {
        init = init.bind(this);

        this.groupsData.forEach(data => {
            init(data);
            this.setValues(data);
            data.inputButtons.forEach(btn => {
                btn.addEventListener("change", () => init(data));
            });
        });

        function init(data) {
            const checkedInputs = data.inputButtons.filter(inp => inp.checked);
            data.checkedInputs = checkedInputs.filter(inp => !inp.classList.contains("__no-count"));
            this.setValues(data);
        }
    }
    initAllInputs() {
        const checkboxes = this.filter.querySelectorAll("input[type='checkbox']");
        const radio = this.filter.querySelectorAll("input[type='radio']");
        const inputs = Array.from(checkboxes).concat(Array.from(radio));
        inputs.forEach(inp => inp.addEventListener("change", this.setFilterShowAmount.bind(this)));

        const filterShowButton = this.filter.querySelector(".jobs-filter__button");
        if (!filterShowButton) return;

        let badge = filterShowButton.querySelector(".badge");
        if (!badge) {
            badge = createElement("span", "jobs-filter__badge badge");
            filterShowButton.append(badge);
            const observer = new MutationObserver(() => {
                if (filterShowButton.classList.contains("__show-more-active"))
                    badge.classList.add("__removed");
                else if (badge.innerHTML != "0") badge.classList.remove("__removed");
            });
            observer.observe(filterShowButton, { attributes: true });
        }
        this.setFilterShowAmount();
    }
    setValues(data) {
        const checkedAmount = data.checkedInputs.length;
        let badge = data.groupButton.querySelector(".badge");
        if (!badge) {
            badge = createElement("span", "jobs-filter__badge badge");
            data.groupButton.append(badge);
        }
        badge.innerHTML = checkedAmount;
        if (checkedAmount < 1) badge.classList.add("__removed");
        else badge.classList.remove("__removed");
    }
    setFilterShowAmount() {
        const filterShowButton = this.filter.querySelector(".jobs-filter__button");
        if (!filterShowButton) return;

        const checkboxes = Array.from(this.filter.querySelectorAll("input[type='checkbox']"));
        const radio = Array.from(this.filter.querySelectorAll("input[type='radio']"));
        const checkedInputs = checkboxes.concat(radio)
            .filter(inp => inp.checked && !inp.classList.contains("__no-count"));
        const checkedAmount = checkedInputs.length;

        const badge = filterShowButton.querySelector(".badge");
        if (!badge) return;
        badge.innerHTML = checkedAmount;
        if (checkedAmount < 1) badge.classList.add("__removed");
    }
}
class JobsSearchForm {
    constructor(form) {
        this.onLocationInput = this.onLocationInput.bind(this);

        this.form = observeNodeBeforeInit(form);
        this.keywordsContainer = this.form.querySelector(".jobs-search-form__search-input");
        this.proximityContainer = this.form.querySelector(".jobs-search-form__proximity-container");
        this.radiusContainer = this.form.querySelector(".jobs-search-form__proximity");
        this.submitContainer = this.form.querySelector(".jobs-search-form__submit-group");
        this.keywordsInput = this.keywordsContainer.querySelector("#keywords");
        this.locationInput = this.proximityContainer.querySelector("#locations");
        this.radiusButton = this.radiusContainer.querySelector(".dropdown__button");

        this.initMobileHiding();
        this.onLocationInput();
        this.locationInput.addEventListener("input", this.onLocationInput);
    }
    initMobileHiding() {
        this.keywordsInput.addEventListener("focus", () => {
            this.proximityContainer.classList.remove("__mobile-hidden");
            this.submitContainer.classList.remove("__mobile-hidden");
        });
    }
    onLocationInput(){
        const value = this.locationInput.value.trim();
        if(value.length < 1) this.radiusButton.setAttribute("disabled", "");
        else this.radiusButton.removeAttribute("disabled");
    }
}

class AlarmDisruptorPill {
    constructor(container) {
        this.toggleBox = this.toggleBox.bind(this);
        this.submitAlarm = this.submitAlarm.bind(this);

        this.container = observeNodeBeforeInit(container);
        this.btnShow = this.container.querySelector(".alarm-disruptor-pill__button");
        this.box = this.container.querySelector(".alarm-disruptor-pill__box");
        this.btnSubmit = this.container.querySelector(".alarm-disruptor-pill__submit");
        this.btnClose = this.container.querySelector(".alarm-disruptor-pill__close");

        this.btnShow.addEventListener("click", this.toggleBox);
        this.btnClose.addEventListener("click", this.toggleBox);
        this.btnSubmit.addEventListener("click", this.submitAlarm);
    }
    toggleBox() {
        this.box.classList.contains("__removed")
            ? this.box.classList.remove("__removed")
            : this.box.classList.add("__removed");
    }
    submitAlarm() {
        const inputs = Array.from(this.container.querySelectorAll("input"));
        if (inputs.find(inp => inp.checked))
            this.container.classList.add("__removed");
    }
}

/* =============================__ОБЫЧНЫЕ INPUT (конец) __============================= */

/* =============================__ВАЛИДАЦИЯ ФОРМ__===================================== */
// вся форма
class ValidationForm {
    constructor(form) {
        this.submit = this.submit.bind(this);

        this.formElementsKeys = ["input"];
        this.form = observeNodeBeforeInit(form);
        this.boxError = this.form.querySelector(".info-box--error");
        this.submitButton = this.form.querySelector(".submit-button");

        this.boxError.classList.add("__removed");
        this.submitButton.addEventListener("click", this.submit);
    }
    submit(event) {
        const formElements = inittedInputs.filter(inpParams => {
            let isFormElement = false;
            this.formElementsKeys.forEach(key => {
                if (
                    inpParams[key]
                    && inpParams[key].closest(".validation-form") === this.form
                    && inpParams[key] !== this.submitButton
                ) isFormElement = true;
            });
            return isFormElement;
        });

        const invalids = [];
        formElements.forEach(formElem => {
            formElem.validate();
            if (formElem.isValid == false) invalids.push(formElem);
        });
        if (invalids.length > 0) event.preventDefault();
    }
}

// элемент формы
class TextFormElement {
    constructor(formElement) {
        this.validate = this.validate.bind(this);

        this.formElement = observeNodeBeforeInit(formElement);
        this.label = this.formElement.querySelector(".label");
        this.input = this.formElement.querySelector(".form-element__input");
        this.validationMessage = this.formElement.querySelector(".form-element__validation-message");

        this.validationMessage.classList.add("__removed");
        this.getValidationConditions();
    }
    getValidationConditions() {
        const valMask = this.input.dataset.validationMask;
        this.validationMask = valMask
            ? new RegExp(valMask)
            : false;

        const valLength = this.input.dataset.validationLength;
        this.validationLength = valLength ? valLength.split(", ") : false;
    }
    validate() {
        let isValid = false;
        const value = this.input.value;

        if (this.validationMask) {
            if (this.validationMask.test(value)) isValid = true;
            else isValid = false;
        }
        if (this.validationLength) {
            const minValue = parseInt(this.validationLength[0]);
            const maxValue = parseInt(this.validationLength[1]) || minValue;

            if (value >= minValue && value <= maxValue) isValid = true;
            else isValid = false;
        }

        this.setValidationState(isValid);
        this.input.addEventListener("input", this.validate);
    }
    setValidationState(isValid) {
        this.isValid = isValid;
        if (isValid) this.validationMessage.classList.add("__removed");
        else this.validationMessage.classList.remove("__removed");
    }
}

// элемент формы для пароля
class PasswordFormElement extends TextFormElement {
    constructor(formElement) {
        super(formElement);
        this.onInput = this.onInput.bind(this);

        this.info = document.querySelector(".password-input__info");
        if (this.info) this.info.classList.add("__removed");

        this.input.addEventListener("focus", () => this.info.classList.remove("__removed"));
        this.input.addEventListener("input", this.onInput);
    }
    onInput() {
        const value = this.input.value;
        this.input.value = value.replace(/[\sа-яА-ЯёЁ]/, "");
    }
    validate() {
        let isValid = false;
        const value = this.input.value;

        const digits = value.match(/\d/g) || [];
        const lowerCases = value.match(/[a-z]/g) || [];
        const upperCases = value.match(/[A-Z]/g) || [];

        const hasValidLength = value.length >= 8;
        const hasDigit = digits.length > 0;
        const hasUpperAndLowerCases = lowerCases.length > 0
            && upperCases.length > 0;

        if (hasValidLength && hasDigit && hasUpperAndLowerCases) isValid = true;
        else isValid = false;

        this.input.addEventListener("input", this.validate);
        super.setValidationState(isValid);
    }
}

/* =============================__ВАЛИДАЦИЯ ФОРМ (конец)__============================= */

// селекторы input, которые инициализируются в классах и помещаются в inittedInputs и соответствующий им экземлпяр класса
const inputSelectors = [
    { selector: ".text-input", classInstance: TextInput },
    { selector: ".dropdown", classInstance: Dropdown },
    { selector: ".jobs-filter", classInstance: JobsFilter },
    { selector: ".jobs-search-form", classInstance: JobsSearchForm },
    { selector: ".alarm-disruptor-pill", classInstance: AlarmDisruptorPill },
    { selector: ".validation-form", classInstance: ValidationForm },
    { selector: ".form-element--text", classInstance: TextFormElement },
    { selector: ".password-input", classInstance: PasswordFormElement },
]
doInit(inputSelectors);

// отлавливать изменения документа
function observeDocumentBodyOnInputs() {
    const observer = new MutationObserver(mutlist => {
        const isRepeating = findCoincidenceInMutationlist(mutlist);
        if (isRepeating) return;

        doInit(inputSelectors);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
observeDocumentBodyOnInputs();