// элемент в списке вакансий
class JobDetailListItem {
    constructor(listItem) {
        this.setJobDetail = this.setJobDetail.bind(this);

        this.elem = observeNodeBeforeInit(listItem);
        this.isActive = this.elem.classList.contains("__active");

        if (this.isActive) this.setJobDetail();
    }
    setJobDetail() {

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
        this.header = this.elem.querySelector(".job-header-m");
        this.container = this.elem.querySelector(".job-detail__container");

        this.container.addEventListener("scroll", this.onContainerScroll);
    }
    onContainerScroll() {
        if (this.container.scrollTop > this.header.offsetHeight)
            this.header.classList.add("__sticky");
        else this.header.classList.remove("__sticky");
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