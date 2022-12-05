class JobEmployerPage {
    constructor(jobCompanyContainer) {
        this.renderPage = this.renderPage.bind(this);

        this.rootElem = jobCompanyContainer;
        this.employerId = this.rootElem.dataset.employerId;
        this.valuesShownAmount = 4;
        this.adsShownAmount = 3;

        this.rootElem.removeAttribute("data-employer-id");
        loadData(`${rootPath}json/employers.json`).then(data => {
            this.employerData = data.find(ed => ed.id === this.employerId);
            this.renderPage();
        });
    }
    renderPage() {
        this.renderHeader();
        this.renderAbout();
        this.renderImages();
        this.renderValues();
        this.renderBenefits();
        this.renderAds();
        this.renderContacts();
        this.renderMap();

        this.fullLayout = `
            ${this.headerSection}
            ${this.aboutSection}
            ${this.imagesSection}
            ${this.valuesSection}
            ${this.benefitsSection}
            ${this.adsSection}
            ${this.contactsSection}
            ${this.mapSection}
        `;

        this.rootElem.insertAdjacentHTML("afterbegin", this.fullLayout);
        this.loadLogo();
    }
    renderOptionalContacts(optionalsArr) {
        let optionalsList = "";
        for (let opt of optionalsArr) {
            const chd = opt.children;
            if (opt.type === "phone") {
                let list = ``;
                for (let i = 0; i < chd.length; i++) {
                    const num = chd[i];
                    list += `
                    <a class="contacts__phone" href="tel:${num}">
                        +7 (${num[1] + num[2] + num[3]}) ${num[4] + num[5] + num[6]}-${num[7] + num[8]}-${num[9] + num[10]}
                    </a>${i === chd.length - 1 ? '' : ','}
                `;
                }

                optionalsList += `
                    <div class="contacts__optional-block">
                        Тел. ${list}
                    </div>
                    `;
            }
            if (opt.type === "email") {
                let list = ``;
                for (let i = 0; i < chd.length; i++) {
                    list += `${chd[i]}${i === chd.length - 1 ? '' : ','}`;
                }

                optionalsList += `
                    <div class="contacts__optional-block">
                        e-mail: ${list}
                    </div>
                    `;
            }
            if (opt.type === "website") {
                optionalsList += `
                    <div class="contacts__optional-block">
                        Перейти на
                        <a class="link" href="${opt.child}" target="_blank">веб-сайт</a>
                    </div>
                    `;
            }
        }
        return optionalsList;
    }
    noArr(arr) {
        return !Array.isArray(arr) || arr.length < 1
    }
    renderHeader() {
        const headerSection = `
        <header class="job-company__company-header company-header">
            <div class="company-header__inner">
                <div class="company-header__background-image company-header__background-image--fallback"></div>
                <div class="company-header__wrap">
                    <div class="company-header__image-container">
                        <a class="company-header__logo-link logo logo--bordered" href="/job1/f/${this.employerData.tag}" target="_blank">
                            <img class="company-header__logo-fallback" src="/job1/img/companies/fallback-logo.gif">
                        </a>
                    </div>
                    <div class="company-header__data-container">
                        <h1 class="company-header__title headline-3x1">
                            <a class="company-header__link link" href="/job1/f/${this.employerData.tag}" target="_blank">
                                ${this.employerData.title}
                            </a>
                        </h1>
                        <div class="company-header__details">
                            ${this.employerData.tags}
                        </div>
                        <div class="company-header__data">
                            <div class="company-header__data-item icon-clock">
                                ${this.employerData.regDate}
                            </div>
                            <div class="company-header__data-item ${this.employerData.onlineStatus.isOnline ? 'company-header__data-online' : ''} icon-dot">
                                ${this.employerData.onlineStatus.isOnline ? 'Онлайн' : 'Оффлайн ' + `(дней: ${this.employerData.onlineStatus.days})`}
                            </div>
                            <div class="company-header__star-rating star-rating" data-rating-value="${this.employerData.ratingValue}">
                                <div class="star-rating__stars"></div>
                                <div class="star-rating__comment">
                                    комментариев: 
                                    ${this.employerData.comments.amount}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>`;

        this.headerSection = headerSection;
    }
    loadLogo() {
        loadData(`${rootPath}${this.employerData.iconURL}`, "text")
            .then(logo => {
                const imgFallback = this.rootElem.querySelector(".company-header__logo-fallback");
                if (imgFallback) {
                    imgFallback.insertAdjacentHTML("afterend", logo);
                    imgFallback.remove();
                }
            });
    }
    renderAbout() {
        let aboutContentHidden = "";
        if (Array.isArray(this.employerData.about) && this.employerData.about.length > 0) {
            let aboutContent = ``;
            for (let contentData of this.employerData.about) {
                if (contentData.type === "paragraph") {
                    aboutContent +=
                        `<p class="job-company__about-paragraph">${contentData.content}</p>`;
                }
                if (contentData.type === "list") {
                    let sublist = ``;
                    for (let sublistItem of contentData.content) {
                        sublist += `<li class="job-company__about-list-item">${sublistItem}</li>`;
                    }
                    aboutContent += `<ul class="job-company__about-list">${sublist}</ul>`;
                }
            }

            aboutContentHidden = `
            <div class="spoiler__hideable">${aboutContent}</div>
            <button class="job-company__spoiler-button spoiler__button"
                data-spoiler-changing-text="Читать еще, Скрыть">Читать еще</button>
            `;
        }
        this.aboutSection = `
        <section class="section job-company__about-us">
            <div class="section__wrap section__wrap--no-padding">
                <div class="section__inner section__inner--small">
                    <h2 class="job-company__headline headline-2x1">О нас</h2>
                    <div class="job-company__about-text ${aboutContentHidden ? 'spoiler' : ''}">
                        <p class="job-company__about-paragraph">
                            ${this.employerData.aboutTitle}
                        </p>
                        ${aboutContentHidden}
                    </div>
                </div>
            </div>
        </section>
        `;
    }
    renderImages() {
        const imagesArr = this.employerData.images;
        if (!Array.isArray(imagesArr) || imagesArr.length < 1) {
            this.imagesLayout = "";
            return;
        }

        let imagesList = ``;
        for (let i = 1; i <= imagesArr.length; i++) {
            const img = imagesArr[i - 1];
            imagesList += `
            <li class="company-images__item ${img.type === 'main' ? 'company-images__item--main' : ''}">
                <img class="company-images__image" data-onclick-modal="iframe"
                    src="${img.src}" alt="${i}">
            </li>
            `;
        }

        this.imagesSection = `
        <section class="section">
            <div class="section__wrap section__wrap--no-padding">
                <div class="section__inner section__inner--small">
                    <div class="job-company__images">
                        <ul class="company-images">
                            ${imagesList}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        `;
    }
    renderValues() {
        const valuesArr = this.employerData.values;
        if (this.noArr(valuesArr))
            return this.valuesSection = "";

        let shownValuesItems = ``;
        let hiddenValuesItems = ``;
        for (let i = 0; i < this.valuesShownAmount; i++) shownValuesItems += renderValItem(i);
        if (valuesArr.length > this.valuesShownAmount) {
            for (let i = this.valuesShownAmount; i < valuesArr.length; i++)
                hiddenValuesItems += renderValItem(i);
        }

        const spoilerButton = hiddenValuesItems
            ? `<div class="job-company__link-container job-company__link-container--with-spacing">
                    <button class="job-company__link spoiler__button"
                        data-spoiler-changing-text="Посмотреть ещё, Скрыть">Посмотреть ещё</button>
                </div>`
            : "";
        const spoilerHideable = hiddenValuesItems
            ? `<ul class="company-values__hideable spoiler__hideable">
                    ${hiddenValuesItems}
                </ul>`
            : "";

        this.valuesSection = `
        <section class="section job-company__values">
            <div class="section__wrap">
                <div class="section__inner section__inner--small">
                    <h2 class="headline-2x1 job-company__headline">
                        Наши ценности
                    </h2>
                    <div class="company-values ${spoilerHideable && spoilerButton ? 'spoiler' : ''}">
                        <ul class="company-values__list">
                            ${shownValuesItems}
                        </ul>
                        ${spoilerHideable}
                        ${spoilerButton}
                    </div>
                </div>
            </div>
        </section>
        `;

        function renderValItem(id) {
            const valData = valuesArr[id];
            if (!valData) return "";

            return `
            <li class="company-values__item ${valData.content ? '' : "company-values__item--full"} icon-c-values-${valData.iconName}">
                <div class="company-values__content hyphenate">
                    <span class="company-values__title">${valData.title}</span>
                    ${valData.content ? `<p class="company-values__text">${valData.content}</p>` : ""}
                </div>
            </li>
            `;
        }
    }
    renderBenefits() {
        const benefitsArr = this.employerData.benefits;
        if (this.noArr(benefitsArr)) return this.benefitsSection = "";

        let benefitsList = ``;
        for (let benf of benefitsArr) {
            benefitsList += `
            <li class="company-benefits__item">
                <p class="company-benefits__title">${benf}</p>
            </li>
            `;
        }

        this.benefitsSection = `
        <section class="section job-company__benefits">
            <div class="section_wrap">
                <div class="section__inner section__inner--small">
                    <h2 class="headline-2x1 job-company__headline">
                        Наши преимущества
                    </h2>
                    <ul class="company-benefits">
                        ${benefitsList}
                    </ul>
                </div>
            </div>
        </section>
        `;
    }
    renderAds() {
        const adsArr = this.employerData.activeAds;
        if (this.noArr(adsArr)) return this.adsSection = "";

        let shownAdsList = ``;
        let hiddenAdsList = "";
        for (let i = 0; i < this.adsShownAmount; i++) shownAdsList += renderAd(i);
        if (adsArr.length > this.adsShownAmount) {
            for (let i = this.adsShownAmount; i < adsArr.length; i++)
                hiddenAdsList += renderAd(i);
        }

        const spoilerHideable = hiddenAdsList
            ? `
            <ul class="job-company__jobs-list job-company__jobs-list--center spoiler__hideable"> 
                ${hiddenAdsList}
            </ul>`
            : "";
        const spoilerButton = hiddenAdsList
            ? `
            <div class="job-company__link-container job-company__link-container--with-spacing">
                <button class="job-company__link spoiler__button"
                    data-spoiler-changing-text="Посмотреть ещё, Скрыть">Посмотреть ещё</button>
            </div>
            `
            : "";

        this.adsSection = `
        <section class="section job-company__jobs">
            <div class="section__wrap section__wrap--no-padding">
                <div class="section__inner ${spoilerHideable && spoilerButton ? 'spoiler' : ''}">
                    <h2 class="headline-2x1 job-company__headline">
                        Актуальных вакансий: ${adsArr.length}
                    </h2>
                    <ul class="job-company__jobs-list job-company__jobs-list--center">
                        ${shownAdsList}
                    </ul>
                    ${spoilerHideable}
                    ${spoilerButton}
                </div>
            </div>
        </section>
        `;

        function renderAd(id) {
            const adData = adsArr[id];
            return `
                <li class="job-company__jobs-item job-card job-card--bordered">
                    <a class="job-card__link" href="#">
                        <h3 class="job-card__title headline-x1">
                            ${adData.title}
                        </h3>
                        <span class="job-card__location">
                            ${adData.meta.location}
                        </span>
                        <span class="job-card__date">
                            ${adData.meta.date}
                        </span>
                        <p class="job-card__text">
                            ${adData.text}
                        </p>
                    </a>
                </li>
            `;
        }
    }
    renderContacts() {
        const contactsArr = this.employerData.contacts;
        if (this.noArr(contactsArr)) return this.contactsSection = "";

        let list = ``;
        for (let contact of contactsArr) {
            const optionalsList = this.renderOptionalContacts(contact.optional);

            list += `
            <li class="job-company__recruiter-item company-recruiter">
                <div class="company-recruiter__info">
                    <div class="company-recruiter__avatar">
                        <div class="company-recruiter__avatar-inner">
                            ${fallbackAvatars[contact.recruiterGender]}
                        </div>
                    </div>
                    <div class="company-recruiter__data">
                        <h3 class="company-recruiter__name headline-x1">Отдел кадров</h3>
                        <span class="company-recruiter__position">${contact.recruiterPosition}</span>
                        <div class="company-recruiter__optional contacts">
                            ${optionalsList}
                        </div>
                    </div>
                </div>
            </li>
            `;
        }

        this.contactsSection = `
        <section class="section">
            <div class="section__wrap section__wrap--no-padding">
                <div class="section__inner section__inner--extra-small">
                    <h2 class="job-company__headline headline-2x1">Контакты</h2>
                    <ul class="job-company__recruiter-list">${list}</ul>
                </div>
            </div>
        </section>
        `;
    }
    renderMap() {
        const locData = this.employerData.location;
        if (!locData) return this.mapSection = "";

        this.mapSection = `
        <section class="section">
            <div class="section__wrap section__wrap--no-padding">
                <div class="section__inner section__inner--extra-small">
                    <h2 class="job-company__headline headline-2x1">Где мы находимся</h2>
                    <div class="company-location">
                        <div class="company-location__map g-map">
                            <iframe class="g-map__iframe"
                                src="${locData.src}"
                                loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                        <div class="company-location__data">
                            <div class="company-location__address">
                                <h3 class="company-location__name headline-x1">
                                    ${locData.name}
                                </h3>
                                <p class="company-location__street">
                                    ${locData.street} -
                                    <a class="company-location__link"
                                        href="${locData.direction}"
                                        target="_blank">
                                        Рассчитать маршрут
                                    </a>
                                </p>
                                <p class="company-location__city">
                                    ${locData.region}
                                </p>
                            </div>
                            <div class="company-location__contact">
                                ${this.renderOptionalContacts(locData.contacts)}
                            </div>
                        </div>
                        <div class="job-company__link-container job-company__link-container--with-spacing">
                            <a class="job-company__link" href="#">Посмотреть все местоположения</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `;
    }
}

const jobCompanyContainer = document.querySelector(".job-company");
if (jobCompanyContainer) new JobEmployerPage(jobCompanyContainer);