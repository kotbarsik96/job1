/*
    Здесь находятся классы input'ов с их инициализацией (которые происходят с помощью методов из scripts.js, поэтому этот скрипт ОБЯЗАТЕЛЬНО должен быть подключен ПОСЛЕ scripts.js)
*/

/* =============================__ОБЫЧНЫЕ INPUT__===================================== */

class TextInput {
    constructor(inpContainer) {
        this.toggleClearButton = this.toggleClearButton.bind(this);
        this.clearInput = this.clearInput.bind(this);

        this.rootElem = observeNodeBeforeInit(inpContainer);
        this.input = this.rootElem.querySelector("input.text-input__input");
        this.wrapper = this.rootElem.querySelector(".text-input__wrapper");
        this.autocompleteList = this.rootElem.querySelector(".text-input__autocomplete");
        this.clearButton = this.rootElem.querySelector(".text-input__close-icon");
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
            this.rootElem.ariaExpanded = true;
            this.autocompleteList.classList.remove("__removed");
        }
        if (!show) {
            this.rootElem.ariaExpanded = false;
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

        this.rootElem = observeNodeBeforeInit(container);
        this.button = this.rootElem.querySelector(".dropdown__button");
        this.list = this.rootElem.querySelector(".dropdown__list");
        this.radioButtons = Array.from(this.list.querySelectorAll("input[type='radio']"));
        this.text = this.rootElem.querySelector(".dropdown__text");

        this.toggleList(false);
        this.button.addEventListener("click", this.toggleList);
        document.addEventListener("click", this.onDocumentClick);
        this.radioButtons.forEach(inp => inp.addEventListener("change", this.onRadioChange));
    }
    toggleList(show = "define") {
        if (!this.button.disabled) {
            if (typeof show !== "boolean") {
                const isShown = this.rootElem.classList.contains("__shown");
                this.toggleList(!isShown);
            }
            if (typeof show === "boolean") {
                if (show) this.rootElem.classList.add("__shown");
                if (!show) this.rootElem.classList.remove("__shown");
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
    onRadioChange(event) {
        const inp = event.target;
        const value = inp.value;
        this.text.innerHTML = value;
    }
}
class JobsFilter {
    constructor(filter) {
        this.init = this.init.bind(this);

        this.rootElem = observeNodeBeforeInit(filter);
        this.namePrefix = this.rootElem.dataset.filterNameprefix || "";
        this.groupsContainer = this.rootElem.querySelector(".jobs-filter__groups");
        this.groupsNodes = this.groupsContainer.querySelectorAll("[data-jobfilter-name]");
        this.renderDropdowns().then(this.init);
    }
    renderDropdowns() {
        renderCheckbox = renderCheckbox.bind(this);
        renderRadioList = renderRadioList.bind(this);
        renderCheckboxList = renderCheckboxList.bind(this);

        return new Promise(resolve => {
            loadData(`${rootPath}json/filter-values.json`).then(filterValues => {
                this.groupsNodes.forEach(groupNode => {
                    const groupList = groupNode.querySelector(".jobs-filter__group-list");
                    const filterData =
                        filterValues.find(fv => fv.name === groupNode.dataset.jobfilterName);

                    switch (filterData.type) {
                        case "checkbox":
                        default:
                            if (Array.isArray(filterData.values))
                                renderCheckboxList(filterData, groupList);
                            else renderCheckbox(filterData, groupNode);
                            break;
                        case "radio":
                            renderRadioList(filterData, groupList);
                            break;
                    }
                    resolve();
                });
            });
        });

        function renderCheckbox(filterData, groupList) {
            const node = `
            <input class="${filterData.noCount ? '__no-count' : ''}" type="checkbox" name="${this.namePrefix}${filterData.name}" id="${this.namePrefix}${filterData.name}"
            value="${filterData.value}">
            <label class="checkbox__value icon-checkbox" for="${this.namePrefix}${filterData.name}">
                ${filterData.value}
            </label>
            `;
            groupList.insertAdjacentHTML("afterbegin", node);
        }
        function renderCheckboxList(filterData, groupList) {
            filterData.values.forEach((filterValue, index) => {
                const listItem = `
                <li class="jobs-filter__group-item">
                    <div class="checkbox">
                        <input class="${filterValue.noCount ? '__no-count' : ''}" type="checkbox" name="${this.namePrefix}${filterData.name}"
                            id="${this.namePrefix}${filterData.name}-${index + 1}" value="${filterValue.title}">
                        <label
                            class="jobs-filter__label checkbox__value icon-checkbox"
                            for="${this.namePrefix}${filterData.name}-${index + 1}">
                            ${filterValue.title}
                            <span
                                class="jobs-filter__group-item-count badge badge--small">${filterValue.amount}</span>
                        </label>
                    </div>
                </li>
                `;
                groupList.insertAdjacentHTML("beforeend", listItem);
            });
        }
        function renderRadioList(filterData, groupList) {
            filterData.values.forEach((filterValue, index) => {
                const listItem = `
                <li class="jobs-filter__group-item">
                    <label class="jobs-filter__label radio-button">
                        <input class="radio-button__input ${filterValue.noCount ? '__no-count' : ''}" type="radio" ${index == 0 ? 'checked' : ''} name="${this.namePrefix}${filterData.name}"
                            value="${filterValue.title}" id="${filterData.name}-${index}">
                        <svg width="20" height="20" viewBox="0 0 23 23">
                            <circle cx="10" cy="10" r="9"></circle>
                            <path
                                d="M10,7 C8.34314575,7 7,8.34314575 7,10 C7,11.6568542 8.34314575,13 10,13 C11.6568542,13 13,11.6568542 13,10 C13,8.34314575 11.6568542,7 10,7 Z"
                                class="radio-button__inner"></path>
                            <path
                                d="M10,1 L10,1 L10,1 C14.9705627,1 19,5.02943725 19,10 L19,10 L19,10 C19,14.9705627 14.9705627,19 10,19 L10,19 L10,19 C5.02943725,19 1,14.9705627 1,10 L1,10 L1,10 C1,5.02943725 5.02943725,1 10,1 L10,1 Z"
                                class="radio-button__outer"></path>
                        </svg>
                        <span class="jobs-filter__group-item-text">
                            ${filterValue.title}
                        </span>
                        <span class="jobs-filter__group-item-count badge badge--small">${filterValue.amount}</span>
                    </label>
                </li>
                `;
                groupList.insertAdjacentHTML("beforeend", listItem);
            });
        }
    }
    init() {
        document.dispatchEvent(new Event("filterRendered"));
        const groups = Array.from(this.rootElem.querySelectorAll(".jobs-filter__dropdown"));
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
        const checkboxes = this.rootElem.querySelectorAll("input[type='checkbox']");
        const radio = this.rootElem.querySelectorAll("input[type='radio']");
        const inputs = Array.from(checkboxes).concat(Array.from(radio));
        inputs.forEach(inp => inp.addEventListener("change", this.setFilterShowAmount.bind(this)));

        const filterShowButton = this.rootElem.querySelector(".jobs-filter__button");
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
        const filterShowButton = this.rootElem.querySelector(".jobs-filter__button");
        if (!filterShowButton) return;

        const checkboxes = Array.from(this.rootElem.querySelectorAll("input[type='checkbox']"));
        const radio = Array.from(this.rootElem.querySelectorAll("input[type='radio']"));
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
        this.onSearchSubmit = this.onSearchSubmit.bind(this);

        this.rootElem = observeNodeBeforeInit(form);
        this.keywordsContainer = this.rootElem.querySelector(".jobs-search-form__search-input");
        this.proximityContainer = this.rootElem.querySelector(".jobs-search-form__proximity-container");
        this.radiusContainer = this.rootElem.querySelector(".jobs-search-form__proximity");
        this.submitContainer = this.rootElem.querySelector(".jobs-search-form__submit-group");
        this.keywordsInput = this.keywordsContainer.querySelector(".text-input__input");
        this.locationInput = this.proximityContainer.querySelector(".text-input__input");
        this.radiusButton = this.radiusContainer ? this.radiusContainer.querySelector(".dropdown__button") : null;

        this.initMobileHiding();
        this.onLocationInput();
        this.locationInput.addEventListener("input", this.onLocationInput);
        this.locationInput.addEventListener("change", this.onLocationInput);

        this.rootElem.addEventListener("submit", this.onSearchSubmit);

        this.getUrlParams();
    }
    onSearchSubmit(event) {
        event.preventDefault();

        const keywords = this.keywordsInput.value;
        const location = this.locationInput.value;
        const radiusInput = this.radiusContainer
            ? this.radiusContainer.querySelector("input:checked")
            : null;
        const radius = radiusInput ? radiusInput.value : null;

        const url = new URL(window.location.origin + "/job1/jobs/");
        if (keywords) url.searchParams.set("keywords", keywords);
        if (location) url.searchParams.set("location", location);
        if (radius) url.searchParams.set("radius", radius);

        if (!window.location.pathname.includes("/jobs/")) {
            const link = createElement("a");
            link.setAttribute("href", url.href);
            link.click();
        } else window.history.replaceState(null, document.title, url.search);
    }
    getUrlParams() {
        const url = new URL(window.location.href);
        const keywords = url.searchParams.get("keywords");
        const location = url.searchParams.get("location");
        const radius = url.searchParams.get("radius");
        const changeEvent = new Event("change");

        this.keywordsInput.value = keywords;
        this.keywordsInput.dispatchEvent(changeEvent)
        this.locationInput.value = location;
        this.locationInput.dispatchEvent(changeEvent);
        if (radius) {
            const input = this.radiusContainer.querySelector(`input[value="${radius}"]`);
            if (input) input.checked = true;
            input.dispatchEvent(changeEvent);
        }

        if (window.location.pathname.includes("/jobs/"));
        setTimeout(() => this.rootElem.dispatchEvent(new Event("loadedReady")), 100);
    }
    initMobileHiding() {
        this.keywordsInput.addEventListener("focus", () => {
            if (this.proximityContainer)
                this.proximityContainer.classList.remove("__mobile-hidden");
            if (this.submitContainer)
                this.submitContainer.classList.remove("__mobile-hidden");
        });
    }
    onLocationInput() {
        if (!this.radiusButton) return;

        const value = this.locationInput.value.trim();
        if (value.length < 1) this.radiusButton.setAttribute("disabled", "");
        else this.radiusButton.removeAttribute("disabled");
    }
}

/* =============================__ОБЫЧНЫЕ INPUT (конец) __============================= */

/* =============================__ВАЛИДАЦИЯ ФОРМ__===================================== */
// вся форма
class ValidationForm {
    constructor(form) {
        this.submit = this.submit.bind(this);

        this.formElementsKeys = ["input"];
        this.rootElem = observeNodeBeforeInit(form);
        this.boxError = this.rootElem.querySelector(".info-box--error");
        this.submitButton = this.rootElem.querySelector(".submit-button");

        this.boxError.classList.add("__removed");
        this.submitButton.addEventListener("click", this.submit);
    }
    submit(event) {
        const formElements = inittedInputs.filter(inpParams => {
            let isFormElement = false;
            this.formElementsKeys.forEach(key => {
                if (
                    inpParams[key]
                    && inpParams[key].closest(".validation-form") === this.rootElem
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

        this.rootElem = observeNodeBeforeInit(formElement);
        this.label = this.rootElem.querySelector(".label");
        this.input = this.rootElem.querySelector(".form-element__input");
        this.validationMessage = this.rootElem.querySelector(".form-element__validation-message");

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
    { selector: ".validation-form", classInstance: ValidationForm },
    { selector: ".form-element--text", classInstance: TextFormElement },
    { selector: ".password-input", classInstance: PasswordFormElement },
];
doInit(inputSelectors);

inittingSelectors = inittingSelectors.concat(inputSelectors);