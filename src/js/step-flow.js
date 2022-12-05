class StepFlow {
    constructor(defaultParams) {
        this.onButtonClick = this.onButtonClick.bind(this);

        this.defaultParams = defaultParams;
        this.stepButtons = Array.from(document.querySelectorAll("[data-step-button]"));
        this.stepContainer = document.querySelector(".step-container");
        this.stepPages = Array.from(document.querySelectorAll("[data-step-page]"));
        this.stepQuery = this.getStepQuery();
        this.stepNode = this.stepPages.find(page => page.dataset.stepPage === this.stepQuery);

        const clickEvent = new Event("click");
        this.stepButtons.forEach(btn => {
            btn.addEventListener("click", this.onButtonClick);
            if (btn.dataset.stepButton === this.stepQuery) btn.dispatchEvent(clickEvent);
        });
        window.onpopstate = () => {
            this.stepQuery = this.getStepQuery();
            const btn = this.stepButtons.find(btn => btn.dataset.stepButton === this.stepQuery);
            btn.dispatchEvent(clickEvent);
        }
    }
    getStepQuery() {
        const url = new URL(window.location.href);
        return url.searchParams.get("step") || "start";
    }
    onButtonClick(event) {
        let button = event.target;
        if (!button.hasAttribute("data-step-button"))
            button = event.target.closest("[data-step-button]");
        this.stepQuery = button.dataset.stepButton;

        const url = new URL(window.location.href);
        if (!this.stepQuery || this.stepQuery === "start") url.searchParams.delete("step");
        else url.searchParams.set("step", this.stepQuery);
        window.history.pushState(null, document.title, url);
        this.activeButton = button;

        this.setActiveButtons();
        this.clearInactivePages().then(() => this.setActivePage());
    }
    setActiveButtons() {
        modClassList = modClassList.bind(this);

        const activeIndex = this.stepButtons
            .filter(btn => btn.parentNode.classList.contains("steps__item"))
            .findIndex(btn => {
                return btn === this.activeButton
                    || btn.dataset.stepButton === this.activeButton.dataset.stepButton;
            });

        for (let i = activeIndex; i >= 0; i--)
            modClassList("add", i);
        for (let i = activeIndex + 1; i < this.stepButtons.length; i++)
            modClassList("remove", i);

        function modClassList(action, i) {
            const btn = this.stepButtons[i];
            btn.parentNode.classList[action]("__active");
        }
    }
    clearInactivePages() {
        return new Promise(resolve => {
            const inactivePages = this.stepPages.filter(page => page.dataset.stepPage !== this.stepQuery);
            if (inactivePages.length > 1) {
                inactivePages.forEach(page => {
                    page.classList.remove("step-page--active")
                });
                resolve();
            } else {
                const inactivePage = inactivePages[0];
                const transDur = parseInt(inactivePage.dataset.stepPageDuration)
                    || this.defaultParams.transitionDuration;
                inactivePage.style.transition = `all ${transDur / 1000}s`;
                setTimeout(() => {
                    inactivePage.style.opacity = "0";
                    setTimeout(() => {
                        inactivePage.classList.remove("step-page--active");
                        inactivePage.style.removeProperty("transition");
                        resolve();
                    }, transDur);
                }, 50);
            }
        });
    }
    setActivePage() {
        const activePage = this.stepPages.find(page => page.dataset.stepPage === this.stepQuery);
        const transDur = activePage.dataset.stepPageDuration || this.defaultParams.transitionDuration;
        activePage.style.transition = `all ${transDur / 1000}s`;
        activePage.style.opacity = "0";
        activePage.classList.add("step-page--active");
        setTimeout(() => {
            activePage.style.opacity = "1";
            setTimeout(() => {
                activePage.style.removeProperty("transition");

                if (typeof sliders === undefined) return;
                sliders.forEach(sliderInstance => sliderInstance.update());
            }, transDur);
        }, 50);
    }
}

new StepFlow({
    transitionDuration: 200
});