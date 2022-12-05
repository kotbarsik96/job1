/*
    Параметры Slider:
    slidesAmount: количество слайдов, помещающихся в экран;
    pagination: параметры отображения пагинации (элемент появится автоматически, его можно не включать в верстку):
        { 
            on: false|true - вкл/выкл пагинацию (по умолчанию - false)
            className: "..." - класслист контейнера пагинации (по умолчанию - "slider__pagination"),
            type: "bullets"|"numbers",
            indexText: "", - текст "СЛАЙД ... из ... слайдов"
            delimeterText: "", - текст "слайд ... ИЗ ... слайдов"
            totalText: "", - текст "слайд ... из ... СЛАЙДОВ",
            indexTextPosition: "afterbegin"|"beforeend", - позиция текста
            totalTextPosition: "beforeend"|"afterbegin", - позиция текста
        };
    controls: параметры отображения кнопок перелистывания (стрелок) (элемент появляется автоматически):
        {
            on: false|true,
            className: "..." - класслит контейнера кнопок
            iconName: "..." - название иконки (из набора иконочного шрифта), которая применяется в кнопку
            rotateButton: "next"|"prev"|"0" - кнопка, к которой будет применен класс "__rotated", переворачивающий ее на 180 градусов. По умолчанию - "next"; 0 - кнопки не будут повернуты
            prevButton: {
                className: "..." - класслист кнопки "назад"
            },
            nextButton: {
                className: "..." - класслист кнопки "вперед"
            }
        }
    grabCursor: false|true - указывать ли "cursor: grab" при наведении и "cursor: grabbing" при передвижении слайдера
    media: запросы media в виде (min-width: media). Синтаксис: 
        media: { 720: { pagination: { on: false } }, 1248: { disabled: true } }. Здесь на экранах шириной от 720px и выше будет отключена пагинация, а на 1248px и выше будет отключен весь слайдер;
    listClass: класс списка слайдов (по умолчанию - "slider__list");
    slideClass: класс слайда (по умолчанию - "slider__slide");
    spaceBetween: расстояние до следующего слайда (px, по умолчанию - 10);
    slideWidth: минимальная ширина слайда (по умолчанию - 0);
    disabled: неактивен ли слайдер (true - неактивен, false - активен);
    speed: длительность transition в мс при пролистывании слайдера через кнопки (по умолчанию - 500);
    draggable: true|false будет ли слайдер перемещаться курсором (по умолчанию - true)
*/

