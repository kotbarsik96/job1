/*
    Здесь находятся основные скрипты (шапка, состояние пользователя - авторизован или нет, методы для инициализации input'ов, полезные data-атрибуты и др.)
*/

const rootPath = "/job1/";

// определить браузер
function getBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    let browser = [
        userAgent.match(/chrome/),
        userAgent.match(/opera/),
        userAgent.match(/safari/),
        userAgent.match(/firefox/)
    ].find(br => br);
    if (browser) browser = browser[0];

    return browser;
}
const browser = getBrowser();

function browserFixes() {
    if (browser) {
        // if (browser === "firefox")
    }
}
browserFixes();

// загрузить что-либо с помощью fetch
function loadData(url, decodeMethod = "json") {
    return new Promise((rs, rj) => {
        fetch(url)
            .then(response => response[decodeMethod]())
            .then(data => rs(data))
            .catch(err => rj(err));
    });
}

// получить название страницы и активировать соответствующие кнопки
function getPageName() {
    const pageNameElem = document.querySelector("[data-page-name]");
    if (!pageNameElem) return;

    const pageNames = pageNameElem.dataset.pageName.split(", ");
    pageNames.forEach(pageName => {
        const elems = Array.from(document.querySelectorAll(`.${pageName}`));
        elems.forEach(el => el.classList.add("__page-active"));
    });
}
getPageName();

if (!String.prototype.trim) {
    (function () {
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    })();
}

function upperFirstLetter(str) {
    str = str.split("");
    str[0] = str[0].toUpperCase();
    return str.join("");
}

// делает автоматический JSON.parse/JSON.stringify при _localStorage["getItem"|"setItem"] или _sessionStorage["getItem"|"setItem"]
const _localStorage = {
    setItem: function (key, value) {
        const stringified = JSON.stringify(value);
        localStorage.setItem(key, stringified);
    },
    getItem: function (key) {
        const item = window.localStorage.getItem(key);
        return JSON.parse(item);
    }
}

// ищет элемент по селектору. Если элементов по селектору найдено больше одного, находит ближайший элемент по отношению к relative (или находит ближайшего родителя, у которого находит первый элемент) по селектору
function findClosestElem(relative, selector) {
    const targetElems = document.querySelectorAll(selector);
    if (targetElems.length === 1) return targetElems[0];

    const parent = relative.parentNode;
    if (parent) {
        const elem = parent.querySelector(selector);
        if (elem) return elem;
        else return findClosestElem(parent, selector);
    }

    return null;
}

// сглаживает скролл при нажатии на ссылку с id-шником элемента, к которому идет скролл
function smoothScroll() {
    const anchorLinks = Array.from(document.querySelectorAll("a[href*='#']"))
        .filter(aLink => aLink.getAttribute("href").length > 1 ? true : false);
    anchorLinks.forEach(aLink => {
        aLink.addEventListener("click", (event) => {
            const selector = event.target.getAttribute("href");
            const dest = document.querySelector(selector);
            dest.scrollIntoView({ behavior: "smooth" });
            event.preventDefault();
        });
    })
}
smoothScroll();

// добавляет/удаляет margin-right к body, когда присваивается класс __disabled. Предотвращает дергание страницы из-за убирания скролла
const bodyDisabledObserver = new MutationObserver((mutlist) => {
    mutlist.forEach(mut => {
        const body = document.body;
        if (mut.target === body) {
            if (body.classList.contains("__disabled")) {
                const scrollWidth = getScrollWidth();
                body.style.paddingRight = `${scrollWidth}px`;
            } else body.style.removeProperty("padding-right");
        }
    });
});
bodyDisabledObserver.observe(document.body, {
    classList: true,
    attributes: true,
    attributeOldValue: true
});

// возвращает true, если у массивов/объектов есть хотя бы одно общее value
function objectsHaveCoincidence(obj1, obj2) {
    const values1 = Object.values(obj1);
    const values2 = Object.values(obj2);
    let haveCoincidence = false;

    for (let val of values1) {
        if (values2.includes(val)) {
            haveCoincidence = true;
            break;
        }
    }

    return haveCoincidence;
}

// создать HTML-элемент (document.createElement) с нужным классом и контентом в виде HTML-строки stringToWrap
function createElement(tagName, className = false, stringToWrap = false) {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    if (stringToWrap) el.innerHTML = stringToWrap;
    return el;
}

// высчитать размер файла и вернуть его либо в килобайтах, либо в мегабайтах
function calcSize(sizeBytes) {
    const kb = sizeBytes / 1024;
    const mb = kb / 1024;
    if (mb < 1) return `${parseInt(kb)} кб`;
    if (mb >= 1) return `${parseInt(mb * 100) / 100} мб`;
}

// получить координаты элемента
function getCoords(el) {
    const box = el.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        bottom: box.bottom + window.pageYOffset,
        left: box.left + window.pageXOffset,
        right: box.right + window.pageXOffset
    };
}

// получить ширину полосы прокрутки
function getScrollWidth() {
    const div = createElement("div");
    div.style.cssText = "width: 50px; height: 50px; overflow: scroll; position: absolute; z-index: -999;";
    document.body.append(div);
    const scrollWidth = div.offsetWidth - div.clientWidth;
    div.remove();
    return scrollWidth;
}

// превратить массив строк в одну строку и обернуть wrapper, если трубуется
function arrayToString(arr, wrapper = false) {
    // wrapper === строка с ключевой подстрокой "[[]]", которая будет заменена строкой из arr; пример: <li>[[]]</li> станет <li>Какой-то текст</li>. Если отсутствует wrapper или такой подстроки нет, вернется просто строка.
    if (!wrapper || !wrapper.match("[[]]")) return arr.join(", ");

    let string = ``;
    arr.forEach(substr => {
        const wrapped = wrapper.replace("[[]]", substr);
        string += wrapped;
    });
    return string;
}

// окно с информацией о выполненном действии (например, создании ежедневного оповещения о вакансиях)
class Snackbar {
    constructor(parent = document.querySelector(".content")) {
        this.remove = this.remove.bind(this);

        this.parentToInsert = parent;
    }
    // для создания snackbar вызывается этот метод. setParams перезапишет параметры из this.params, а те, что не будут указаны в setParams, останутся по определенными по умолчанию
    create(setParams) {
        if (this.snackbar) this.remove(true);

        this.params = {
            iconName: "icon-checkbox",
            className: "snackbar",
            contentClassName: "snackbar__content",
            text: "",
            appearDuration: 250,
            fadeOutDuration: 500,
            showDuration: 5000
        }
        for (let key in setParams) this.params[key] = setParams[key];

        this.renderTemplate();
    }
    renderTemplate() {
        const snackbar = createElement("div", this.params.className);
        const node = `
        <div class="${this.params.contentClassName}">
            <div class="snackbar__check ${this.params.iconName}"></div>
            <span class="snackbar__info-text">${this.params.text}</span>
        </div>
        `;
        snackbar.insertAdjacentHTML("afterbegin", node);
        snackbar.style.transition = `all ${this.params.appearDuration / 1000}s`;
        this.parentToInsert.append(snackbar);
        this.snackbar = snackbar;
        setTimeout(() => {
            snackbar.classList.add("snackbar--shown");
            setTimeout(() => snackbar.style.removeProperty("transition"), this.params.appearDuration);
        }, 100);
        setTimeout(this.remove, this.params.showDuration);
    }
    remove(immediately = false) {
        this.snackbar.style.transition = `all ${this.params.fadeOutDuration / 1000}s`;

        if (immediately) {
            this.snackbar.classList.remove("snackbar--shown");
            this.snackbar.remove();
        } else {
            setTimeout(() => {
                this.snackbar.classList.remove("snackbar--shown");
                setTimeout(() => this.snackbar.remove(), this.params.fadeOutDuration);
            }, 100);
        }
    }
}
const snackbar = new Snackbar();

