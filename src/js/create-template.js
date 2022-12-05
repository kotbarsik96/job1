/* 
    Данный скрипт позволяет выбрать шаблон из заданных параметров.
    Если у параметра есть главные элементы управления, от которых зависят другие элементы управления, т.е. будет использован слайдер, обязательно, чтобы create-template.js был подключен после slider.js.

    Параметры могут быть прописаны: 
        1) напрямую здесь при определении экземпляра класса CreateTemplateBlock путем передачи объекта в качестве аргумента params;
        2) в отдельном json файле, путь до которого указывается через передачу строки в качестве аргумента params.
    
    При создании экземпляра класса, ему передаются аргументы:
        1) selector === селектор, по которому будет найден контейнер, в который будет вставлен template-block;
        2) params - рассмотрен ранее;
        3) otherParams: === объект, содержащий другие настройки:
            1) renderPosition === "start"|"end", т.е. позиция, в которую в контейнер будет помещен блок;
            2) pathToImg === "...", путь до папки с нужными изображениями;
            3) imgAlt === "...", атрибут "alt" для превью изображений;
            4) name === "...", имя, которое используется для обозначения блока (чтобы, например, обращаться к нему в запросах в url, например htpps://[...]/?resume_template=line); либо указываемое в атрибутах name&id (input), for (label);


    В случае, если есть параметр, который влияет на отображение других параметров (например, выбор шаблона резюме влияет на набор возможных цветов), корнем json является объект - главный параметр, внутри значения controlItems которого указан массив, содержащий зависимые параметры. Далее показан пример. controlName - используется в атрибутах id (input), for (label); controlTitle - отображается в заголовке; type - "pill"|"image" - отрисовывает либо изображение, либо текст с иконкой, название которой указано в "iconName".
    {
        "controlName": "template",
        "controlTitle": "шаблон",
        "type": "image",
        "controlItems": [
            {
                "value": "line",
                "title": "линия",
                "options": [
                    {
                        "controlName": "color",
                        "controlTitle": "цвет",
                        "controlItems": [
                            {
                                "value": "gray",
                                "title": "серый",
                                "iconName": "icon-dot",
                                "iconStyle": "color: #607d8b;"
                            }
                        ]
                    },
                    {
                        "controlName": "font-style",
                        "controlTitle": "шрифт",
                        "controlItems": [
                            {
                                "value": "italic",
                                "title": "курсивный",
                                "textStyle": "font-style: italic;"
                            }
                        ]
                    }
                ]
            }
        ]
    }
    В случае, когда все параметры независимы друг от друга, корнем json становится другой объект. Пример: 
    {
        "fileExtension": "jpg",
        "params":  [
            {
                "controlName": "template",
                "controlTitle": "шаблон",
                "controlItems": [...]
            },
            {
                "controlName": "color",
                "controlTitle": "цвет",
                "controlItems": [...]
            },
            {
                "controlName": "шрифт",
                "controlTitle": "font-style",
                "controlItems": [...]
            }
        ]
    }
*/