class Slider {
    constructor(selector, params = {}) {
        this.setSlidesWidth = this.setSlidesWidth.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.initSlider = this.initSlider.bind(this);
        this.disableSlider = this.disableSlider.bind(this);
        this.sliderOnResize = this.sliderOnResize.bind(this);

        if (!params.disabled) params.disabled = false;

        this.selector = selector || ".slider";
        this.sliders = Array.from(document.querySelectorAll(this.selector));
        this.getParams(params);
        this.paramsOnInit = params;
        document.querySelectorAll(`.${this.listClass}`).forEach(slidesList => {
            slidesList.addEventListener("transitionend", () => {
                slidesList.style.removeProperty("transition");
            });
        });

        if (this.disabled) this.disableSlider();
        else this.initSlider();

        this.initMediaQueries();
    }
    getParams(params) {
        setDefaultParam = setDefaultParam.bind(this);

        // параметры по умолчанию (НЕ будет перезаписывать выставленные пользователем далее)
        setDefaultParam("listClass", "slider__list");
        setDefaultParam("slideClass", "slider__slide");
        setDefaultParam("slidesAmount", 1);
        setDefaultParam("spaceBetween", 10);
        setDefaultParam("slideWidth", 0);
        setDefaultParam("media", {});
        setDefaultParam("speed", 500);
        setDefaultParam("pagination", {
            on: false,
            className: "slider__pagination",
            type: "bullets",
            indexText: "",
            delimeterText: "из",
            totalText: "",
            indexTextPosition: "afterbegin",
            totalTextPosition: "beforeend"
        });
        setDefaultParam("controls", {
            on: false,
            className: "slider__controls",
            iconName: "icon-arrow-back",
            rotateButton: "next",
            prevButton: { className: "slider__control slider__control--prev" },
            nextButton: { className: "slider__control slider__control--next" }
        });
        setDefaultParam("grabCursor", false);
        setDefaultParam("draggable", true);

        // пользовательские параметры
        for (let key in params) {
            const param = params[key];
            // записать все, кроме объекта
            if (typeof param !== "object" || param === null) this[key] = params[key];
            // записать объект, не затронув уже выставленные параметры
            else {
                if (!this[key]) {
                    if (Array.isArray(param)) this[key] = [];
                    else this[key] = {};
                }
                for (let k in param) this[key][k] = param[k];
            }
        }

        function setDefaultParam(key, value) {
            if (this[key] === undefined) this[key] = value;
        }
    }
    initMediaQueries() {
        const isMediaValues = this.media
            && typeof this.media === "object"
            && !Array.isArray(this.media);
        if (!this.mediaQueries) this.mediaQueries = {};

        if (isMediaValues) {
            for (let mediaValue in this.media) {
                mediaValue = parseInt(mediaValue);
                const mediaQuery = window.matchMedia(`(min-width: ${mediaValue}px)`);
                this.mediaQueries[mediaValue] = mediaQuery.matches;

                mediaQuery.addEventListener("change", () => {
                    if (!this.mediaQueries) this.mediaQueries = {};
                    this.mediaQueries[mediaValue] = mediaQuery.matches;
                    this.onMediaQueryChange(mediaValue);
                });
                mediaQuery.dispatchEvent(new Event("change"));
            }
        }
    }
    onMediaQueryChange(mediaValue) {
        // если текущий media-запрос является true, то:
        if (this.mediaQueries[mediaValue]) {
            // сначала получаем начальные параметры (указанные при инициализации слайдера)
            this.getParams(this.paramsOnInit);
            // получаем параметры от media-запросов, которые ниже текущего
            for (let otherMdValue in this.mediaQueries) {
                if (parseInt(otherMdValue) < parseInt(mediaValue) && this.mediaQueries[mediaValue]) {
                    const otherMdParams = this.media[otherMdValue];
                    this.getParams(otherMdParams);
                }
            }
            // получаем параметры текущего запроса
            const params = this.media[mediaValue];
            this.getParams(params);
        }
        // если текущий media-запрос - false, то смотрим, есть ли другие запросы с true
        const hasTrueMediaQueries = Object.values(this.mediaQueries).find(query => query);
        // если нет ни одного, получаем параметры изначальной инициализации
        if (!hasTrueMediaQueries) this.getParams(this.paramsOnInit);
        // если есть другие, проходимся циклом по тем, что являются true и получаем параметры изначальной инициализации
        else {
            this.getParams(this.paramsOnInit);
            for (let otherMdValue in this.mediaQueries) {
                if (this.mediaQueries[otherMdValue]) {
                    const otherMdParams = this.media[otherMdValue];
                    this.getParams(otherMdParams);
                }
            }
        }

        // получив параметры, среди которых может быть disabled, либо инициализируем слайдер, либо отключаем его в зависимости от этого параметра
        if (this.disabled) this.disableSlider();
        else this.initSlider();
    }
    // элементы управления [начало] //
    createPagination() {
        this.sliders.forEach(sliderContainer => {
            switch (this.pagination.type) {
                case "bullets":
                default: createBullets.call(this, sliderContainer);
                    break;
                case "numbers": createNumbers.call(this, sliderContainer);
                    break;
            }
        });

        function createBullets(sliderContainer) {
            const sliderData = this.getSliderData(sliderContainer);
            const slides = sliderData.slides;
            let paginationContainer = sliderContainer
                .querySelector(`.${this.pagination.className.split(" ")[0]}`);

            if (!paginationContainer || paginationContainer.tagName !== "UL") {
                paginationContainer = createElement("ul", this.pagination.className);
                sliderContainer.append(paginationContainer);
            }
            paginationContainer.classList.remove("__removed");
            paginationContainer.innerHTML = "";

            for (let i = 0; i < slides.length; i++) {
                const paginationItem = createElement("li", "slider__pagination-item");
                const paginationButton = createElement("button", "slider__pagination-button");
                paginationButton.setAttribute("aria-label", "Пролистать слайд");

                paginationItem.append(paginationButton);
                paginationContainer.append(paginationItem);
                paginationItem.addEventListener("click", () => {
                    const otherItems = paginationContainer.querySelectorAll(".slider__pagination-item");
                    otherItems.forEach(item => item.classList.remove("slider__pagination-item--active"));
                    this.slideTo(sliderContainer, i);
                    paginationItem.classList.add("slider__pagination-item--active");
                });
            }
        }
        function createNumbers(sliderContainer) {
            const sliderData = this.getSliderData(sliderContainer);
            const slides = sliderData.slides;
            let paginationContainer = sliderContainer
                .querySelector(`.${this.pagination.className.split(" ")[0]}`);

            if (!paginationContainer) {
                paginationContainer = createElement("div", this.pagination.className);
                sliderContainer.append(paginationContainer);
            }

            const paginationInner = `
                <span class="slider__pagination-number slider__pagination-number--index"></span>
                <span class="slider__pagination-delimeter">${this.pagination.delimeterText}</span>
                <span class="slider__pagination-number slider__pagination-number--total">
                    ${" " + slides.length + " "}
                </span>
            `;

            paginationContainer.insertAdjacentHTML("afterbegin", paginationInner);
            paginationContainer.querySelector(".slider__pagination-number--total")
                .insertAdjacentText(this.pagination.totalTextPosition, this.pagination.totalText);
        }
    }
    setPagination(sliderContainer, slideIndex) {
        slideIndex = parseInt(slideIndex);

        switch (this.pagination.type) {
            case "bullets":
            default: setBullets.call(this);
                break;
            case "numbers": setNumbers.call(this);
                break;
        }

        function setBullets() {
            const items = sliderContainer.querySelectorAll(".slider__pagination-item");

            items.forEach((pagItem, pagIndex) => {
                if (pagIndex != slideIndex) pagItem.classList.remove("slider__pagination-item--active");
                else pagItem.classList.add("slider__pagination-item--active");
            });
        }
        function setNumbers() {
            const numberSpan = sliderContainer.querySelector(".slider__pagination-number--index");
            if(!numberSpan) return;

            numberSpan.innerHTML = " " + (slideIndex + 1) + " ";
            numberSpan.insertAdjacentText(this.pagination.indexTextPosition, this.pagination.indexText);
        }
    }
    removePagination() {
        this.sliders.forEach(sliderContainer => {
            const paginationContainer = sliderContainer.querySelector(`.${this.pagination.className}`);
            if (paginationContainer) paginationContainer.classList.add("__removed");
        });
    }
    createControls() {
        this.sliders.forEach(sliderContainer => {
            let controlsContainer =
                sliderContainer.querySelector(`.${this.controls.className.split(" ")[0]}`);

            if (!controlsContainer) {
                controlsContainer = createElement("div", this.controls.className);
                sliderContainer.append(controlsContainer);

                const prevButtonClassName = this.controls.prevButton.className + " " + this.controls.iconName;
                const nextButtonClassName = this.controls.nextButton.className + " " + this.controls.iconName;

                const prevButton = createElement("button", prevButtonClassName);
                prevButton.setAttribute("aria-label", "Листать слайдер назад");
                const nextButton = createElement("button", nextButtonClassName);
                nextButton.setAttribute("aria-label", "Листать слайдер вперед");
                controlsContainer.append(prevButton);
                controlsContainer.append(nextButton);

                if (this.controls.rotateButton === "prev") prevButton.classList.add("__rotated");
                if (this.controls.rotateButton === "next") nextButton.classList.add("__rotated");

                prevButton.addEventListener("click", () => this.slidePrev(sliderContainer));
                nextButton.addEventListener("click", () => this.slideNext(sliderContainer));

                this.slidersData.forEach(sd => {
                    sd.controls = { prevButton, nextButton };
                });
            }
            controlsContainer.classList.remove("__removed");
            sliderContainer
                .querySelector(`.${this.controls.prevButton.className.split(" ")[0]}`)
                .removeAttribute("disabled");
            sliderContainer
                .querySelector(`.${this.controls.nextButton.className.split(" ")[0]}`)
                .removeAttribute("disabled");
        });
    }
    removeControls() {
        this.sliders.forEach(sliderContainer => {
            const controls = sliderContainer.querySelector(`.${this.controls.className.split(" ")[0]}`);
            if (controls) controls.classList.add("__removed");
        });
    }
    // элементы управления [конец] //
    initScriptElement() {
        if (this.disabled) this.disableSlider();
        else this.initSlider();
    }
    getNewSliders() {
        const newSliders = Array.from(document.querySelectorAll(this.selector))
            .filter(sld => !this.sliders.includes(sld));
        this.sliders = this.sliders.concat(newSliders);
        this.setPointerdownHandlers(newSliders);
    }
    setPointerdownHandlers(sliders) {
        sliders.forEach(sliderContainer => {
            const slidesList = sliderContainer.querySelector(`.${this.listClass}`);
            if (this.draggable) slidesList.addEventListener("pointerdown", this.onPointerDown);

            if (this.slidersData.find(sl => sl.sliderContainer === sliderContainer))
                return;

            this.slidersData.push({
                sliderContainer,
                slidesList: sliderContainer.querySelector(`.${this.listClass}`),
                slides: Array.from(sliderContainer.querySelectorAll(`.${this.slideClass}`)),
                currentIndex: 0,
                moved: 0
            });
        });
    }
    initSlider() {
        setTimeout(() => {
            this.getNewSliders();

            if (!this.resizeListeners) {
                window.addEventListener("resize", this.setSlidesWidth);
                window.addEventListener("resize", this.sliderOnResize);
                this.resizeListeners = true;
            }
            if (!this.pointerDownListeners) {
                this.slidersData = [];
                this.setPointerdownHandlers(this.sliders);
                this.pointerDownListeners = true;
            }
            this.setSlidesWidth();
            setTimeout(this.setSlidesWidth, 250);
            this.pagination.on ? this.createPagination() : this.removePagination();
            this.controls.on ? this.createControls() : this.removeControls();
            this.sliders.forEach(sliderContainer => {
                sliderContainer.classList.add("slider--active");
                this.setPagination(sliderContainer, 0);
                this.slideTo(sliderContainer, 0);
                if (this.grabCursor) sliderContainer.classList.add("slider--grab");

                const slides = sliderContainer.querySelectorAll(`.${this.slideClass}`);
                slides.forEach((sl, index) => sl.dataset.sliderSlideIndex = index);

                sliderContainer.dispatchEvent(new CustomEvent("sliderinit"));
            });
        }, 0);
    }
    disableSlider() {
        setTimeout(() => {
            window.removeEventListener("resize", this.setSlidesWidth);
            window.removeEventListener("resize", this.sliderOnResize);
            this.resizeListeners = false;

            this.slidersData = [];

            this.sliders.forEach(sliderContainer => {
                sliderContainer.classList.remove("slider--active");
                const slidesList = sliderContainer.querySelector(`.${this.listClass}`);
                slidesList.removeEventListener("pointerdown", this.onPointerDown);
                sliderContainer.querySelector(`.${this.listClass}`).style.removeProperty("transform");
                sliderContainer.classList.remove("slider--grab");
            });
            this.pointerDownListeners = false;

            this.removeControls();
            this.removePagination();
            this.unsetSlidesWidth();
        }, 0);
    }
    update() {
        this.setSlidesWidth();
    }
    unsetSlidesWidth() {
        this.sliders.forEach(sliderContainer => {
            const slidesList = sliderContainer.querySelector(`.${this.listClass}`);
            const slides = sliderContainer.querySelectorAll(`.${this.slideClass}`);

            slidesList.style.removeProperty("width");
            slides.forEach(slide => {
                slide.style.removeProperty("width");
                slide.style.removeProperty("margin-right");
            });
        });
    }
    setSlidesWidth() {
        this.sliders.forEach(sliderContainer => {
            const sliderData = this.getSliderData(sliderContainer);
            if (!sliderData) return;

            const slidesList = sliderData.slidesList;
            const slides = sliderData.slides;
            const spaceBetweenTotalWidth = this.spaceBetween * (slides.length - 1);

            slides.forEach((slide, index) => {
                slide.style.marginLeft = `${this.spaceBetween / 2}px`;
                if (index < slides.length - 1)
                    slide.style.marginRight = `${this.spaceBetween / 2}px`;
            });

            // если слайдам задана ширина
            if (parseInt(this.slideWidth) > 0) {
                slides.forEach(slide => slide.style.width = `${this.slideWidth}px`);
                const totalWidth = slides.length * this.slideWidth + spaceBetweenTotalWidth;
                slidesList.style.width = `${totalWidth}px`;
            }
            // если слайдам не задана ширина - рассчитать её исходя из this.slidesAmount
            else {
                const slideWidth = sliderContainer.offsetWidth / this.slidesAmount;
                const totalWidth = slideWidth * slides.length + spaceBetweenTotalWidth;
                slides.forEach(slide => slide.style.width = `${slideWidth}px`);
                slidesList.style.width = `${totalWidth - slideWidth / 25}px`;
            }
        });
    }
    isOverLimit(sliderContainer) {
        // метод возвращает "left", если выходит за границу слева; "right", если выходит за границу справа
        if (sliderContainer) {
            const sliderContainerPos = getCoords(sliderContainer);
            const slidesListPos = getCoords(sliderContainer.querySelector(`.${this.listClass}`));

            if (sliderContainerPos.left < slidesListPos.left) return "left";
            if (sliderContainerPos.right > slidesListPos.right) return "right";
            return false;
        }
    }
    getSliderData(sliderContainer) {
        const dataIndex = this.slidersData.findIndex(data => data.sliderContainer === sliderContainer);
        const sliderData = this.slidersData[dataIndex];
        return sliderData;
    }
    onPointerDown(event) {
        onMove = onMove.bind(this);
        onUp = onUp.bind(this);
        moveTo = moveTo.bind(this);

        const xStart = event.clientX;
        let xOld = event.clientX;
        const slidesList = event.target.classList.contains(this.listClass)
            ? event.target
            : event.target.closest(`.${this.listClass}`);
        const sliderContainer = slidesList.closest(this.selector);
        const links = sliderContainer.querySelectorAll("a");
        if (this.grabCursor) sliderContainer.classList.add("slider--moving");

        event.preventDefault();
        event.target.ondragstart = () => false;
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);