// модальное окно
class Modal {
    constructor(className = "modal", noTemplateDraw = false) {
        this.removeModal = this.removeModal.bind(this);
        this.onModalClick = this.onModalClick.bind(this);
        this.appearTransitionDur = 400;

        this.calcCloseBtnPosition = this.calcCloseBtnPosition.bind(this);
        this.modal = createElement("div", className);
        this.modal.addEventListener("click", this.onModalClick);
        if (!noTemplateDraw) this.drawBasicTemplate();
    }
    drawBasicTemplate() {
        this.basicTemplate = `
            <div class="modal__body">
                <div class="modal__close">
                    <button class="icon-close" aria-label="Закрыть модальное окно"></button>
                </div>
                <div class="modal__content">
                    <h3 class="modal__title"> ==title== </h3>
                    <div class="modal__block">
                        ==content==
                    </div>
                    <div class="modal__buttons">
                        <button class="modal__apply button"> ==apply-action== </button>
                        <button class="modal__cancel"> ==cancel-action== </button>
                    </div>
                </div>
            </div>
        `;
    }
    onModalClick(event) {
        if (event.target !== this.modal) return;
        this.removeModal();
    }
    createBasicModal(title, content, apply = null, cancel = null) {
        // apply = { text: "...", confirmCallback: function(){...} }
        // cancel = { text: "...", cancelCallback: function(){...} }
        let template = this.basicTemplate;
        if (title) template = template.replace("==title==", title);
        if (content) template = template.replace("==content==", content);

        if (apply) template = template.replace("==apply-action==", apply.text);
        if (cancel) template = template.replace("==cancel-action==", cancel.text);

        this.setModalHandlers(template, apply, cancel);
        this.modal.addEventListener("click", this.onModalClick);
    }
    createImageModal(src, borderRadius = "0px") {
        const img = createElement("img", "modal__image");
        img.src = src;
        img.style.borderRadius = borderRadius;

        this.createImageCloseBtn();

        this.modal.innerHTML = "";
        this.modal.append(this.closeBtn);
        this.modal.append(img);
        this.img = img;
        this.appendModal();
    }
    createImageCloseBtn() {
        const closeBtn = createElement("div", "modal__close modal__close--image");
        closeBtn.addEventListener("click", (event) => {
            event.preventDefault();
            this.removeModal();
        });

        closeBtn.style.opacity = 0;
        closeBtn.style.transition = "opacity .4s";
        this.closeBtn = closeBtn;

        setTimeout(() => this.calcCloseBtnPosition(true), this.appearTransitionDur);
        window.addEventListener("resize", this.calcCloseBtnPosition);
    }
    calcCloseBtnPosition(onAppear = false) {
        this.closeBtn.style.opacity = "1";
        if (onAppear) {
            setTimeout(
                () => this.closeBtn.style.removeProperty("transition"),
                this.appearTransitionDur
            );
        }

        const btnWidth = this.closeBtn.offsetWidth;

        const hasNoRelative = !this.closeBtnRelative
            || (this.closeBtnRelative.closest && !this.closeBtnRelative.closest("body"));

        if (hasNoRelative) this.closeBtnRelative = this.img;
        const imgCoords = this.closeBtnRelative.getBoundingClientRect();
        let imgY = imgCoords.top;
        let imgX = imgCoords.left - this.closeBtn.offsetWidth - 20;
        if (imgX < btnWidth) imgX = 16;

        this.closeBtn.style.cssText += `top: ${imgY}px; right: ${imgX}px`;
    }
    setModalHandlers(template, apply, cancel) {
        const removeMd = this.removeModal.bind(this);

        this.modal.innerHTML = "";
        this.modal.insertAdjacentHTML("afterbegin", template);
        const applyBtn = this.modal.querySelector(".modal__apply");
        const cancelBtn = this.modal.querySelector(".modal__cancel");
        const closeBtn = this.modal.querySelector(".modal__close");
        this.appendModal();

        if (!apply && !cancel) this.modal.querySelector(".modal__buttons").remove();
        else if (!apply) applyBtn.remove();
        else if (!cancel) cancelBtn.remove();

        closeBtn.addEventListener("click", removeMd);
        if (cancelBtn) cancelBtn.addEventListener("click", () => {
            removeMd();
            cancel.cancelCallback();
        });
        if (applyBtn) applyBtn.addEventListener("click", () => {
            removeMd();
            apply.confirmCallback();
        });
    }
    appendModal() {
        const modalBody = this.getModalBody();
        this.modal.style.transition = "opacity .2s";
        this.modal.style.opacity = "0";
        modalBody.style.transition = `transform ${this.appearTransitionDur / 1000}s`;
        modalBody.style.transform = "scale(0.7)";

        document.body.append(this.modal);
        document.body.classList.add("__disabled");
        setTimeout(() => {
            this.modal.style.opacity = "1";
            modalBody.style.transform = "scale(1)";
        }, 50);
    }
    removeModal() {
        const modalBody = this.getModalBody();
        this.modal.style.opacity = "0";
        modalBody.style.transform = "scale(0.7)";
        setTimeout(() => {
            this.closeBtn = null;
            this.img = null;
            this.modal.remove();
            document.body.classList.remove("__disabled");
            window.removeEventListener("resize", this.calcCloseBtnPosition);
        }, this.appearTransitionDur);
    }
    getTitle() {
        return this.modal.querySelector(".modal__title");
    }
    getModalBody() {
        return this.modal.querySelector(".modal__body") || this.modal.querySelector(".modal__image");
    }
}
const modal = new Modal();

// модальное окно логина
class LoginModal extends Modal {
    constructor() {
        super("modal login-modal");
        this.calcIframeHeight = this.calcIframeHeight.bind(this);
    }
    drawBasicTemplate(type) {
        // type === "signup"|"login"
        let iframeSrc;
        const origin = rootPath;
        switch (type) {
            case "signup": iframeSrc = origin + "user/signup-frame.html";
                break;
            case "login": iframeSrc = origin + "user/login-frame.html";
                break;
        }
        this.basicTemplate = `
            <div class="modal__body login-modal__body">
                <div class="modal__content login-modal__content">
                    <div class="login-modal__scene">
                        <div class="login-modal__scene-image-container">
                            <div class="login-modal__scene-background-image"></div>
                            <ul class="login-modal__list list">
                                <li class="login-modal__list-item list__item icon-checkbox">
                                    <b class="login-modal__bold">Получайте выгодные предложения о работе</b>
                                    <a class="login-modal__link link" href="#">по Email</a>
                                </li>
                                <li class="login-modal__list-item list__item icon-checkbox">
                                    <a class="login-modal__link link" href="/job1/create-resume/">Создавайте резюме</a>
                                    <b class="login-modal__bold">чтобы повысить шансы заинтересовать рекрутеров</b>
                                </li>
                                <li class="login-modal__list-item list__item icon-checkbox">
                                    <b class="login-modal__bold">Откликайтесь</b>
                                    <a class="login-modal__link link" href="#">на понравившуюся</a>
                                    <b class="login-modal__bold">вакансию</b>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="login-modal__inner">
                        <div class="login-modal__frame-container">
                            <button class="modal__close login-modal__close icon-close" aria-label="Закрыть модальное окно"></button>
                            <iframe class="login-modal__frame" src="${iframeSrc}" frameborder="0"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    createBasicModal(type) {
        // type === "signup"|"login"
        this.drawBasicTemplate(type);
        this.setModalHandlers();
        this.appendModal();
        this.iframe = this.modal.querySelector("iframe");

        this.iframe.onload = () => {
            this.calcIframeHeight();
            // следить за изменением размера экрана iframe и высчитывать высоту
            this.iframe.contentWindow.addEventListener("resize", this.calcIframeHeight);
            // следить за изменением контента на странице 
            const iframeObserver = new MutationObserver(this.calcIframeHeight);
            iframeObserver.observe(this.iframe.contentWindow.document, { subtree: true, attributes: true });
        }
    }
    calcIframeHeight() {
        const iframeWindow = this.iframe.contentWindow;
        const height = iframeWindow
            .document.querySelector(".default-layout").offsetHeight;
        this.iframe.height = height + 30;
    }
    setModalHandlers() {
        this.modal.innerHTML = "";
        this.modal.insertAdjacentHTML("afterbegin", this.basicTemplate);
        const closeBtn = this.modal.querySelector(".modal__close");

        closeBtn.addEventListener("click", this.removeModal);
    }
}
const loginModal = new LoginModal();

// модальное окно настройки оповещений вакансии. После вызова конструктора можно получить доступ к formModal.closeBtn, formModal.applyBtn, formModal.removeBtn; обработчики на них вешаются вызовом конструктора и передачи аргумента handlers
class FormModal extends Modal {
    constructor(content, handlers) {
        super("modal form-modal", true);
        this.content = {
            titleText: "",
            applyButtonText: "",
            removeButtonText: "",
            bodyContent: ""
        };
        this.handlers = { applyBtnHandler: null, removeBtnHandler: null };

        for (let key in content) this.content[key] = content[key];
        for (let key in handlers) this.handlers[key] = handlers[key];

        this.drawBasicTemplate();
    }
    drawBasicTemplate() {
        this.basicTemplate = `
        <form class="modal__body form-modal__body">
            <div class="form-modal__header ">
                <h3 class="form-modal__title">${this.content.titleText}</h3>
                <button class="form-modal__close icon-close" type="button" aria-label="Закрыть модальное окно"></button>
            </div>
            <div class="form-modal__content">
                ${this.content.bodyContent}
            </div>
            <div class="form-modal__button-container">
                <button class="form-modal__apply-button button button--full" aria-label="${this.content.applyButtonText}" type="button">
                    ${this.content.applyButtonText}
                </button>
            </div>
            <button class="form-modal__remove-button link" type="button" aria-label="${this.content.removeButtonText}">${this.content.removeButtonText}</button>
        </form>
        `;
        this.modal.innerHTML = this.basicTemplate;
        this.appendModal();
        this.addHandlers();
    }
    appendModal() {
        super.appendModal();
        this.closeBtn = this.modal.querySelector(".form-modal__close");
        this.applyBtn = this.modal.querySelector(".form-modal__apply-button");
        this.removeBtn = this.modal.querySelector(".form-modal__remove-button");
        this.content = this.modal.querySelector(".form-modal__content");
    }
    addHandlers() {
        this.closeBtn.addEventListener("click", this.removeModal);
        if (this.handlers.applyBtnHandler)
            this.applyBtn.addEventListener("click", this.handlers.applyBtnHandler);
        if (this.handlers.removeBtnHandler)
            this.removeBtn.addEventListener("click", this.handlers.removeBtnHandler);
    }
}

// модальное окно с оповещением о куки
class CookieModal extends Modal {
    constructor() {
        super("modal cookie-modal");

        this.confirmCookies = this.confirmCookies.bind(this);
        this.declineCookies = this.declineCookies.bind(this);
        const cookiePolicyPageLink = rootPath + "politika-ispolzovania-failov-cookie/";

        this.createBasicModal(
            "Куки обеспечивают удобное использование сайта!",
            `Информацию о cookie, целях их использования и способах отказа от таковых, можно найти в <a class="link" href="${cookiePolicyPageLink}" target="_blank">«Политике использования файлов cookie»</a>. Продолжая использовать наш Сайт, Вы выражаете согласие на обработку файлов cookie «cookie», а также подтверждаете факт ознакомления с <a class="link" href="${cookiePolicyPageLink}" target="_blank">«Политикой использования файлов cookie»</a>. Если Вы не хотите, чтобы ваши данные обрабатывались, покиньте сайт.`,
            { text: "ПРИНЯТЬ", confirmCallback: this.confirmCookies },
            { text: "Отклонить файлы cookie", cancelCallback: this.declineCookies }
        );
    }
    drawBasicTemplate() {
        // та же разметка, что и у Modal, но добавлены классы "cookie-modal__[...]"; добавлен modal__body--small; изменена кнопка cancel;
        this.basicTemplate = `
            <div class="modal__body modal__body--small cookie-modal__body">
                <div class="modal__close">
                    <button class="icon-close" aria-label="Закрыть модальное окно"></button>
                </div>
                <div class="modal__content cookie-modal__content">
                    <h3 class="modal__title cookie-modal__title"> ==title== </h3>
                    <div class="modal__block cookie-modal__block">
                        ==content==
                    </div>
                    <div class="cookie-modal__footer">
                        <div class="modal__buttons cookie-modal__buttons">
                            <button class="cookie-modal__button modal__apply button"> ==apply-action== </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    confirmCookies() {
        _localStorage.setItem("job1_cookies", true);
    }
    declineCookies() {
        _localStorage.setItem("job1_cookies", false);
    }
}

// вызов окна с оповещением о куки
function showCookieModal() {
    if (window.parent !== window) return;
    if (window.location.pathname.includes("politika-ispolzovania-failov-cookie")) return;

    const cookiesDecision = _localStorage.getItem("job1_cookies");
    if (typeof cookiesDecision === "boolean") return;

    setTimeout(() => new CookieModal(), 1000);
}
showCookieModal();

// модальное окно для логотипа вакансии 
class JobLogoModal extends Modal {
    constructor(employerId) {
        super("modal", true);
        this.employerId = employerId;
    }
    createBasicModal() {
        loadData(`${rootPath}json/employers.json`).then(employers => {
            this.employerData = employers.find(emp => emp.id === this.employerId);
            loadData(`${rootPath}${this.employerData.iconURL}`, "text").then(icon => {
                this.icon = icon;
                const node = createElement("div", "modal__logo");
                node.insertAdjacentHTML("afterbegin", this.icon);
                node.style.cssText = "position: absolute; z-index: -999";
                document.body.append(node);
                this.iconData = {
                    height: node.offsetHeight,
                    width: node.offsetWidth,
                    direction: node.offsetHeight > node.offsetWidth + 50 ? "vertical" : "horizontal"
                }
                node.remove();
                this.img = node;
                this.img.style.cssText = "";
                this.drawBasicTemplate();
            });
        });
    }
    drawBasicTemplate() {
        switch (this.iconData.direction) {
            case "vertical":
                this.img.classList.add("modal__logo--vertical");
                break;
            case "horizontal":
                this.img.classList.add("modal__logo--horizontal");
                break;
        }

        this.modal.insertAdjacentHTML("afterbegin", `<div class="modal__logo-body"></div>`);
        const body = this.getModalBody();
        body.append(this.img);
        this.appendModal();

        this.closeBtnRelative = body;
        super.createImageCloseBtn();
        this.modal.append(this.closeBtn);
        this.createMeta();
    }
    createMeta() {
        const employerTitleNode = createElement("h3", "modal__logo-title");
        const employerAdsNode = createElement("div", "modal__logo-ads");
        const eData = this.employerData;

        let activeAds;
        if (eData.activeAds.length > 0) {
            activeAds = `Активных объявлений: ${eData.activeAds.length}`
            employerAdsNode.classList.add("link");
        } else activeAds = "Нет активных объявлений";

        employerTitleNode.insertAdjacentText("afterbegin", eData.title);
        employerAdsNode.insertAdjacentText("afterbegin", activeAds);

        const body = this.getModalBody();
        body.prepend(employerTitleNode);
        body.append(employerAdsNode);
    }
    getModalBody() {
        return this.modal.querySelector(".modal__logo-body");
    }
}

// изображение, при нажатие на которое вызывается модальное окно
class ModalImageOnclick {
    constructor(img) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = observeNodeBeforeInit(img);
        this.isInIframe = this.rootElem.dataset.onclickModal === "iframe";
        this.src = this.rootElem.getAttribute("src");

