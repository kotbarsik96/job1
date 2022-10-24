/*
    Здесь находятся основные скрипты (шапка, состояние пользователя - авторизован или нет, методы для инициализации input'ов, полезные data-атрибуты и др.)
*/

const rootPath = "/job1/";

// получить название страницы и активировать соответствующие кнопки
function getPageName() {
    const pageNameElem = document.querySelector("[data-page-name]");
    if (!pageNameElem) return;

    const pageName = pageNameElem.dataset.pageName;
    const elems = Array.from(document.querySelectorAll(`.${pageName}`));
    elems.forEach(el => {
        el.classList.add("__page-active");
    });
    pageNameElem.removeAttribute("data-page-name");

    return pageName;
}
const pageName = getPageName();

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

// делает автоматический JSON.parse/JSON.stringify при _localStorage.["getItem"|"setItem"];
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
    if(!wrapper || !wrapper.match("[[]]")) return arr.join(", ");
    
    let string = ``;
    arr.forEach(substr => {
        const wrapped = wrapper.replace("[[]]", substr);
        string += wrapped;
    });
    return string;
}

// модальное окно
class Modal {
    constructor(className = "modal") {
        this.removeModal = this.removeModal.bind(this);
        this.onModalClick = this.onModalClick.bind(this);
        this.appearTransitionDur = 400;

        this.calcCloseBtnPosition = this.calcCloseBtnPosition.bind(this);
        this.modal = createElement("div", className);
        this.modal.addEventListener("click", this.onModalClick);
        this.drawBasicTemplate();
    }
    drawBasicTemplate() {
        this.basicTemplate = `
            <div class="modal__body">
                <div class="modal__close">
                    <button class="icon-close"></button>
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
    createBasicModal(title, content, apply = null, cancelText = null) {
        // apply = { text: "...", confirmCallback: function(){...} }
        let template = this.basicTemplate;
        if (title) template = template.replace("==title==", title);
        if (content) template = template.replace("==content==", content);

        if (apply) template = template.replace("==apply-action==", apply.text);
        if (cancelText) template = template.replace("==cancel-action==", cancelText);

        this.setModalHandlers(template, apply, cancelText);
        this.modal.addEventListener("click", this.onModalClick);
    }
    createImageModal(src, borderRadius = "0px") {
        const img = createElement("img", "modal__image");
        img.src = src;
        img.style.borderRadius = borderRadius;

        const closeBtn = createElement("div", "modal__close modal__close--image");
        closeBtn.addEventListener("click", (event) => {
            event.preventDefault();
            this.removeModal();
        });

        this.modal.innerHTML = "";
        this.modal.append(closeBtn);
        this.modal.append(img);
        this.img = img;
        this.closeBtn = closeBtn;
        this.closeBtn.style.opacity = 0;
        this.closeBtn.style.transition = "opacity .4s";
        this.appendModal();

        setTimeout(() => this.modal.addEventListener("click", this.onModalClick), 0);
        setTimeout(() => this.calcCloseBtnPosition(true), this.appearTransitionDur);
        window.addEventListener("resize", this.calcCloseBtnPosition);
    }
    calcCloseBtnPosition(onAppear = false) {
        this.closeBtn.style.opacity = "1";
        if (onAppear) {
            setTimeout(() => this.closeBtn.style.removeProperty("transition"), 400);
        }

        const windowWidth = document.documentElement.clientWidth || window.innerWidth;
        const btnWidth = this.closeBtn.offsetWidth;

        const imgCoords = this.img.getBoundingClientRect();
        let imgY = imgCoords.top;
        let imgX = imgCoords.left - this.closeBtn.offsetWidth - 10;
        if (imgX < btnWidth) imgX = (windowWidth / 2) - (btnWidth / 2);

        this.closeBtn.style.cssText += `top: ${imgY}px; right: ${imgX}px`;
    }
    setModalHandlers(template, apply, cancelText) {
        const removeMd = this.removeModal.bind(this);

        this.modal.innerHTML = "";
        this.modal.insertAdjacentHTML("afterbegin", template);
        const applyBtn = this.modal.querySelector(".modal__apply");
        const cancelBtn = this.modal.querySelector(".modal__cancel");
        const closeBtn = this.modal.querySelector(".modal__close");
        this.appendModal();

        if (!apply && !cancelText) this.modal.querySelector(".modal__buttons").remove();
        else if (!apply) applyBtn.remove();
        else if (!cancelText) cancelBtn.remove();

        closeBtn.addEventListener("click", removeMd);
        if (cancelBtn) cancelBtn.addEventListener("click", removeMd);
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
        const origin = window.location.origin + "/job1/";
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
                                    по Email
                                </li>
                                <li class="login-modal__list-item list__item icon-checkbox">
                                    Создавайте резюме,
                                    <b class="login-modal__bold">чтобы повысить шансы заинтересовать рекрутеров</b>
                                </li>
                                <li class="login-modal__list-item list__item icon-checkbox">
                                    <b class="login-modal__bold">Откликайтесь</b>
                                    на понравившуюся
                                    <b class="login-modal__bold">вакансию</b>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="login-modal__inner">
                        <div class="login-modal__frame-container">
                            <button class="modal__close login-modal__close icon-close"></button>
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
        this.showSideNavButton = this.headerContainer.querySelector("[data-header-show]");
        this.closeSideNavButton = this.headerContainer.querySelector("[data-header-close]");
        this.sideNav = this.headerContainer.querySelector(".side-navigation");

        this.initSideNav();
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
                        <svg fill="currentColor" viewBox="0 0 16 18" role="img"
                            aria-label="Platzhalter für Profilbild">
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

/* =============================__ИНИЦИАЛИЗАЦИЯ ЭЛЕМЕНТОВ__============================= */

// список ключей, значения которых в классах, содержащихся в массивах inittedInputs, являются DOM-элементами, обязательными для присутствия на странице. Массив используется в observeNodeBeforeInit().
const observingNodesKeys = [
    "input", "form", "formElement", "elem"
];

// Данный метод обязательно вызывается для присваивания в основной элемент, список которых указан в observingNodesKeys (this.input, this.form, ...). Он добавляет MutationObserver к элементу, который, в случае его удаления из document, убирает его из списка inittedInputs
function observeNodeBeforeInit(node) {
    let observerTarget = node;
    const observer = new MutationObserver((mutlist) => {
        mutlist.forEach(mut => {
            const removedNodes = Array.from(mut.removedNodes);

            inittedInputs = inittedInputs.filter(params => {
                let keepInArray = true;
                observingNodesKeys.forEach(key => {
                    if (params[key] && removedNodes.includes(params[key]))
                        keepInArray = false;
                });

                if (keepInArray == false) {
                    observer.disconnect();
                    if (params.onDestroy) params.onDestroy();
                }

                return keepInArray;
            });
        });
        setTimeout(() => doInit(inputSelectors), 0);
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
function doInit(selectors) {
    inittedInputs = inittedInputs.filter(inpParam => {
        if (!inpParam) return false;
        if (Object.values(inpParam).length < 1) return false;

        let keepInArray = true;
        for (let nodeKey of observingNodesKeys) {
            if (!inpParam[nodeKey]) continue;
            if (inpParam[nodeKey].closest && !inpParam[nodeKey].closest("body"))
                keepInArray = false;
        }
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

        this.input = observeNodeBeforeInit(btn);
        this.input.addEventListener("click", this.toggleElem);
        this.inputText = this.input.querySelector(".show-more__text");
        this.selector = this.input.dataset.showMore;

        const elems = Array.from(document.querySelectorAll(this.selector));

        if (elems.length > 0) {
            if (elems.length === 1) this.elem = elems[0];
            if (elems.length > 1) this.elem = findClosestElem(btn, this.selector);
        }

        let textOnToggle = this.input.dataset.showMoreText;
        textOnToggle = textOnToggle ? textOnToggle.split(", ") : textOnToggle;
        if (textOnToggle) {
            this.textOnShow = textOnToggle[0];
            this.textOnHide = textOnToggle[1] || textOnToggle[0];
        }

        if (this.input.hasAttribute("data-click-closable"))
            initDataClickClosable.call(this, this.input.dataset.clickClosable, this.onDocumentClick);
    }
    onDocumentClick(event) {
        const inputSelector = this.input.className.split(" ")[0];
        const isTarget =
            event.target !== this.elem
            && event.target !== this.input
            && event.target.closest(inputSelector) !== this.input;

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
        this.input.classList.remove("__show-more-active");
        this.elem.classList.remove("__show-more");
        if (this.textOnHide) {
            this.inputText
                ? this.inputText.innerHTML = this.textOnHide
                : btn.innerHTML = this.textOnHide;
        }
    }
    showElem() {
        this.input.classList.add("__show-more-active");
        this.elem.classList.add("__show-more");
        if (this.textOnShow) {
            this.inputText
                ? this.inputText.innerHTML = this.textOnShow
                : btn.innerHTML = this.textOnShow;
        }
    }
}

// показывает подскзаку сверху содержимого элемента при наведении
class DataTitle {
    constructor(elem) {
        this.showTitle = this.showTitle.bind(this);
        this.hideTitle = this.hideTitle.bind(this);

        this.elem = observeNodeBeforeInit(elem);
        this.showingDur = 300;

        this.elem.addEventListener("pointerover", this.showTitle);
    }
    showTitle(event) {
        const node = event.target;
        let titleString = node.dataset.title;
        if (!titleString) titleString = node.textContent || node.innerText;

        const titleNode = createElement("div", "hover-title", titleString);
        const fontSize = getComputedStyle(this.elem).fontSize;
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

        this.input = observeNodeBeforeInit(btn);
        this.target = findClosestElem(this.input, this.input.dataset.show);
        this.targetClass = this.target.className.split(" ")[0];

        this.input.addEventListener("click", this.toggle)
        document.addEventListener("click", this.onDocumentClick);
    }
    onDocumentClick(event) {
        const notButtonOrTargetElem =
            event.target !== this.input
            && event.target.closest("[data-show]") !== this.input
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
        this.input.removeEventListener("click", this.toggle)
        document.removeEventListener("click", this.onDocumentClick);
    }
}

// переносит элементы в блоки, указанные в data-dynamic-adaptive="selector, media" как selector на запросе, равному (max-width: media)"
class DynamicAdaptive {
    constructor(elem) {
        this.moveElem = this.moveElem.bind(this);

        this.movableElem = observeNodeBeforeInit(elem);
        this.data = this.movableElem.dataset.dynamicAdaptive.split(", ");
        this.selector = this.data[0];
        this.mediaValue = this.data[1];
        this.mediaQuery = window.matchMedia(`(max-width: ${this.mediaValue}px)`);
        this.target = findClosestElem(this.movableElem, this.selector);
        this.replacement = createElement("div", "dynamic-adaptive-replacement");

        this.moveElem();
        this.mediaQuery.addEventListener("change", this.moveElem);
    }
    moveElem() {
        if (this.movableElem.closest("body")) {
            // переместить элемент в this.target
            if (this.mediaQuery.matches && this.target.closest("body")) {
                // поставить элемент-якорь для последующего возвращения
                this.movableElem.after(this.replacement);
                setTimeout(() => this.target.append(this.movableElem), 0);
            }
            // вернуть элемент обратно
            else this.replacement.replaceWith(this.movableElem);
        }
    }
}

// кнопка прокрутки в начало страницы
class BackToTopButton {
    constructor(btn) {
        this.onScroll = this.onScroll.bind(this);
        this.onClick = this.onClick.bind(this);

        this.input = observeNodeBeforeInit(btn);
        this.parent = this.input.parentNode;

        this.onScroll();
        window.addEventListener("scroll", this.onScroll);
        window.addEventListener("resize", this.onScroll);
        this.input.addEventListener("click", this.onClick);
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
        this.input.classList.add("__hidden");
    }
    showBtn() {
        this.input.classList.remove("__hidden");
    }
}

// спойлеры
class Spoiler {
    constructor(spoiler) {
        this.onDocumentClick = this.onDocumentClick.bind(this);

        this.spoiler = observeNodeBeforeInit(spoiler);
        this.hideable = this.spoiler.querySelector(".spoiler__hideable");
        this.button = this.spoiler.querySelector(".spoiler__button");
        this.buttonChangingText = this.button.hasAttribute("data-spoiler-changing-text") ? this.button.dataset.spoilerChangingText.split(", ") : null;
        this.isHidden = true;

        this.button.addEventListener("click", this.toggle.bind(this));
        this.hide();

        if (this.spoiler.hasAttribute("data-click-closable")) {
            initDataClickClosable.call(this, this.spoiler.dataset.clickClosable, this.onDocumentClick);
        }
    }
    onDocumentClick(event) {
        if (event.target.closest(".spoiler") !== this.spoiler && event.target !== this.spoiler)
            this.hide();
    }
    toggle() {
        if (this.isHidden) this.show();
        else this.hide();
    }
    calcHeight(el) {
        const clone = el.cloneNode(true);
        clone.classList.remove("spoiler__hideable");
        clone.style.cssText = "opacity: 0; position: absolute; z-index: -1";
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

// поднавигация
class ScrollShadow {
    constructor(elem) {
        this.onScroll = this.onScroll.bind(this);

        this.elem = observeNodeBeforeInit(elem);
        this.selector = this.elem.dataset.scrollShadow;
        this.scrollable = this.elem.querySelector(this.selector);
        this.items = Array.from(this.scrollable.childNodes).filter(node => node.nodeType != 4);
        this.shadowStart = this.elem.querySelector(".scroll-shadow-start")
            || this.createShadow("start");
        this.shadowEnd = this.elem.querySelector(".scroll-shadow-end")
            || this.createShadow("end");


        this.visibleClass = "scroll-shadow--visible";

        this.onScroll();
        window.addEventListener("resize", this.onScroll);
        this.scrollable.addEventListener("scroll", this.onScroll);
    }
    createShadow(side) {
        const shadow = createElement("div", `scroll-shadow scroll-shadow-${side}`);
        this.elem.append(shadow);
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

        this.input = observeNodeBeforeInit(btn);
        this.data = this.input.dataset.changingButton;

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
        this.contentContainer = this.input.querySelector(params.contentContainer) || this.input;
        this.originalState = {
            classList: params.classList.match(/.*:-/)[0].replace(":-", "").split(" "),
            content: params.content.match(/.*:-/)[0].replace(":-", "")
        };
        this.changedState = {
            classList: params.classList.match(/:-.*/)[0].replace(":-", "").split(" "),
            content: params.content.match(/:-.*/)[0].replace(":-", "")
        };

        this.input.removeAttribute("data-changing-button");
        if (!this.input.dataset.isChangedButton) this.input.dataset.isChangedButton = "false";
        // this.initState();
        this.input.addEventListener("click", this.changeState);
    }
    initState() {
        if (this.input.dataset.isChangedButton == "false") this.setOriginalState();
        else this.setChangedState();
    }
    changeState() {
        if (this.input.dataset.isChangedButton == "false") this.setChangedState();
        else this.setOriginalState();
    }
    setChangedState() {
        this.contentContainer.innerHTML = this.changedState.content;
        this.originalState.classList.forEach(className => {
            this.input.className = this.input.className.replace(className, "");
        });
        this.changedState.classList.forEach(className => {
            this.input.className += " " + className;
            this.input.className = this.input.className.replace(/\s\s/g, " ");
        });
        this.input.dataset.isChangedButton = "true";
    }
    setOriginalState() {
        this.contentContainer.innerHTML = this.originalState.content;
        this.changedState.classList.forEach(className => {
            this.input.className = this.input.className.replace(className, "");
        });
        this.originalState.classList.forEach(className => {
            this.input.className += " " + className;
            this.input.className = this.input.className.replace(/\s\s/g, " ");
        });
        this.input.dataset.isChangedButton = "false";
    }
}

const inittingSelectors = [
    { selector: "[data-show-more]", classInstance: ButtonShowMore },
    { selector: "[data-title]", classInstance: DataTitle },
    { selector: "[data-show]", classInstance: ShowButton },
    { selector: "[data-dynamic-adaptive]", classInstance: DynamicAdaptive },
    { selector: ".back-to-top", classInstance: BackToTopButton },
    { selector: ".spoiler", classInstance: Spoiler },
    { selector: "[data-scroll-shadow]", classInstance: ScrollShadow },
    { selector: "[data-changing-button]", classInstance: ChangingButton },
]

// найти совпадения в removedNodes и addedNodes, дабы исключить бесконечный цикл инициализации при возникающих ошибках
function findCoincidenceInMutationlist(mutlist) {
    return Boolean(mutlist.find(mut => {
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
    }));
}

// отлавливать изменения документа
function observeDocumentBodyOnInputs() {
    const observer = new MutationObserver((mutlist) => {
        const isRepeating = findCoincidenceInMutationlist(mutlist);
        if (isRepeating) return;

        setTimeout(() => {
            doInit(inittingSelectors);
        }, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
observeDocumentBodyOnInputs();