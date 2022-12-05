class CompanyPage {
    constructor(companyContainer) {
        this.rootElem = companyContainer;
        this.main = this.rootElem.querySelector(".company-page__main");
        this.sideBar = this.rootElem.querySelector(".company-page__side-bar");
        this.asideLeft = this.rootElem.querySelector(".company-page__aside--left");
        this.asideRight = this.rootElem.querySelector(".company-page__aside--right");
        this.employerId = this.rootElem.dataset.employerId;
        this.shownValuesAmount = 3;
        this.shownJobsAmount = 3;

        this.rootElem.removeAttribute("data-employer-id");
        loadData(`${rootPath}json/employers.json`).then(data => {
            this.companyData = data.find(ed => ed.id === this.employerId);
            this.renderPage();
        });
    }
    renderPage() {
        this.renderHeader();
        this.renderMain();
        this.renderSideBar();
        this.renderSimilarCompanies();
    }
    renderHeader() {
        const headerSection = `
        <header class="company-page__header company-header">
            <div class="company-header__inner">
                <div class="company-header__background-image company-header__background-image--fallback"></div>
                <div class="company-header__wrap">
                    <div class="company-header__image-container">
                        <a class="company-header__logo-link logo logo--bordered" href="/job1/f/${this.companyData.tag}/"
                            target="_blank">
                                <img class="company-header__logo-fallback" src="/job1/img/companies/fallback-logo.gif">
                            </a>
                    </div>
                    <div class="company-header__data-container">
                        <h1 class="company-header__title headline-3x1">
                            <a class="company-header__link link" href="/job1/f/${this.companyData.tag}/"
                                target="_blank">
                                ${this.companyData.title}
                            </a>
                        </h1>
                        <div class="company-header__details">
                            ${this.companyData.tags}
                        </div>
                        <div class="company-header__data">
                            <div class="company-header__data-item icon-clock">
                                ${this.companyData.regDate}
                            </div>
                            <div class="company-header__data-item ${this.companyData.onlineStatus.isOnline ? 'company-header__data-online' : ''} icon-dot">
                                ${this.companyData.onlineStatus.isOnline
                ? 'Онлайн'
                : 'Оффлайн (дней:' + this.companyData.onlineStatus.days + ')'
            }
                            </div>
                            <div class="company-header__star-rating star-rating" data-rating-value="${this.companyData.ratingValue}">
                                <div class="star-rating__stars">
                                    <div class="star-rating__stars-filled star-rating__stars-list"></div>
                                    <div class="star-rating__star-inputs star-rating__stars-list"></div>
                                </div>
                                <div class="star-rating__comment">
                                    комментариев:
                                    16
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="company-header__button-container">
                        <button class="company-header__button button icon-heart"
                            data-changing-button="classList='icon-heart:-__active icon-heart-full', content='Добавить компанию в избранное:-Убрать компанию из избранного'">
                            Добавить компанию в избранное
                        </button>
                    </div>
                </div>
            </div>
        </header>
        `;

        this.rootElem.insertAdjacentHTML("afterbegin", headerSection);
        this.loadLogo();
    }
    loadLogo() {
        loadData(`${rootPath}${this.companyData.iconURL}`, "text")
            .then(logo => {
                const imgFallback = this.rootElem.querySelector(".company-header__logo-fallback");
                if (imgFallback) {
                    imgFallback.insertAdjacentHTML("afterend", logo);
                    imgFallback.remove();
                }
            });
    }
    renderMain() {
        const fullMainLayout = `
            ${this.renderAbout()}
            ${this.renderInner()}
            ${this.renderValues()}
            ${this.renderJobs()}
        `;

        this.main.insertAdjacentHTML("afterbegin", fullMainLayout);
    }
    noPropOrEmptyArr(prop) {
        if (!prop) return true;
        if (typeof prop === "object" && (!Object.values(prop) || prop.length < 1)) return true;

        return false;
    }
    renderAbout() {
        let aboutHidden = "";
        const aboutData = this.companyData.about;
        if (this.noPropOrEmptyArr(aboutData) == false) {
            for (let contentData of aboutData) {
                if (contentData.type === "paragraph") {
                    aboutHidden += `
                        <p class="job-company__about-paragraph">${contentData.content}</p>
                    `;
                }
                if (contentData.type === "list") {
                    let list = "";
                    for (let item of contentData.content) {
                        list += `<li class="job-company__about-list-item">${item}</li>`;
                    }
                    aboutHidden += `<ul class="job-company__about-list">${list}</ul>`
                }
            }
        }

        const spoilerHideable = aboutHidden
            ? `<div class="spoiler__hideable">${aboutHidden}</div>`
            : "";
        const spoilerButton = aboutHidden
            ? `<button class="job-company__spoiler-button spoiler__button" data-spoiler-changing-text="Читать еще, Скрыть">Читать еще</button>`
            : "";

        return `
        <h2 class="company-page__headline headline-2x1">
            О компании Сормовская Фабрика
        </h2>
        <div class="job-company__about-text ${aboutHidden ? 'spoiler' : ''}">
            <p class="job-company__about-paragraph">${this.companyData.aboutTitle}</p>
            ${spoilerHideable}
            ${spoilerButton}
        </div>
        `;
    }
    renderInner() {
        renderFacts = renderFacts.bind(this);
        renderImages = renderImages.bind(this);

        return `
        <div class="company-page__main-inner">
            ${renderFacts()}
            ${renderImages()}
        </div>
        `;

        function renderFacts() {
            const facts = this.companyData.facts;
            if (this.noPropOrEmptyArr(facts)) return "";

            let list = "";
            for (let fact of facts) {
                let data = "";
                if (Array.isArray(fact.data)) {
                    fact.data.forEach((subfact, index) => {
                        const doInsertComma = index + 1 !== fact.data.length;
                        data += subfact + (doInsertComma ? ", " : "");
                    });
                } else data = fact.data;

                list += `
                    <div class="company-facts__item">
                        <dt class="company-facts__title">${fact.title}</dt>
                        <dd class="company-facts__data">${data}</dd>
                    </div>
                `;
            }

            return `
                <div class="company-page__facts company-facts">
                    <dl class="company-facts__list">${list}</dl>
                </div>`;
        }
        function renderImages() {
            const images = this.companyData.images;
            if (this.noPropOrEmptyArr(images)) return "";

            let list = "";
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                list += `
                <li class="company-images__item ${img.type === 'main' ? 'company-images__item--main' : ''}">
                    <img class="company-images__image" src="${img.src}" alt="${i + 1}" data-onclick-modal>
                </li>
                `;
            }

            return `<ul class="company-page__images company-images">${list}</ul>`;
        }
    }
    renderValues() {
        const values = this.companyData.values;
        if (this.noPropOrEmptyArr(values)) return "";

        let shownList = "";
        for (let i = 0; i < this.shownValuesAmount; i++) {
            const val = values[i];
            if (!val) break;
            shownList += renderListItem(val);
        }
        let hiddenList = "";
        for (let i = this.shownValuesAmount; i < values.length; i++) {
            const val = values[i];
            hiddenList += renderListItem(val);
        }

        const spoilerHideable = hiddenList
            ? `<ul class="company-values__list spoiler__hideable">${hiddenList}</ul>`
            : "";
        const spoilerButton = hiddenList
            ? `
            <div class="job-company__link-container job-company__link-container--with-spacing">
                <button class="job-company__link spoiler__button" data-spoiler-changing-text="Показать еще, Скрыть">Показать еще</button>
            </div>
            `
            : "";

        return `
        <div class="company-page__values company-values ${hiddenList ? 'spoiler' : ''}">
            <ul class="company-values__list">${shownList}</ul>
            ${spoilerHideable}
            ${spoilerButton}
        </div>
        `;

        function renderListItem(val) {
            return `
            <li class="company-values__item company-values__item--full icon-c-values-${val.iconName}">
                <div class="company-values__content hyphenate">
                    <span class="company-values__title">${val.title}</span>
                    <p class="company-values__text">${val.content || ""}</p>
                </div>
            </li>
            `;
        }
    }
    renderJobs() {
        const jobs = this.companyData.activeAds;
        if (this.noPropOrEmptyArr(jobs)) return "";

        renderJob = renderJob.bind(this);

        let shownList = "";
        for (let i = 0; i < this.shownJobsAmount; i++) {
            const job = jobs[i];
            if (!job) break;
            shownList += renderJob(job);
        }
        let hiddenList = "";
        for (let i = this.shownJobsAmount; i < jobs.length; i++) {
            const job = jobs[i];
            hiddenList += renderJob(job);
        }

        const spoilerHideable = hiddenList
            ? `<ul class="company-jobs spoiler__hideable">${shownList}</ul>`
            : "";
        const spoilerButton = hiddenList
            ? `
            <div class="job-company__link-container job-company__link-container--with-spacing">
                <button class="job-company__link spoiler__button" data-spoiler-changing-text="Показать еще, Скрыть">Показать еще</button>
            </div>
            `
            : "";

        return `
            <div class="company-page__jobs ${hiddenList ? 'spoiler' : ''}">
                <h2 class="headline-2x1">
                    Актуальных вакансий: ${jobs.length}
                </h2>
                <ul class="company-jobs">${shownList}</ul>
                ${spoilerHideable}
                ${spoilerButton}
            </div>
        `;

        function renderJob(job) {
            return `
                <li class="company-jobs__item">
                    <h3 class="company-jobs__item-title">
                        <a class="link company-jobs__item-title-link" href="/job1/jobs/${job.id}">${job.title}</a>
                    </h3>
                    <div class="company-jobs__item-meta">
                        <div class="company-jobs__item-company">
                            <a class="link company-jobs__item-company-link" href="/job1/f/${this.companyData.tag}">${this.companyData.title}</a>
                        </div>
                        <div class="company-jobs__item-wrap">${job.meta.location}, ${job.meta.date}</div>
                    </div>
                    <p class="company-jobs__item-snippet">${job.text}</p>
                    <div class="company-jobs__item-button-container">
                        <button class="company-jobs__item-button icon-star" data-changing-button="classList='icon-star:-icon-star-full', content='В избранное:-Убрать из избранного'">В избранное</button>
                    </div>
                </li>
            `;
        }
    }
    renderSideBar() {
        const fullSideBarLayout = `
            ${this.renderMap()}
            ${this.renderRecruiter()}
        `;

        this.sideBar.insertAdjacentHTML("afterbegin", fullSideBarLayout);
    }
    renderMap() {
        const locData = this.companyData.location;
        if (!locData) return "";

        return `
        <div class="company-page__location company-location">
            <div class="company-location__map g-map">
                <iframe class="g-map__iframe" src="${locData.src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <div class="company-location__data">
                <div class="company-location__address">
                    <h3 class="company-location__name headline-x1">${locData.name}</h3>
                    <p class="company-location__street">
                        ${locData.street} -
                        <a class="company-location__link" href="${locData.direction}" target="_blank">Рассчитать маршрут</a>
                    </p>
                </div>
            </div>
        </div>
        `;
    }
    renderRecruiter() {
        const contacts = this.companyData.contacts;
        if (this.noPropOrEmptyArr(contacts)) return "";

        let list = "";
        for (let contact of contacts) {
            list += `
            <li class="job-company__recruiter-item company-recruiter company-recruiter--in-side-bar">
                <div class="company-recruiter__info">
                    <div class="company-recruiter__data">
                        <div class="company-recruiter__avatar">
                            <div class="company-recruiter__avatar-inner">
                                ${fallbackAvatars[contact.recruiterGender]}
                            </div>
                        </div>
                        <h3 class="company-recruiter__name headline-x1">${contact.recruiterName}</h3>
                        <span class="company-recruiter__position">${contact.recruiterPosition}</span>
                        <a class="job-company__link" href="${this.companyData.website}" target="_blank">Связаться</a>
                    </div>
                </div>
            </li>
            `;
        }

        return `
        <div class="company-page__recruiters">
            <h2 class="company-page__headline headline-2x1">Контактное лицо</h2>
            <ul class="company-page__recruiter-list job-company__recruiter-list">${list}</ul>
        </div>
        `;
    }
    renderSimilarCompanies() {
        const similarsData = this.companyData.similarCompanies;
        if (this.noPropOrEmptyArr(similarsData)) return;

        loadData(`${rootPath}json/employers.json`).then(employers => {
            let list = "";
            for (let companyId of similarsData) {
                const companyData = employers.find(emp => emp.id === companyId);
                let pills = "";
                if (companyData.description)
                    pills += `<span class="company-card__image-pill small-pill small-pill--m-top">ЕСТЬ ОПИСАНИЕ</span>`;
                if (companyData.video)
                    pills += `<span class="company-card__image-pill small-pill small-pill--m-top small-pill--dark">ВИДЕО</span>`;

                list += `
                    <li class="slider__slide">
                        <div class="company-card">
                            <div class="company-card__image-container">
                                <a class="company-card__image-link" href="/job1/f/${companyData.tag}">
                                    <img src="${companyData.avatar}" alt="${companyData.title.replace(/"/g, "'")}" class="company-card__image">
                                    <div class="company-card__image-pills">${pills}</div>
                                    <div class="company-card__image-logo" data-logo-name="${companyData.tag}"></div>
                                </a>
                            </div>
                            <div class="company-card__container company-card__container--fixed-height-small">
                                <h3 class="company-card__title">
                                    <a class="company-card__title-link link" href="/job1/f/${companyData.tag}" target="_blank" data-title>
                                        ${companyData.title}
                                    </a>
                                </h3>
                                <div class="company-card__locations">
                                    <p class="company-card__locations-inner" data-title>${companyData.location.region}</p>
                                </div>
                                <div class="company-card__branch">${companyData.tags}</div>
                                <div class="company-card__footer">
                                    <button class="company-card__button icon-star"
                                        data-changing-button="classList='icon-star:-icon-star-full', content='В избранное:-В избранном', contentContainer='.link'">
                                        <span class="link">В избранное</span>
                                    </button>
                                    <a class="link" href="/job1/f/${companyData.tag}#actual-jobs" target="_blank">
                                        ${companyData.activeAds ? "Вакансий: " + companyData.activeAds.length : ""}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </li>
                `;
            }

            const similarCompaniesLayout = `
                <div class="company-page__similars similar-companies">
                    <div class="wrap similar-companies__wrap">
                        <h2 class="similar-companies__headline headline-2x1">
                            Вас также могут заинтересовать следующие компании:
                        </h2>
                        <div class="slider">
                            <ul class="similar-companies__list slider__list">${list}</ul>
                        </div>
                    </div>
                </div>
            `;
            this.rootElem.insertAdjacentHTML("beforeend", similarCompaniesLayout);

            const logoContainers = this.rootElem.querySelectorAll("[data-logo-name]");
            logoContainers.forEach(logoContainer => {
                const logoName = logoContainer.dataset.logoName;
                loadData(`${rootPath}/svg-elements/logos/${logoName}.html`, "text")
                    .then(logoLayout => {
                        logoContainer.insertAdjacentHTML("afterbegin", logoLayout);
                    });
                logoContainer.removeAttribute("data-logo-name");
            });
        });
    }
}

const companyContainer = document.querySelector(".company-page");
if (companyContainer) new CompanyPage(companyContainer);