        this.rootElem.removeAttribute("data-onclick-modal");
        this.rootElem.addEventListener("click", this.onClick);
    }
    onClick() {
        if (this.isInIframe) {
            const event = new Event("createImageModal");
            event.data = this.src;
            window.parent.dispatchEvent(event);
        }
        else modal.createImageModal(this.src);
    }
}

// создает модальное окно соглашений при нажатии на ссылку с соответствующим id или data-атрибутом с соответсвующим значением
class CreateModalLink {
    constructor(link) {
        this.rootElem = link;
        link.addEventListener("click", this.onClick.bind(this));
    }
    onClick(event) {
        event.preventDefault();
        if (
            event.target.getAttribute("id") === "conditions-link"
            || event.target.dataset.agreementName === "conditions-link"
        ) {
            const title = "Условия направления физическими лицами заявлений в электронном виде в информационно-телекоммуникационной сети «Интернет» на сайте Job1.ru";
            const content = `
            <div class="agreement__content">
                <h3 class="agreement__statement">
                    Гражданин Российской Федерации <span class="bold">(далее – «Заявитель»)</span>, сайт Job1.ru
                    <span class="bold">(далее – «Сайт»)</span>
                    заявление в электронном виде на сайте <span class="bold">(далее – «Заявление»)</span> в
                    целях получения услуги Сайта,
                    тем самым понимает, принимает и подтверждает следующее:
                </h3>
                <ol class="agreement-list__primary">
                    <li class="agreement-list__primary-item">
                        Заявитель подтверждает, что все указанные в Заявлении персональные данные принадлежат
                        лично Заявителю.
                    </li>
                    <li class="agreement-list__primary-item">
                        Заявитель подтверждает, что он является совершеннолетним гражданином Российской
                        Федерации, имеет законное право на предоставление Сайту данных, указанных в Заявлении, и
                        такие данные являются полными и действительными на момент их предоставления Сайту.
                    </li>
                    <li class="agreement-list__primary-item">
                        Заявитель обязуется <span class="underlined">не совершать</span> следующие действия:
                        <ul class="agreement-list__secondary">
                            <li class="agreement-list__secondary-item">
                                Любым способом посредством сайта <a href="https://job1.ru/">https://job1.ru/</a>
                                размещать, распространять, сохранять, загружать и/или уничтожать материалы
                                (информацию) в нарушение законодательства Российской Федерации;
                            </li>
                            <li class="agreement-list__secondary-item">
                                Размещать заведомо недостоверную информацию, регистрироваться, используя чужие
                                персональные данные (персональные данные третьих лиц, а также вымышленных лиц);
                            </li>
                            <li class="agreement-list__secondary-item">
                                Размещать заведомо недостоверную информацию об адресе
                                фактического проживания, номере(-ах) телефона(-ов), размещать информацию об
                                адресах электронной почты, права на использование которых отсутствуют у
                                Заявителя.
                            </li>
                        </ul>
                    </li>
                    <li class="agreement-list__primary-item">
                        Заявитель обязуется не нарушать информационную безопасность электронных ресурсов Сайта, не нарушать процедуры регистрации, предусмотренные Сайтом.
                    </li>
                    <li class="agreement-list__primary-item">
                        Сайт прилагает все возможные усилия и предусмотренные законодательством Российской
                        Федерации меры для того, чтобы избежать несанкционированного использования персональной
                        информации Заявителя. Заявитель уведомлен и соглашается с тем, что Сайт не несет
                        ответственности за возможное нецелевое использование персональной информации
                        пользователей, произошедшее из-за технических неполадок в программном обеспечении,
                        серверах, компьютерных сетях, находящихся вне контроля Сайта, или в результате
                        противоправных действий третьих лиц..
                    </li>
                    <li class="agreement-list__primary-item">
                        Заявитель выражает согласие и уполномочивает Сайт предоставлять полностью или
                        частично персональные данные работодателю (организациям и индивидуальным
                        предпринимателям) в целях получения от последнего предложение работы.
                    </li>
                </ol>
            </div>
            `;
            modal.createBasicModal(title, content);
            modal.getTitle().classList.add("modal__title--agreement");
        }
        if (
            event.target.getAttribute("id")
            || event.target.dataset.agreementName === "data-processing-link"
        ) {
            const title = "Согласие на обработку персональных данных, применяемое при направлении заявлений в электронном виде в информационно-телекоммуникационной сети «Интернет» на сайте Job1.ru в целях получения услуг (далее – «Согласие»)";
            const content = `<div class="agreement__content">
                <p class="agreement__statement">
                Я, <span class="bold">(далее – «Заявитель»)</span>, свободно, своей волей и в своем интересе
                даю конкретное,
                информированное и сознательное согласие сайту job1.ru <span class="bold">(далее -
                    «Сайт»)</span> на обработку
                информации, относящейся к моим персональным данным, в том числе: Ф.И.О.; год, месяц, дата; гражданство; пол; адрес: места жительства (только название улицы и номер дома); сведения об образовании, профессии, специальности и квалификации; сведения о занимаемых ранее должностях и стаже работы, места работы; семейное положение; наличие детей; сведения о смене фамилии; фотография; иная, ранее предоставленная Сайту информация; сведения о номерах телефонов, абонентом и/или пользователем которых я являюсь; сведения об адресах электронной почты Заявителя, имени пользователя Заявителя в сети Интернет, данные о созданном на сайте Сайта; метаданные, данные cookie-файлов, cookie-идентификаторы, IP-адреса, сведения о браузере и операционной системе; сведения, полученные от третьих лиц, в том числе государственных органов, государственных информационных систем, единой системы идентификации и аутентификации (ЕСИА), Пенсионного фонда Российской Федерации, в том числе через систему межведомственного электронного взаимодействия (СМЭВ), и/или из сети Интернет, и/или из иных общедоступных источников персональных данных и любую иную информацию, представленную Сайту.
                </p>
                <p class="agreement__statement">
                    Обработка персональных данных может осуществляться с использованием средств автоматизации или без таковых, а также путем смешанной обработки персональных данных, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных, в том числе в информационных системах Сайту, и совершение иных действий, предусмотренных Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
                </p>
                <p class="agreement__statement">
                    Я даю согласие на обработку своих персональных данных в следующих целях:
                </p>
                <ul class="agreement-list__primary">
                    <li
                        class="agreement-list__primary-item agreement-list__primary-item--long">
                        предоставления доступа к моим персональным данным и передача моих персональных данных работодателям и кадровым агентствам в целях потенциального трудоустройства;
                    </li>
                    <li class="agreement-list__primary-item agreement-list__primary-item--long">
                        добавление моих персональных данных в базы данных резюме на Сайтее
                    </li>
                </ul>
                <p class="agreement__statement">
                    В вышеуказанных целях я согласен на поручение обработки моих контактных данных контрагентам Сайта с обязательным условием соблюдения конфиденциальности таких данных.
                </p>
                <p class="agreement__statement">
                    Банк осуществляет обработку персональных данных Заявителя в течение 3 (трех) лет со дня подачи настоящего Согласия. 
                </p>
                <p class="agreement__statement">
                    Согласие может быть отозвано субъектом персональных данных путем обращения в отделение Банка с заявлением, оформленным в письменной форме.
                </p>
                <p class="agreement__statement">
                    Настоящее Согласие признается мной и Сайтом моим письменным согласием на обработку моих персональных данных, согласно ст. 9 Федерального закона от 27.07.2006 г. №152-ФЗ «О персональных данных».
                </p>
                <p class="agreement__statement">
                    Согласие может быть отозвано субъектом персональных данных путем направления в job1.ru письменного отзыва по адресу электронной почты: <a href="mailto: support@job1.ru">support@job1.ru</a> . В соответствии с п. 12 ст. 10.1 Федерального закона от 27.07.2006 г. № 152-ФЗ «О персональных данных» требование должно включать в себя фамилию, имя, отчество (при наличии), контактную информацию (номер телефона, адрес электронной почты или почтовый адрес), а также перечень персональных данных, обработка которых подлежит прекращению.
                </p>
            </div>`;
            modal.createBasicModal(title, content);
            modal.getTitle().classList.add("modal__title--agreement");
        }
    }
}

