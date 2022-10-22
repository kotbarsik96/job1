class JobDetailState {
    defineState() {
        setTimeout(() => {
            const oldJobId = this.jobId;
            this.jobId = window.location.hash.replace("#", "");
            if (this.jobId == oldJobId) return;

            if (this.jobId) this.setShowState();
            else this.setHideState();

            const jobDetailItems = inittedInputs
                .filter(inpParams => inpParams instanceof JobDetailListItem);
            jobDetailItems.forEach(item => item.setState());
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
    }
    setHideState() {
        const resizableElems = document.querySelectorAll(".--jobs-resizable-elem");
        resizableElems.forEach(elem => {
            elem.className = elem.className.replace("--jobs-resizable-elem", "--jobs-full-elem");
        });
        const jobDetails = inittedInputs
            .filter(inpParams => inpParams instanceof JobDetail);
        jobDetails.forEach(jd => jd.setHideState());
    }
}
// данный экземлпяр класса используется, чтобы выставить элементам на странице состояние показа вакансии (setShowState()) или состояние без показанной вакансии (setHideState). Метод defineState() определяет состояние и саму вакансию на основе хэша в адресной строке (#101, #102, ...)
const jobDetailState = new JobDetailState();


// список вакансий
class JobsListing {
    constructor(elem) {
        this.onJobsSearchSubmit = this.onJobsSearchSubmit.bind(this);
        this.removeTag = this.removeTag.bind(this);

        this.elem = observeNodeBeforeInit(elem);
        this.tagsList = this.elem.querySelector(".jobs-filter-buttons__tags");
        this.filterListItemNames = ["professional-area", "employment-type", "work-experience", "salary"];
        this.filterInputs = [];
        this.createdTags = [];
        this.jobsSearchForm = document.querySelector(".jobs-search-form");

        this.filterListItemNames.forEach(name => {
            const inputs = document.querySelectorAll(`input[name="${name}"]`);
            inputs.forEach(inp => this.filterInputs.push(inp));
        });
        this.jobsSearchForm.addEventListener("submit", this.onJobsSearchSubmit);
    }
    onJobsSearchSubmit(event) {
        event.preventDefault();

        const checkedFilterInputs = this.filterInputs.filter(inp => {
            return inp.checked && !inp.classList.contains("__no-count");
        });
        checkedFilterInputs.forEach(inp => {
            const value = inp.value;
            this.createTag(value);
        });
    }
    createTag(value) {
        if (this.createdTags.find(tagValue => tagValue === value)) return;

        const tag = createElement("li", "jobs-filter-buttons__tag-item tag");
        const tagInner = `
            <div class="tag__text __no-hover">${value}</div>
            <button class="tag__close icon-close"></button>
        `;
        tag.insertAdjacentHTML("afterbegin", tagInner);
        const removeButton = tag.querySelector(".tag__close");
        removeButton.addEventListener("click", this.removeTag);
        this.createdTags.push(value);
        this.tagsList.append(tag);
    }
    removeTag(event) {
        const tag = event.target.closest(".jobs-filter-buttons__tag-item");
        tag.remove();
        event.target.removeEventListener("click", this.removeTag);
        const value = tag.querySelector(".tag__text").innerHTML;
        this.createdTags = this.createdTags.filter(tagValue => tagValue !== value);
    }
}

// элемент в списке вакансий
class JobDetailListItem {
    constructor(listItem) {
        this.onLinkClick = this.onLinkClick.bind(this);

        this.elem = observeNodeBeforeInit(listItem);
        this.jobId = this.elem.dataset.jobId;

        this.setLinksId();
        this.elem.addEventListener("click", jobDetailState.defineState.bind(jobDetailState));
    }
    setLinksId() {
        const links = this.elem.querySelectorAll("a");
        links.forEach(link => {
            link.href = `#${this.jobId}`;
            link.addEventListener("click", this.onLinkClick);
        });
    }
    onLinkClick(event) {
        event.preventDefault();
        const id = event.target.getAttribute("href");
        if (id) window.location.href = window.location.href.replace(/#.*/, "") + id;
    }
    setState() {
        const chosenJobId = window.location.hash.replace("#", "");
        if (chosenJobId == this.jobId) this.elem.classList.add("__active");
        else this.elem.classList.remove("__active");
    }
}

// элемент в списке вакансий, представляющий запрос на оповещение
class AlarmDisruptorListItem {
    constructor(listItem) {

    }
}

// детали вакансии
class JobDetail {
    constructor(elem) {
        this.onContainerScroll = this.onContainerScroll.bind(this);
        this.removeLoadingOverlay = this.removeLoadingOverlay.bind(this);
        this.createLoadingOverlay = this.createLoadingOverlay.bind(this);
        this.onTabBarClick = this.onTabBarClick.bind(this);

        this.elem = observeNodeBeforeInit(elem);
        this.jobDetail = this.elem.querySelector(".job-detail");
        this.closeContainer = this.elem.querySelector(".job-detail__close");
        this.closeButton = this.closeContainer.querySelector(".job-detail__close-button");
        this.container = this.elem.querySelector(".job-detail__container");
        this.noHideHeaderMedia = window.matchMedia("(min-width: 720px)");
        this.emptyState = this.elem.querySelector(".job-empty-state");
        this.loadingOverlay = this.elem.querySelector(".jobs-search__detail-loading");

        this.container.addEventListener("scroll", this.onContainerScroll);
        this.drawJobDetailContent();
        this.closeButton.addEventListener("click", jobDetailState.setHideState);
    }
    arrayToString(arr, doWrap = false) {
        // doWrap = false|{ tagName: "...", className: "..." }
        const strings = arr.toString().split(",");
        if (!doWrap) return strings.join(", ");

        let wrapped = ``;
        for (let substr of strings) {
            wrapped += `<${doWrap.tagName} class="${doWrap.className || ""}">${substr}</${doWrap.tagName}>`
        }
        return wrapped;
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
    drawJobDetailContent() {
        getData = getData.bind(this);

        this.createLoadingOverlay();
        fetch("/job1/json/jobs.json").then(response => {
            response.json().then(getData);
        }).finally(this.removeLoadingOverlay);

        function getData(data) {
            data = data[this.jobId];
            if (!data) return;

            this.contentTemplate = `
            <div class="job-detail__content">
                <div class="job-header-m">
                    <div class="job-header-m__info">
                        <h1 class="job-header-m__job-title">
                            ${data.title}
                        </h1>
                        <ul class="job-header-m__meta-list">
                            <li
                                class="job-header-m__meta-item  icon-building-with-tree">
                                <a class="job-header-m__company-link link" href="#">
                                    ${data.employer}
                                </a>
                            </li>
                            <li class="job-header-m__meta-item  icon-location">
                                ${this.arrayToString(data.location)}
                            </li>
                            <li class="job-header-m__meta-item  icon-clock-arrow">
                                ${this.arrayToString(data["employment-type"])}
                            </li>
                            <li class="job-header-m__meta-item  icon-portfolio">
                                ${data.expierence}
                            </li>
                            <li class="job-header-m__meta-item icon-calendar-empty">
                                ${data.date}
                            </li>
                        </ul>
                    </div>
                    <div class="job-header-m__actions">
                        <div class="job-header-m__action job-header-m__print ">
                            <button
                                class="job-header-m__button button  button--transparent icon-printer"></button>
                        </div>
                        <div class="job-header-m__action job-header-m__share">
                            <button
                                class="job-header-m__button button button--transparent icon-share"
                                data-show-more=".share-modal"
                                data-click-closable="0 true"></button>
                            <div class="share-modal">
                                <div class="share-modal__overlay"
                                    data-show-more=".share-modal"></div>
                                <div class="share-modal__content">
                                    <div class="share-modal__close-container">
                                        <span class="share-modal__headline">
                                            Поделиться вакансией
                                        </span>
                                        <button class="share-modal__close icon-close" aria-label="Скрыть окно с предложением поделиться"
                                            data-show-more=".share-modal"></button>
                                    </div>
                                    <div class="share-modal__share-container">
                                        <div
                                            class="share-modal__link share-link icon-link-share">
                                            <input type="text" disabled
                                                class="share-link__input"
                                                value="https://job1.ru">
                                        </div>
                                        <button
                                            class="share-modal__copy-button button button--transparent">
                                            Скопировать ссылку
                                        </button>
                                        <ul class="share-modal__options">
                                            <li class="share-modal__option-item">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 17.61 18">
                                                    <path fill="currentColor"
                                                        d="M15.16 3.73H2.45c-.8 0-1.45.67-1.45 1.5v7.98c0 .83.65 1.5 1.45 1.5h12.7c.8 0 1.45-.67 1.45-1.5V5.23c.01-.83-.64-1.5-1.44-1.5zM2 5.39L5.99 8.8 2 12.95V5.39zm6.81 4.5L2.77 4.73h12.07L8.81 9.89zm-2.06-.44l1.73 1.48a.49.49 0 0 0 .64 0l1.73-1.48 4.09 4.26H2.66l4.09-4.26zm4.88-.66l3.99-3.41v7.56l-3.99-4.15z">
                                                    </path>
                                                </svg>
                                                <a class="share-modal__option-link"
                                                    href="#">Отправить по E-Mail</a>
                                            </li>
                                            <li class="share-modal__option-item">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="115.029 58.1333 155.9 268.8">
                                                    <path
                                                        d="M 189.00,58.42
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
                                                            158.91,264.00 169.00,253.00 169.00,253.00 Z"
                                                        fill="#f7931e" />
                                                </svg>
                                                <a class="share-modal__option-link"
                                                    href="#">Отправить через ОК</a>
                                            </li>
                                            <li class="share-modal__option-item">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="92.2132 145.6 263.9 156.8">
                                                    <path
                                                        d="M 97.3 145.999 C 97.3 145.999 128.8 145.6 128.8 145.6 C 131.425 145.607 134.057 145.509 136.493 146.699 C 141.925 149.359 144.48 159.677 146.524 165.2 C 151.935 179.837 162.47 201.495 171.304 214.2 C 175.196 219.8 181.342 228.13 186.9 231.945 C 191.268 234.941 195.37 233.527 196.623 228.2 C 196.735 226.856 196.7 224.714 196.623 223.3 C 196.623 223.3 196.623 181.3 196.623 181.3 C 196.693 175.49 195.524 169.512 192.451 164.5 C 190.036 160.559 184.94 155.995 185.668 151.2 C 186.48 145.831 190.974 145.607 195.3 145.6 C 195.3 145.6 235.9 145.6 235.9 145.6 C 245.301 145.614 246.295 149.492 246.491 158.2 C 246.491 158.2 246.491 211.4 246.491 211.4 C 246.4 212.863 246.351 214.907 246.491 216.3 C 247.688 220.682 250.635 222.523 254.8 220.5 C 258.51 218.694 265.041 211.862 267.792 208.6 C 278.887 195.447 288.274 177.807 295.925 162.4 C 300.349 153.496 300.909 145.747 312.9 145.6 C 312.9 145.6 341.6 145.6 341.6 145.6 C 343.007 145.621 344.442 145.621 345.8 146.055 C 355.334 149.086 348.075 162.386 345.275 168 C 337.673 183.197 328.377 197.281 318.969 211.4 C 316.421 215.215 308.343 225.554 308.602 229.6 C 308.917 234.619 318.395 242.795 322 246.4 C 331.513 255.913 343.854 270.151 351.162 281.4 C 355.152 287.553 360.451 298.809 350 301.847 C 348.243 302.358 346.892 302.379 345.1 302.4 C 345.1 302.4 317.8 302.4 317.8 302.4 C 307.118 302.274 303.373 296.31 296.744 289.1 C 287.658 279.223 278.488 268.835 267.4 261.128 C 262.507 257.726 250.348 250.88 246.918 259.7 C 246.309 261.268 246.4 263.613 246.4 265.3 C 246.4 265.3 246.4 287.7 246.4 287.7 C 246.393 290.668 246.414 294.119 244.902 296.786 C 242.144 301.679 233.996 302.337 228.9 302.4 C 202.265 302.708 179.445 292.306 159.6 274.897 C 146.293 263.228 136.08 248.654 126.665 233.8 C 115.43 216.09 107.478 201.516 99.68 182 C 96.929 175.119 93.562 165.445 92.344 158.2 C 91.392 152.544 95.9 148.4 97.3 145.999 Z"
                                                        fill="#5181b8" />
                                                </svg>
                                                <a class="share-modal__option-link"
                                                    href="#">Отправить через ВК</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="job-header-m__action job-header-m__watchlist">
                            <button
                                class="job-header-m__button button button--transparent icon-star icon--margin">
                                В избранное
                            </button>
                        </div>
                        <div class="job-header-m__action job-header-m__watchlist">
                            <button class="job-header-m__button button">
                                Откликнуться
                            </button>
                        </div>
                    </div>
                </div>
                <div class="job-detail__tab-bar">
                    <ul class="job-detail__tab-bar-list">
                        <li class="job-detail__tab-bar-item">
                            <button class="job-detail__tab-bar-button"
                                aria-label="Показать информацию о вакансии" data-tabbar-job="job-data">
                                Вакансия
                            </button>
                        </li>
                        <li class="job-detail__tab-bar-item">
                            <button class="job-detail__tab-bar-button"
                                aria-label="Показать информацию о работодателе" data-tabbar-job="employer-data">
                                О работодателе
                            </button>
                        </li>
                    </ul>
                    <button class="job-detail__tab-bar-print icon-printer">
                        Распечатать
                    </button>
                </div>
                <div class="job-content">
                    ${this.arrayToString(data["job-data"], { tagName: "p" })}
                </div>
            </div>
            `;
            this.container.innerHTML = this.contentTemplate;
            this.jobData = data;
            this.header = this.elem.querySelector(".job-header-m");
            this.jobContent = this.container.querySelector(".job-content");
            this.initTabBarButtons();
        }
    }
    initTabBarButtons() {
        this.tabBarButtons = this.container.querySelectorAll(".job-detail__tab-bar-button");
        this.onTabBarClick(null, this.tabBarButtons[0]);
        this.tabBarButtons.forEach(btn => btn.addEventListener("click", this.onTabBarClick));
    }
    onTabBarClick(event, node) {
        const btn = event ? event.target : node;
        const tabBarValue = btn.dataset.tabbarJob;

        this.tabBarButtons.forEach(btn => btn.classList.remove("__active"));
        btn.classList.add("__active");
        this.currentTabBar = tabBarValue;

        this.jobContent.innerHTML = "";
        const insertToJobContent = this.arrayToString(this.jobData[tabBarValue], { tagName: "p" }) || "";
        this.jobContent.insertAdjacentHTML("afterbegin", insertToJobContent);
    }
    onContainerScroll() {
        this.doFixHeader = this.container.scrollTop > this.header.offsetHeight;
        if (this.doFixHeader) {
            this.header.classList.add("__sticky");
            this.closeContainer.classList.add("__visible");
        }
        else {
            this.header.classList.remove("__sticky");
            this.closeContainer.classList.remove("__visible");
            this.header.style.removeProperty("top");
            this.closeContainer.style.removeProperty("top");
        }

        if (this.noHideHeaderMedia.matches == false) this.hideHeader();
        this.containerScrolledTop = this.container.scrollTop;
    }
    hideHeader() {
        if (!this.doFixHeader) return;

        const isScrolledUp = this.containerScrolledTop < this.container.scrollTop;
        if (isScrolledUp) {
            this.header.style.top = "-500px";
            this.closeContainer.style.top = "-500px";
        } else {
            this.header.style.removeProperty("top");
            this.closeContainer.style.removeProperty("top");
        }
    }
    setShowState() {
        this.jobDetail.classList.add("job-detail--shown");
        this.emptyState.classList.add("__removed");
        this.jobId = window.location.hash.replace("#", "");
        this.drawJobDetailContent();
        this.closeContainer.style.removeProperty("top");
    }
    setHideState() {
        this.jobDetail.classList.remove("job-detail--shown");
        this.emptyState.classList.remove("__removed");
        this.container.innerHTML = "";
        setTimeout(() => this.closeContainer.style.top = "-500px", 100);
    }
}

const jobDetailsSelectors = [
    { selector: ".jobs-search__listing", classInstance: JobsListing },
    { selector: ".jobs-list__item:not(.jobs-list__alarm-disruptor)", classInstance: JobDetailListItem },
    { selector: ".jobs-list__alarm-disruptor", classInstance: AlarmDisruptorListItem },
    { selector: ".jobs-search__detail", classInstance: JobDetail },
];

// отлавливать изменения документа
function observeJobDetails() {
    const observer = new MutationObserver((mutlist) => {
        const isRepeating = findCoincidenceInMutationlist(mutlist);
        if (isRepeating) return;

        setTimeout(() => {
            doInit(jobDetailsSelectors);
            jobDetailState.defineState();
        }, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
observeJobDetails();