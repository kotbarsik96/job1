class Slider{constructor(e,i={}){this.setSlidesWidth=this.setSlidesWidth.bind(this),this.onPointerDown=this.onPointerDown.bind(this),this.initSlider=this.initSlider.bind(this),this.disableSlider=this.disableSlider.bind(this),this.sliderOnResize=this.sliderOnResize.bind(this),i.disabled||(i.disabled=!1),this.selector=e||".slider",this.sliders=Array.from(document.querySelectorAll(this.selector)),this.getParams(i),this.paramsOnInit=i,document.querySelectorAll(`.${this.listClass}`).forEach((e=>{e.addEventListener("transitionend",(()=>{e.style.removeProperty("transition")}))})),this.disabled?this.disableSlider():this.initSlider(),this.initMediaQueries()}getParams(e){(i=i.bind(this))("listClass","slider__list"),i("slideClass","slider__slide"),i("slidesAmount",1),i("spaceBetween",10),i("slideWidth",0),i("media",{}),i("speed",500),i("pagination",{on:!1,className:"slider__pagination"});for(let i in e){const t=e[i];if("object"!=typeof t||null===t)this[i]=e[i];else{this[i]||(Array.isArray(t)?this[i]=[]:this[i]={});for(let e in t)this[i][e]=t[e]}}function i(e,i){void 0===this[e]&&(this[e]=i)}}initMediaQueries(){const e=this.media&&"object"==typeof this.media&&!Array.isArray(this.media);if(this.mediaQueries||(this.mediaQueries={}),e)for(let e in this.media){e=parseInt(e);const i=window.matchMedia(`(min-width: ${e}px)`);this.mediaQueries[e]=i.matches,i.addEventListener("change",(()=>{this.mediaQueries||(this.mediaQueries={}),this.mediaQueries[e]=i.matches,this.onMediaQueryChange(e)})),i.dispatchEvent(new Event("change"))}}onMediaQueryChange(e){if(this.mediaQueries[e]){this.getParams(this.paramsOnInit);for(let i in this.mediaQueries)if(parseInt(i)<parseInt(e)&&this.mediaQueries[e]){const e=this.media[i];this.getParams(e)}const i=this.media[e];this.getParams(i)}if(Object.values(this.mediaQueries).find((e=>e))){this.getParams(this.paramsOnInit);for(let e in this.mediaQueries)if(this.mediaQueries[e]){const i=this.media[e];this.getParams(i)}}else this.getParams(this.paramsOnInit);this.disabled?this.disableSlider():this.initSlider()}createPagination(){this.sliders.forEach((e=>{const i=this.getSliderData(e).slides;let t=e.querySelector(`.${this.pagination.className.split(" ")[0]}`);t&&"UL"===t.tagName||(t=createElement("ul",this.pagination.className),e.append(t)),t.classList.remove("__removed"),t.innerHTML="";for(let s=0;s<i.length;s++){const i=createElement("li","slider__pagination-item"),r=createElement("button","slider__pagination-button");r.setAttribute("aria-label","Пролистать слайд"),i.append(r),t.append(i),i.addEventListener("click",(()=>{t.querySelectorAll(".slider__pagination-item").forEach((e=>e.classList.remove("slider__pagination-item--active"))),this.slideTo(e,s),i.classList.add("slider__pagination-item--active")}))}this.pagination.items=t.querySelectorAll(".slider__pagination-item")}))}setPagination(e,i){e.querySelectorAll(".slider__pagination-item").forEach(((e,t)=>{t!=i?e.classList.remove("slider__pagination-item--active"):e.classList.add("slider__pagination-item--active")}))}removePagination(){this.sliders.forEach((e=>{const i=e.querySelector(`.${this.pagination.className}`);i&&i.classList.add("__removed")}))}initNewSliders(){this.disabled?this.disableSlider():this.initSlider()}getNewSliders(){const e=Array.from(document.querySelectorAll(this.selector)).filter((e=>!this.sliders.includes(e)));this.sliders=this.sliders.concat(e),this.setPointerdownHandlers(e)}setPointerdownHandlers(e){e.forEach((e=>{e.querySelector(`.${this.listClass}`).addEventListener("pointerdown",this.onPointerDown),this.slidersData.find((i=>i.sliderContainer===e))||this.slidersData.push({sliderContainer:e,slidesList:e.querySelector(`.${this.listClass}`),slides:e.querySelectorAll(`.${this.slideClass}`),currentIndex:0,moved:0})}))}initSlider(){setTimeout((()=>{this.getNewSliders(),this.resizeListeners||(window.addEventListener("resize",this.setSlidesWidth),window.addEventListener("resize",this.sliderOnResize),this.resizeListeners=!0),this.pointerDownListeners||(this.slidersData=[],this.setPointerdownHandlers(this.sliders),this.pointerDownListeners=!0),this.setSlidesWidth(),this.pagination.on?this.createPagination():this.removePagination(),this.sliders.forEach((e=>{e.classList.add("slider--active"),this.setPagination(e,0)}))}),0)}disableSlider(){setTimeout((()=>{window.removeEventListener("resize",this.setSlidesWidth),window.removeEventListener("resize",this.sliderOnResize),this.resizeListeners=!1,this.slidersData=[],this.sliders.forEach((e=>{e.classList.remove("slider--active");e.querySelector(`.${this.listClass}`).removeEventListener("pointerdown",this.onPointerDown),e.querySelector(`.${this.listClass}`).style.removeProperty("transform")})),this.pointerDownListeners=!1,this.removePagination(),this.unsetSlidesWidth()}),0)}unsetSlidesWidth(){this.sliders.forEach((e=>{const i=e.querySelector(`.${this.listClass}`),t=e.querySelectorAll(`.${this.slideClass}`);i.style.removeProperty("width"),t.forEach((e=>{e.style.removeProperty("width"),e.style.removeProperty("margin-right")}))}))}setSlidesWidth(){this.sliders.forEach((e=>{const i=this.getSliderData(e),t=i.slidesList,s=i.slides,r=this.spaceBetween*(s.length-1);if(s.forEach(((e,i)=>{e.style.marginLeft=this.spaceBetween/2+"px",i<s.length-1&&(e.style.marginRight=this.spaceBetween/2+"px")})),parseInt(this.slideWidth)>0){s.forEach((e=>e.style.width=`${this.slideWidth}px`));const e=s.length*this.slideWidth+r;t.style.width=`${e}px`}else{const i=e.offsetWidth/this.slidesAmount,n=i*s.length+r;s.forEach((e=>e.style.width=`${i}px`)),t.style.width=`${n}px`}}))}isOverLimit(e){if(e){const i=getCoords(e),t=getCoords(e.querySelector(`.${this.listClass}`));return i.left<t.left?"left":i.right>t.right&&"right"}}getSliderData(e){const i=this.slidersData.findIndex((i=>i.sliderContainer===e));return this.slidersData[i]}onPointerDown(e){n=n.bind(this),a=a.bind(this),d=d.bind(this);let i=e.clientX;const t=e.target.classList.contains(this.listClass)?e.target:e.target.closest(`.${this.listClass}`),s=t.closest(this.selector),r=s.querySelectorAll("a");function n(e){const s=e.clientX;r.forEach((e=>e.style.pointerEvents="none")),s>i&&d("+",s,i),s<i&&d("-",s,i),i=s,t.style.removeProperty("transition")}function a(){document.removeEventListener("pointermove",n),document.removeEventListener("pointerup",a),r.forEach((e=>e.style.removeProperty("pointer-events"))),"left"===this.isOverLimit(s)?this.slideTo(s,0):"right"===this.isOverLimit(s)?this.slideTo(s,"last"):this.slideTo(s,"nearest")}function d(e,i,r){let n;"+"===e&&(n=1),"-"===e&&(n=-1);const a=Math.abs(r-i),d=this.getSliderData(s),l=d.moved;let o;o=l+a*n;const h=this.isOverLimit(s);h&&("right"===h&&n<0||"left"===h&&n>0)&&(o=l+n),t.style.transform=`translate(${o}px, 0)`,d.moved=o}e.preventDefault(),e.target.ondragstart=()=>!1,document.addEventListener("pointermove",n),document.addEventListener("pointerup",a)}slideNext(e){setTimeout((()=>{const i=this.getSliderData(e).currentIndex;this.slideTo(e,i+1)}),0)}slidePrev(e){setTimeout((()=>{const i=this.getSliderData(e).currentIndex;this.slideTo(e,i-1)}),0)}slideTo(e,i){const t=this.getSliderData(e),s=t.slidesList,r=t.slides?Array.from(t.slides):t.slides;if(r){const n=getCoords(e);if("nearest"===i){const i=r.map((e=>Math.abs(getCoords(e).left))),t=Math.min(...i),s=r.findIndex((e=>getCoords(e).left==t||getCoords(e).left==-1*t));return void this.slideTo(e,s)}if((i>=r.length-1||"last"===i)&&(i=r.length-1),i>=0){s.style.transition=`all ${this.speed/1e3}s`;let a=-1*(r[i].offsetWidth*i+this.spaceBetween*i);s.offsetWidth-Math.abs(a)<n.right&&(a=-1*(s.offsetWidth-n.right+this.spaceBetween*(r.length-1))),a>0&&(a=0),s.style.transform=`translate(${a}px, 0)`,t.moved=a,t.currentIndex=i,this.setPagination(e,i)}}}sliderOnResize(){this.sliders.forEach((e=>{this.slideTo(e,"nearest")}))}}const sliders=[new Slider(".article-cards",{slidesAmount:1,slideWidth:300,speed:300,spaceBetween:10,pagination:{on:!0},media:{720:{slideWidth:400,pagination:{on:!1}},1248:{disabled:!0}}}),new Slider(".companies-logos__slider",{slideWidth:97,speed:300,spaceBetween:24,media:{720:{disabled:!0}}}),new Slider(".similar-companies__wrap",{slideWidth:297,slidesAmount:3,spaceBetween:10,media:{1248:{disabled:!0}}})];function observeSliderElementsOnBodyChildren(){new MutationObserver((e=>{e.forEach((e=>{Array.from(e.addedNodes).find((e=>!!e&&(!!e.className&&e.querySelector(".slider"))))&&sliders.forEach((e=>e.initNewSliders()))}))})).observe(document.body,{childList:!0,subtree:!0})}observeSliderElementsOnBodyChildren();