// авторизация пользователя или определение гостя
class User {
    constructor() {
        this.init();
    }
    init() {
        this.checkUserLogin();
        // для начала нужно прождать, пока отрисуется интерфейс для авторизированного/неавторизированного режима
        this.renderUserInterface().then(() => {
            setTimeout(() => this.initLoggingButtons(), 100);
        });
    }
    checkUserLogin() {
        const userData = _localStorage.getItem("job1_user");
        if (userData && typeof userData === "object") {
            if (userData.logged) this.logged = true;
            else this.logged = false;
        } else _localStorage.setItem("job1_user", {});
    }
    logUser(isLogged) {
        // isLogged == true: login; isLogged == false: logout.
        const userData = _localStorage.getItem("job1_user") || {};
        userData.logged = isLogged;
        _localStorage.setItem("job1_user", userData);
        this.checkUserLogin();
        setTimeout(() => window.location.reload(), 0);
    }
    initLoggingButtons() {
        // повесить обработчики на кнопки выхода
        if (this.logged) {
            this.logoutButtons = Array.from(document.querySelectorAll(".logout-button"));
            this.logoutButtons.forEach(btn => {
                btn.addEventListener("click", () => this.logUser(false));
            });
        }
        // повесить обработчики на кнопки входа, регистрации
        else {
            this.signUpButtons = Array.from(document.querySelectorAll(".signup-button"));
            this.loginButtons = Array.from(document.querySelectorAll(".login-button"));

            this.loginButtons.forEach(btn => {
                btn.addEventListener("click", () => this.logUser(true));
            });
            this.signUpButtons.forEach(btn => {
                btn.addEventListener("click", () => this.signup());
            });
        }
    }
    renderUserInterface() {
        // задержка нужно для того, чтобы сначала прошла инициализация всех классов, методов и прочих скриптов
        return new Promise(resolve => {
            setTimeout(() => {
                if (this.logged) document.body.dataset.isLoggedin = "true";
                if (!this.logged) {
                    setTimeout(() => {
                        const requireUserElems = document.querySelectorAll("[data-require-user]");
                        requireUserElems.forEach(elem => {
                            const args = elem.dataset.requireUser.split(", ");

                            if (args[0] === "button") elem.setAttribute("disabled", "");
                            if (args[0] === "button-close-icon") {
                                elem.setAttribute("disabled", "");
                                const lockIcon = `
                            <svg class="disabled-elem__lock-icon" xmlns="http://www.w3.org/2000/svg" viewBox="1 1.99 11.31 13.79">
                                <path d="M11.09 7.74H9.98V5.31a3.32 3.32 0 0 0-6.64 0v2.43H2.22C1.55 7.74 1 8.28 1 8.96v5.6c0 .67.55 1.22 1.22 1.22h8.87c.67 0 1.22-.55 1.22-1.22v-5.6a1.2 1.2 0 0 0-1.22-1.22zM4.34 5.31a2.32 2.32 0 0 1 4.64 0v2.43H4.34V5.31z" fill="currentColor"/>
                            </svg>
                            `;
                                elem.insertAdjacentHTML("beforeend", lockIcon);
                            }
                            if (args[0] === "render") elem.remove();

                            if (args[1] === "login" || args[1] === "signup") {
                                elem.removeAttribute("disabled");
                                elem.setAttribute("data-disabled", "");
                                const newElem = elem.cloneNode(true);
                                elem.replaceWith(newElem);
                                newElem.addEventListener("click", this[args[1]]);
                            }
                        });
                    }, 100);
                }

                if (header) header.renderUserInterface();
                resolve();
            }, 0);
        });
    }
    signup() {
        loginModal.createBasicModal("signup");
    }
    login() {
        loginModal.createBasicModal("login");
    }
}
const user = new User();

