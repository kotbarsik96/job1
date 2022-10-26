const jobsDataURL=`${rootPath}json/jobs.json`;class JobDetailState{defineState(){setTimeout((()=>{const t=this.jobId;this.jobId=window.location.hash.replace("#","");inittedInputs.filter((t=>t instanceof JobDetailListItem)).forEach((t=>t.setState())),this.jobId!=t&&(this.jobId?this.setShowState():this.setHideState())}),100)}setShowState(){document.querySelectorAll(".--jobs-full-elem").forEach((t=>{t.className=t.className.replace("--jobs-full-elem","--jobs-resizable-elem")}));inittedInputs.filter((t=>t instanceof JobDetail)).forEach((t=>t.setShowState()))}setHideState(){document.querySelectorAll(".--jobs-resizable-elem").forEach((t=>{t.className=t.className.replace("--jobs-resizable-elem","--jobs-full-elem")}));inittedInputs.filter((t=>t instanceof JobDetail)).forEach((t=>t.setHideState()))}}const jobDetailState=new JobDetailState;window.addEventListener("hashchange",jobDetailState.defineState.bind(jobDetailState));class JobsListing{constructor(t){this.onJobsSearchSubmit=this.onJobsSearchSubmit.bind(this),this.removeTag=this.removeTag.bind(this),this.renderJobs=this.renderJobs.bind(this),this.loadJobs=this.loadJobs.bind(this),this.rootElem=observeNodeBeforeInit(t),this.title=this.rootElem.querySelector(".jobs-search-list__title"),this.emptyResult=this.rootElem.querySelector(".jobs-search-list__empty-result"),this.infoBox=this.rootElem.querySelector(".jobs-search-list__info-box"),this.jobsListContainer=this.rootElem.querySelector(".jobs-list"),this.loadMore=this.rootElem.querySelector(".more-jobs"),this.tagsList=this.rootElem.querySelector(".jobs-filter-buttons__tags"),this.alarmDisruptorPill=this.rootElem.querySelector(".jobs-search__alarm-disruptor__pill"),this.companySearch=document.querySelector("input[name='keywords']"),this.locationSearch=document.querySelector("input[name='locations']"),this.radiusInputs=Array.from(document.querySelectorAll("input[name='proximity-radius']")),this.filterListItemNames=["professional-area","employment-type","work-experience","salary"],this.filterInputs=[],this.createdTags=[],this.jobsRendered=[],this.jobsSearchForm=document.querySelector(".jobs-search-form"),this.maxJobsOnLoad=2,this.emptyResult.classList.add("__removed"),this.infoBox.classList.add("__removed"),this.filterListItemNames.forEach((t=>{document.querySelectorAll(`input[name="${t}"]`).forEach((t=>this.filterInputs.push(t)))})),this.jobsSearchForm.addEventListener("submit",this.onJobsSearchSubmit),this.loadMore.addEventListener("click",this.loadJobs),this.loadJobs(),this.alarmDisruptorPill&&this.alarmDisruptorPill.classList.add("__removed")}createButtonLoading(){if(this.loadMore.querySelector(".loading-box"))return;this.loadMore.insertAdjacentHTML("afterbegin",'\n        <div class="loading-box">\n            <span class="loading-box__dot"></span>\n            <span class="loading-box__dot"></span>\n            <span class="loading-box__dot"></span>\n        </div>\n        ')}removeButtonLoading(){const t=this.loadMore.querySelector(".loading-box");t&&t.remove()}loadJobs(){if(!this.loading)return new Promise(((t,e)=>{this.loading=!0,this.createButtonLoading(),this.jobsListContainer.classList.add("jobs-list--unload"),fetch(jobsDataURL).then((s=>{s.ok||(this.removeButtonLoading(),e()),s.json().then((e=>{this.jobs||(this.jobs=[]);let s=0;for(let t of e){this.jobs.find((e=>e.id===t.id))||s>=this.maxJobsOnLoad||(this.jobs.push(t),s++)}t()}))}))})).then((()=>{this.renderJobs(),this.removeButtonLoading(),this.loading=!1,setTimeout((()=>{this.jobsListContainer.querySelector("li")&&this.jobsListContainer.classList.remove("jobs-list--unload")}),1e3)}))}renderJobs(){this.jobs.forEach((t=>{this.jobsRendered.find((e=>e===t.id))||function(t){return new Promise((e=>{const s=`${rootPath}${t.iconURL}`;fetch(s).then((t=>{if(!t.ok)return e("");t.text().then((t=>e(t)))}))}))}(t).then((e=>{const s=`\n                <li class="jobs-list__item" data-job-id="${t.id}">\n                    <div class="jobs-list__item-container">\n                        <a class="jobs-list__item-image-container" href="#">\n                            <span class="jobs-list__item-image-link">\n                                ${e}\n                            </span>\n                        </a>\n                        <div class="jobs-list__item-data-container">\n                            <h2 class="jobs-list__title">\n                                <a class="jobs-list__title-link link" href="#">\n                                    ${t.title}\n                                </a>\n                            </h2>\n                            <div class="jobs-list__meta">\n                                <div class="jobs-list__item-company">\n                                    <a class="jobs-list__item-company-name"\n                                        href="${t.url}"\n                                        target="_blank">\n                                        ${t.employer}\n                                    </a>\n                                </div>\n                                <div class="jobs-list__item-wrap">\n                                <ul class="jobs-list__locations">\n                                    ${arrayToString(t.locations,'\n                <li class="jobs-list__location">\n                    <a class="jobs-list__location-link"\n                        href="#">[[]]</a>,\n                </li>\n                ')}\n                                </ul>\n                                <a class="jobs-list__item-date" href="#">\n                                    ${t.date}\n                                </a>\n                                </div>\n                            </div>\n                            <p class="jobs-list__snippet">\n                                <a href="#">\n                                    ${t.description}\n                                </a>\n                            </p>\n                            <div class="jobs-list__user-action-container">\n                                <div class="jobs-list__watch-list">\n                                    <button class="jobs-list__user-button icon-star"\n                                        data-changing-button="classList='icon-star:-icon-star-full', contentContainer='.jobs-list__user-button-text', content='В избранное:-В избранном'">\n                                        <span class="jobs-list__user-button-text">\n                                            В избранное\n                                        </span>\n                                    </button>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n                `;this.jobsListContainer.insertAdjacentHTML("beforeend",s),this.jobsRendered.push(t.id),jobDetailState.defineState()}))}))}onJobsSearchSubmit(t){t.preventDefault(),this.checkedFilterInputs=this.filterInputs.filter((t=>t.checked&&!t.classList.contains("__no-count"))),this.checkedFilterInputs.forEach((t=>{const e=t.value,s=t.name;this.createTag(e,s)})),this.checkedFilterInputs.length<1&&this.companySearch.value.length<1&&this.locationSearch.value.length<1||(this.setTitleText(),this.alarmDisruptorPill&&this.alarmDisruptorPill.classList.remove("__removed"),this.isRenderedAlarmDisruptor||this.renderAlarmDisruptor())}setTitleText(){const t=this.companySearch.value.trim(),e=this.locationSearch.value.trim(),s=this.radiusInputs.find((t=>t.checked));if(!t&&!e&&!s&&this.checkedFilterInputs.length<1)this.title.innerHTML="Текущие вакансии";else if(t||e||s){const i=`Вакансии ${t||""} ${e?"в г.":""} ${e||""}`;s||(this.title.innerHTML=i),s&&(this.title.innerHTML=`${i} ${s.value?"в радиусе":""} \n                ${s.value?`<span class="jobs-search-list__title--bigger-text">${s.value.replace("км","")}</span> км`:""}`)}else this.title.innerHTML="<span class='jobs-search-list__title--bigger-text'>2</span> вакансии"}createTag(t,e){if(this.createdTags.find((s=>s.value===t&&s.name===e)))return;const s=createElement("li","jobs-filter-buttons__tag-item tag");s.dataset.inputName=e;const i=`\n            <div class="tag__text __no-hover">${t}</div>\n            <button class="tag__close icon-close"></button>\n        `;s.insertAdjacentHTML("afterbegin",i);s.querySelector(".tag__close").addEventListener("click",this.removeTag),this.createdTags.push({value:t,name:e}),this.tagsList.append(s)}removeTag(t){const e=t.target.closest(".jobs-filter-buttons__tag-item");e.remove(),t.target.removeEventListener("click",this.removeTag);const s=e.querySelector(".tag__text").innerHTML,i=e.dataset.inputName;function o(t){const e=Array.from(document.querySelectorAll(`input[name="${t.name}"]`)).find((t=>t.classList.contains("__no-count")));e&&(t.checked=!1,e.checked=!0,e.dispatchEvent(new Event("change")),t.dispatchEvent(new Event("checked")))}function n(t){t.checked=!1,t.dispatchEvent(new Event("change"))}this.createdTags=this.createdTags.filter((t=>t.value!==s||t.name!==i)),Array.from(document.querySelectorAll(`input[name="${i}"]`)).filter((t=>t.value==s)).forEach((t=>{"radio"==t.getAttribute("type")&&o.call(this,t),"checkbox"==t.getAttribute("type")&&n.call(this,t),setTimeout((()=>this.jobsSearchForm.dispatchEvent(new Event("submit"))),100)}))}renderAlarmDisruptor(){this.jobsListContainer.insertAdjacentHTML("beforeend",'\n        <li class="jobs-list__item jobs-list__alarm-disruptor alarm-disruptor">\n            <div class="alarm-disruptor__inner alarm-disruptor__inner--inline">\n                <div class="alarm-disruptor__image">\n                    <img src="../img/icons/notify-bell.svg" alt="Колокольчик">\n                </div>\n                <h3 class="alarm-disruptor__headline">\n                    <p>Мы подберем вакансии по выбранным позициям</p>\n                    <p>Отправить запрос?</p>\n                </h3>\n                <form novalidate class="alarm-disruptor__form">\n                    <button class="alarm-disruptor__submit-button button" type="button">\n                        Получать уведомления о вакансиях\n                    </button>\n                    <div class="alarm-disruptor__no-spam-text">\n                        Вы получите только уведомления о вакансиях - ничего больше!\n                    </div>\n                </form>\n            </div>\n        </li>\n        '),this.isRenderedAlarmDisruptor=!0}}class JobDetailListItem{constructor(t){this.rootElem=observeNodeBeforeInit(t),this.jobId=this.rootElem.dataset.jobId,this.setLinksId(),this.rootElem.addEventListener("click",jobDetailState.defineState.bind(jobDetailState))}setLinksId(){this.rootElem.querySelectorAll("a").forEach((t=>{"#"==t.getAttribute("href")&&(t.href=`#${this.jobId}`)}))}setState(){window.location.hash.replace("#","")==this.jobId?this.rootElem.classList.add("__active"):this.rootElem.classList.remove("__active")}}class AlarmDisruptorListItem{constructor(t){this.onAlarmSubmit=this.onAlarmSubmit.bind(this),this.rootElem=observeNodeBeforeInit(t),this.elemInner=this.rootElem.querySelector(".alarm-disruptor__inner"),this.submitButton=this.rootElem.querySelector(".alarm-disruptor__submit-button"),this.submitButton.addEventListener("click",this.onAlarmSubmit)}onAlarmSubmit(){this.elemInner.innerHTML='\n        <div class="alarm-disruptor__image">\n            <img src="../img/icons/phone-notify.jpg" alt="Уведомление на телефон">\n        </div>\n        <h3 class="alarm-disruptor__headline">\n            <p>Новые вакансии, подходящие по запросам вашего поиска, будут отправлены на ваш E-Mail адрес.</p>\n        </h3>\n        '}}class AlarmDisruptorPill{constructor(t){this.toggleBox=this.toggleBox.bind(this),this.submitAlarm=this.submitAlarm.bind(this),this.createAlarmEditModal=this.createAlarmEditModal.bind(this),this.rootElem=observeNodeBeforeInit(t),this.btnShow=this.rootElem.querySelector(".alarm-disruptor-pill__button"),this.btnText=this.btnShow.querySelector(".alarm-disruptor-pill__text"),this.box=this.rootElem.querySelector(".alarm-disruptor-pill__box"),this.btnSubmit=this.rootElem.querySelector(".alarm-disruptor-pill__submit"),this.btnClose=this.rootElem.querySelector(".alarm-disruptor-pill__close"),this.jobsSearchForm=document.querySelector(".jobs-search-form"),this.btnShow.addEventListener("click",this.toggleBox),this.btnClose.addEventListener("click",this.toggleBox),this.btnSubmit.addEventListener("click",this.submitAlarm)}toggleBox(){this.box.classList.contains("__removed")?(this.box.classList.remove("__removed"),this.btnShow.classList.add("__removed")):(this.box.classList.add("__removed"),this.btnShow.classList.remove("__removed"))}submitAlarm(){const t=Array.from(this.rootElem.querySelectorAll("input"));this.checkedFilters=Array.from(this.jobsSearchForm.querySelectorAll("input")).filter((t=>t.checked)),t.find((t=>t.checked))&&(this.btnText.innerHTML="Изменить настройки оповещений",this.btnText.className=this.btnText.className.replace("icon-bell","icon-pencil"),this.box.classList.add("__removed"),this.btnShow.classList.remove("__removed"),this.btnShow.removeEventListener("click",this.toggleBox),this.btnShow.addEventListener("click",this.createAlarmEditModal),snackbar.create({text:"Оповещение создано успешно"}));inittedInputs.filter((t=>t instanceof AlarmDisruptorListItem)).forEach((t=>t.onAlarmSubmit()))}createAlarmEditModal(){const t=createElement("div","jobs-search-form jobs-search-form--min");this.jobsSearchForm;new FormModal({bodyContent:t,titleText:"Изменение настроек оповещений",applyButtonText:"Сохранить изменения",removeButtonText:"Отменить отправку оповещений"})}}class JobDetail{constructor(t){this.onContainerScroll=this.onContainerScroll.bind(this),this.removeLoadingOverlay=this.removeLoadingOverlay.bind(this),this.createLoadingOverlay=this.createLoadingOverlay.bind(this),this.onTabBarClick=this.onTabBarClick.bind(this),this.rootElem=observeNodeBeforeInit(t),this.jobDetail=this.rootElem.querySelector(".job-detail"),this.closeContainer=this.rootElem.querySelector(".job-detail__close"),this.closeButton=this.closeContainer.querySelector(".job-detail__close-button"),this.container=this.rootElem.querySelector(".job-detail__container"),this.noHideHeaderMedia=window.matchMedia("(min-width: 720px)"),this.emptyState=this.rootElem.querySelector(".job-empty-state"),this.loadingOverlay=this.rootElem.querySelector(".jobs-search__detail-loading"),this.container.addEventListener("scroll",this.onContainerScroll),this.drawJobDetailContent(),this.closeButton.addEventListener("click",(()=>{jobDetailState.setHideState(),window.location.href=window.location.href.replace(/#.*/,"#")}))}createLoadingOverlay(){if(this.loadingOverlay.classList.remove("__removed"),this.loadingOverlay.querySelector(".loading-overlay__dot"))return;this.loadingOverlay.insertAdjacentHTML("afterbegin",'\n        <div class="loading-overlay__ellipsis">\n            <span class="loading-overlay__dot"></span>\n            <span class="loading-overlay__dot"></span>\n            <span class="loading-overlay__dot"></span>\n        </div>')}removeLoadingOverlay(){this.loadingOverlay.classList.add("__removed"),this.loadingOverlay.innerHTML=""}drawJobDetailContent(){function t(t){Array.isArray(t)&&(t=t.find((t=>t.id===this.jobId)))&&(this.contentTemplate=`\n            <div class="job-detail__content">\n                <div class="job-header-m">\n                    <div class="job-header-m__info">\n                        <h1 class="job-header-m__job-title">\n                            ${t.title}\n                        </h1>\n                        <ul class="job-header-m__meta-list">\n                            <li\n                                class="job-header-m__meta-item  icon-building-with-tree">\n                                <a class="job-header-m__company-link link" href="${t.url}">\n                                    ${t.employer}\n                                </a>\n                            </li>\n                            <li class="job-header-m__meta-item  icon-location">\n                                ${arrayToString(t.locations)}\n                            </li>\n                            <li class="job-header-m__meta-item  icon-clock-arrow">\n                                ${arrayToString(t["employment-type"])}\n                            </li>\n                            <li class="job-header-m__meta-item  icon-portfolio">\n                                ${t.expierence}\n                            </li>\n                            <li class="job-header-m__meta-item icon-calendar-empty">\n                                ${t.date}\n                            </li>\n                        </ul>\n                    </div>\n                    <div class="job-header-m__actions">\n                        <div class="job-header-m__action job-header-m__print ">\n                            <button\n                                class="job-header-m__button button  button--transparent icon-printer"></button>\n                        </div>\n                        <div class="job-header-m__action job-header-m__share">\n                            <button\n                                class="job-header-m__button button button--transparent icon-share"\n                                data-show-more=".share-modal"\n                                data-click-closable="0 true"></button>\n                            <div class="share-modal">\n                                <div class="share-modal__overlay"\n                                    data-show-more=".share-modal"></div>\n                                <div class="share-modal__content">\n                                    <div class="share-modal__close-container">\n                                        <span class="share-modal__headline">\n                                            Поделиться вакансией\n                                        </span>\n                                        <button class="share-modal__close icon-close" aria-label="Скрыть окно с предложением поделиться"\n                                            data-show-more=".share-modal"></button>\n                                    </div>\n                                    <div class="share-modal__share-container">\n                                        <div\n                                            class="share-modal__link share-link icon-link-share">\n                                            <input type="text" disabled\n                                                class="share-link__input"\n                                                value="https://job1.ru">\n                                        </div>\n                                        <button\n                                            class="share-modal__copy-button button button--transparent">\n                                            Скопировать ссылку\n                                        </button>\n                                        <ul class="share-modal__options">\n                                            <li class="share-modal__option-item">\n                                                <svg xmlns="http://www.w3.org/2000/svg"\n                                                    viewBox="0 0 17.61 18">\n                                                    <path fill="currentColor"\n                                                        d="M15.16 3.73H2.45c-.8 0-1.45.67-1.45 1.5v7.98c0 .83.65 1.5 1.45 1.5h12.7c.8 0 1.45-.67 1.45-1.5V5.23c.01-.83-.64-1.5-1.44-1.5zM2 5.39L5.99 8.8 2 12.95V5.39zm6.81 4.5L2.77 4.73h12.07L8.81 9.89zm-2.06-.44l1.73 1.48a.49.49 0 0 0 .64 0l1.73-1.48 4.09 4.26H2.66l4.09-4.26zm4.88-.66l3.99-3.41v7.56l-3.99-4.15z">\n                                                    </path>\n                                                </svg>\n                                                <a class="share-modal__option-link"\n                                                    href="#">Отправить по E-Mail</a>\n                                            </li>\n                                            <li class="share-modal__option-item">\n                                                <svg xmlns="http://www.w3.org/2000/svg"\n                                                    viewBox="115.029 58.1333 155.9 268.8">\n                                                    <path\n                                                        d="M 189.00,58.42\n                                                            C 196.54,57.51 206.72,58.87 214.00,61.04\n                                                            263.59,75.76 280.01,137.11 245.27,174.91\n                                                            240.01,180.64 232.97,186.14 226.00,189.63\n                                                            214.95,195.16 204.25,197.14 192.00,197.00\n                                                            140.94,196.40 109.95,140.63 132.27,96.00\n                                                            140.41,79.73 155.53,66.72 173.00,61.44\n                                                            179.90,59.35 182.28,59.40 189.00,58.42 Z\n                                                            M 193.00,98.32\n                                                            C 184.45,99.49 178.27,101.18 172.33,108.04\n                                                            156.29,126.53 167.80,155.44 193.00,156.91\n                                                            225.14,158.78 235.30,113.47 206.00,100.88\n                                                            201.90,99.12 197.44,98.23 193.00,98.32 Z\n                                                            M 169.00,253.00\n                                                            C 154.80,249.23 129.28,242.11 119.53,230.82\n                                                            108.77,218.35 118.64,198.95 135.00,200.10\n                                                            141.62,200.56 150.38,207.12 157.00,210.22\n                                                            166.27,214.57 180.76,217.88 191.00,218.00\n                                                            205.25,218.16 216.94,215.70 230.00,210.00\n                                                            238.33,206.36 244.27,199.42 254.00,200.10\n                                                            264.66,200.84 271.63,209.51 270.90,220.00\n                                                            270.32,228.37 265.75,232.73 259.00,236.94\n                                                            249.25,243.00 230.45,251.44 219.00,252.00\n                                                            223.76,258.65 243.92,277.92 251.00,285.00\n                                                            255.42,289.42 263.18,296.18 265.15,302.00\n                                                            270.41,317.57 255.07,331.79 240.00,325.03\n                                                            235.25,322.90 231.81,318.61 228.00,315.17\n                                                            228.00,315.17 207.00,295.00 207.00,295.00\n                                                            204.65,292.65 196.81,283.99 194.00,283.62\n                                                            190.29,283.13 183.64,292.28 180.99,295.00\n                                                            180.99,295.00 159.00,318.00 159.00,318.00\n                                                            153.91,323.02 148.70,327.56 141.00,326.80\n                                                            130.93,325.81 123.39,317.13 124.10,307.00\n                                                            124.75,297.58 131.00,293.34 136.91,287.00\n                                                            136.91,287.00 158.91,264.00 158.91,264.00\n                                                            158.91,264.00 169.00,253.00 169.00,253.00 Z"\n                                                        fill="#f7931e" />\n                                                </svg>\n                                                <a class="share-modal__option-link"\n                                                    href="#">Отправить через ОК</a>\n                                            </li>\n                                            <li class="share-modal__option-item">\n                                                <svg xmlns="http://www.w3.org/2000/svg"\n                                                    viewBox="92.2132 145.6 263.9 156.8">\n                                                    <path\n                                                        d="M 97.3 145.999 C 97.3 145.999 128.8 145.6 128.8 145.6 C 131.425 145.607 134.057 145.509 136.493 146.699 C 141.925 149.359 144.48 159.677 146.524 165.2 C 151.935 179.837 162.47 201.495 171.304 214.2 C 175.196 219.8 181.342 228.13 186.9 231.945 C 191.268 234.941 195.37 233.527 196.623 228.2 C 196.735 226.856 196.7 224.714 196.623 223.3 C 196.623 223.3 196.623 181.3 196.623 181.3 C 196.693 175.49 195.524 169.512 192.451 164.5 C 190.036 160.559 184.94 155.995 185.668 151.2 C 186.48 145.831 190.974 145.607 195.3 145.6 C 195.3 145.6 235.9 145.6 235.9 145.6 C 245.301 145.614 246.295 149.492 246.491 158.2 C 246.491 158.2 246.491 211.4 246.491 211.4 C 246.4 212.863 246.351 214.907 246.491 216.3 C 247.688 220.682 250.635 222.523 254.8 220.5 C 258.51 218.694 265.041 211.862 267.792 208.6 C 278.887 195.447 288.274 177.807 295.925 162.4 C 300.349 153.496 300.909 145.747 312.9 145.6 C 312.9 145.6 341.6 145.6 341.6 145.6 C 343.007 145.621 344.442 145.621 345.8 146.055 C 355.334 149.086 348.075 162.386 345.275 168 C 337.673 183.197 328.377 197.281 318.969 211.4 C 316.421 215.215 308.343 225.554 308.602 229.6 C 308.917 234.619 318.395 242.795 322 246.4 C 331.513 255.913 343.854 270.151 351.162 281.4 C 355.152 287.553 360.451 298.809 350 301.847 C 348.243 302.358 346.892 302.379 345.1 302.4 C 345.1 302.4 317.8 302.4 317.8 302.4 C 307.118 302.274 303.373 296.31 296.744 289.1 C 287.658 279.223 278.488 268.835 267.4 261.128 C 262.507 257.726 250.348 250.88 246.918 259.7 C 246.309 261.268 246.4 263.613 246.4 265.3 C 246.4 265.3 246.4 287.7 246.4 287.7 C 246.393 290.668 246.414 294.119 244.902 296.786 C 242.144 301.679 233.996 302.337 228.9 302.4 C 202.265 302.708 179.445 292.306 159.6 274.897 C 146.293 263.228 136.08 248.654 126.665 233.8 C 115.43 216.09 107.478 201.516 99.68 182 C 96.929 175.119 93.562 165.445 92.344 158.2 C 91.392 152.544 95.9 148.4 97.3 145.999 Z"\n                                                        fill="#5181b8" />\n                                                </svg>\n                                                <a class="share-modal__option-link"\n                                                    href="#">Отправить через ВК</a>\n                                            </li>\n                                        </ul>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                        <div class="job-header-m__action job-header-m__watchlist">\n                            <button\n                                data-changing-button="classList='icon-star:-icon-star-full', contentContainer='.jobs-list__user-button-text', content='В избранное:-В избранном'"\n                                class="job-header-m__button button button--transparent icon-star icon--margin">\n                                В избранное\n                            </button>\n                        </div>\n                        <div class="job-header-m__action job-header-m__watchlist">\n                            <button class="job-header-m__button button">\n                                Откликнуться\n                            </button>\n                        </div>\n                    </div>\n                </div>\n                <div class="job-detail__tab-bar">\n                    <ul class="job-detail__tab-bar-list">\n                        <li class="job-detail__tab-bar-item">\n                            <button class="job-detail__tab-bar-button"\n                                aria-label="Показать информацию о вакансии" data-tabbar-job="job-data">\n                                Вакансия\n                            </button>\n                        </li>\n                        <li class="job-detail__tab-bar-item">\n                            <button class="job-detail__tab-bar-button"\n                                aria-label="Показать информацию о работодателе" data-tabbar-job="employer-data">\n                                О работодателе\n                            </button>\n                        </li>\n                    </ul>\n                    <button class="job-detail__tab-bar-print icon-printer">\n                        Распечатать\n                    </button>\n                </div>\n                <div class="job-content">\n                    ${arrayToString(t["job-data"],"<p>[[]]</p>")}\n                </div>\n            </div>\n            `,this.container.innerHTML=this.contentTemplate,this.jobData=t,this.header=this.rootElem.querySelector(".job-header-m"),this.jobContent=this.container.querySelector(".job-content"),this.initTabBarButtons())}t=t.bind(this),this.createLoadingOverlay(),fetch(jobsDataURL).then((e=>{e.ok&&e.json().then(t)})).finally(this.removeLoadingOverlay)}initTabBarButtons(){this.tabBarButtons=this.container.querySelectorAll(".job-detail__tab-bar-button"),this.onTabBarClick(null,this.tabBarButtons[0]),this.tabBarButtons.forEach((t=>t.addEventListener("click",this.onTabBarClick)))}onTabBarClick(t,e){const s=t?t.target:e,i=s.dataset.tabbarJob;this.tabBarButtons.forEach((t=>t.classList.remove("__active"))),s.classList.add("__active"),this.currentTabBar=i,this.jobContent.innerHTML="";const o=arrayToString(this.jobData[i],"<p>[[]]</p>")||"";this.jobContent.insertAdjacentHTML("afterbegin",o)}onContainerScroll(){this.doFixHeader=this.container.scrollTop>this.header.offsetHeight,this.doFixHeader&&!this.isHeaderFixed?(setTimeout((()=>this.header.classList.add("__sticky")),100),this.closeContainer.classList.add("__visible")):(setTimeout((()=>this.header.classList.remove("__sticky")),100),this.closeContainer.classList.remove("__visible"),this.header.style.removeProperty("top"),this.closeContainer.style.removeProperty("top")),this.noHideHeaderMedia.matches||this.hideHeader(),this.containerScrolledTop=this.container.scrollTop}hideHeader(){if(!this.doFixHeader)return;this.containerScrolledTop<this.container.scrollTop?(this.header.style.top="-500px",this.closeContainer.style.top="-500px"):(this.header.style.removeProperty("top"),this.closeContainer.style.removeProperty("top"))}setShowState(){this.jobDetail.classList.add("job-detail--shown"),this.emptyState.classList.add("__removed"),this.jobId=window.location.hash.replace("#",""),this.drawJobDetailContent(),this.closeContainer.style.removeProperty("top")}setHideState(){this.jobDetail.classList.remove("job-detail--shown"),this.emptyState.classList.remove("__removed"),this.container.innerHTML="",setTimeout((()=>this.closeContainer.style.top="-500px"),100)}}const jobDetailsSelectors=[{selector:".alarm-disruptor-pill",classInstance:AlarmDisruptorPill},{selector:".jobs-search__listing",classInstance:JobsListing},{selector:".jobs-list__item:not(.jobs-list__alarm-disruptor)",classInstance:JobDetailListItem},{selector:".jobs-list__alarm-disruptor",classInstance:AlarmDisruptorListItem},{selector:".jobs-search__detail",classInstance:JobDetail}];doInit(jobDetailsSelectors),inittingSelectors=inittingSelectors.concat(jobDetailsSelectors);