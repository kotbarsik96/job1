/*
    Параметры слайдера Slider:
    slidesAmount: количество слайдов, помещающихся в экран;
    pagination: параметры отображения пагинации (элемент появится автоматически, его можно не включать в верстку):
        { 
            on: false|true - вкл/выкл пагинацию (по умолчанию - false)
            className: "..." - класслист контейнера пагинации (по умолчанию - "slider__pagination")
        };
    media: запросы media в виде (min-width: media). Синтаксис: 
        media: { 720: { pagination: { on: false } }, 1248: { disabled: true } }. Здесь на экранах шириной от 720px и выше будет отключена пагинация, а на 1248px и выше будет отключен весь слайдер;
    listClass: класс списка слайдов (по умолчанию - "slider__list");
    slideClass: класс слайда (по умолчанию - "slider__slide");
    spaceBetween: расстояние до следующего слайда (px, по умолчанию - 10);
    slideWidth: минимальная ширина слайда (по умолчанию - 0);
    disabled: неактивен ли слайдер (true - неактивен, false - активен);
    speed: длительность transition в мс при пролистывании слайдера через кнопки (по умолчанию - 500);
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
        this.sliders = document.querySelectorAll(this.selector);
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
            className: "slider__pagination"
        });

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
    createPagination() {
        this.sliders.forEach(sliderContainer => {
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
            this.pagination.items = paginationContainer.querySelectorAll(".slider__pagination-item");
        });
    }
    setPagination(sliderContainer, slideIndex) {
        const items = sliderContainer.querySelectorAll(".slider__pagination-item");

        items.forEach((pagItem, pagIndex) => {
            if (pagIndex != slideIndex) pagItem.classList.remove("slider__pagination-item--active");
            else pagItem.classList.add("slider__pagination-item--active");
        });
    }
    removePagination() {
        this.sliders.forEach(sliderContainer => {
            const paginationContainer = sliderContainer.querySelector(`.${this.pagination.className}`);
            if (paginationContainer) paginationContainer.classList.add("__removed");
        });
    }
    initSlider() {
        setTimeout(() => {
            if (!this.resizeListeners) {
                window.addEventListener("resize", this.setSlidesWidth);
                window.addEventListener("resize", this.sliderOnResize);
                this.resizeListeners = true;
            }
            if (!this.pointerDownListeners) {
                this.slidersData = [];
                this.sliders.forEach(sliderContainer => {
                    const slidesList = sliderContainer.querySelector(`.${this.listClass}`);
                    slidesList.addEventListener("pointerdown", this.onPointerDown);
                    this.slidersData.push({
                        sliderContainer,
                        slidesList: sliderContainer.querySelector(`.${this.listClass}`),
                        slides: sliderContainer.querySelectorAll(`.${this.slideClass}`),
                        currentIndex: 0,
                        moved: 0
                    });
                });
                this.pointerDownListeners = true;
            }
            this.setSlidesWidth();
            this.pagination.on ? this.createPagination() : this.removePagination();
            this.sliders.forEach(sliderContainer => {
                sliderContainer.classList.add("slider--active");
                this.setPagination(sliderContainer, 0);
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
            });
            this.pointerDownListeners = false;

            this.removePagination();
            this.unsetSlidesWidth();
        }, 0);
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
            const slidesList = sliderData.slidesList;
            const slides = sliderData.slides;
            const spaceBetweenTotalWidth = this.spaceBetween * (slides.length - 1);

            slides.forEach((slide, index) => {
                if(index < slides.length - 1) slide.style.marginRight = `${this.spaceBetween}px`;
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
                slidesList.style.width = `${totalWidth}px`;
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

        let xOld = event.clientX;
        const slidesList = event.target.classList.contains(this.listClass)
            ? event.target
            : event.target.closest(`.${this.listClass}`);
        const sliderContainer = slidesList.closest(this.selector);
        const links = sliderContainer.querySelectorAll("a");

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
            else this.slideTo(sliderContainer, "nearest");
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
    slideTo(sliderContainer, slideIndex) {
        const sliderData = this.getSliderData(sliderContainer);
        const slidesList = sliderData.slidesList;
        const slides = sliderData.slides ? Array.from(sliderData.slides) : sliderData.slides;

        if (slides) {
            const sliderContainerCoords = getCoords(sliderContainer);
            // найти ближайший к левой границе слайд, если требуется
            if (slideIndex === "nearest") {
                const lefts = slides.map(slide => Math.abs(getCoords(slide).left));
                const minLeft = Math.min(...lefts);
                const nearestIndex = slides.findIndex(slide => {
                    return getCoords(slide).left == minLeft
                        || getCoords(slide).left == minLeft * (-1);
                });

                this.slideTo(sliderContainer, nearestIndex);
                return;
            }

            if (slideIndex >= slides.length - 1 || slideIndex === "last")
                slideIndex = slides.length - 1;

            if (slideIndex >= 0) {
                slidesList.style.transition = `all ${this.speed / 1000}s`;
                const slide = slides[slideIndex];
                let slidePosition = (slide.offsetWidth * slideIndex + this.spaceBetween * slideIndex) * -1;

                // если выходит за границу справа
                if (slidesList.offsetWidth - Math.abs(slidePosition) < sliderContainerCoords.right) {
                    slidePosition = (slidesList.offsetWidth - sliderContainerCoords.right + this.spaceBetween) * -1;
                }
                // если выходит за границу слева
                if (slidePosition > 0) slidePosition = 0;

                slidesList.style.transform = `translate(${slidePosition}px, 0)`;

                sliderData.moved = slidePosition;
                sliderData.currentIndex = slideIndex;
                this.setPagination(sliderContainer, slideIndex);
            }
        }
    }
    sliderOnResize() {
        this.sliders.forEach(sliderContainer => {
            this.slideTo(sliderContainer, "nearest");
        });
    }
}

const newsSlider = new Slider(".article-cards", {
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
});

const logosSlider = new Slider(".companies-logos__slider", {
    slideWidth: 97,
    speed: 300,
    spaceBetween: 24,
    media: {
        720: { disabled: true }
    },
});