// шапка
class Header {
    constructor() {
        this.showSideNav = this.showSideNav.bind(this);
        this.closeSideNav = this.closeSideNav.bind(this);

        this.headerContainer = document.querySelector(".header-container");
        if (!this.headerContainer) return;

        this.header = this.headerContainer.querySelector(".header");
        this.headerMenu = this.header.querySelector(".header-menu");
        this.headerLogo = this.header.querySelector(".header__logo");
        this.showSideNavButton = this.headerContainer.querySelector("[data-header-show]");
        this.closeSideNavButton = this.headerContainer.querySelector("[data-header-close]");
        this.sideNav = this.headerContainer.querySelector(".side-navigation");
        this.headerNavList = this.headerContainer.querySelector(".header__navigation-list");

        this.initSideNav();
        this.firefoxFix();
    }
    firefoxFix() {
        const logo = this.header.querySelector(".header__logo");
        if (browser && browser === "firefox") {
            logo.classList.add("__mozfix");
        }
        if (browser && browser !== "firefox") {
            logo.classList.add("__nomozfix");

            if (this.headerNavList) {
                this.headerNavList.style.transform = "translate(0, 1px)";
            }
            const domain = this.header.querySelector(".header__logo-domain");
            domain.classList.add("__nomozfix");
        }
    }
    initSideNav() {
        if (this.sideNav) {
            this.showSideNavButton.addEventListener("click", this.showSideNav);
            this.closeSideNavButton.addEventListener("click", this.closeSideNav);
            this.sideNav.addEventListener("click", (event) => {
                if (event.target === this.sideNav || event.target.closest(".side-navigation") !== this.sideNav)
                    this.closeSideNav();
            });
        }
    }
    renderUserInterface() {
        this.headerBox = this.header.querySelector(".header__box");
        this.loginButtonDesktop = this.header.querySelector(".header__box-trigger-title");

        if (user.logged) {
            this.loginButtonDesktop.innerHTML = "Исмукова Светлана";

            // убрать замки у иконок
            const closeIcons = document.querySelectorAll(".header-menu__svg-path-lock");
            closeIcons.forEach(icon => icon.remove());

            if (!this.userContainer) {
                this.userContainer = createElement("a", "header-menu__user");
                this.userContainer.href = "#";
                this.userContainer.dataset.dynamicAdaptive = "#side-nav__user, 719";
                this.userContainer.innerHTML = `
                <div class="header-menu__user-logo">
                    <img class="header-menu__user-portrait __removed" src="#" alt="">
                    <div class="header-menu__user-icon">
                        <svg fill="currentColor" viewBox="0 0 16 18">
                            <path
                                d="M8,1.25C3.73,1.25,0.25,4.73,0.25,9S3.73,16.75,8,16.75s7.75-3.48,7.75-7.75S12.27,1.25,8,1.25z M8,1.75 c4,0,7.25,3.25,7.25,7.25c0,1.76-0.63,3.38-1.68,4.64c-0.15-0.07-0.31-0.14-0.48-0.19c-0.2-0.06-0.73-0.21-1.24-0.36 c-0.51-0.15-1.01-0.29-1.12-0.33l-0.09-0.03c-0.22-0.07-0.49-0.16-0.68-0.35c-0.03-0.06-0.07-0.35-0.09-0.53 c1.08-0.9,1.98-2.41,1.98-3.95c0-2.33-1.58-3.96-3.85-3.96S4.15,5.58,4.15,7.91c0,1.54,0.9,3.06,1.98,3.95c0,0,0,0.01-0.01,0.01 c-0.01,0.19-0.06,0.46-0.05,0.47c-0.22,0.24-0.5,0.33-0.71,0.4l-0.09,0.03c-0.11,0.04-0.61,0.18-1.12,0.33 c-0.51,0.14-1.03,0.29-1.23,0.36c-0.18,0.05-0.33,0.12-0.49,0.19C1.38,12.38,0.75,10.76,0.75,9C0.75,5,4,1.75,8,1.75z M4.65,7.91 c0-2.04,1.38-3.46,3.35-3.46s3.35,1.42,3.35,3.46c0,2.12-1.95,4.27-3.35,4.27S4.65,10.03,4.65,7.91z M8,16.25 c-2.04,0-3.89-0.85-5.2-2.21c0.09-0.03,0.17-0.08,0.27-0.1c0.2-0.06,0.72-0.21,1.23-0.36c0.52-0.15,1.02-0.29,1.14-0.33l0.08-0.03 c0.25-0.08,0.62-0.2,0.95-0.56c0.06-0.09,0.11-0.29,0.13-0.46c0.47,0.3,0.96,0.49,1.4,0.49c0.45,0,0.93-0.19,1.41-0.49 c0.03,0.18,0.07,0.39,0.15,0.49c0.31,0.34,0.69,0.46,0.93,0.54l0.08,0.03c0.12,0.04,0.62,0.18,1.14,0.33 c0.5,0.14,1.02,0.29,1.23,0.36c0.1,0.03,0.18,0.07,0.27,0.1C11.89,15.4,10.04,16.25,8,16.25z">
                            </path>
                        </svg>
                    </div>
                </div>
                <div class="header-menu__user-content">
                    <div class="header-menu__user-title">
                        Исмукова Светлана
                    </div>
                    <span class="header-menu__user-link link">Посмотреть обзор</span>
                </div>
            `;
            }
            if (!this.controlsDivider) {
                this.controlsDivider = createElement("div", "header-menu__divider divider divider--full divider--fine");
            }
            if (!this.userControls) {
                this.userControls = createElement("nav", "header-menu__control");
                this.userControls.innerHTML = `
                <ul class="header-menu__control-list">
                    <li class="header-menu__control-item">
                        <a class="header-menu__control-link" href="#">
                            Настройки
                        </a>
                    </li>
                    <li class="header-menu__control-item">
                        <a class="header-menu__control-link logout-button" href="#">
                            Выход
                        </a>
                    </li>
                </ul>
            `;
                this.userControls.dataset.dynamicAdaptive = "#side-nav__user-controls, 719"
            }

            if (!this.userContainer.closest("body")) this.headerMenu.prepend(this.userContainer);

            if (!this.controlsDivider.closest("body")) this.headerMenu.append(this.controlsDivider);
            if (!this.userControls.closest("body")) this.headerMenu.append(this.userControls);
        } else {
            this.signupButtonMobile = createElement("button", "header__box-signup-button button button--small button--outline-white signup-button");
            this.signupButtonMobile.innerHTML = "Регистрация";
            this.headerBox.append(this.signupButtonMobile);

            if (!this.guestContainer) {
                this.guestContainer = createElement("div", "header-menu__guest");
                this.guestContainer.dataset.dynamicAdaptive = "#side-nav__user, 719";
                this.guestContainer.innerHTML = `
                    <div class="header-menu__guest-content">
                        <button class="login-button button button--full">Войти</button>
                        <div class="guest-link-container">
                            Вы еще не зарегистрированы на job1.ru?
                            <a class="guest-link signup-button link" href="#">Зарегистрируйтесь
                                бесплатно</a>
                        </div>
                    </div>
                `;
            }

            if (this.userContainer) {
                this.userContainer.replaceWith(this.guestContainer);
            } else if (!this.guestContainer.closest("body")) this.headerMenu.prepend(this.guestContainer);

            if (this.controlsDivider) this.controlsDivider.remove();
            if (this.userControls) this.userControls.remove();
        }
    }
    showSideNav() {
        this.sideNav.classList.add("__show");
        document.body.classList.add("__disabled");
    }
    closeSideNav() {
        this.sideNav.classList.remove("__show");
        document.body.classList.remove("__disabled");
    }
}
const header = document.querySelector(".header-container") ? new Header() : null;

window.addEventListener("createImageModal", (event) => {
    modal.createImageModal(event.data);
});

/* =============================__ИНИЦИАЛИЗАЦИЯ ЭЛЕМЕНТОВ__============================= */

// метод добавляет MutationObserver к элементу, который, в случае его удаления из document, убирает его из списка inittedInputs
function observeNodeBeforeInit(node) {
    let observerTarget = node;
    const observer = new MutationObserver((mutlist) => {
        mutlist.forEach(mut => {
            const removedNodes = Array.from(mut.removedNodes);

            inittedInputs = inittedInputs.filter(params => {
                let keepInArray = true;
                if (removedNodes.includes(params.rootElem)) keepInArray = false;

                if (keepInArray == false) {
                    observer.disconnect();
                    if (params.onDestroy) params.onDestroy();
                }

                return keepInArray;
            });
        });
        setTimeout(() => doInit(inittingSelectors), 0);
    });
    observer.observe(observerTarget, { childList: true });

    return observerTarget;
}

// всевозможные input, dropdown и др.
let inittedInputs = [];

// инициализация конкретного input (создание экземпляра класса и помещение его в массив)
function initInput(array, elem, ClassInstance) {
    const alreadyInArray = array.find(item => {
        if (item) return Object.values(item).includes(elem);
        return false;
    });
    if (alreadyInArray) return;

    inittedInputs.push(new ClassInstance(elem));
}

// инициализация всех input по селекторам
// если что-то не инициализируется, стоит переместить этот элемент в порядке в массиве inittingSelectors или подобному ему
function doInit(selectors) {
    inittedInputs = inittedInputs.filter(inpParam => {
        if (!inpParam) return false;
        if (Object.values(inpParam).length < 1) return false;

        let keepInArray = true;
        if (!inpParam.rootElem.closest("body")) keepInArray = false;
        return keepInArray;
    });
    // selectors == [{ selector: "...", classInstance: ... }]
    for (let selData of selectors) {
        const elems = Array.from(document.querySelectorAll(selData.selector));
        elems.forEach(elem => initInput(inittedInputs, elem, selData.classInstance));
    }
}

// функция предназначена для элементов с data-click-closable, должна быть привязана к контексту класса, внутри которого вызывается, либо вызвана с помощью .call|.apply;
// dataQueries - строка data-click-closable, т.е. запросы вида "720, false, ...", которые функция распарсит и запишет; вызывает callback при нажатии на document, если медиа запрос просит это сделать
function initDataClickClosable(queries, callback) {
    queries = queries.split(", ");
    this.mediaQueries = queries.map(query => {
        const split = query.split(" ");
        return { mediaValue: split[0], boolean: split[1] };
    });
    this.mediaQueries.forEach(mdq => {
        onQueryChange = onQueryChange.bind(this);

        const query = window.matchMedia(`(min-width: ${mdq.mediaValue}px)`);
        onQueryChange();
        query.addEventListener("change", onQueryChange);

        function onQueryChange() {
            const isRemoveHandler = mdq.boolean == "true" && !query.matches
                || mdq.boolean == "false" && query.matches;
            const isAddHandler = mdq.boolean == "true" && query.matches;

            if (isRemoveHandler)
                document.removeEventListener("click", callback);
            if (isAddHandler) document.addEventListener("click", callback);
        }
    });
}


// кнопка при нажатии находит элемент по селектору, указанному в data-show-more и присваивает ему класс "__shown-more". Если по селектору найдено несколько элементов, выбирается первый элемент у ближайшего общего родителя
class ButtonShowMore {
    constructor(btn) {
        this.toggleElem = this.toggleElem.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);

        this.rootElem = observeNodeBeforeInit(btn);
        this.rootElem.addEventListener("click", this.toggleElem);
        this.inputText = this.rootElem.querySelector(".show-more__text");
        this.selector = this.rootElem.dataset.showMore;

        const elems = Array.from(document.querySelectorAll(this.selector));

        if (elems.length > 0) {
            if (elems.length === 1) this.elem = elems[0];
            if (elems.length > 1) this.elem = findClosestElem(btn, this.selector);
        }

        let textOnToggle = this.rootElem.dataset.showMoreText;
        textOnToggle = textOnToggle ? textOnToggle.split(", ") : textOnToggle;
        if (textOnToggle) {
            this.textOnHidden = textOnToggle[0];
            this.textOnShown = textOnToggle[1] || textOnToggle[0];
        }

