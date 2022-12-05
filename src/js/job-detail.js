const jobsDataURL = `${rootPath}json/jobs.json`;

class JobDetailState {
    constructor() {
        this.isEmbedded = document.body.hasAttribute("data-job-detail") == false;
    }
    defineState() {
        setTimeout(() => {
            const oldJobId = this.jobId;
            if (this.isEmbedded)
                this.jobId = window.location.hash.replace("#", "");
            else this.jobId = window.location.pathname.match(/\/\d+\//g)[0].replace(/\//g, "");

            const jobDetailItems = inittedInputs
                .filter(inpParams => inpParams instanceof JobDetailListItem);
            jobDetailItems.forEach(item => item.setState());

            if (this.jobId == oldJobId) return;

            if (this.jobId) this.setShowState();
            else this.setHideState();
        }, 100);
    }
    setShowState() {
        const resizableElems = document.querySelectorAll(".--jobs-full-elem");
        resizableElems.forEach(elem => {
            elem.className = elem.className.replace("--jobs-full-elem", "--jobs-resizable-elem");
        });

        const jobDetails = inittedInputs
            .filter(inpParams => inpParams instanceof JobDetail);
        jobDetails.forEach(jd => jd.setShowState());

        const jobsListings = inittedInputs
            .filter(inpParams => inpParams instanceof JobsListing);
        jobsListings.forEach(jListing => jListing.changeInfoBoxLink({ jobId: this.jobId }));
    }
    setHideState() {
        const resizableElems = document.querySelectorAll(".--jobs-resizable-elem");
        resizableElems.forEach(elem => {
            elem.className = elem.className.replace("--jobs-resizable-elem", "--jobs-full-elem");
        });
        const jobDetails = inittedInputs
            .filter(inpParams => inpParams instanceof JobDetail);
        jobDetails.forEach(jd => jd.setHideState());

        const jobsListings = inittedInputs
            .filter(inpParams => inpParams instanceof JobsListing);
        jobsListings.forEach(jListing => jListing.changeInfoBoxLink({ doRemove: true }));
    }
}
// данный экземлпяр класса используется, чтобы выставить элементам на странице состояние показа вакансии (setShowState()) или состояние без показанной вакансии (setHideState). Метод defineState() определяет состояние и саму вакансию на основе хэша в адресной строке (#101, #102, ...)
const jobDetailState = new JobDetailState();
if (jobDetailState.isEmbedded) {
    window.addEventListener("hashchange", jobDetailState.defineState.bind(jobDetailState));
}

// получить иконку, скачав ее по url
function loadAndGetIcon(url) {
    return new Promise(resolve => {
        const iconURL = `${rootPath}${url}`;
        fetch(iconURL).then(response => {
            if (!response.ok) return resolve("");
            response.text().then(data => resolve(data));
        });
    });
}


// список вакансий
class JobsListing {
    constructor(elem) {
        this.onJobsSearchSubmit = this.onJobsSearchSubmit.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.renderJobs = this.renderJobs.bind(this);
        this.loadJobs = this.loadJobs.bind(this);

        this.rootElem = observeNodeBeforeInit(elem);
        // блоки внутри jobs-listing
        this.title = this.rootElem.querySelector(".jobs-search-list__title");
        this.emptyResult = this.rootElem.querySelector(".jobs-search-list__empty-result");
        this.infoBox = this.rootElem.querySelector(".jobs-search-list__info-box");
        this.jobsListContainer = this.rootElem.querySelector(".jobs-list");
        this.loadMore = this.rootElem.querySelector(".more-jobs");
        this.tagsList = this.rootElem.querySelector(".jobs-filter-buttons__tags");
        this.alarmDisruptorPill = this.rootElem.querySelector(".jobs-search__alarm-disruptor__pill");
        // блоки фильтра вверху страницы
        this.companySearch = document.querySelector("input[name='keywords']");
        this.locationSearch = document.querySelector("input[name='locations']");
        this.radiusInputs = Array.from(document.querySelectorAll("input[name='proximity-radius']"));
        // остальное
        this.filterListItemNames = ["professional-area", "employment-type", "work-experience", "salary"];
        this.filterInputs = [];
        this.createdTags = [];
        this.jobsRendered = [];
        this.jobsSearchForm = document.querySelector("#jobs-search-form");
        this.maxJobsOnLoad = 2;

        this.emptyResult.classList.add("__removed");
        this.infoBox.classList.add("__removed");
        this.getFilterInputs();
        this.jobsSearchForm.addEventListener("submit", this.onJobsSearchSubmit);
        this.jobsSearchForm.addEventListener("loadedReady", this.onJobsSearchSubmit);
        this.loadMore.addEventListener("click", this.loadJobs);
        this.loadJobs();
        if (this.alarmDisruptorPill) this.alarmDisruptorPill.classList.add("__removed");
    }
    getFilterInputs() {
        this.filterListItemNames.forEach(name => {
            const inputs = document.querySelectorAll(`input[name="${name}"]`);
            inputs.forEach(inp => {
                const alreadyInList = this.filterInputs.find(i => i === inp);
                if (!alreadyInList) this.filterInputs.push(inp);
            });
        });
    }
    createButtonLoading() {
        if (this.loadMore.querySelector(".loading-box")) return;

        const boxLayout = `
        <div class="loading-box">
            <span class="loading-box__dot"></span>
            <span class="loading-box__dot"></span>
            <span class="loading-box__dot"></span>
        </div>
        `;
        this.loadMore.insertAdjacentHTML("afterbegin", boxLayout);
    }
    removeButtonLoading() {
        const box = this.loadMore.querySelector(".loading-box");
        if (box) box.remove();
    }
    loadJobs() {
        if (this.loading) return;

        return new Promise((resolve, reject) => {
            this.loading = true;
            this.createButtonLoading();
            this.jobsListContainer.classList.add("jobs-list--unload");
            fetch(jobsDataURL)
                .then(response => {
                    if (!response.ok) {
                        this.removeButtonLoading();
                        reject();
                    }

                    response.json().then(data => {
                        if (!this.jobs) this.jobs = [];
                        let counter = 0;
                        for (let job of data) {
                            const alreadyRendered = this.jobs.find(j => j.id === job.id);
                            if (alreadyRendered || counter >= this.maxJobsOnLoad) continue;

                            this.jobs.push(job);
                            counter++;
                        }
                        resolve();
                    });
                });
        }).then(() => {
            this.renderJobs();
            this.removeButtonLoading();
            setTimeout(() => this.loading = false, 250);
            setTimeout(() => {
                if (this.jobsListContainer.querySelector("li"))
                    this.jobsListContainer.classList.remove("jobs-list--unload");
            }, 1000);
        });
    }
    renderJobs() {
        this.jobs.forEach(jobData => {
            if (this.jobsRendered.find(id => id === jobData.id)) return;
            const item = new JobDetailListItem(jobData);
            item.render().then(() => {
                const node = item.rootElem;
                this.jobsListContainer.append(node);
                this.jobsRendered.push(jobData.id);

                const alreadyInInittedInputs = Object.values(inittedInputs)
                    .find(inpParams => inpParams.rootElem === node);
                if (!alreadyInInittedInputs) inittedInputs.push(item);
            });
        });
    }
    onJobsSearchSubmit(event) {
        event.preventDefault();
        this.getFilterInputs();

        this.checkedFilterInputs = this.filterInputs.filter(inp => {
            return inp.checked && !inp.classList.contains("__no-count");
        });
        this.createdTags.forEach(tagData => {
            const isRemovedFromFilter =
                !this.checkedFilterInputs
                    .find(inp => inp.value === tagData.value && inp.name === tagData.name)

            if (isRemovedFromFilter) this.removeTag(null, tagData.tag, true);
        });
        this.checkedFilterInputs.forEach(inp => {
            const value = inp.value;
            const name = inp.name;
            this.createTag(value, name);
        });

        if (this.checkedFilterInputs.length < 1
            && this.companySearch.value.length < 1
            && this.locationSearch.value.length < 1) return;

        this.setTitleText();
        if (this.alarmDisruptorPill) this.alarmDisruptorPill.classList.remove("__removed");
        if (!this.isRenderedAlarmDisruptor) this.renderAlarmDisruptor();
    }
    setTitleText() {
        const keywords = this.companySearch.value.trim();
        const location = this.locationSearch.value.trim();
        const radiusInput = this.radiusInputs.find(inp => inp.checked);

        if (!keywords && !location && !radiusInput && this.checkedFilterInputs.length < 1)
            this.title.innerHTML = "Текущие вакансии";
        else if (!keywords && !location && !radiusInput)
            this.title.innerHTML = "<span class='jobs-search-list__title--bigger-text'>2</span> вакансии";
        else {
            const text = `Вакансии ${keywords ? keywords : ""} ${location ? "в г." : ""} ${location ? location : ""}`;
            if (!radiusInput) this.title.innerHTML = text;
            if (radiusInput) this.title.innerHTML =
                `${text} ${radiusInput.value ? "в радиусе" : ""} 
                ${radiusInput.value ? `<span class="jobs-search-list__title--bigger-text">${radiusInput.value.replace("км", "")}</span> км` : ""}`;
        }
    }
    createTag(value, name) {
        if (this.createdTags.find(tagData => tagData.value === value && tagData.name === name))
            return;

        const tag = createElement("li", "jobs-filter-buttons__tag-item tag");
        tag.dataset.inputName = name;
        const tagInner = `
            <div class="tag__text __no-hover">${value}</div>
            <button class="tag__close icon-close"></button>
        `;
        tag.insertAdjacentHTML("afterbegin", tagInner);
        const removeButton = tag.querySelector(".tag__close");
        removeButton.addEventListener("click", this.removeTag);
        this.createdTags.push({ value, name, tag });
        this.tagsList.append(tag);
    }
    removeTag(event, tag = null, noSubmit = false) {
        if (!tag && event.target) tag = event.target.closest(".jobs-filter-buttons__tag-item");
        tag.remove();
        if (event && event.target) event.target.removeEventListener("click", this.removeTag);

        const value = tag.querySelector(".tag__text").innerHTML;
        const name = tag.dataset.inputName;
        this.createdTags = this.createdTags.filter(tagData => {
            if (tagData.value === value && tagData.name === name) return false;
            return true;
        });

        if (noSubmit) return;
        Array.from(document.querySelectorAll((`input[name="${name}"]`)))
            .filter(i => i.value == value)
            .forEach(i => {
                if (i.getAttribute("type") == "radio") setUncheckedRadio.call(this, i);
                if (i.getAttribute("type") == "checkbox") setUncheckedCheckbox.call(this, i);
                setTimeout(() => this.jobsSearchForm.dispatchEvent(new Event("submit")), 100);
            });
        function setUncheckedRadio(input) {
            const noCountRelative = Array.from(document.querySelectorAll(`input[name="${input.name}"]`))
                .find(inp => inp.classList.contains("__no-count"));
            if (noCountRelative) {
                input.checked = false;
                noCountRelative.checked = true;
                noCountRelative.dispatchEvent(new Event("change"));
                input.dispatchEvent(new Event("checked"));
            }
        }
        function setUncheckedCheckbox(input) {
            input.checked = false;
            input.dispatchEvent(new Event("change"));
        }
    }
    renderAlarmDisruptor() {
        const node = `
        <li class="jobs-list__item jobs-list__alarm-disruptor alarm-disruptor">
            <div class="alarm-disruptor__inner alarm-disruptor__inner--inline">
                <div class="alarm-disruptor__image">
                    <img src="../img/icons/notify-bell.svg" alt="Колокольчик">
                </div>
                <h3 class="alarm-disruptor__headline">
                    <p>Мы подберем вакансии по выбранным позициям</p>
                    <p>Отправить запрос?</p>
                </h3>
                <form novalidate class="alarm-disruptor__form">
                    <button class="alarm-disruptor__submit-button button" type="button">
                        Получать уведомления о вакансиях
                    </button>
                    <div class="alarm-disruptor__no-spam-text">
                        Вы получите только уведомления о вакансиях - ничего больше!
                    </div>
                </form>
            </div>
        </li>
        `;
        this.jobsListContainer.insertAdjacentHTML("beforeend", node);
        this.isRenderedAlarmDisruptor = true;
    }
    changeInfoBoxLink(params) {
        // params = { doRemove: false|true, jobId: number }
        if (params.doRemove) {
            this.infoBox.classList.add("__removed");
            return;
        }

        const link = this.infoBox.querySelector(".jobs-search-list__info-box-link");
        if (link) link.setAttribute("href", `${rootPath}jobs/${params.jobId}/`);
        this.infoBox.classList.remove("__removed");
    }
}

// элемент в списке вакансий. Экземпляр должен вызываться из JobsListing.renderJobs();
class JobDetailListItem {
    constructor(jobData) {
        this.init = this.init.bind(this);
        this.showLogo = this.showLogo.bind(this);

        this.jobData = jobData;
    }
    init() {
        this.jobId = this.rootElem.dataset.jobId;
        this.imageLink = this.rootElem.querySelector(".jobs-list__item-image-link");

        this.setLinksId();
        this.rootElem.addEventListener("click", jobDetailState.defineState.bind(jobDetailState));
        this.imageLink.addEventListener("click", this.showLogo);
    }
    render() {
        renderLocations = renderLocations.bind(this);

        return new Promise(resolve => {
            loadAndGetIcon(this.jobData.iconURL).then(icon => {
                this.rootElem = createElement("li", "jobs-list__item");
                this.rootElem.dataset.jobId = this.jobData.id;
                const nodeInner = `
                <div class="jobs-list__item-container">
                    <a class="jobs-list__item-image-container" href="#">
                        <span class="jobs-list__item-image-link">
                            ${icon}
                        </span>
                    </a>
                    <div class="jobs-list__item-data-container">
                        <h2 class="jobs-list__title">
                            <a class="jobs-list__title-link link" href="#">
                                ${this.jobData.title}
                            </a>
                        </h2>
                        <div class="jobs-list__meta">
                            <div class="jobs-list__item-company">
                                <a class="jobs-list__item-company-name"
                                    data-employer-title="${this.jobData.employer}"
                                    href="${this.jobData.url}"
                                    target="_blank">
                                    ${this.jobData.employer}
                                </a>
                            </div>
                            <div class="jobs-list__item-wrap">
                            <ul class="jobs-list__locations">
                                ${renderLocations()}
                            </ul>
                            <a class="jobs-list__item-date link" href="#">
                                ${this.jobData.date}
                            </a>
                            </div>
                        </div>
                        <p class="jobs-list__snippet">
                            <a href="#">
                                ${this.jobData.description}
                            </a>
                        </p>
                        <div class="jobs-list__user-action-container">
                            <div class="jobs-list__watch-list">
                                <button class="jobs-list__user-button icon-star"
                                    data-changing-button="classList='icon-star:-icon-star-full', contentContainer='.jobs-list__user-button-text', content='В избранное:-В избранном'">
                                    <span class="jobs-list__user-button-text">
                                        В избранное
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                this.rootElem.insertAdjacentHTML("afterbegin", nodeInner);
                this.renderEmployerPills();

                this.init();
                jobDetailState.defineState();
            }).finally(resolve);
        });

        function renderLocations() {
            const locationLink = `<a class="jobs-list__location-link link" href="#">[[]]</a>`;
            const locationItem = `
                <li class="jobs-list__location">[[]]</li>
            `;
            let renderedList = ``;
            this.jobData.locations.forEach((lct, lctIndex, locationsArray) => {
                const districts = lct.districts;
                const cityLink = locationLink.replace("[[]]", lct.city) + ",";
                renderedList += locationItem.replace("[[]]", cityLink);
                if (Array.isArray(districts)) {
                    districts.forEach((dstr, index) => {
                        let distrLink = locationLink.replace("[[]]", dstr);

                        if (index === districts.length - 1) distrLink += " район";
                        else distrLink += ",";

                        if (index > 0 && index === districts.length - 1) distrLink += "ы";
                        if (lctIndex < locationsArray.length - 1) distrLink += ";";
                        renderedList += locationItem.replace("[[]]", distrLink);
                    });
                } else {
                    let distrLink = locationLink.replace("[[]]", lct.districts);
                    if (lctIndex < locationsArray.length - 1) distrLink += ";";
                    renderedList += locationLink.replace("[[]]", distrLink);
                }
            });
            return renderedList;
        }
    }
    renderEmployerPills() {
        loadData(`${rootPath}json/employers.json`).then(empsData => {
            const employerData = empsData.find(e => e.id === this.jobData.employerId);
            if (!employerData.video && !employerData.employer) return;

            const imageBlock = this.rootElem.querySelector(".jobs-list__item-image-container");
            const pillNode =
                createElement("span", "small-pill small-pill--m-top small-pill--full");
            if (employerData.employer) {
                let pill = pillNode.cloneNode();
                pill.insertAdjacentText("afterbegin", "ЕСТЬ ОПИСАНИЕ");
                imageBlock.append(pill);
            }
            if (employerData.video) {
                let pill = pillNode.cloneNode();
                pill.classList.add("small-pill--dark");
                pill.insertAdjacentText("afterbegin", "ВИДЕО");
                imageBlock.append(pill);
            }
        });
    }
    setLinksId() {
        const links = this.rootElem.querySelectorAll("a");
        links.forEach(link => {
            if (link.getAttribute("href") == "#") link.href = `#${this.jobId}`;
        });
    }
    setState() {
        const chosenJobId = window.location.hash.replace("#", "");
        if (chosenJobId == this.jobId) this.rootElem.classList.add("__active");
        else this.rootElem.classList.remove("__active");
    }
    showLogo(event) {
        event.stopPropagation();
        event.preventDefault();

        const logoModal = new JobLogoModal(this.jobData.employerId);
        logoModal.createBasicModal();
    }
}

// элемент в списке вакансий, представляющий запрос на оповещение
class AlarmDisruptorListItem {
    constructor(listItem) {
        this.onAlarmSubmit = this.onAlarmSubmit.bind(this);

        this.rootElem = observeNodeBeforeInit(listItem);
        this.elemInner = this.rootElem.querySelector(".alarm-disruptor__inner");

        this.init();
    }
    init() {
        this.submitButton = this.rootElem.querySelector(".alarm-disruptor__submit-button");
        this.submitButton.addEventListener("click", this.onAlarmSubmit);
        this.submitButton.addEventListener("click", this.dispatchAlarmPillSubmit);
    }
    onAlarmSubmit() {
        this.elemOriginHTML = this.elemInner.innerHTML;
        setTimeout(() => {
            this.elemInner.innerHTML = `
            <div class="alarm-disruptor__image">
                <img src="../img/icons/phone-notify.jpg" alt="Уведомление на телефон">
            </div>
            <h3 class="alarm-disruptor__headline">
                <p>Новые вакансии, подходящие по запросам вашего поиска, будут отправлены на ваш E-Mail адрес.</p>
            </h3>
        `;
        }, 100);
    }
    dispatchAlarmPillSubmit() {
        const alarmDisruptors = inittedInputs
            .filter(inpParams => inpParams instanceof AlarmDisruptorPill);

        alarmDisruptors.forEach(alarmDisruptor => alarmDisruptor.submitAlarm.call(this));
    }
    onAlarmCancel() {
        this.elemInner.innerHTML = this.elemOriginHTML;
        this.init();
    }
}

// кнопка для создания оповещения
class AlarmDisruptorPill {
    constructor(container) {
        this.toggleBox = this.toggleBox.bind(this);
        this.submitAlarm = this.submitAlarm.bind(this);
        this.createAlarmEditModal = this.createAlarmEditModal.bind(this);
        this.setParamsAutocomplete = this.setParamsAutocomplete.bind(this);

        this.rootElem = observeNodeBeforeInit(container);
        this.btnShow = this.rootElem.querySelector(".alarm-disruptor-pill__button");
        this.btnText = this.btnShow.querySelector(".alarm-disruptor-pill__text");
        this.box = this.rootElem.querySelector(".alarm-disruptor-pill__box");
        this.btnSubmit = this.rootElem.querySelector(".alarm-disruptor-pill__submit");
        this.btnClose = this.rootElem.querySelector(".alarm-disruptor-pill__close");
        this.alarmForm = this.rootElem.querySelector(".alarm-disruptor-pill__form");
        this.jobsSearchForm = document.querySelector("#jobs-search-form");

        this.btnShow.addEventListener("click", this.toggleBox);
        this.btnClose.addEventListener("click", this.toggleBox);
        this.btnSubmit.addEventListener("click", this.submitAlarm);
    }
    toggleBox() {
        if (this.box.classList.contains("__removed")) {
            this.box.classList.remove("__removed");
            this.btnShow.classList.add("__removed");
        } else {
            this.box.classList.add("__removed");
            this.btnShow.classList.remove("__removed");
        }
    }
    submitAlarm() {
        const inputs = Array.from(this.rootElem.querySelectorAll("input"));
        this.getCheckedAlarmValues();

        if (inputs.find(inp => inp.checked)) {
            this.btnTextOrigin = this.btnText.innerHTML;
            this.btnText.innerHTML = "Изменить настройки оповещений";
            this.btnText.className = this.btnText.className.replace("icon-bell", "icon-pencil");
            this.box.classList.add("__removed");
            this.btnShow.classList.remove("__removed");
            this.btnShow.removeEventListener("click", this.toggleBox);
            this.btnShow.addEventListener("click", this.createAlarmEditModal);
            snackbar.create({
                text: "Оповещение о вакансиях создано",
            });
        }

        this.alarmDisruptorListItems = inittedInputs
            .filter(inpParams => inpParams instanceof AlarmDisruptorListItem);
        this.alarmDisruptorListItems.forEach(alarm => alarm.onAlarmSubmit());
    }
    cancelAlarm() {
        this.btnText.innerHTML = this.btnTextOrigin;
        this.btnText.className = this.btnText.className.replace("icon-pencil", "icon-bell");
        this.btnShow.addEventListener("click", this.toggleBox);
        this.btnShow.removeEventListener("click", this.createAlarmEditModal);
        snackbar.create({
            text: "Оповещение о вакансиях отменено"
        });

        if (Array.isArray(this.alarmDisruptorListItems))
            this.alarmDisruptorListItems.forEach(alarm => alarm.onAlarmCancel());
    }
    getCheckedAlarmValues() {
        // сбор введенных компании, местоположения и радиуса
        const keywordsInput = this.jobsSearchForm.querySelector("#keywords");
        const locationInput = this.jobsSearchForm.querySelector("#locations");
        const radius = Array.from(this.jobsSearchForm.querySelectorAll("[name='proximity-radius']"))
            .find(inp => inp.checked);
        this.searchFormValues = {};
        if (keywordsInput) this.searchFormValues.keywords = keywordsInput.value;
        if (locationInput) this.searchFormValues.location = locationInput.value;
        if (radius) this.searchFormValues.radius = radius.value;

        // сбор выбранных фильтров
        this.checkedFilters = Array.from(this.jobsSearchForm.querySelectorAll("input"))
            .filter(inp => inp.checked);

        // сбор выбранного периода отправления оповещений
        this.alarmPeriod = this.alarmForm.querySelector("input:checked");
    }
    createAlarmEditModal() {
        applyBtnHandler = applyBtnHandler.bind(this);
        removeBtnHandler = removeBtnHandler.bind(this);

        const jobsSearchFormMin = createElement("div", "jobs-search-form jobs-search-form--min");
        const textInputs = `
            <div class="text-input jobs-search-form__search-input" role="combobox"
            aria-expanded="false">
                <span class="text-input__icon-label icon-search"></span>
                <button class="text-input__close-icon icon-close"></button>
                <input type="text" name="keywords" id="alarm-params_keywords"
                    class="text-input__input text-input__wrapper" role="searchbox"
                    aria-haspopup="listbox" aria-controls="keywords-autocomplete" spellcheck="false"
                    autocapitalize="off" autocomplete="off" placeholder="Профессия, компания"
                    ${this.searchFormValues.keywords ? "value='" + this.searchFormValues.keywords + "'" : ""}>
                <ul class="text-input__autocomplete autocomplete __removed" id="alarm-params_keywords-autocomplete"
                    role="listbox" aria-label="Автозаполнение">
                    <li class="autocomplete__item" role="option">
                        <span class="autocomplete__item-regular">Эл</span>
                        <span>емент</span>
                    </li>
                    <li class="autocomplete__item" role="option">
                        <span class="autocomplete__item-regular">Эл</span>
                        <span>емент2</span>
                    </li>
                    <li class="autocomplete__item" role="option">
                        <span class="autocomplete__item-regular">Эл</span>
                        <span>емент312321321</span>
                    </li>
                </ul>
            </div>
            <div class="jobs-search-form__proximity-container">
                <div class="text-input jobs-search-form__location-input">
                    <span class="text-input__icon-label icon-location"></span>
                    <button class="text-input__close-icon icon-close"></button>
                    <input type="text" name="locations" id="alarm-params_locations"
                        class="text-input__input text-input__wrapper"
                        placeholder="Регион, населенный пункт" 
                        ${this.searchFormValues.location ? "value='" + this.searchFormValues.location + "'" : ""}>
                </div>
                <div class="jobs-search-form__proximity">
                    <div class="dropdown dropdown--with-input">
                        <button class="dropdown__button icon-chevron-down" type="button"
                            data-require-user="button">
                            <span class="dropdown__text">Радиус</span>
                        </button>
                        <ul class="dropdown__list">
                            <li class="dropdown__option">
                                <label class="dropdown__label">
                                    <input type="radio" name="proximity-radius" value="0 км" id="alarm-params_proximity-radius-1">
                                    0 км
                                </label>
                            </li>
                            <li class="dropdown__option">
                                <label class="dropdown__label">
                                    <input type="radio" name="proximity-radius" value="50 км" id="alarm-params_proximity-radius-2">
                                    50 км
                                </label>
                            </li>
                            <li class="dropdown__option">
                                <label class="dropdown__label">
                                    <input type="radio" name="proximity-radius" value="100 км" id="alarm-params_proximity-radius-3">
                                    100 км
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            `;
        const filter = `
            <div class="jobs-search-form__filter jobs-filter" data-filter-nameprefix="alarm-params_">
                <div class="jobs-filter__container">
                    <div class="jobs-filter__inner">
                        <div class="jobs-filter__groups">
                            <div class="jobs-filter__dropdown spoiler"
                                data-jobfilter-name="professional-area">
                                <button
                                    class="jobs-filter__group-button headline-m spoiler__button icon-chevron-down"
                                    aria-label="Фильтр по профессиональным областям" type="button">
                                    <span class="jobs-filter__group-button-text">
                                        Профессиональные области
                                    </span>
                                </button>
                                <ul class="jobs-filter__group-list spoiler__hideable"></ul>
                            </div>
                            <div class="jobs-filter__dropdown spoiler"
                                data-jobfilter-name="employment-type">
                                <button
                                    class="jobs-filter__group-button headline-m spoiler__button icon-chevron-down"
                                    aria-label="Фильтр по типу занятости" type="button">
                                    <span class="jobs-filter__group-button-text">
                                        Тип занятости
                                    </span>
                                </button>
                                <ul class="jobs-filter__group-list spoiler__hideable"></ul>
                            </div>
                            <div class="jobs-filter__dropdown spoiler"
                                data-jobfilter-name="work-experience">
                                <button
                                    class="jobs-filter__group-button headline-m spoiler__button icon-chevron-down"
                                    aria-label="Фильтр по опыту" type="button">
                                    <span class="jobs-filter__group-button-text">
                                        Опыт работы
                                    </span>
                                </button>
                                <ul class="jobs-filter__group-list spoiler__hideable"></ul>
                            </div>
                            <div class="jobs-filter__dropdown spoiler"
                                data-click-closable="0 false, 720 true" data-jobfilter-name="salary">
                                <button
                                    class="jobs-filter__group-button headline-m spoiler__button icon-chevron-down"
                                    aria-label="Фильтр по заработной плате" type="button"
                                    data-require-user="button-close-icon, signup">
                                    <span class="jobs-filter__group-button-text">
                                        Заработная плата
                                    </span>
                                </button>
                                <ul class="jobs-filter__group-list spoiler__hideable"></ul>
                            </div>
                            <div class="jobs-filter__groups-checkbox checkbox" data-jobfilter-name="homeoffice"></div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        jobsSearchFormMin.insertAdjacentHTML("afterbegin", textInputs);
        jobsSearchFormMin.insertAdjacentHTML("beforeend", filter);

        const alarmBoxInfo = createElement("div", "alarm-box-info");
        const alarmBoxInfoInner = `
        <div class="jobs-search__alarm-disruptor__pill alarm-disruptor-pill alarm-disruptor-pill--noinit"
        data-require-user="render">
            <p class="alarm-disruptor-pill__box-headline">
                Как часто мы должны сообщать Вам о новых вакансиях по этому поиску?
            </p>
            <div class="alarm-disruptor-pill__form">
                <div class="alarm-disruptor-pill__choice">
                    <div class="alarm-disruptor-pill__radio-group radio-group">
                        <input class="radio-group__input" id="alarm-params_vacancy-notification-1"
                            name="vacancy-notification" type="radio" checked>
                        <label class="radio-group__label" for="alarm-params_vacancy-notification-1">
                            Раз в день
                        </label>
                        <input class="radio-group__input" name="vacancy-notification"
                            id="alarm-params_vacancy-notification-2" type="radio">
                        <label class="radio-group__label" for="alarm-params_vacancy-notification-2">
                            Раз в неделю
                        </label>
                        <input class="radio-group__input" id="alarm-params_vacancy-notification-3"
                            name="vacancy-notification" type="radio">
                        <label class="radio-group__label" for="alarm-params_vacancy-notification-3">
                            Не присылать
                        </label>
                    </div>
                </div>
            </div>
        </div>
        `;
        alarmBoxInfo.insertAdjacentHTML("beforeend", alarmBoxInfoInner);

        // создание модального окна и обработчиков для его кнопок
        const modalContent = {
            bodyContent: `${jobsSearchFormMin.outerHTML}${alarmBoxInfo.outerHTML}`,
            titleText: "Изменение настроек оповещений",
            applyButtonText: "Сохранить изменения",
            removeButtonText: "Отменить отправку оповещений"
        };
        const modalHanlders = { applyBtnHandler, removeBtnHandler };
        this.paramsModal = new FormModal(modalContent, modalHanlders);
        this.paramsModal.applyBtn.setAttribute("disabled", "");

        document.addEventListener("filterRendered", () => {
            setTimeout(() => {
                this.setParamsAutocomplete();
                this.searchBoxInputs = [
                    this.paramsModal.content.querySelector("[name='keywords']"),
                    this.paramsModal.content.querySelector("[name='locations']"),
                    this.paramsModal.content.querySelector("[name='proximity-radius']")
                ];
                setTimeout(() => this.initModalApplyBtnCheck(), 100);
            }, 0);
        });

        function applyBtnHandler() {
            snackbar.create({
                text: "Настройки оповещений изменены"
            });

            // применить изменения на фильтры
            this.searchBoxInputs.forEach(inp => {
                if (!inp) return;
                const originalInput = this.jobsSearchForm.querySelector(`[name*="${inp.name}"]`);
                if (!originalInput) return;

                if (inp.type === "text") {
                    originalInput.value = inp.value;
                    inp.dispatchEvent(new Event("input"));
                }
                if (inp.type === "radio" || inp.type === "checkbox")
                    originalInput.checked = inp.checked;
                inp.dispatchEvent(new Event("change"));
            });
            this.jobsSearchForm.dispatchEvent(new Event("submit"));

            this.paramsModal.removeModal();
        }
        function removeBtnHandler() {
            this.cancelAlarm();
            this.paramsModal.removeModal();
        }
    }
    initModalApplyBtnCheck() {
        checkAutocompleteChanges = checkAutocompleteChanges.bind(this);

        const applyBtn = this.paramsModal.applyBtn;
        const modalForm = this.paramsModal.content.closest("form");
        const checkedParamsInputs = Array.from(this.paramsModal.content.querySelectorAll("input"))
            .filter(inp => inp.checked);
        const searchInputValues = {
            keywords: this.searchBoxInputs[0].value,
            locations: this.searchBoxInputs[1].value
        };

        checkAutocompleteChanges();
        modalForm.addEventListener("change", checkAutocompleteChanges);
        for (let i = 0; i < 2; i++) {
            this.searchBoxInputs[i].addEventListener("input", checkAutocompleteChanges);
        }

        function checkAutocompleteChanges() {
            const newCheckedParamsInputs = Array.from(this.paramsModal.content.querySelectorAll("input"))
                .filter(inp => inp.checked);

            let hasDifference = false;
            for (let inp of newCheckedParamsInputs) {
                if (!checkedParamsInputs.includes(inp)) {
                    hasDifference = true;
                    break;
                }
            }
            if (this.searchBoxInputs[0].value !== searchInputValues.keywords)
                hasDifference = true;
            if (this.searchBoxInputs[1].value !== searchInputValues.locations)
                hasDifference = true;

            if (hasDifference) enableApplyBtn();
            else disableApplyBtn();
        }
        function disableApplyBtn() {
            applyBtn.setAttribute("disabled", "");
        }
        function enableApplyBtn() {
            applyBtn.removeAttribute("disabled");
        }
    }
    setParamsAutocomplete() {
        const changeEvent = new Event("change");
        if (this.searchFormValues.radius) {
            const radiusInp = this.paramsModal.content.querySelector(
                `input[value="${this.searchFormValues.radius}"]`
            );
            if (radiusInp) {
                radiusInp.checked = true;
                radiusInp.dispatchEvent(changeEvent);
            }
        }
        this.checkedFilters.forEach(checkedInp => {
            const id = checkedInp.getAttribute("id");
            const paramsInp = this.paramsModal.content.querySelector(`[id*="${id}"]`);
            if (paramsInp) {
                paramsInp.checked = true;
                paramsInp.dispatchEvent(changeEvent);
            }
        });
        if (this.alarmPeriod) {
            const id = this.alarmPeriod.getAttribute("id");
            const inp = this.paramsModal.content.querySelector(`[id*="${id}"]`);
            inp.checked = true;
            inp.dispatchEvent(changeEvent);
        }
    }
}

// детали вакансии
class JobDetail {
    constructor(elem) {
        this.onContainerScroll = this.onContainerScroll.bind(this);
        this.removeLoadingOverlay = this.removeLoadingOverlay.bind(this);
        this.createLoadingOverlay = this.createLoadingOverlay.bind(this);
        this.onTabBarClick = this.onTabBarClick.bind(this);

        this.rootElem = observeNodeBeforeInit(elem);
        this.isEmbedded = this.rootElem.querySelector(".job-detail--embedded");
        this.jobDetail = this.rootElem.querySelector(".job-detail");
        this.container = this.rootElem.querySelector(".job-detail__container");
        this.noHideHeaderMedia = window.matchMedia("(min-width: 720px)");
        this.loadingOverlay = this.rootElem.querySelector(".jobs-detail-wrapper__loading");


        if (this.loadingOverlay) this.loadingOverlay.classList.add("__removed");
        if (this.isEmbedded) {
            this.closeContainer = this.rootElem.querySelector(".job-detail__close");
            this.closeButton = this.closeContainer.querySelector(".job-detail__close-button");
            this.emptyState = this.rootElem.querySelector(".job-empty-state");
            this.container.addEventListener("scroll", this.onContainerScroll);
        }
        else {
            this.setShowState();
            window.addEventListener("scroll", this.onContainerScroll);
        }

        if (this.closeButton) {
            this.closeButton.addEventListener("click", () => {
                jobDetailState.setHideState();
                window.location.href = window.location.href.replace(/#.*/, "#");
            });
        }
    }
    getJobId() {
        if (this.isEmbedded)
            this.jobId = window.location.hash.replace("#", "");
        else {
            const id = window.location.pathname.match(/\/\d+\//g)[0].replace(/\//g, "");
            this.jobId = id;
        }
    }
    createLoadingOverlay() {
        this.loadingOverlay.classList.remove("__removed");
        if (this.loadingOverlay.querySelector(".loading-overlay__dot")) return;

        const innerHTML = `
        <div class="loading-overlay__ellipsis">
            <span class="loading-overlay__dot"></span>
            <span class="loading-overlay__dot"></span>
            <span class="loading-overlay__dot"></span>
        </div>`;
        this.loadingOverlay.insertAdjacentHTML("afterbegin", innerHTML);
    }
    removeLoadingOverlay() {
        this.loadingOverlay.classList.add("__removed");
        this.loadingOverlay.innerHTML = "";
    }
    setShowState() {
        this.jobDetail.classList.add("job-detail--shown");
        if (this.emptyState) this.emptyState.classList.add("__removed");
        this.getJobId();

        this.renderJobDetail();
        if (this.closeContainer) this.closeContainer.style.removeProperty("top");
    }
    renderJobDetail() {
        getData = getData.bind(this);
        this.drawingContent = true;

        this.createLoadingOverlay();
        loadData(jobsDataURL)
            .then(getData)
            .finally(this.removeLoadingOverlay);

        function getData(data) {
            if (!Array.isArray(data)) return;

            data = data.find(item => item.id === this.jobId);
            if (!data) return;

            this.contentTemplate = `
            <div class="job-detail__content">
                <div class="job-header ${this.isEmbedded ? 'job-header-m' : ''}">
                    <div class="job-header__inner">
                        <div class="job-header__info">
                            <h1 class="job-header__job-title ${this.isEmbedded ? '' : 'job-header__job-title--min'}">
                                ${data.title}
                            </h1>
                            <ul class="job-header__meta-list custom-scrollbar">
                                <li class="job-header__meta-item icon-building-with-tree">
                                    <a class="job-header__company-link link" href="${data.url}">
                                        ${data.employer}
                                    </a>
                                </li>
                                <li class="job-header__meta-item icon-location">
                                    ${renderLocations()}
                                </li>
                                <li class="job-header__meta-item icon-clock-arrow">
                                    ${arrayToString(data["employment-type"])}
                                </li>
                                <li class="job-header__meta-item icon-portfolio">
                                    ${data.expierence}
                                </li>
                                <li class="job-header__meta-item icon-calendar-empty">
                                    <a class="job-header__company-link link" href="${data.url}">
                                        ${data.date}
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div class="job-header__actions">
                            <div class="job-header__action job-header__print ">
                                <button class="job-header__button button  button--transparent icon-printer"
                                    aria-label="Распечатать вакансию"></button>
                            </div>
                            <div class="job-header__action job-header__share">
                                <button class="job-header__button button button--transparent icon-share icon--margin"
                                    aria-label="Поделиться вакансией" data-show-more=".share-modal"
                                    data-click-closable="0 true">Поделиться</button>
                                <div class="share-modal">
                                    <div class="share-modal__overlay" data-show-more=".share-modal"></div>
                                    <div class="share-modal__content">
                                        <div class="share-modal__close-container">
                                            <span class="share-modal__headline">
                                                Поделиться вакансией
                                            </span>
                                            <button class="share-modal__close icon-close"
                                                aria-label="Скрыть окно с предложением поделиться"
                                                data-show-more=".share-modal"></button>
                                        </div>
                                        <div class="share-modal__share-container">
                                            <div class="share-modal__link share-link icon-link-share">
                                                <input type="text" disabled class="share-link__input" value="https://job1.ru">
                                            </div>
                                            <button class="share-modal__copy-button button button--transparent">
                                                Скопировать ссылку
                                            </button>
                                            <ul class="share-modal__options">
                                                <li class="share-modal__option-item">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.61 18">
                                                        <path fill="currentColor"
                                                            d="M15.16 3.73H2.45c-.8 0-1.45.67-1.45 1.5v7.98c0 .83.65 1.5 1.45 1.5h12.7c.8 0 1.45-.67 1.45-1.5V5.23c.01-.83-.64-1.5-1.44-1.5zM2 5.39L5.99 8.8 2 12.95V5.39zm6.81 4.5L2.77 4.73h12.07L8.81 9.89zm-2.06-.44l1.73 1.48a.49.49 0 0 0 .64 0l1.73-1.48 4.09 4.26H2.66l4.09-4.26zm4.88-.66l3.99-3.41v7.56l-3.99-4.15z">
                                                        </path>
                                                    </svg>
                                                    <a class="share-modal__option-link" href="#">Отправить по E-Mail</a>
                                                </li>
                                                <li class="share-modal__option-item">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="115.029 58.1333 155.9 268.8">
                                                        <path d="M 189.00,58.42
                                                                C 196.54,57.51 206.72,58.87 214.00,61.04
                                                                263.59,75.76 280.01,137.11 245.27,174.91
                                                                240.01,180.64 232.97,186.14 226.00,189.63
                                                                214.95,195.16 204.25,197.14 192.00,197.00
                                                                140.94,196.40 109.95,140.63 132.27,96.00
                                                                140.41,79.73 155.53,66.72 173.00,61.44
                                                                179.90,59.35 182.28,59.40 189.00,58.42 Z
                                                                M 193.00,98.32
                                                                C 184.45,99.49 178.27,101.18 172.33,108.04
                                                                156.29,126.53 167.80,155.44 193.00,156.91
                                                                225.14,158.78 235.30,113.47 206.00,100.88
                                                                201.90,99.12 197.44,98.23 193.00,98.32 Z
                                                                M 169.00,253.00
                                                                C 154.80,249.23 129.28,242.11 119.53,230.82
                                                                108.77,218.35 118.64,198.95 135.00,200.10
                                                                141.62,200.56 150.38,207.12 157.00,210.22
                                                                166.27,214.57 180.76,217.88 191.00,218.00
                                                                205.25,218.16 216.94,215.70 230.00,210.00
                                                                238.33,206.36 244.27,199.42 254.00,200.10
                                                                264.66,200.84 271.63,209.51 270.90,220.00
                                                                270.32,228.37 265.75,232.73 259.00,236.94
                                                                249.25,243.00 230.45,251.44 219.00,252.00
                                                                223.76,258.65 243.92,277.92 251.00,285.00
                                                                255.42,289.42 263.18,296.18 265.15,302.00
                                                                270.41,317.57 255.07,331.79 240.00,325.03
                                                                235.25,322.90 231.81,318.61 228.00,315.17
                                                                228.00,315.17 207.00,295.00 207.00,295.00
                                                                204.65,292.65 196.81,283.99 194.00,283.62
                                                                190.29,283.13 183.64,292.28 180.99,295.00
                                                                180.99,295.00 159.00,318.00 159.00,318.00
                                                                153.91,323.02 148.70,327.56 141.00,326.80
                                                                130.93,325.81 123.39,317.13 124.10,307.00
                                                                124.75,297.58 131.00,293.34 136.91,287.00
                                                                136.91,287.00 158.91,264.00 158.91,264.00
                                                                158.91,264.00 169.00,253.00 169.00,253.00 Z" fill="#f7931e" />
                                                    </svg>
                                                    <a class="share-modal__option-link" href="#">Отправить через ОК</a>
                                                </li>
                                                <li class="share-modal__option-item">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="92.2132 145.6 263.9 156.8">
                                                        <path
                                                            d="M 97.3 145.999 C 97.3 145.999 128.8 145.6 128.8 145.6 C 131.425 145.607 134.057 145.509 136.493 146.699 C 141.925 149.359 144.48 159.677 146.524 165.2 C 151.935 179.837 162.47 201.495 171.304 214.2 C 175.196 219.8 181.342 228.13 186.9 231.945 C 191.268 234.941 195.37 233.527 196.623 228.2 C 196.735 226.856 196.7 224.714 196.623 223.3 C 196.623 223.3 196.623 181.3 196.623 181.3 C 196.693 175.49 195.524 169.512 192.451 164.5 C 190.036 160.559 184.94 155.995 185.668 151.2 C 186.48 145.831 190.974 145.607 195.3 145.6 C 195.3 145.6 235.9 145.6 235.9 145.6 C 245.301 145.614 246.295 149.492 246.491 158.2 C 246.491 158.2 246.491 211.4 246.491 211.4 C 246.4 212.863 246.351 214.907 246.491 216.3 C 247.688 220.682 250.635 222.523 254.8 220.5 C 258.51 218.694 265.041 211.862 267.792 208.6 C 278.887 195.447 288.274 177.807 295.925 162.4 C 300.349 153.496 300.909 145.747 312.9 145.6 C 312.9 145.6 341.6 145.6 341.6 145.6 C 343.007 145.621 344.442 145.621 345.8 146.055 C 355.334 149.086 348.075 162.386 345.275 168 C 337.673 183.197 328.377 197.281 318.969 211.4 C 316.421 215.215 308.343 225.554 308.602 229.6 C 308.917 234.619 318.395 242.795 322 246.4 C 331.513 255.913 343.854 270.151 351.162 281.4 C 355.152 287.553 360.451 298.809 350 301.847 C 348.243 302.358 346.892 302.379 345.1 302.4 C 345.1 302.4 317.8 302.4 317.8 302.4 C 307.118 302.274 303.373 296.31 296.744 289.1 C 287.658 279.223 278.488 268.835 267.4 261.128 C 262.507 257.726 250.348 250.88 246.918 259.7 C 246.309 261.268 246.4 263.613 246.4 265.3 C 246.4 265.3 246.4 287.7 246.4 287.7 C 246.393 290.668 246.414 294.119 244.902 296.786 C 242.144 301.679 233.996 302.337 228.9 302.4 C 202.265 302.708 179.445 292.306 159.6 274.897 C 146.293 263.228 136.08 248.654 126.665 233.8 C 115.43 216.09 107.478 201.516 99.68 182 C 96.929 175.119 93.562 165.445 92.344 158.2 C 91.392 152.544 95.9 148.4 97.3 145.999 Z"
                                                            fill="#5181b8" />
                                                    </svg>
                                                    <a class="share-modal__option-link" href="#">Отправить через ВК</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="job-header__action job-header__watchlist">
                                <button
                                    data-changing-button="classList='icon-star:-icon-star-full', contentContainer='.jobs-list__user-button-text', content='В избранное:-В избранном'"
                                    class="job-header__button button button--transparent icon-star icon--margin">
                                    В избранное
                                </button>
                            </div>
                            <div class="job-header__action job-header__watchlist">
                                <button class="job-header__button button">
                                    Откликнуться
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="job-detail__tab-bar">
                    <div class="job-detail__tab-bar-inner">
                        <ul class="job-detail__tab-bar-list">
                            <li class="job-detail__tab-bar-item">
                                <button class="job-detail__tab-bar-button" aria-label="Показать информацию о вакансии"
                                    data-tabbar-job="job">
                                    Вакансия
                                </button>
                            </li>
                            <li class="job-detail__tab-bar-item">
                                <button class="job-detail__tab-bar-button" aria-label="Показать информацию о работодателе"
                                    data-tabbar-job="employer">
                                    О работодателе
                                </button>
                            </li>
                        </ul>
                        <button class="job-detail__tab-bar-print icon-printer" aria-label="Распечатать вакансию">
                            Распечатать
                        </button>
                    </div>
                </div>
                <div class="job-content"></div>
            </div>
            `;
            this.container.innerHTML = "";
            this.container.insertAdjacentHTML("afterbegin", this.contentTemplate);
            this.jobData = data;
            this.header = this.rootElem.querySelector(".job-header");
            this.jobContent = this.container.querySelector(".job-content");
            this.initTabBarButtons();
            this.onContainerScroll();

            const logoRenderMedia = window.matchMedia("(min-width: 1248px)");
            if (!this.isEmbedded && logoRenderMedia.matches) this.renderLogo();
            else if (!this.isEmbedded) {
                onLogoMediaChange = onLogoMediaChange.bind(this);
                logoRenderMedia.addEventListener("change", onLogoMediaChange);
            }

            function renderLocations() {
                const linkTemplate =
                    `<a class="job-header__company-link link" href="#">[[]]</a>`;

                let renderedList = ``;
                data.locations.forEach((lct, lctIndex, locationsArray) => {
                    const distrs = lct.districts;
                    renderedList += linkTemplate.replace("[[]]", lct.city + ", ");
                    if (Array.isArray(distrs)) {
                        distrs.forEach((drct, index) => {
                            let distrStr = drct;

                            if (index < distrs.length - 1) distrStr += ", ";

                            renderedList += linkTemplate.replace("[[]]", distrStr);

                            if (index === distrs.length - 1) {
                                renderedList += " район";
                                if (index > 0) renderedList += "ы";
                            }
                            if (index === distrs.length - 1 && lctIndex < locationsArray.length - 1)
                                renderedList += ";";
                        });
                    } else {
                        let distrStr = distrs;
                        if (lctIndex < locationsArray.length - 1) distrStr += ";";
                        renderedList += linkTemplate.replace("[[]]", distrStr);
                    }
                });
                return renderedList;
            }
            function onLogoMediaChange() {
                if (logoRenderMedia.matches) {
                    logoRenderMedia.removeEventListener("change", onLogoMediaChange);
                    this.renderLogo();
                }
            }
        }
    }
    renderJobContent() {
        calcIframeHeight = calcIframeHeight.bind(this);

        if (this.iframe) this.iframe.remove();
        this.iframe = createElement("iframe", "job-content__iframe");
        this.iframe.scrolling = "no";
        this.jobContent.append(this.iframe);

        const iframeSizes = getIframeSize(this.iframe);
        let iframeHeight = iframeSizes.height;
        let iframeWidth = iframeSizes.width;

        this.iframe.onload = () => {
            const observingIframe = this.iframe;
            calcIframeHeight();
            setTimeout(calcIframeHeight, 1000);
            const observer = new MutationObserver(() => {
                calcIframeHeight();
                setTimeout(calcIframeHeight, 1000);
                if (!observingIframe.closest("body")) observer.disconnect();
            });
            observer.observe(this.iframe.contentDocument.body, { subtree: true, childList: true, attributes: true });
            this.iframe.contentWindow.addEventListener("resize", calcIframeHeight);
        };
        this.iframe.src = `${rootPath}jobs/${this.jobId}/${this.currentTabBar}.html`;

        function calcIframeHeight(event) {
            const newIframeSizes = getIframeSize(this.iframe);
            const newIframeHeight = newIframeSizes.height;
            const newIframeWidth = newIframeSizes.width;
            // предотвращает изменение высоты, если при resize изменилась только длина
            if (event && newIframeHeight !== iframeHeight && newIframeWidth === iframeWidth)
                return;

            const iDocument = this.iframe.contentDocument;
            const iWrapper = iDocument.querySelector(".wrapper");
            const iWrapperStyles = getComputedStyle(iWrapper);
            if (!iWrapper) return setTimeout(() => calcIframeHeight(event), 100);

            let childrenHeight = 0;
            Array.from(iWrapper.childNodes)
                .filter(childNode => childNode.nodeType !== 3)
                .forEach(childNode => {
                    const styles = getComputedStyle(childNode);
                    const mTop = parseInt(styles.marginTop.replace(/\D/g, ""));
                    const mBottom = parseInt(styles.marginBottom.replace(/\D/g, ""));
                    
                    childrenHeight += mTop + mBottom;
                    childrenHeight += childNode.offsetHeight;
                });
            if (!childrenHeight) childrenHeight = iWrapper.offsetHeight;
            const pTop = parseInt(iWrapperStyles.paddingTop.replace(/\D/g, ""));
            const pBottom = parseInt(iWrapperStyles.paddingBottom.replace(/\D/g, ""));

            this.iframe.height = childrenHeight + pTop + pBottom; 

            iframeHeight = newIframeHeight;
            iframeWidth = newIframeWidth;
        }

        function getIframeSize(iframe) {
            return {
                height: iframe.contentDocument.clientHeight || iframe.contentWindow.innerHeight,
                width: iframe.contentDocument.clientWidth || iframe.contentWindow.innerWidth
            }
        }
    }
    renderLogo() {
        if (!this.header) return;

        const headerInner = this.header.querySelector(".job-header__inner");
        loadData(jobsDataURL).then(jobs => {
            const logoContainer = createElement("div", "job-header__logo");
            const jobData = jobs.find(job => job.id === this.jobId);
            if (!jobData) return;

            loadData(`${rootPath}${jobData.iconURL}`, "text").then(logo => {
                logoContainer.insertAdjacentHTML("afterbegin", logo);
                headerInner.prepend(logoContainer);
            });
        });
    }
    initTabBarButtons() {
        this.tabBarButtons = this.container.querySelectorAll(".job-detail__tab-bar-button");
        this.onTabBarClick(null, this.tabBarButtons[0]);
        this.tabBarButtons.forEach(btn => {
            btn.addEventListener("click", this.onTabBarClick);
            if (btn.dataset.tabbarJob === "employer") this.renderTabbarButtonPills(btn);
        });
    }
    renderTabbarButtonPills(btn) {
        loadData(`${rootPath}json/employers.json`).then(empsData => {
            const employerData = empsData.find(e => e.id === this.jobData.employerId);
            if (!employerData.video && !employerData.employer) return;

            const pillNode = createElement("span", "small-pill small-pill--m-left");
            if (employerData.employer) {
                const pill = pillNode.cloneNode();
                pill.insertAdjacentText("afterbegin", "ЕСТЬ ОПИСАНИЕ");
                btn.append(pill);
            }
            if (employerData.video) {
                const pill = pillNode.cloneNode();
                pill.classList.add("small-pill--dark");
                pill.insertAdjacentText("afterbegin", "ВИДЕО");
                btn.append(pill);
            }
        });
    }
    onTabBarClick(event, node) {
        const btn = event ? event.target : node;
        let tabBarValue = btn.dataset.tabbarJob;
        if (!tabBarValue) tabBarValue = btn.closest("[data-tabbar-job]").dataset.tabbarJob;
        if (!tabBarValue) tabBarValue = "job";

        this.tabBarButtons.forEach(btn => btn.classList.remove("__active"));
        btn.classList.add("__active");
        this.currentTabBar = tabBarValue;

        this.renderJobContent();
    }
    onContainerScroll() {
        if (!this.header) return;

        this.doFixHeader = this.isEmbedded
            ? this.container.scrollTop > this.header.offsetHeight
            : window.pageYOffset > this.header.offsetHeight;

        if (this.doFixHeader && !this.isHeaderFixed) {
            setTimeout(() => this.header.classList.add("__sticky"), 100);
            if (this.closeContainer) this.closeContainer.classList.add("__visible");
        } else {
            setTimeout(() => this.header.classList.remove("__sticky"), 100);
            if (this.closeContainer) {
                this.closeContainer.classList.remove("__visible");
                this.closeContainer.style.removeProperty("top");
            }
            this.header.style.removeProperty("top");
        }

        if (!this.noHideHeaderMedia.matches) this.hideHeader();
        this.scrollableElemScrollTop = this.isEmbedded
            ? this.container.scrollTop
            : window.pageYOffset;
    }
    hideHeader() {
        if (!this.doFixHeader) return;

        let isScrolledUp = false;
        if (this.isEmbedded) isScrolledUp = this.scrollableElemScrollTop < this.container.scrollTop;
        else isScrolledUp = this.scrollableElemScrollTop < window.pageYOffset;

        if (isScrolledUp) {
            this.header.style.top = "-500px";
            if (this.closeContainer) this.closeContainer.style.top = "-500px";
        } else {
            this.header.style.removeProperty("top");
            if (this.closeContainer) this.closeContainer.style.removeProperty("top");
        }
    }
    setHideState() {
        this.jobDetail.classList.remove("job-detail--shown");
        if (this.emptyState) this.emptyState.classList.remove("__removed");
        this.container.innerHTML = "";
        if (this.closeContainer) {
            setTimeout(() => this.closeContainer.style.top = "-500px", 100);
        }
    }
}

const jobDetailsSelectors = [
    { selector: ".alarm-disruptor-pill:not(.alarm-disruptor-pill--noinit)", classInstance: AlarmDisruptorPill },
    { selector: ".jobs-search__listing", classInstance: JobsListing },
    { selector: ".jobs-list__alarm-disruptor", classInstance: AlarmDisruptorListItem },
    { selector: ".job-detail-wrapper", classInstance: JobDetail }
];
doInit(jobDetailsSelectors);

inittingSelectors = inittingSelectors.concat(jobDetailsSelectors);