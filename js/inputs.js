/*
    Здесь находятся классы input'ов с их инициализацией (которые происходят с помощью методов из scripts.js, поэтому этот скрипт ОБЯЗАТЕЛЬНО должен быть подключен ПОСЛЕ scripts.js)
*/

function preventButtonsDefault() {
    const exceptions = ["submit-button"];

    const buttons = document.querySelectorAll("button");
    buttons.forEach(btn => {
        exceptions.forEach(exc => {
            if (btn.classList.contains(exc)) return;

            btn.addEventListener("click", (e) => e.preventDefault())
        });
    });
}
preventButtonsDefault();

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

        this.input = observeNodeBeforeInit(container);
        this.button = this.input.querySelector(".dropdown__button");
        this.list = this.input.querySelector(".dropdown__list");

        this.toggleList(false);
        this.button.addEventListener("click", this.toggleList);
        document.addEventListener("click", this.onDocumentClick);
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
}
class JobsSearchForm {
    constructor(form) {
        this.form = observeNodeBeforeInit(form, true);
        this.keywordsContainer = this.form.querySelector(".jobs-search-form__search-input");
        this.proximityContainer = this.form.querySelector(".jobs-search-form__proximity-container");
        this.submitContainer = this.form.querySelector(".jobs-search-form__submit-group");
        this.keywordsInput = this.keywordsContainer.querySelector(".text-input__input");

        this.initMobileHiding();
    }
    initMobileHiding() {
        this.keywordsInput.addEventListener("focus", () => {
            this.proximityContainer.classList.remove("__mobile-hidden");
            this.submitContainer.classList.remove("__mobile-hidden");
        });
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
    { selector: ".jobs-search-form", classInstance: JobsSearchForm },
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
        preventButtonsDefault();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
observeDocumentBodyOnInputs();