        if (this.rootElem.hasAttribute("data-click-closable"))
            initDataClickClosable.call(this, this.rootElem.dataset.clickClosable, this.onDocumentClick);
    }
    onDocumentClick(event) {
        const inputSelector = this.rootElem.className.split(" ")[0];
        const isTarget =
            event.target !== this.elem
            && event.target !== this.rootElem
            && event.target.closest("." + inputSelector) !== this.rootElem;

        if (isTarget) this.hideElem();
    }
    toggleElem() {
        if (this.elem) {
            this.elem.classList.contains("__show-more")
                ? this.hideElem()
                : this.showElem();
        }
    }
    hideElem() {
        this.rootElem.classList.remove("__show-more-active");
        this.elem.classList.remove("__show-more");
        if (this.textOnHidden) {
            this.inputText
                ? this.inputText.innerHTML = this.textOnHidden
                : btn.innerHTML = this.textOnHidden;
        }
    }
    showElem() {
        this.rootElem.classList.add("__show-more-active");
        this.elem.classList.add("__show-more");
        if (this.textOnShown) {
            this.inputText
                ? this.inputText.innerHTML = this.textOnShown
                : btn.innerHTML = this.textOnShown;
        }
    }
}

// показывает подскзаку сверху содержимого элемента при наведении
class DataTitle {
    constructor(elem) {
        this.showTitle = this.showTitle.bind(this);
        this.hideTitle = this.hideTitle.bind(this);

        this.rootElem = observeNodeBeforeInit(elem);
        this.showingDur = 300;

        this.rootElem.addEventListener("pointerover", this.showTitle);
    }
    showTitle(event) {
        const node = event.target;
        let titleString = node.dataset.title;
        if (!titleString) titleString = node.textContent || node.innerText;

        const titleNode = createElement("div", "hover-title", titleString);
        const fontSize = getComputedStyle(this.rootElem).fontSize;
        titleNode.style.cssText = `
            transition: all ${this.showingDur / 1000}s; 
            opacity: 0; 
            font-size: ${fontSize}
        `;
        const alreadyHasTitleNode = node.querySelector(".hover-title");
        if (!alreadyHasTitleNode) node.append(titleNode);
        setTimeout(() => titleNode.style.opacity = "1", 0);
        node.addEventListener("pointerout", this.hideTitle);
    }
    hideTitle(event) {
        const node = event.target;
        const titleNode = node.querySelector(".hover-title");
        if (titleNode) {
            titleNode.style.opacity = "0";
            node.removeEventListener("pointerout", this.hideTitle);

            setTimeout(() => {
                titleNode.remove();
                this.hideTitle(event);
            }, this.showingDur);
        }
    }
}

// работает также, как и initShowMoreButtons, но присваивает класс __shown, а при нажатии на любое место на странице, кроме открытого элемента, скрывает открытый элемент
class ShowButton {
    constructor(btn) {
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.toggle = this.toggle.bind(this);

        this.rootElem = observeNodeBeforeInit(btn);
        this.target = findClosestElem(this.rootElem, this.rootElem.dataset.show);
        this.targetClass = this.target.className.split(" ")[0];

        this.rootElem.addEventListener("click", this.toggle)
        document.addEventListener("click", this.onDocumentClick);
    }
    onDocumentClick(event) {
        const notButtonOrTargetElem =
            event.target !== this.rootElem
            && event.target.closest("[data-show]") !== this.rootElem
            && event.target !== this.target
            && event.target.closest(`.${this.targetClass}`) !== this.target;

        if (notButtonOrTargetElem) this.hide();
    }
    toggle() {
        const action = this.target.classList.contains("__show")
            ? "hide"
            : "show";
        this[action]();
    }
    show() {
        this.target.classList.add("__show");
    }
    hide() {
        this.target.classList.remove("__show");
    }
    onDestroy() {
        this.rootElem.removeEventListener("click", this.toggle)
        document.removeEventListener("click", this.onDocumentClick);
    }
}

// переносит элементы в блоки, указанные в data-dynamic-adaptive="selector, media" как selector на запросе, равному (max-width: media)"
class DynamicAdaptive {
    constructor(elem) {
        this.moveElem = this.moveElem.bind(this);

        this.rootElem = observeNodeBeforeInit(elem);
        this.data = this.rootElem.dataset.dynamicAdaptive.split(", ");
        this.selector = this.data[0];
        this.mediaValue = this.data[1];
        this.mediaQuery = window.matchMedia(`(max-width: ${this.mediaValue}px)`);
        this.target = findClosestElem(this.rootElem, this.selector);
        this.replacement = createElement("div", "dynamic-adaptive-replacement");

        this.moveElem();
        this.mediaQuery.addEventListener("change", this.moveElem);
    }
    moveElem() {
        if (this.rootElem.closest("body")) {
            // переместить элемент в this.target
            if (this.mediaQuery.matches && this.target.closest("body")) {
                // поставить элемент-якорь для последующего возвращения
                this.rootElem.after(this.replacement);
                setTimeout(() => this.target.append(this.rootElem), 0);
            }
            // вернуть элемент обратно
            else this.replacement.replaceWith(this.rootElem);
        }
    }
}

// кнопка прокрутки в начало страницы
class BackToTopButton {
    constructor(btn) {
        this.onScroll = this.onScroll.bind(this);
        this.onClick = this.onClick.bind(this);

        this.rootElem = observeNodeBeforeInit(btn);
        this.parent = this.rootElem.parentNode;

        this.onScroll();
        window.addEventListener("scroll", this.onScroll);
        window.addEventListener("resize", this.onScroll);
        this.rootElem.addEventListener("click", this.onClick);
    }
    onScroll() {
        const windowHeight = document.documentElement.clientHeight || window.innerHeight;

        if (window.pageYOffset + windowHeight <= windowHeight) this.hideBtn();
        else this.showBtn();
    }
    onClick() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
    hideBtn() {
        this.rootElem.classList.add("__hidden");
    }
    showBtn() {
        this.rootElem.classList.remove("__hidden");
    }
}

// спойлеры
class Spoiler {
    constructor(spoiler) {
        this.onDocumentClick = this.onDocumentClick.bind(this);

        this.rootElem = observeNodeBeforeInit(spoiler);
        this.hideable = this.rootElem.querySelector(".spoiler__hideable");
        this.button = this.rootElem.querySelector(".spoiler__button");
        this.buttonChangingText = this.button.hasAttribute("data-spoiler-changing-text") ? this.button.dataset.spoilerChangingText.split(", ") : null;
        this.isHidden = true;

        this.button.addEventListener("click", this.toggle.bind(this));
        this.hide();

        if (this.rootElem.hasAttribute("data-click-closable")) {
            initDataClickClosable.call(this, this.rootElem.dataset.clickClosable, this.onDocumentClick);
        }
    }
    onDocumentClick(event) {
        if (event.target.closest(".spoiler") !== this.rootElem && event.target !== this.rootElem)
            this.hide();
    }
    toggle() {
        if (this.isHidden) this.show();
        else this.hide();

        const spoilerContainer = this.rootElem.closest(".spoiler-container");
        if (spoilerContainer) {
            const customEvent = new CustomEvent("spoiler-state-change", {
                detail: { target: this.rootElem, isHidden: this.isHidden }
            });
            spoilerContainer.dispatchEvent(customEvent);
        }
    }
    calcHeight(el) {
        const clone = el.cloneNode(true);
        clone.classList.remove("spoiler__hideable");
        clone.style.cssText = "opacity: 0; position: absolute; z-index: -1; transition: none";
        clone.style.width = el.offsetWidth + "px";
        document.body.append(clone);
        const height = clone.offsetHeight;
        clone.remove();
        return height;
    }
    show() {
        this.isHidden = false;
        if (this.buttonChangingText) this.button.textContent = this.buttonChangingText[1];
        this.button.classList.add("spoiler__button--shown");

        const height = this.calcHeight(this.hideable);
        this.hideable.classList.add("spoiler__hideable--shown");
        this.hideable.style.cssText = `
            max-height: ${height}px;
            opacity: 1;
            visibility: visible;
        `;

    }
    hide() {
        this.isHidden = true;
        if (this.buttonChangingText) this.button.textContent = this.buttonChangingText[0];
        this.button.classList.remove("spoiler__button--shown");

        this.hideable.classList.remove("spoiler__hideable--shown");
        this.hideable.style.removeProperty("max-height");
        this.hideable.style.removeProperty("opacity");
        this.hideable.style.removeProperty("visibility");
    }
}