        function onMove(moveEvent) {
            const x = moveEvent.clientX;
            links.forEach(link => link.style.pointerEvents = "none");
            if (x > xOld) moveTo("+", x, xOld);
            if (x < xOld) moveTo("-", x, xOld);
            xOld = x;
            slidesList.style.removeProperty("transition");
        }
        function onUp() {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            links.forEach(link => link.style.removeProperty("pointer-events"));
            if (this.isOverLimit(sliderContainer) === "left") this.slideTo(sliderContainer, 0);
            else if (this.isOverLimit(sliderContainer) === "right") this.slideTo(sliderContainer, "last");
            else {
                const slideWidth = sliderContainer.querySelector(`.${this.slideClass}`)
                    .offsetWidth;

                if (xOld > xStart + 100 && xOld < xStart + slideWidth) this.slidePrev(sliderContainer);
                else if (xOld < xStart - 100 && xOld > xStart - slideWidth) this.slideNext(sliderContainer);
                else this.slideTo(sliderContainer, "nearest");
            };
            sliderContainer.classList.remove("slider--moving");
        }
        function moveTo(direction, x, xOld) {
            let directionValue;
            if (direction === "+") directionValue = 1;
            if (direction === "-") directionValue = -1;

            const step = Math.abs(xOld - x);
            const sliderData = this.getSliderData(sliderContainer);
            const moved = sliderData.moved;
            let moveNext;
            moveNext = moved + step * directionValue;
            const overLimit = this.isOverLimit(sliderContainer);

            if (overLimit) {
                if (
                    (overLimit === "right" && directionValue < 0)
                    || (overLimit === "left" && directionValue > 0)
                ) moveNext = moved + directionValue;
            }

            slidesList.style.transform = `translate(${moveNext}px, 0)`;
            sliderData.moved = moveNext;
        }
    }
    slideNext(sliderContainer) {
        setTimeout(() => {
            const sliderData = this.getSliderData(sliderContainer);
            const currentIndex = sliderData.currentIndex;
            this.slideTo(sliderContainer, currentIndex + 1);
        }, 0);
    }
    slidePrev(sliderContainer) {
        setTimeout(() => {
            const sliderData = this.getSliderData(sliderContainer);
            const currentIndex = sliderData.currentIndex;
            this.slideTo(sliderContainer, currentIndex - 1);
        }, 0);
    }
    slideTo(sliderContainer, slideIndex, params = {}) {
        // params === { ignoreSpeed: false|true, noEvent: false|true }

        const sliderData = this.getSliderData(sliderContainer);
        const slidesList = sliderData.slidesList;
        const slides = sliderData.slides;

        if (slides) {
            const sliderContainerCoords = getCoords(sliderContainer);
            const slidesListCoords = getCoords(slidesList);
            // найти ближайший к левой границе слайд, если требуется
            if (slideIndex === "nearest") {
                const lefts = slides.map(slide => {
                    return Math.abs(sliderContainerCoords.left - Math.abs(getCoords(slide).left));
                });
                const minLeft = Math.min(...lefts);
                const nearestIndex = lefts.findIndex(l => l === minLeft);

                this.slideTo(sliderContainer, nearestIndex, params.ignoreSpeed);
                return;
            }

            if (slideIndex >= slides.length - 1 || slideIndex === "last")
                slideIndex = slides.length - 1;

            if (slideIndex >= 0) {
                slidesList.style.transition = `all ${this.speed / 1000}s`;
                const slide = slides[slideIndex];
                let slidePosition = (slide.offsetWidth * slideIndex + this.spaceBetween * slideIndex) * -1;
                const controls = this.getSliderData(sliderContainer).controls || {};
                const prevButton = controls.prevButton;
                const nextButton = controls.nextButton;

                // если еще не выходит, но выйдет за границу справа
                const expectedRightCoord =
                    slidePosition + sliderContainerCoords.left + slidesList.offsetWidth;
                const isOverRightLimit = sliderContainerCoords.right > slidesListCoords.right
                    || sliderContainerCoords.right > expectedRightCoord;

                // если выходит за границу справа
                if (isOverRightLimit) {
                    const diff = sliderContainerCoords.right - slidesListCoords.right;
                    slidePosition = slidesListCoords.left - sliderContainerCoords.left + diff;
                    if (nextButton) nextButton.setAttribute("disabled", "");
                } else {
                    if (nextButton) nextButton.removeAttribute("disabled");
                }

                // если выходит за границу слева
                if (slidePosition > 0) slidePosition = 0;
                if (slidePosition >= 0) {
                    if (prevButton) prevButton.setAttribute("disabled", "");
                }
                else {
                    if (prevButton) prevButton.removeAttribute("disabled");
                }

                if (params.ignoreSpeed) {
                    slidesList.style.transition = "all 0s";
                    setTimeout(() => slidesList.style.removeProperty("transition"), 50);
                }
                slidesList.style.transform = `translate(${slidePosition}px, 0)`;

                sliderData.moved = slidePosition;
                sliderData.currentIndex = parseInt(slideIndex);
                this.setPagination(sliderContainer, slideIndex);

                const activeSlide = slides.find((slide, index) => index == slideIndex);
                const prevSlide = slides.find(slide => slide.classList.contains("slider__slide--active"));
                if (activeSlide === prevSlide) return;

                slides.forEach(slide => slide.classList.remove("slider__slide--active"));
                if (activeSlide) activeSlide.classList.add("slider__slide--active");

                if (params.noEvent) return;
                sliderContainer.dispatchEvent(new CustomEvent("slidechange", {
                    detail: { activeSlide, prevSlide }
                }));
            }
        }
    }
    sliderOnResize() {
        this.sliders.forEach(sliderContainer => {
            this.slideTo(sliderContainer, "nearest");
        });
    }
}

