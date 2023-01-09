class CompanyPage{constructor(a){this.rootElem=a,this.main=this.rootElem.querySelector(".company-page__main"),this.sideBar=this.rootElem.querySelector(".company-page__side-bar"),this.asideLeft=this.rootElem.querySelector(".company-page__aside--left"),this.asideRight=this.rootElem.querySelector(".company-page__aside--right"),this.employerId=this.rootElem.dataset.employerId,this.shownValuesAmount=3,this.shownJobsAmount=3,this.rootElem.removeAttribute("data-employer-id"),loadData(`${rootPath}json/employers.json`).then((a=>{this.companyData=a.find((a=>a.id===this.employerId)),this.renderPage()}))}renderPage(){this.renderHeader(),this.renderMain(),this.renderSideBar(),this.renderSimilarCompanies()}renderHeader(){const a=`\n        <header class="company-page__header company-header">\n            <div class="company-header__inner">\n                <div class="company-header__background-image company-header__background-image--fallback"></div>\n                <div class="company-header__wrap">\n                    <div class="company-header__image-container">\n                        <a class="company-header__logo-link logo logo--bordered" href="/job1/f/${this.companyData.tag}/"\n                            target="_blank">\n                                <img class="company-header__logo-fallback" src="/job1/img/companies/fallback-logo.gif">\n                            </a>\n                    </div>\n                    <div class="company-header__data-container">\n                        <h1 class="company-header__title headline-3x1">\n                            <a class="company-header__link link" href="/job1/f/${this.companyData.tag}/"\n                                target="_blank">\n                                ${this.companyData.title}\n                            </a>\n                        </h1>\n                        <div class="company-header__details">\n                            ${this.companyData.tags}\n                        </div>\n                        <div class="company-header__data">\n                            <div class="company-header__data-item icon-clock">\n                                ${this.companyData.regDate}\n                            </div>\n                            <div class="company-header__data-item ${this.companyData.onlineStatus.isOnline?"company-header__data-online":""} icon-dot">\n                                ${this.companyData.onlineStatus.isOnline?"Онлайн":"Оффлайн (дней:"+this.companyData.onlineStatus.days+")"}\n                            </div>\n                            <div class="company-header__star-rating star-rating" data-rating-value="${this.companyData.ratingValue}">\n                                <div class="star-rating__stars">\n                                    <div class="star-rating__stars-filled star-rating__stars-list"></div>\n                                    <div class="star-rating__star-inputs star-rating__stars-list"></div>\n                                </div>\n                                <div class="star-rating__comment">\n                                    комментариев:\n                                    16\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class="company-header__button-container">\n                        <button class="company-header__button button icon-heart"\n                            data-changing-button="classList='icon-heart:-__active icon-heart-full', content='Добавить компанию в избранное:-Убрать компанию из избранного'">\n                            Добавить компанию в избранное\n                        </button>\n                    </div>\n                </div>\n            </div>\n        </header>\n        `;this.rootElem.insertAdjacentHTML("afterbegin",a),this.loadLogo()}loadLogo(){loadData(`${rootPath}${this.companyData.iconURL}`,"text").then((a=>{const n=this.rootElem.querySelector(".company-header__logo-fallback");n&&(n.insertAdjacentHTML("afterend",a),n.remove())}))}renderMain(){const a=`\n            ${this.renderAbout()}\n            ${this.renderInner()}\n            ${this.renderValues()}\n            ${this.renderJobs()}\n        `;this.main.insertAdjacentHTML("afterbegin",a)}noPropOrEmptyArr(a){return!a||"object"==typeof a&&(!Object.values(a)||a.length<1)}renderAbout(){let a="";const n=this.companyData.about;if(0==this.noPropOrEmptyArr(n))for(let t of n)if("paragraph"===t.type&&(a+=`\n                        <p class="job-company__about-paragraph">${t.content}</p>\n                    `),"list"===t.type){let n="";for(let a of t.content)n+=`<li class="job-company__about-list-item">${a}</li>`;a+=`<ul class="job-company__about-list">${n}</ul>`}const t=a?`<div class="spoiler__hideable">${a}</div>`:"",e=a?'<button class="job-company__spoiler-button spoiler__button" data-spoiler-changing-text="Читать еще, Скрыть">Читать еще</button>':"";return`\n        <h2 class="company-page__headline headline-2x1">\n            О компании Сормовская Фабрика\n        </h2>\n        <div class="job-company__about-text ${a?"spoiler":""}">\n            <p class="job-company__about-paragraph">${this.companyData.aboutTitle}</p>\n            ${t}\n            ${e}\n        </div>\n        `}renderInner(){return a=a.bind(this),n=n.bind(this),`\n        <div class="company-page__main-inner">\n            ${a()}\n            ${n()}\n        </div>\n        `;function a(){const a=this.companyData.facts;if(this.noPropOrEmptyArr(a))return"";let n="";for(let t of a){let a="";Array.isArray(t.data)?t.data.forEach(((n,e)=>{const s=e+1!==t.data.length;a+=n+(s?", ":"")})):a=t.data,n+=`\n                    <div class="company-facts__item">\n                        <dt class="company-facts__title">${t.title}</dt>\n                        <dd class="company-facts__data">${a}</dd>\n                    </div>\n                `}return`\n                <div class="company-page__facts company-facts">\n                    <dl class="company-facts__list">${n}</dl>\n                </div>`}function n(){const a=this.companyData.images;if(this.noPropOrEmptyArr(a))return"";let n="";for(let t=0;t<a.length;t++){const e=a[t];n+=`\n                <li class="company-images__item ${"main"===e.type?"company-images__item--main":""}">\n                    <img class="company-images__image" src="${e.src}" alt="${t+1}" data-onclick-modal>\n                </li>\n                `}return`<ul class="company-page__images company-images">${n}</ul>`}}renderValues(){const a=this.companyData.values;if(this.noPropOrEmptyArr(a))return"";let n="";for(let t=0;t<this.shownValuesAmount;t++){const s=a[t];if(!s)break;n+=e(s)}let t="";for(let n=this.shownValuesAmount;n<a.length;n++){t+=e(a[n])}return`\n        <div class="company-page__values company-values ${t?"spoiler":""}">\n            <ul class="company-values__list">${n}</ul>\n            ${t?`<ul class="company-values__list spoiler__hideable">${t}</ul>`:""}\n            ${t?'\n            <div class="job-company__link-container job-company__link-container--with-spacing">\n                <button class="job-company__link spoiler__button" data-spoiler-changing-text="Показать еще, Скрыть">Показать еще</button>\n            </div>\n            ':""}\n        </div>\n        `;function e(a){return`\n            <li class="company-values__item company-values__item--full icon-c-values-${a.iconName}">\n                <div class="company-values__content hyphenate">\n                    <span class="company-values__title">${a.title}</span>\n                    <p class="company-values__text">${a.content||""}</p>\n                </div>\n            </li>\n            `}}renderJobs(){const a=this.companyData.activeAds;if(this.noPropOrEmptyArr(a))return"";i=i.bind(this);let n="";for(let t=0;t<this.shownJobsAmount;t++){const e=a[t];if(!e)break;n+=i(e)}let t="";for(let n=this.shownJobsAmount;n<a.length;n++){t+=i(a[n])}const e=t?`<ul class="company-jobs spoiler__hideable">${n}</ul>`:"",s=t?'\n            <div class="job-company__link-container job-company__link-container--with-spacing">\n                <button class="job-company__link spoiler__button" data-spoiler-changing-text="Показать еще, Скрыть">Показать еще</button>\n            </div>\n            ':"";return`\n            <div class="company-page__jobs ${t?"spoiler":""}">\n                <h2 class="headline-2x1">\n                    Актуальных вакансий: ${a.length}\n                </h2>\n                <ul class="company-jobs">${n}</ul>\n                ${e}\n                ${s}\n            </div>\n        `;function i(a){return`\n                <li class="company-jobs__item">\n                    <h3 class="company-jobs__item-title">\n                        <a class="link company-jobs__item-title-link" href="/job1/jobs/${a.id}">${a.title}</a>\n                    </h3>\n                    <div class="company-jobs__item-meta">\n                        <div class="company-jobs__item-company">\n                            <a class="link company-jobs__item-company-link" href="/job1/f/${this.companyData.tag}">${this.companyData.title}</a>\n                        </div>\n                        <div class="company-jobs__item-wrap">${a.meta.location}, ${a.meta.date}</div>\n                    </div>\n                    <p class="company-jobs__item-snippet">${a.text}</p>\n                    <div class="company-jobs__item-button-container">\n                        <button class="company-jobs__item-button icon-star" data-changing-button="classList='icon-star:-icon-star-full', content='В избранное:-Убрать из избранного'">В избранное</button>\n                    </div>\n                </li>\n            `}}renderSideBar(){const a=`\n            ${this.renderMap()}\n            ${this.renderRecruiter()}\n        `;this.sideBar.insertAdjacentHTML("afterbegin",a)}renderMap(){const a=this.companyData.location;return a?`\n        <div class="company-page__location company-location">\n            <div class="company-location__map g-map">\n                <iframe class="g-map__iframe" src="${a.src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>\n            </div>\n            <div class="company-location__data">\n                <div class="company-location__address">\n                    <h3 class="company-location__name headline-x1">${a.name}</h3>\n                    <p class="company-location__street">\n                        ${a.street} -\n                        <a class="company-location__link" href="${a.direction}" target="_blank">Рассчитать маршрут</a>\n                    </p>\n                </div>\n            </div>\n        </div>\n        `:""}renderRecruiter(){const a=this.companyData.contacts;if(this.noPropOrEmptyArr(a))return"";let n="";for(let t of a)n+=`\n            <li class="job-company__recruiter-item company-recruiter company-recruiter--in-side-bar">\n                <div class="company-recruiter__info">\n                    <div class="company-recruiter__data">\n                        <div class="company-recruiter__avatar">\n                            <div class="company-recruiter__avatar-inner">\n                                ${fallbackAvatars[t.recruiterGender]}\n                            </div>\n                        </div>\n                        <h3 class="company-recruiter__name headline-x1">${t.recruiterName}</h3>\n                        <span class="company-recruiter__position">${t.recruiterPosition}</span>\n                        <a class="job-company__link" href="${this.companyData.website}" target="_blank">Связаться</a>\n                    </div>\n                </div>\n            </li>\n            `;return`\n        <div class="company-page__recruiters">\n            <h2 class="company-page__headline headline-2x1">Контактное лицо</h2>\n            <ul class="company-page__recruiter-list job-company__recruiter-list">${n}</ul>\n        </div>\n        `}renderSimilarCompanies(){const a=this.companyData.similarCompanies;this.noPropOrEmptyArr(a)||loadData(`${rootPath}json/employers.json`).then((n=>{let t="";for(let e of a){const a=n.find((a=>a.id===e));let s="";a.description&&(s+='<span class="company-card__image-pill small-pill small-pill--m-top">ЕСТЬ ОПИСАНИЕ</span>'),a.video&&(s+='<span class="company-card__image-pill small-pill small-pill--m-top small-pill--dark">ВИДЕО</span>'),t+=`\n                    <li class="slider__slide">\n                        <div class="company-card">\n                            <div class="company-card__image-container">\n                                <a class="company-card__image-link" href="/job1/f/${a.tag}">\n                                    <img src="${a.avatar}" alt="${a.title.replace(/"/g,"'")}" class="company-card__image">\n                                    <div class="company-card__image-pills">${s}</div>\n                                    <div class="company-card__image-logo" data-logo-name="${a.tag}"></div>\n                                </a>\n                            </div>\n                            <div class="company-card__container company-card__container--fixed-height-small">\n                                <h3 class="company-card__title">\n                                    <a class="company-card__title-link link" href="/job1/f/${a.tag}" target="_blank" data-title>\n                                        ${a.title}\n                                    </a>\n                                </h3>\n                                <div class="company-card__locations">\n                                    <p class="company-card__locations-inner" data-title>${a.location.region}</p>\n                                </div>\n                                <div class="company-card__branch">${a.tags}</div>\n                                <div class="company-card__footer">\n                                    <button class="company-card__button icon-star"\n                                        data-changing-button="classList='icon-star:-icon-star-full', content='В избранное:-В избранном', contentContainer='.link'">\n                                        <span class="link">В избранное</span>\n                                    </button>\n                                    <a class="link" href="/job1/f/${a.tag}#actual-jobs" target="_blank">\n                                        ${a.activeAds?"Вакансий: "+a.activeAds.length:""}\n                                    </a>\n                                </div>\n                            </div>\n                        </div>\n                    </li>\n                `}const e=`\n                <div class="company-page__similars similar-companies">\n                    <div class="wrap similar-companies__wrap">\n                        <h2 class="similar-companies__headline headline-2x1">\n                            Вас также могут заинтересовать следующие компании:\n                        </h2>\n                        <div class="slider">\n                            <ul class="similar-companies__list slider__list">${t}</ul>\n                        </div>\n                    </div>\n                </div>\n            `;this.rootElem.insertAdjacentHTML("beforeend",e);this.rootElem.querySelectorAll("[data-logo-name]").forEach((a=>{const n=a.dataset.logoName;loadData(`${rootPath}svg-elements/logos/${n}.html`,"text").then((n=>{a.insertAdjacentHTML("afterbegin",n)})),a.removeAttribute("data-logo-name")}))}))}}const companyContainer=document.querySelector(".company-page");companyContainer&&new CompanyPage(companyContainer);