// родительский контейнер со спойлерами. Полезен в случаях, когда нужно сделать аккордеон или превратить спойлер в табы
class SpoilerContainer {
    constructor(spoilerContainer) {
        this.getSpoilers = this.getSpoilers.bind(this);
        this.onSpoilerStateChange = this.onSpoilerStateChange.bind(this);
        this.tabHandler = this.tabHandler.bind(this);
        this.calcContainerMinHeight = this.calcContainerMinHeight.bind(this);

        this.rootElem = observeNodeBeforeInit(spoilerContainer);
        this.isTab = this.rootElem.hasAttribute("data-spoiler-tab");
        this.tabMediaQuery =
            window.matchMedia(`(min-width: ${this.rootElem.dataset.spoilerTab}px)`);

        this.getSpoilers();
        this.addObserver();
        // реализация функционала аккордеона
        this.rootElem.addEventListener("spoiler-state-change", this.onSpoilerStateChange);
        if (this.isTab) this.tabHandler();
        this.tabMediaQuery.addEventListener("change", this.tabHandler);

        window.addEventListener("resize", this.calcContainerMinHeight);
    }
    addObserver() {
        const subtreeObserver = new MutationObserver((mut) => {
            console.log(mut);
            setTimeout(this.getSpoilers, 250);
        });
        subtreeObserver.observe(this.rootElem, { childList: true, subtree: true });
    }
    getSpoilers() {
        this.spoilerChildNodes = Array.from(this.rootElem.querySelectorAll(".spoiler"));
        this.spoilers = inittedInputs.filter(inpParams => {
            if (inpParams.rootElem) {
                return this.spoilerChildNodes.includes(inpParams.rootElem);
            }
            return false;
        });
    }
    onSpoilerStateChange(event) {
        const toggledSpoiler = event.detail.target;
        const isHidden = event.detail.isHidden;

        const shownSpoilers = this.spoilers.filter(sp => !sp.isHidden);
        if (shownSpoilers.length > 1) {
            shownSpoilers.forEach(shownSpParams => {
                if (shownSpParams.rootElem !== toggledSpoiler)
                    shownSpParams.hide();
            });
        }
        if (this.tabMediaQuery.matches && isHidden)
            this.spoilers.find(sp => sp.rootElem === toggledSpoiler).show();

        this.calcContainerMinHeight();
    }
    tabHandler() {
        if (this.tabMediaQuery.matches) {
            const shownTab = this.spoilers.find(sp => !sp.isHidden);
            if (!shownTab) this.spoilers[0].show();
            this.calcContainerMinHeight();
        } else {
            this.spoilers.forEach(sp => {
                sp.hide();
                sp.hideable.style.removeProperty("min-height");
            });
        }
    }
    calcContainerMinHeight() {
        if (this.tabMediaQuery.matches) {
            onTransEnd = onTransEnd.bind(this);

            const spoilerHideable = this.rootElem.querySelector(".spoiler__hideable--shown");
            if (!spoilerHideable) return;
            this.rootElem.style.minHeight = `${spoilerHideable.offsetHeight}px`;
            this.rootElem.addEventListener("transitionend", onTransEnd);

            function onTransEnd() {
                if (this.tabMediaQuery.matches)
                    spoilerHideable.style.minHeight = `${this.rootElem.offsetHeight}px`;
                this.rootElem.removeEventListener("transitionend", onTransEnd);
                setTimeout(() => onTransEnd(), 1000);
            }
        } else {
            this.rootElem.style.removeProperty("min-height");
        }
    }
}

// поднавигация
class ScrollShadow {
    constructor(elem) {
        this.onScroll = this.onScroll.bind(this);

        this.rootElem = observeNodeBeforeInit(elem);
        this.selector = this.rootElem.dataset.scrollShadow;
        this.scrollable = this.rootElem.querySelector(this.selector);
        this.items = Array.from(this.scrollable.childNodes).filter(node => node.nodeType != 3);
        this.shadowStart = this.rootElem.querySelector(".scroll-shadow-start")
            || this.createShadow("start");
        this.shadowEnd = this.rootElem.querySelector(".scroll-shadow-end")
            || this.createShadow("end");


        this.visibleClass = "scroll-shadow--visible";

        this.onScroll();
        window.addEventListener("resize", this.onScroll);
        this.scrollable.addEventListener("scroll", this.onScroll);
    }
    createShadow(side) {
        const shadow = createElement("div", `scroll-shadow scroll-shadow-${side}`);
        this.rootElem.append(shadow);
        return shadow;
    }
    onScroll() {
        if (this.scrollable.scrollWidth == this.scrollable.offsetWidth) {
            this.toggleShadow("start", "remove");
            this.toggleShadow("end", "remove");
            return;
        };

        const scrolled = this.scrollable.scrollLeft;
        const listWidth = this.scrollable.offsetWidth;
        let totalWidth = 0;
        this.items.forEach(item => totalWidth += item.offsetWidth);
        const diff = totalWidth - listWidth;

        // в начало
        scrolled > 0 ? this.toggleShadow("start", "add")
            : this.toggleShadow("start", "remove");
        // в конец
        scrolled < diff ? this.toggleShadow("end", "add")
            : this.toggleShadow("end", "remove");
    }
    toggleShadow(side, action) {
        if (side !== "start" && side !== "end") return;
        if (action !== "add" && action !== "remove") return;

        side = upperFirstLetter(side);
        this["shadow" + side].classList[action](this.visibleClass);
    }
}