class CreateTemplateBlock {
    constructor(selector, params, otherParams) {
        onSliderInit = onSliderInit.bind(this);
        this.changeSlide = this.changeSlide.bind(this);
        this.onSlideChange = this.onSlideChange.bind(this);
        this.setImageFilename = this.setImageFilename.bind(this);

        this.rootElem = document.querySelector(`${selector}`);
        this.selector = selector;
        this.otherParams = {
            renderPosition: "start",
            name: ""
        }
        for (let key in otherParams) this.otherParams[key] = otherParams[key];
        this.renderPosition = this.otherParams.renderPosition === "start"
            ? "afterbegin"
            : "beforeend";

        this.getParams(params).then(() => {
            this.hasSlider = !this.params.params;
            this.renderTemplateBlockBody();
            if (this.hasSlider) {
                this.sliderContainer = this.rootElem.querySelector(".slider");
                this.sliderContainer.addEventListener("sliderinit", onSliderInit);
            }
        });

        function onSliderInit() {
            setTimeout(() => {
                const url = new URL(window.location.href);
                const value = url.searchParams.get(this.otherParams.name);
                const slideIndex = this.sliderContainer
                    .querySelector(`[data-steps-slider-value="${value}"]`)
                    .dataset.sliderSlideIndex;

                this.sliderInstance.setSlidesWidth();
                this.sliderInstance.slideTo(this.sliderContainer, slideIndex);
                this.sliderContainer.removeEventListener("sliderinit", onSliderInit);
            }, 750);
        }
    }
    getParams(params) {
        return new Promise(resolve => {
            if (!params) {
                this.params = {};
                resolve();
            }
            else if (typeof params === "object") {
                this.params = params;
                resolve();
            }
            else if (typeof params === "string") {
                loadData(params).then(paramsData => {
                    this.params = paramsData;
                    resolve();
                });
            }
        });
    }
    renderTemplateBlockBody() {
        getPreviewSrc = getPreviewSrc.bind(this);
        onSliderInit = onSliderInit.bind(this);
        onInputChange = onInputChange.bind(this);
        isCurrentLabel = isCurrentLabel.bind(this);
        onMouseover = onMouseover.bind(this);
        onMouseleave = onMouseleave.bind(this);

        const templateBlockBody = `
            <div class="template-block__body">
                ${renderPreview.call(this)}
                ${this.hasSlider
                ? renderMainControls.call(this)
                : `<div class="template-block__controls"></div>`}
            </div>
        `;
        this.rootElem.insertAdjacentHTML(this.renderPosition, templateBlockBody);
        if (this.hasSlider) {
            // те элементы управления, которые влияют на слайдер
            this.mainControlsBlock = this.rootElem.querySelector(".template-block__controls-block");
            this.mainControlsBlock.classList.add("template-block__controls--main");

            this.mainControls = Array.from(this.mainControlsBlock
                .querySelectorAll("input[type='radio']") || []);

            this.sliderContainer = this.rootElem.querySelector(".slider");
            this.sliderContainer.addEventListener("sliderinit", onSliderInit);
            setTimeout(onSliderInit, 150);

            this.mainControls.forEach(ctrl => {
                // обработчик на изменение input основного выбора, связанного со slider'ом
                ctrl.addEventListener("change", onInputChange);
                // обработчик на наведение на label input'a основного выбора, связанного со slider'ом
                const label = ctrl.nextElementSibling;
                label.addEventListener("mouseover", onMouseover);
                label.addEventListener("mouseleave", onMouseleave);
            });
            // обработчик на slideChange для slider
            this.sliderContainer.addEventListener("slidechange", this.onSlideChange);
        } else {
            this.renderTemplateBlockControls();

        }

        function renderPreview() {
            if (this.hasSlider) {
                let slides = ``;
                this.params.controlItems.forEach(ctrlItem => {
                    slides += `
                    <li class="template-block__slide slider__slide" data-steps-slider-value="${ctrlItem.value}">
                        <img class="template-block__image"
                            src="${this.otherParams.pathToImg}${ctrlItem.value}/${getPreviewSrc(ctrlItem)}" alt="${this.otherParams.imgAlt}">
                    </li>
                    `;
                });

                return `
                <div class="template-block__slider slider">
                    <ul class="template-block__slider-list slider__list">
                        ${slides}
                    </ul>
                </div>
                <hr class="create-resume__subline template-block__subline">
                `;
            } else {
                return `
                <div class="template-block__preview">
                    <img src="${this.otherParams.pathToImg}${getPreviewSrc(this.params.params)}" alt="${this.otherParams.imgAlt}" class="template-block__preview-image">
                </div>
                <hr class="create-resume__subline template-block__subline">
                `;
            }
        }
        function getPreviewSrc(ctrlItem) {
            let src = "";
            const options = ctrlItem.options || ctrlItem;
            options.forEach((opt, index, arr) => {
                if (this.hasSlider) src += opt.controlItems[0].value;
                else src += opt.controlItems[0].value;
                if (index !== arr.length - 1) src += "_";
            });

            if (this.hasSlider) src += `.${ctrlItem.fileExtension}`;
            else src += `.${this.params.fileExtension}`;

            return src;
        }
        function renderMainControls() {
            let blocks = "";

            if (this.hasSlider)
                blocks += this.getControls(this.params);

            return `
                <div class="template-block__controls">
                    ${blocks}
                </div>
            `;
        }
        function onSliderInit() {
            this.sliderInstance = sliders.find(slInst => {
                return slInst.sliders.includes(this.sliderContainer);
            });
            this.sliderContainer.removeEventListener("sliderinit", onSliderInit);
        }
        function onInputChange(event) {
            const inp = event.target;
            const value = inp.value;
            this.changeSlide(value, false);
            this.mainValue = value;
            this.currentSlideRadio = inp;
            this.renderTemplateBlockControls();
        }
        function isCurrentLabel(label) {
            return label.parentNode.querySelector("input").value === this.currentSlideRadio.value;
        }
        function onMouseover(event) {
            const label = event.currentTarget;
            const input = label.parentNode.querySelector("input");
            input.classList.add("__mouseover");
            if (isCurrentLabel(label)) return;

            const value = label.parentNode.querySelector("input").value;
            this.changeSlide(value, true);
            this.renderTemplateBlockControls(true, value);
            this.setControlsHeadlineName();
        }
        function onMouseleave(event) {
            const label = event.currentTarget;
            const input = label.parentNode.querySelector("input");
            input.classList.remove("__mouseover");
            this.setControlsHeadlineName();
            if (isCurrentLabel(label)) return;

            const slideIndex = this.rootElem.querySelector(`[data-steps-slider-value="${this.mainValue}"]`)
                .dataset.sliderSlideIndex;
            this.sliderInstance.slideTo(this.sliderContainer, slideIndex, { noEvent: true });

            this.controlBlocks.forEach(ctrlBlock => {
                ctrlBlock.classList.remove("__removed");
                if (!ctrlBlock.classList.contains("__stays-shown")) ctrlBlock.remove();
            });
        }
    }
    getControls(controlParams) {
        const type = controlParams.type || "pill";
        let listClass;
        switch (type) {
            case "image": listClass = "template-block__images-list"
                break;
            default:
            case "pill": listClass = "template-block__pills-list"
        }

        let newBlocks = "";
        controlParams.controlItems.forEach(ctrlItem => {
            if (type === "image") {
                newBlocks += `
                <li class="template-block__images-item">
                    <input class="template-block__radio" id="${this.otherParams.name}-${controlParams.controlName}-${ctrlItem.value}" type="radio"
                        name="${this.otherParams.name}-${controlParams.controlName}" value="${ctrlItem.value}" data-template-name="${ctrlItem.title}">
                    <label class="template-block__image-label" for="${this.otherParams.name}-${controlParams.controlName}-${ctrlItem.value}">
                        <img src="${ctrlItem.src}"
                            alt="Превью - ${ctrlItem.value}" class="template-block__images-img">
                    </label>
                </li>
                `;
            }
            if (type === "pill") {
                newBlocks += `
                <li class="template-block__pill">
                    <input class="template-block__radio" id="${this.otherParams.name}-${controlParams.controlName}-${ctrlItem.value}"
                        type="radio" name="${this.otherParams.name}-${controlParams.controlName}" value="${ctrlItem.value}" data-template-name="${ctrlItem.title}">
                    <label class="template-block__pill-label"
                        for="${this.otherParams.name}-${controlParams.controlName}-${ctrlItem.value}">
                        ${ctrlItem.iconName ?
                        `<span class="template-block__pill-icon ${ctrlItem.iconName}" style="${ctrlItem.iconStyle}"></span>`
                        : ""
                    }
                        <span class="template-block__pill-text" style="${ctrlItem.textStyle}">
                            ${ctrlItem.title}
                        </span>
                    </label>
                </li>
                `;
            }
        });

        return `
            <div class="template-block__controls-block">
                <div class="template-block__controls-headline">
                    <h3 class="template-block__controls-title">${controlParams.controlTitle}:</h3>
                    <p class="template-block__controls-name"></p>
                </div>
                <ul class="${listClass}">
                    ${newBlocks}
                </ul>
            </div>
        `;
    }
    renderTemplateBlockControls(onMouseEvent = false, value = null) {
        // метод рендерит только зависимые настройки; главные (которые влияют на слайдер) остаются неизменными
        onLabelMouseover = onLabelMouseover.bind(this);
        onLabelMouseleave = onLabelMouseleave.bind(this);

        let blocks = "";
        if (this.hasSlider) {
            // приготовить новые элементы управления
            const ctrlItem = onMouseEvent && value
                ? this.params.controlItems.find(ctrlItem => ctrlItem.value === value)
                : this.params.controlItems.find(ctrlItem => ctrlItem.value === this.mainValue);
            ctrlItem.options.forEach(opt => {
                blocks += this.getControls(opt);
            });
            // удалить старые элементы управления/скрыть, если onMouseEvent === true
            const prevControls = Array.from(this.mainControlsBlock.parentNode
                .querySelectorAll(".template-block__controls-block:not(.template-block__controls--main)"));
            if (onMouseEvent) {
                prevControls.forEach(prev => prev.classList.add("__removed"));
            }
            else prevControls.forEach(prev => prev.remove());

            // выставить значения checked для новых элементов управления
            this.mainControlsBlock.insertAdjacentHTML("afterend", blocks);
            this.controlBlocks = Array.from(this.mainControlsBlock.parentNode
                .querySelectorAll(".template-block__controls-block:not(.template-block__controls--main)"));
        } else {
            this.params.params.forEach(opt => {
                blocks += this.getControls(opt);
            });

            const controlsBlock = this.rootElem.querySelector(".template-block__controls");
            controlsBlock.insertAdjacentHTML("afterbegin", blocks);

            this.controlBlocks = Array.from(this.rootElem.querySelectorAll(".template-block__controls-block"));
        }

        this.controlBlocks.forEach(ctrlBlock => {
            if (!onMouseEvent) {
                ctrlBlock.classList.add("__stays-shown");

                const inputs = ctrlBlock.querySelectorAll("input");
                inputs.forEach(inp => {
                    inp.addEventListener("change", this.setImageFilename);
                    const label = inp.nextElementSibling;
                    label.addEventListener("mouseover", onLabelMouseover);
                    label.addEventListener("mouseleave", onLabelMouseleave);
                });

                const firstInput = ctrlBlock.querySelector("input");
                firstInput.checked = true;
                firstInput.dispatchEvent(new Event("change"));
            }
        });

        function onLabelMouseover(event) {
            const label = event.currentTarget;
            const input = label.parentNode.querySelector("input");
            input.classList.add("__mouseover");
            this.setImageFilename();
        }
        function onLabelMouseleave(event) {
            const label = event.currentTarget;
            const input = label.parentNode.querySelector("input");
            input.classList.remove("__mouseover");
            this.setImageFilename();
        }
    }
    setImageFilename() {
        let filename = "";

        if (this.hasSlider) {
            this.controlBlocks.forEach((ctrlBlock, index) => {
                const input = ctrlBlock.querySelector(".__mouseover")
                    || ctrlBlock.querySelector("input:checked");
                if (!input) return;

                const value = input.value;
                filename += value;
                if (index !== this.controlBlocks.length - 1) filename += "_";
            });

            const fileExtension = this.params.controlItems
                .find(ctrlItem => ctrlItem.value === this.mainValue)
                .fileExtension;
            const activeSlide = this.sliderContainer.querySelector(".slider__slide--active");
            const image = activeSlide.querySelector("img");

            const src = image.getAttribute("src");
            const srcParts = src.split("/");
            srcParts[srcParts.length - 1] = `${filename}.${fileExtension}`;
            const newSrc = srcParts.join("/");

            image.setAttribute("src", newSrc);
        } else {
            this.controlBlocks.forEach((ctrlBlock, index, arr) => {
                const input = ctrlBlock.querySelector("input.__mouseover")
                    || ctrlBlock.querySelector("input:checked");
                if (!input) return;

                filename += input.value;
                if (index !== arr.length - 1) filename += "_";
            });

            const image = this.rootElem.querySelector(".template-block__preview-image");
            const src = image.getAttribute("src");
            const srcParts = src.split("/");
            srcParts[srcParts.length - 1] = `${filename}.${this.params.fileExtension}`;
            image.setAttribute("src", srcParts.join("/"));
        }

        this.setControlsHeadlineName();
    }
    setDefaultFilenames() {
        this.params.controlItems.forEach(ctrlItem => {
            const slide = this.rootElem.querySelector(`[data-steps-slider-value="${ctrlItem.value}"]`);
            const img = slide.querySelector("img");
            let filename = "";
            ctrlItem.options.forEach((opt, optIndex, arr) => {
                filename += opt.controlItems[0].value;
                if (optIndex !== arr.length - 1) filename += "_";
            });

            const src = img.getAttribute("src");
            const srcParts = src.split("/");
            srcParts[srcParts.length - 1] = `${filename}.${ctrlItem.fileExtension}`;
            img.setAttribute("src", srcParts.join("/"));
        });
    }
    setControlsHeadlineName() {
        const blocks = Array.from(this.rootElem.querySelectorAll(".template-block__controls-block"));
        blocks.forEach(block => {
            const headlineName = block.querySelector(".template-block__controls-name");
            const input = block.querySelector("input.__mouseover") || block.querySelector("input:checked");
            if (!input) return;
            const title = input.dataset.templateName;
            headlineName.innerHTML = "";
            headlineName.insertAdjacentText("afterbegin", title || "");
        });
    }
    returnSavedControlsChecks() {
        if (this.savedControlsChecks) {
            this.savedControlsChecks.forEach(check => {
                const input = Array.from(this.rootElem.querySelectorAll(`input[name="${check.name}"]`))
                    .find(inp => inp.value === check.value);
                if (!input) return;
                input.checked = true;
                input.dispatchEvent(new Event("change"));
            });
        }
    }
    changeSlide(value, noSliderChangeEvent = false) {
        if (!this.sliderContainer || !this.sliderInstance) return;

        const slide = this.sliderContainer.querySelector(`[data-steps-slider-value="${value}"]`);
        const slideIndex = slide.dataset.sliderSlideIndex;
        this.sliderInstance.slideTo(this.sliderContainer, slideIndex, { noEvent: noSliderChangeEvent });
        if (!noSliderChangeEvent) this.setDefaultFilenames();
    }
    onSlideChange(event) {
        const value = event.detail.activeSlide.dataset.stepsSliderValue;
        const mainControl = this.mainControls.find(ctrl => ctrl.value === value);
        mainControl.checked = true;
        mainControl.dispatchEvent(new Event("change"));
        this.setDefaultFilenames();
    }
}

const createTemplateBlocks = [
    new CreateTemplateBlock(".resume-template", `${rootPath}json/resume-template.json`, {
        pathToImg: "/job1/img/create-resume/cv-templates/",
        imgAlt: "Шаблон резюме",
        name: "resume_template"
    })
];  