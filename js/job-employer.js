class JobEmployerPage{constructor(n){this.renderPage=this.renderPage.bind(this),this.rootElem=n,this.employerId=this.rootElem.dataset.employerId,this.valuesShownAmount=4,this.adsShownAmount=3,this.rootElem.removeAttribute("data-employer-id"),loadData(`${rootPath}json/employers.json`).then((n=>{this.employerData=n.find((n=>n.id===this.employerId)),this.renderPage()}))}renderPage(){this.renderHeader(),this.renderAbout(),this.renderImages(),this.renderValues(),this.renderBenefits(),this.renderAds(),this.renderContacts(),this.renderMap(),this.fullLayout=`\n            ${this.headerSection}\n            ${this.aboutSection}\n            ${this.imagesSection}\n            ${this.valuesSection}\n            ${this.benefitsSection}\n            ${this.adsSection}\n            ${this.contactsSection}\n            ${this.mapSection}\n        `,this.rootElem.insertAdjacentHTML("afterbegin",this.fullLayout),this.loadLogo()}renderOptionalContacts(n){let a="";for(let e of n){const n=e.children;if("phone"===e.type){let e="";for(let a=0;a<n.length;a++){const t=n[a];e+=`\n                    <a class="contacts__phone" href="tel:${t}">\n                        +7 (${t[1]+t[2]+t[3]}) ${t[4]+t[5]+t[6]}-${t[7]+t[8]}-${t[9]+t[10]}\n                    </a>${a===n.length-1?"":","}\n                `}a+=`\n                    <div class="contacts__optional-block">\n                        Тел. ${e}\n                    </div>\n                    `}if("email"===e.type){let e="";for(let a=0;a<n.length;a++)e+=`${n[a]}${a===n.length-1?"":","}`;a+=`\n                    <div class="contacts__optional-block">\n                        e-mail: ${e}\n                    </div>\n                    `}"website"===e.type&&(a+=`\n                    <div class="contacts__optional-block">\n                        Перейти на\n                        <a class="link" href="${e.child}" target="_blank">веб-сайт</a>\n                    </div>\n                    `)}return a}noArr(n){return!Array.isArray(n)||n.length<1}renderHeader(){const n=`\n        <header class="job-company__company-header company-header">\n            <div class="company-header__inner">\n                <div class="company-header__background-image company-header__background-image--fallback"></div>\n                <div class="company-header__wrap">\n                    <div class="company-header__image-container">\n                        <a class="company-header__logo-link logo logo--bordered" href="/job1/f/${this.employerData.tag}" target="_blank">\n                            <img class="company-header__logo-fallback" src="/job1/img/companies/fallback-logo.gif">\n                        </a>\n                    </div>\n                    <div class="company-header__data-container">\n                        <h1 class="company-header__title headline-3x1">\n                            <a class="company-header__link link" href="/job1/f/${this.employerData.tag}" target="_blank">\n                                ${this.employerData.title}\n                            </a>\n                        </h1>\n                        <div class="company-header__details">\n                            ${this.employerData.tags}\n                        </div>\n                        <div class="company-header__data">\n                            <div class="company-header__data-item icon-clock">\n                                ${this.employerData.regDate}\n                            </div>\n                            <div class="company-header__data-item ${this.employerData.onlineStatus.isOnline?"company-header__data-online":""} icon-dot">\n                                ${this.employerData.onlineStatus.isOnline?"Онлайн":`Оффлайн (дней: ${this.employerData.onlineStatus.days})`}\n                            </div>\n                            <div class="company-header__star-rating star-rating" data-rating-value="${this.employerData.ratingValue}">\n                                <div class="star-rating__stars"></div>\n                                <div class="star-rating__comment">\n                                    комментариев: \n                                    ${this.employerData.comments.amount}\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </header>`;this.headerSection=n}loadLogo(){loadData(`${rootPath}${this.employerData.iconURL}`,"text").then((n=>{const a=this.rootElem.querySelector(".company-header__logo-fallback");a&&(a.insertAdjacentHTML("afterend",n),a.remove())}))}renderAbout(){let n="";if(Array.isArray(this.employerData.about)&&this.employerData.about.length>0){let a="";for(let n of this.employerData.about)if("paragraph"===n.type&&(a+=`<p class="job-company__about-paragraph">${n.content}</p>`),"list"===n.type){let e="";for(let a of n.content)e+=`<li class="job-company__about-list-item">${a}</li>`;a+=`<ul class="job-company__about-list">${e}</ul>`}n=`\n            <div class="spoiler__hideable">${a}</div>\n            <button class="job-company__spoiler-button spoiler__button"\n                data-spoiler-changing-text="Читать еще, Скрыть">Читать еще</button>\n            `}this.aboutSection=`\n        <section class="section job-company__about-us">\n            <div class="section__wrap section__wrap--no-padding">\n                <div class="section__inner section__inner--small">\n                    <h2 class="job-company__headline headline-2x1">О нас</h2>\n                    <div class="job-company__about-text ${n?"spoiler":""}">\n                        <p class="job-company__about-paragraph">\n                            ${this.employerData.aboutTitle}\n                        </p>\n                        ${n}\n                    </div>\n                </div>\n            </div>\n        </section>\n        `}renderImages(){const n=this.employerData.images;if(!Array.isArray(n)||n.length<1)return void(this.imagesLayout="");let a="";for(let e=1;e<=n.length;e++){const t=n[e-1];a+=`\n            <li class="company-images__item ${"main"===t.type?"company-images__item--main":""}">\n                <img class="company-images__image" data-onclick-modal="iframe"\n                    src="${t.src}" alt="${e}">\n            </li>\n            `}this.imagesSection=`\n        <section class="section">\n            <div class="section__wrap section__wrap--no-padding">\n                <div class="section__inner section__inner--small">\n                    <div class="job-company__images">\n                        <ul class="company-images">\n                            ${a}\n                        </ul>\n                    </div>\n                </div>\n            </div>\n        </section>\n        `}renderValues(){const n=this.employerData.values;if(this.noArr(n))return this.valuesSection="";let a="",e="";for(let n=0;n<this.valuesShownAmount;n++)a+=i(n);if(n.length>this.valuesShownAmount)for(let a=this.valuesShownAmount;a<n.length;a++)e+=i(a);const t=e?'<div class="job-company__link-container job-company__link-container--with-spacing">\n                    <button class="job-company__link spoiler__button"\n                        data-spoiler-changing-text="Посмотреть ещё, Скрыть">Посмотреть ещё</button>\n                </div>':"",s=e?`<ul class="company-values__hideable spoiler__hideable">\n                    ${e}\n                </ul>`:"";function i(a){const e=n[a];return e?`\n            <li class="company-values__item ${e.content?"":"company-values__item--full"} icon-c-values-${e.iconName}">\n                <div class="company-values__content hyphenate">\n                    <span class="company-values__title">${e.title}</span>\n                    ${e.content?`<p class="company-values__text">${e.content}</p>`:""}\n                </div>\n            </li>\n            `:""}this.valuesSection=`\n        <section class="section job-company__values">\n            <div class="section__wrap">\n                <div class="section__inner section__inner--small">\n                    <h2 class="headline-2x1 job-company__headline">\n                        Наши ценности\n                    </h2>\n                    <div class="company-values ${s&&t?"spoiler":""}">\n                        <ul class="company-values__list">\n                            ${a}\n                        </ul>\n                        ${s}\n                        ${t}\n                    </div>\n                </div>\n            </div>\n        </section>\n        `}renderBenefits(){const n=this.employerData.benefits;if(this.noArr(n))return this.benefitsSection="";let a="";for(let e of n)a+=`\n            <li class="company-benefits__item">\n                <p class="company-benefits__title">${e}</p>\n            </li>\n            `;this.benefitsSection=`\n        <section class="section job-company__benefits">\n            <div class="section_wrap">\n                <div class="section__inner section__inner--small">\n                    <h2 class="headline-2x1 job-company__headline">\n                        Наши преимущества\n                    </h2>\n                    <ul class="company-benefits">\n                        ${a}\n                    </ul>\n                </div>\n            </div>\n        </section>\n        `}renderAds(){const n=this.employerData.activeAds;if(this.noArr(n))return this.adsSection="";let a="",e="";for(let n=0;n<this.adsShownAmount;n++)a+=i(n);if(n.length>this.adsShownAmount)for(let a=this.adsShownAmount;a<n.length;a++)e+=i(a);const t=e?`\n            <ul class="job-company__jobs-list job-company__jobs-list--center spoiler__hideable"> \n                ${e}\n            </ul>`:"",s=e?'\n            <div class="job-company__link-container job-company__link-container--with-spacing">\n                <button class="job-company__link spoiler__button"\n                    data-spoiler-changing-text="Посмотреть ещё, Скрыть">Посмотреть ещё</button>\n            </div>\n            ':"";function i(a){const e=n[a];return`\n                <li class="job-company__jobs-item job-card job-card--bordered">\n                    <a class="job-card__link" href="#">\n                        <h3 class="job-card__title headline-x1">\n                            ${e.title}\n                        </h3>\n                        <span class="job-card__location">\n                            ${e.meta.location}\n                        </span>\n                        <span class="job-card__date">\n                            ${e.meta.date}\n                        </span>\n                        <p class="job-card__text">\n                            ${e.text}\n                        </p>\n                    </a>\n                </li>\n            `}this.adsSection=`\n        <section class="section job-company__jobs">\n            <div class="section__wrap section__wrap--no-padding">\n                <div class="section__inner ${t&&s?"spoiler":""}">\n                    <h2 class="headline-2x1 job-company__headline">\n                        Актуальных вакансий: ${n.length}\n                    </h2>\n                    <ul class="job-company__jobs-list job-company__jobs-list--center">\n                        ${a}\n                    </ul>\n                    ${t}\n                    ${s}\n                </div>\n            </div>\n        </section>\n        `}renderContacts(){const n=this.employerData.contacts;if(this.noArr(n))return this.contactsSection="";let a="";for(let e of n){const n=this.renderOptionalContacts(e.optional);a+=`\n            <li class="job-company__recruiter-item company-recruiter">\n                <div class="company-recruiter__info">\n                    <div class="company-recruiter__avatar">\n                        <div class="company-recruiter__avatar-inner">\n                            ${fallbackAvatars[e.recruiterGender]}\n                        </div>\n                    </div>\n                    <div class="company-recruiter__data">\n                        <h3 class="company-recruiter__name headline-x1">Отдел кадров</h3>\n                        <span class="company-recruiter__position">${e.recruiterPosition}</span>\n                        <div class="company-recruiter__optional contacts">\n                            ${n}\n                        </div>\n                    </div>\n                </div>\n            </li>\n            `}this.contactsSection=`\n        <section class="section">\n            <div class="section__wrap section__wrap--no-padding">\n                <div class="section__inner section__inner--extra-small">\n                    <h2 class="job-company__headline headline-2x1">Контакты</h2>\n                    <ul class="job-company__recruiter-list">${a}</ul>\n                </div>\n            </div>\n        </section>\n        `}renderMap(){const n=this.employerData.location;if(!n)return this.mapSection="";this.mapSection=`\n        <section class="section">\n            <div class="section__wrap section__wrap--no-padding">\n                <div class="section__inner section__inner--extra-small">\n                    <h2 class="job-company__headline headline-2x1">Где мы находимся</h2>\n                    <div class="company-location">\n                        <div class="company-location__map g-map">\n                            <iframe class="g-map__iframe"\n                                src="${n.src}"\n                                loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>\n                        </div>\n                        <div class="company-location__data">\n                            <div class="company-location__address">\n                                <h3 class="company-location__name headline-x1">\n                                    ${n.name}\n                                </h3>\n                                <p class="company-location__street">\n                                    ${n.street} -\n                                    <a class="company-location__link"\n                                        href="${n.direction}"\n                                        target="_blank">\n                                        Рассчитать маршрут\n                                    </a>\n                                </p>\n                                <p class="company-location__city">\n                                    ${n.region}\n                                </p>\n                            </div>\n                            <div class="company-location__contact">\n                                ${this.renderOptionalContacts(n.contacts)}\n                            </div>\n                        </div>\n                        <div class="job-company__link-container job-company__link-container--with-spacing">\n                            <a class="job-company__link" href="#">Посмотреть все местоположения</a>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </section>\n        `}}const jobCompanyContainer=document.querySelector(".job-company");jobCompanyContainer&&new JobEmployerPage(jobCompanyContainer);