// изменяемое состояние кнопки по нажатию
class ChangingButton {
    constructor(btn) {
        this.changeState = this.changeState.bind(this);

        this.rootElem = observeNodeBeforeInit(btn);
        this.data = this.rootElem.dataset.changingButton;

        const classListStr = this.data.match(/classList='.*?'/);
        const contentContainerStr = this.data.match(/contentContainer='.*?'/);
        const contentStr = this.data.match(/content='.*?'/);
        const params = {
            classList: classListStr
                ? classListStr[0].replace("classList=", "").replace(/'/g, "")
                : null,
            contentContainer: contentContainerStr
                ? contentContainerStr[0].replace("contentContainer=", "").replace(/'/g, "")
                : null,
            content: contentStr
                ? contentStr[0].replace("content=", "").replace(/'/g, "")
                : null
        }
        this.contentContainer = this.rootElem.querySelector(params.contentContainer) || this.rootElem;
        this.originalState = {
            classList: params.classList.match(/.*:-/)[0].replace(":-", "").split(" "),
            content: params.content.match(/.*:-/)[0].replace(":-", "")
        };
        this.changedState = {
            classList: params.classList.match(/:-.*/)[0].replace(":-", "").split(" "),
            content: params.content.match(/:-.*/)[0].replace(":-", "")
        };

        this.rootElem.removeAttribute("data-changing-button");
        if (!this.rootElem.dataset.isChangedButton) this.rootElem.dataset.isChangedButton = "false";
        // this.initState();
        this.rootElem.addEventListener("click", this.changeState);
    }
    initState() {
        if (this.rootElem.dataset.isChangedButton == "false") this.setOriginalState();
        else this.setChangedState();
    }
    changeState() {
        if (this.rootElem.dataset.isChangedButton == "false") this.setChangedState();
        else this.setOriginalState();
    }
    setChangedState() {
        this.contentContainer.innerHTML = this.changedState.content;
        this.originalState.classList.forEach(className => {
            this.rootElem.className = this.rootElem.className.replace(className, "");
        });
        this.changedState.classList.forEach(className => {
            this.rootElem.className += " " + className;
            this.rootElem.className = this.rootElem.className.replace(/\s\s/g, " ");
        });
        this.rootElem.dataset.isChangedButton = "true";
    }
    setOriginalState() {
        this.contentContainer.innerHTML = this.originalState.content;
        this.changedState.classList.forEach(className => {
            this.rootElem.className = this.rootElem.className.replace(className, "");
        });
        this.originalState.classList.forEach(className => {
            this.rootElem.className += " " + className;
            this.rootElem.className = this.rootElem.className.replace(/\s\s/g, " ");
        });
        this.rootElem.dataset.isChangedButton = "false";
    }
}

// звездный рейтинг
class StarRating {
    constructor(container) {
        this.onChange = this.onChange.bind(this);
        this.onPointerover = this.onPointerover.bind(this);
        this.onPointerleave = this.onPointerleave.bind(this);

        this.rootElem = observeNodeBeforeInit(container);
        this.starsContainer = this.rootElem.querySelector(".star-rating__stars");
        this.starsAmount = parseInt(this.rootElem.dataset.starsAmount) || 5;
        this.inputName = this.rootElem.dataset.starsName || "star-rating";
        this.ratingValue = parseFloat(this.rootElem.dataset.ratingValue) || 0;
        this.starsFilled = createElement("div", "star-rating__stars-filled star-rating__stars-list");
        this.starsEmpty = createElement("div", "star-rating__star-inputs star-rating__stars-list");

        // убрать датасеты
        this.rootElem.removeAttribute("data-stars-amount");
        this.rootElem.removeAttribute("data-stars-name");
        this.rootElem.removeAttribute("data-rating-value");
        // отрисовать незаполненные и заполненные звезды, input'ы для незаполненных звезд
        this.renderFilled();
        this.renderInputs();
    }
    renderFilled() {
        for (let i = 1; i <= this.starsAmount; i++) {
            const filledStar = createElement("span", "star-rating__stars-filled-star st-ic-container");
            this.starsFilled.append(filledStar);
        }

        this.starsContainer.append(this.starsFilled);
    }
    renderInputs() {
        this.starInputs = [];
        for (let i = 1; i <= this.starsAmount; i++) {
            const starLabel = createElement("label", "star-rating__label st-ic-container");
            const starInput = createElement("input", "star-rating__input");
            starInput.type = "radio";
            starInput.name = this.inputName;
            starInput.value = i;
            starInput.dataset.starNumber = i;
            starLabel.append(starInput);
            this.starsEmpty.append(starLabel);

            this.starInputs.push(starInput);
            starInput.addEventListener("change", this.onChange);
            const starInputLabel = starInput.parentNode;
            starInputLabel.addEventListener("pointerover", this.onPointerover);
            starInputLabel.addEventListener("pointerleave", this.onPointerleave);
        }
        if (this.ratingValue) {
            const changeEvent = new Event("change");
            this.checkedInput = this.starInputs[parseInt(this.ratingValue) - 1];
            this.checkedInput.checked = true;
            this.checkedInput.dispatchEvent(changeEvent);
            this.setFilledWidth(this.ratingValue);
            this.checkedInputNumber = this.ratingValue;
        }

        this.starsContainer.append(this.starsEmpty);
    }
    setFilledWidth(inputNumber) {
        const width = 100 * (inputNumber / this.starsAmount);
        this.starsFilled.style.width = `${width}%`;
    }
    onChange(event) {
        const input = event.target;
        const number = input.dataset.starNumber;
        this.setFilledWidth(number);
        this.checkedInputNumber = number;
    }
    onPointerover(event) {
        const label = event.target;
        const input = label.querySelector("input");
        const number = input.dataset.starNumber;
        this.setFilledWidth(number);
    }
    onPointerleave() {
        this.setFilledWidth(this.checkedInputNumber);
    }
}

// при добавлении новых селекторов в других файлах .js, можно создать отдельный подобный массив и затем применить inittingSelectors = inittingSelectors.concat(newArray); 
let inittingSelectors = [
    { selector: "[data-show-more]", classInstance: ButtonShowMore },
    { selector: "[data-title]", classInstance: DataTitle },
    { selector: "[data-show]", classInstance: ShowButton },
    { selector: "[data-dynamic-adaptive]", classInstance: DynamicAdaptive },
    { selector: ".back-to-top", classInstance: BackToTopButton },
    { selector: ".spoiler", classInstance: Spoiler },
    { selector: ".spoiler-container", classInstance: SpoilerContainer },
    { selector: "[data-scroll-shadow]", classInstance: ScrollShadow },
    { selector: "[data-changing-button]", classInstance: ChangingButton },
    { selector: ".star-rating", classInstance: StarRating },
    { selector: "[data-onclick-modal]", classInstance: ModalImageOnclick },
    { selector: ".create-modal-link", classInstance: CreateModalLink },
]

// дает html код для аватара женского/мужского лица
class FallbackAvatars {
    constructor() {
        this.male = this.renderMale();
        this.female = this.renderFemale();
    }
    renderMale() {
        return `
            <svg fill="currentColor" viewBox="0 0 16 18">
                <path
                    d="M8,1.25C3.73,1.25,0.25,4.73,0.25,9S3.73,16.75,8,16.75s7.75-3.48,7.75-7.75S12.27,1.25,8,1.25z M8,1.75 c4,0,7.25,3.25,7.25,7.25c0,1.76-0.63,3.38-1.68,4.64c-0.15-0.07-0.31-0.14-0.48-0.19c-0.2-0.06-0.73-0.21-1.24-0.36 c-0.51-0.15-1.01-0.29-1.12-0.33l-0.09-0.03c-0.22-0.07-0.49-0.16-0.68-0.35c-0.03-0.06-0.07-0.35-0.09-0.53 c1.08-0.9,1.98-2.41,1.98-3.95c0-2.33-1.58-3.96-3.85-3.96S4.15,5.58,4.15,7.91c0,1.54,0.9,3.06,1.98,3.95c0,0,0,0.01-0.01,0.01 c-0.01,0.19-0.06,0.46-0.05,0.47c-0.22,0.24-0.5,0.33-0.71,0.4l-0.09,0.03c-0.11,0.04-0.61,0.18-1.12,0.33 c-0.51,0.14-1.03,0.29-1.23,0.36c-0.18,0.05-0.33,0.12-0.49,0.19C1.38,12.38,0.75,10.76,0.75,9C0.75,5,4,1.75,8,1.75z M4.65,7.91 c0-2.04,1.38-3.46,3.35-3.46s3.35,1.42,3.35,3.46c0,2.12-1.95,4.27-3.35,4.27S4.65,10.03,4.65,7.91z M8,16.25 c-2.04,0-3.89-0.85-5.2-2.21c0.09-0.03,0.17-0.08,0.27-0.1c0.2-0.06,0.72-0.21,1.23-0.36c0.52-0.15,1.02-0.29,1.14-0.33l0.08-0.03 c0.25-0.08,0.62-0.2,0.95-0.56c0.06-0.09,0.11-0.29,0.13-0.46c0.47,0.3,0.96,0.49,1.4,0.49c0.45,0,0.93-0.19,1.41-0.49 c0.03,0.18,0.07,0.39,0.15,0.49c0.31,0.34,0.69,0.46,0.93,0.54l0.08,0.03c0.12,0.04,0.62,0.18,1.14,0.33 c0.5,0.14,1.02,0.29,1.23,0.36c0.1,0.03,0.18,0.07,0.27,0.1C11.89,15.4,10.04,16.25,8,16.25z">
                </path>
            </svg>
            `;
    }
    renderFemale() {
        return `
        <svg viewBox="0 0 17.16 18">
            <path fill="currentColor"
                d="M8.58 1.42c-2.21 0-4.21.95-5.59 2.47A7.52 7.52 0 0 0 1 9c0 1.53.46 2.96 1.24 4.15a7.57 7.57 0 0 0 11.91.98 7.56 7.56 0 0 0-.12-10.39 7.53 7.53 0 0 0-5.45-2.32zM5.69 15.34l.15-.06.75-.22.83-.24c.16-.05.44-.14.69-.42.08-.11.11-.35.12-.47.09.01.19.04.28.04h.07c.16 0 .31-.02.47-.06.01.14.05.38.14.51.23.26.5.35.72.42l.75.23.79.24.04.01a6.92 6.92 0 0 1-5.8.02zm6.54-5.88a.77.77 0 0 0-.46-.27v-.27c0-1.39-1.64-1.44-2.96-1.48-1.5-.04-1.86-.36-2.21-.8a.61.61 0 0 0-.47-.23l-.08.01a.59.59 0 0 0-.47.36c-.3.7-.32 1.64-.3 2.23a.69.69 0 0 0-.38.29.97.97 0 0 0-.09.91c.11.32.31.53.53.64.11.8.52 1.52 1.06 2.06-.73-.11-1.9-.41-2.19-1.22-.32-.87-.55-3.88.76-5.82.79-1.17 2-1.76 3.6-1.76h.1c1.59 0 2.79.58 3.57 1.74 1.3 1.92 1.04 4.96.72 5.85-.3.84-1.51 1.13-2.26 1.23.51-.52.89-1.19 1.03-1.88.27-.12.49-.38.63-.74l.03-.08c.07-.39-.05-.64-.16-.77zm-6.31 1.23l-.02-.32-.1.01c-.08 0-.32-.04-.44-.37-.08-.27.04-.44.15-.44.16 0 .41.14.44.31l-.04-.38c0-.02-.17-1.57.22-2.49.53.67 1.13.99 2.67 1.03 1.43.04 2.38.12 2.38.88v1.14c.22-.24.26-.22.32-.24l.15-.03c.12 0 .19.09.14.31-.12.3-.29.44-.4.44h-.08c-.04 0-.06-.01-.11-.05l-.02.2c-.12 1.33-1.42 2.68-2.59 2.68h-.08c-1.04 0-2.46-1.26-2.59-2.68zm6.21 4.3c-.02-.02-.03-.06-.06-.07a2.03 2.03 0 0 0-.43-.17l-.8-.24-.79-.24c-.12-.04-.25-.08-.36-.19l-.04-.29-.03-.06.2-.11.44-.03c.82-.05 2.77-.32 3.26-1.68.36-1 .65-4.26-.79-6.39-.9-1.33-2.26-2-4.06-2h-.1c-1.81 0-3.19.68-4.1 2.03-1.45 2.15-1.18 5.38-.82 6.36.48 1.32 2.37 1.61 3.17 1.67l.32.02.14.01h.01c.13.07.25.13.38.18l-.02.04-.04.26c-.11.1-.25.14-.42.2l-.76.22-.75.22c-.17.05-.33.11-.47.18-.06.03-.09.08-.11.14a7.11 7.11 0 0 1-2.33-2.2A6.91 6.91 0 0 1 1.6 9c0-1.79.67-3.42 1.78-4.65a6.95 6.95 0 0 1 5.2-2.33c1.99 0 3.79.84 5.06 2.18A6.94 6.94 0 0 1 15.56 9a6.97 6.97 0 0 1-3.43 5.99z">
            </path>
        </svg>
            `;
    }
}
const fallbackAvatars = new FallbackAvatars();

// найти совпадения в removedNodes и addedNodes, дабы исключить бесконечный цикл инициализации при возникающих ошибках
function findCoincidenceInMutation(mut) {
    const addedNodes = Array.from(mut.addedNodes);
    const removedNodes = Array.from(mut.removedNodes);

    let isRep = Boolean(
        addedNodes.find(added => {
            return Boolean(
                removedNodes.find(removed => {
                    return removed.className == added.className;
                })
            );
        })
    );
    return isRep;
}

// отлавливать изменения документа
function observeDocumentBody() {
    const observer = new MutationObserver((mutlist) => {
        mutlist.forEach(mut => {
            const isRepeating = findCoincidenceInMutation(mut);
            if (isRepeating) return;

            setTimeout(() => {
                doInit(inittingSelectors);
                browserFixes();
            }, 100);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
document.addEventListener("DOMContentLoaded", () => {
    doInit(inittingSelectors);
    observeDocumentBody();
});

// отлавливать документа для элементов, создающих глобальный функционал (слайдер - sliders.js, создание шаблона - create-template.js). В ClassInstance функционала (например, Slider) обязательно нужно добавлять поле selector! Например: Slider.selector = ".slider".
// после scriptElementArray (в котором инициализируется этот глоб.функционал) вызывается setObserver, параметр которого - scriptElementArray.
function setScriptElementsObserver(scriptElementArray) {
    scriptElementArray.forEach(scriptElement => {
        const selector = scriptElement.selector;
        observeScriptElements(selector, scriptElementArray);
    });
}
function observeScriptElements(selector, scriptElementArray) {
    const scriptElementObserver = new MutationObserver(mutlist => {
        mutlist.forEach(mut => {
            const addedNodes = Array.from(mut.addedNodes);
            const hasScriptElementAdded = addedNodes.find(node => {
                if (!node) return false;
                if (!node.className) return false;
                return node.querySelector(selector);
            });

            if (hasScriptElementAdded)
                scriptElementArray.forEach(sldData => sldData.initScriptElement());
        });
    });

    scriptElementObserver.observe(document.body, { childList: true, subtree: true });
}