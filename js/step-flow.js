class StepFlow{constructor(t){this.onButtonClick=this.onButtonClick.bind(this),this.defaultParams=t,this.stepButtons=Array.from(document.querySelectorAll("[data-step-button]")),this.stepContainer=document.querySelector(".step-container"),this.stepPages=Array.from(document.querySelectorAll("[data-step-page]")),this.stepQuery=this.getStepQuery(),this.stepNode=this.stepPages.find((t=>t.dataset.stepPage===this.stepQuery));const e=new Event("click");this.stepButtons.forEach((t=>{t.addEventListener("click",this.onButtonClick),t.dataset.stepButton===this.stepQuery&&t.dispatchEvent(e)})),window.onpopstate=()=>{this.stepQuery=this.getStepQuery();this.stepButtons.find((t=>t.dataset.stepButton===this.stepQuery)).dispatchEvent(e)}}getStepQuery(){return new URL(window.location.href).searchParams.get("step")||"start"}onButtonClick(t){t.preventDefault();let e=t.target;e.hasAttribute("data-step-button")||(e=t.target.closest("[data-step-button]")),this.stepQuery=e.dataset.stepButton;const s=new URL(window.location.href);this.stepQuery&&"start"!==this.stepQuery?s.searchParams.set("step",this.stepQuery):s.searchParams.delete("step"),window.history.pushState(null,document.title,s),this.activeButton=e,this.setActiveButtons(),this.clearInactivePages().then((()=>this.setActivePage()))}setActiveButtons(){e=e.bind(this);const t=this.stepButtons.filter((t=>t.parentNode.classList.contains("steps__item"))).findIndex((t=>t===this.activeButton||t.dataset.stepButton===this.activeButton.dataset.stepButton));for(let s=t;s>=0;s--)e("add",s);for(let s=t+1;s<this.stepButtons.length;s++)e("remove",s);function e(t,e){this.stepButtons[e].parentNode.classList[t]("__active")}}clearInactivePages(){return new Promise((t=>{const e=this.stepPages.filter((t=>t.dataset.stepPage!==this.stepQuery));if(e.length>1)e.forEach((t=>{t.classList.remove("step-page--active")})),t();else{const s=e[0],a=parseInt(s.dataset.stepPageDuration)||this.defaultParams.transitionDuration;s.style.transition=`all ${a/1e3}s`,setTimeout((()=>{s.style.opacity="0",setTimeout((()=>{s.classList.remove("step-page--active"),s.style.removeProperty("transition"),t()}),a)}),50)}}))}setActivePage(){const t=this.stepPages.find((t=>t.dataset.stepPage===this.stepQuery)),e=t.dataset.stepPageDuration||this.defaultParams.transitionDuration;t.style.transition=`all ${e/1e3}s`,t.style.opacity="0",t.classList.add("step-page--active"),setTimeout((()=>{t.style.opacity="1",setTimeout((()=>{t.style.removeProperty("transition"),void 0!==typeof sliders&&sliders.forEach((t=>t.update()))}),e)}),50)}}new StepFlow({transitionDuration:200});