const sliders = [
    new Slider(".article-cards", {
        slidesAmount: 1,
        slideWidth: 300,
        speed: 300,
        spaceBetween: 10,
        pagination: {
            on: true
        },
        media: {
            720: { slideWidth: 400, pagination: { on: false } },
            1248: { disabled: true }
        },
    }),
    new Slider(".companies-logos__slider", {
        slideWidth: 125,
        speed: 300,
        spaceBetween: 0,
        media: {
            720: { disabled: true }
        },
    }),
    new Slider(".similar-companies__wrap", {
        slideWidth: 330,
        spaceBetween: 10,
        media: {
            1248: {
                disabled: true
            }
        }
    }),
    new Slider(".cv-templates-list__slider", {
        slidesAmount: 1,
        grabCursor: true,
        controls: {
            on: true
        },
        media: {
            720: { slidesAmount: 2 },
            1010: { disabled: true }
        }
    }),
    new Slider(".tips-slider", {
        slidesAmount: 1,
        grabCursor: true,
        controls: {
            on: true
        },
        media: {
            510: { slidesAmount: 2 },
            800: { slidesAmount: 3 },
            1248: { slideWidth: 300, slidesAmount: null },
        }
    }),
    new Slider(".template-block__slider", {
        slidesAmount: 1,
        controls: {
            on: true,
            iconName: "icon-chevron-down",
            rotateButton: 0
        },
        pagination: {
            on: true,
            type: "numbers"
        },
        media: {
            720: {
                speed: 0,
                draggable: false,
                controls: {
                    on: false
                },
                pagination: {
                    on: false
                }
            }
        }
    })
];

setScriptElementsObserver(sliders);