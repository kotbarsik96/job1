// определить, показывать ли вакансию
function defineJobDetailState() {
    const jobId = window.location.hash.replace("#", "");
    console.log(jobId); 
}
function jobDetailShowState() {

}
function jobDetailHideState() {

}
defineJobDetailState();

// элемент в списке вакансий
class JobDetailListItem {
    constructor(listItem) {
        this.setJobId = this.setJobId.bind(this);

        this.elem = observeNodeBeforeInit(listItem);
        this.elem.addEventListener("click", this.setJobId);
    }
    setJobId(){
        
    }
}

// элемент в списке вакансий, представляющий запрос на оповещение
class AlarmDisruptorListItem {
    constructor(listItem) {

    }
}

class JobDetail {
    constructor(elem) {
        this.onContainerScroll = this.onContainerScroll.bind(this);

        this.elem = observeNodeBeforeInit(elem);
        this.closeContainer = this.elem.querySelector(".job-detail__close");
        this.header = this.elem.querySelector(".job-header-m");
        this.container = this.elem.querySelector(".job-detail__container");
        this.noHideHeaderMedia = window.matchMedia("(min-width: 720px)");

        this.container.addEventListener("scroll", this.onContainerScroll);
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

}

const jobDetailsSelectors = [
    { selector: ".jobs-list__item:not(.jobs-list__alarm-disruptor)", classInstance: JobDetailListItem },
    { selector: ".jobs-list__alarm-disruptor", classInstance: AlarmDisruptorListItem },
    { selector: ".job-detail", classInstance: JobDetail },
];

// отлавливать изменения документа
function observeJobDetails() {
    const observer = new MutationObserver((mutlist) => {
        const isRepeating = findCoincidenceInMutationlist(mutlist);
        if (isRepeating) return;

        setTimeout(() => {
            doInit(jobDetailsSelectors);
        }, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
observeJobDetails();