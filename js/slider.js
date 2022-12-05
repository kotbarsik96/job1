class Slider{constructor(e,t={}){this.setSlidesWidth=this.setSlidesWidth.bind(this),this.onPointerDown=this.onPointerDown.bind(this),this.initSlider=this.initSlider.bind(this),this.disableSlider=this.disableSlider.bind(this),this.sliderOnResize=this.sliderOnResize.bind(this),t.disabled||(t.disabled=!1),this.selector=e||".slider",this.sliders=Array.from(document.querySelectorAll(this.selector)),this.getParams(t),this.paramsOnInit=t,document.querySelectorAll(`.${this.listClass}`).forEach((e=>{e.addEventListener("transitionend",(()=>{e.style.removeProperty("transition")}))})),this.disabled?this.disableSlider():this.initSlider(),this.initMediaQueries()}getParams(e){(t=t.bind(this))("listClass","slider__list"),t("slideClass","slider__slide"),t("slidesAmount",1),t("spaceBetween",10),t("slideWidth",0),t("media",{}),t("speed",500),t("pagination",{on:!1,className:"slider__pagination"}),t("controls",{on:!1,className:"slider__controls",iconName:"icon-arrow-back",rotateButton:"next",prevButton:{className:"slider__control slider__control--prev"},nextButton:{className:"slider__control slider__control--next"}}),t("grabCursor",!1),t("draggable",!0);for(let t in e){const s=e[t];if("object"!=typeof s||null===s)this[t]=e[t];else{this[t]||(Array.isArray(s)?this[t]=[]:this[t]={});for(let e in s)this[t][e]=s[e]}}function t(e,t){void 0===this[e]&&(this[e]=t)}}initMediaQueries(){const e=this.media&&"object"==typeof this.media&&!Array.isArray(this.media);if(this.mediaQueries||(this.mediaQueries={}),e)for(let e in this.media){e=parseInt(e);const t=window.matchMedia(`(min-width: ${e}px)`);this.mediaQueries[e]=t.matches,t.addEventListener("change",(()=>{this.mediaQueries||(this.mediaQueries={}),this.mediaQueries[e]=t.matches,this.onMediaQueryChange(e)})),t.dispatchEvent(new Event("change"))}}onMediaQueryChange(e){if(this.mediaQueries[e]){this.getParams(this.paramsOnInit);for(let t in this.mediaQueries)if(parseInt(t)<parseInt(e)&&this.mediaQueries[e]){const e=this.media[t];this.getParams(e)}const t=this.media[e];this.getParams(t)}if(Object.values(this.mediaQueries).find((e=>e))){this.getParams(this.paramsOnInit);for(let e in this.mediaQueries)if(this.mediaQueries[e]){const t=this.media[e];this.getParams(t)}}else this.getParams(this.paramsOnInit);this.disabled?this.disableSlider():this.initSlider()}createPagination(){this.sliders.forEach((e=>{const t=this.getSliderData(e).slides;let s=e.querySelector(`.${this.pagination.className.split(" ")[0]}`);s&&"UL"===s.tagName||(s=createElement("ul",this.pagination.className),e.append(s)),s.classList.remove("__removed"),s.innerHTML="";for(let i=0;i<t.length;i++){const t=createElement("li","slider__pagination-item"),r=createElement("button","slider__pagination-button");r.setAttribute("aria-label","Пролистать слайд"),t.append(r),s.append(t),t.addEventListener("click",(()=>{s.querySelectorAll(".slider__pagination-item").forEach((e=>e.classList.remove("slider__pagination-item--active"))),this.slideTo(e,i),t.classList.add("slider__pagination-item--active")}))}}))}setPagination(e,t){e.querySelectorAll(".slider__pagination-item").forEach(((e,s)=>{s!=t?e.classList.remove("slider__pagination-item--active"):e.classList.add("slider__pagination-item--active")}))}removePagination(){this.sliders.forEach((e=>{const t=e.querySelector(`.${this.pagination.className}`);t&&t.classList.add("__removed")}))}createControls(){this.sliders.forEach((e=>{let t=e.querySelector(`.${this.controls.className.split(" ")[0]}`);if(!t){t=createElement("div",this.controls.className),e.append(t);const s=this.controls.prevButton.className+" "+this.controls.iconName,i=this.controls.nextButton.className+" "+this.controls.iconName,r=createElement("button",s);r.setAttribute("aria-label","Листать слайдер назад");const n=createElement("button",i);n.setAttribute("aria-label","Листать слайдер вперед"),t.append(r),t.append(n),"prev"===this.controls.rotateButton&&r.classList.add("__rotated"),"next"===this.controls.rotateButton&&n.classList.add("__rotated"),r.addEventListener("click",(()=>this.slidePrev(e))),n.addEventListener("click",(()=>this.slideNext(e))),this.slidersData.forEach((e=>{e.controls={prevButton:r,nextButton:n}}))}t.classList.remove("__removed"),e.querySelector(`.${this.controls.prevButton.className.split(" ")[0]}`).removeAttribute("disabled"),e.querySelector(`.${this.controls.nextButton.className.split(" ")[0]}`).removeAttribute("disabled")}))}removeControls(){this.sliders.forEach((e=>{const t=e.querySelector(`.${this.controls.className.split(" ")[0]}`);t&&t.classList.add("__removed")}))}initScriptElement(){this.disabled?this.disableSlider():this.initSlider()}getNewSliders(){const e=Array.from(document.querySelectorAll(this.selector)).filter((e=>!this.sliders.includes(e)));this.sliders=this.sliders.concat(e),this.setPointerdownHandlers(e)}setPointerdownHandlers(e){e.forEach((e=>{const t=e.querySelector(`.${this.listClass}`);this.draggable&&t.addEventListener("pointerdown",this.onPointerDown),this.slidersData.find((t=>t.sliderContainer===e))||this.slidersData.push({sliderContainer:e,slidesList:e.querySelector(`.${this.listClass}`),slides:Array.from(e.querySelectorAll(`.${this.slideClass}`)),currentIndex:0,moved:0})}))}initSlider(){setTimeout((()=>{this.getNewSliders(),this.resizeListeners||(window.addEventListener("resize",this.setSlidesWidth),window.addEventListener("resize",this.sliderOnResize),this.resizeListeners=!0),this.pointerDownListeners||(this.slidersData=[],this.setPointerdownHandlers(this.sliders),this.pointerDownListeners=!0),this.setSlidesWidth(),setTimeout(this.setSlidesWidth,250),this.pagination.on?this.createPagination():this.removePagination(),this.controls.on?this.createControls():this.removeControls(),this.sliders.forEach((e=>{e.classList.add("slider--active"),this.setPagination(e,0),this.slideTo(e,0),this.grabCursor&&e.classList.add("slider--grab");e.querySelectorAll(`.${this.slideClass}`).forEach(((e,t)=>e.dataset.sliderSlideIndex=t)),e.dispatchEvent(new CustomEvent("sliderinit"))}))}),0)}disableSlider(){setTimeout((()=>{window.removeEventListener("resize",this.setSlidesWidth),window.removeEventListener("resize",this.sliderOnResize),this.resizeListeners=!1,this.slidersData=[],this.sliders.forEach((e=>{e.classList.remove("slider--active");e.querySelector(`.${this.listClass}`).removeEventListener("pointerdown",this.onPointerDown),e.querySelector(`.${this.listClass}`).style.removeProperty("transform"),e.classList.remove("slider--grab")})),this.pointerDownListeners=!1,this.removeControls(),this.removePagination(),this.unsetSlidesWidth()}),0)}update(){this.setSlidesWidth()}unsetSlidesWidth(){this.sliders.forEach((e=>{const t=e.querySelector(`.${this.listClass}`),s=e.querySelectorAll(`.${this.slideClass}`);t.style.removeProperty("width"),s.forEach((e=>{e.style.removeProperty("width"),e.style.removeProperty("margin-right")}))}))}setSlidesWidth(){this.sliders.forEach((e=>{const t=this.getSliderData(e);if(!t)return;const s=t.slidesList,i=t.slides,r=this.spaceBetween*(i.length-1);if(i.forEach(((e,t)=>{e.style.marginLeft=this.spaceBetween/2+"px",t<i.length-1&&(e.style.marginRight=this.spaceBetween/2+"px")})),parseInt(this.slideWidth)>0){i.forEach((e=>e.style.width=`${this.slideWidth}px`));const e=i.length*this.slideWidth+r;s.style.width=`${e}px`}else{const t=e.offsetWidth/this.slidesAmount,n=t*i.length+r;i.forEach((e=>e.style.width=`${t}px`)),s.style.width=n-t/25+"px"}}))}isOverLimit(e){if(e){const t=getCoords(e),s=getCoords(e.querySelector(`.${this.listClass}`));return t.left<s.left?"left":t.right>s.right&&"right"}}getSliderData(e){const t=this.slidersData.findIndex((t=>t.sliderContainer===e));return this.slidersData[t]}onPointerDown(e){l=l.bind(this),a=a.bind(this),o=o.bind(this);const t=e.clientX;let s=e.clientX;const i=e.target.classList.contains(this.listClass)?e.target:e.target.closest(`.${this.listClass}`),r=i.closest(this.selector),n=r.querySelectorAll("a");function l(e){const t=e.clientX;n.forEach((e=>e.style.pointerEvents="none")),t>s&&o("+",t,s),t<s&&o("-",t,s),s=t,i.style.removeProperty("transition")}function a(){if(document.removeEventListener("pointermove",l),document.removeEventListener("pointerup",a),n.forEach((e=>e.style.removeProperty("pointer-events"))),"left"===this.isOverLimit(r))this.slideTo(r,0);else if("right"===this.isOverLimit(r))this.slideTo(r,"last");else{const e=r.querySelector(`.${this.slideClass}`).offsetWidth;s>t+100&&s<t+e?this.slidePrev(r):s<t-100&&s>t-e?this.slideNext(r):this.slideTo(r,"nearest")}r.classList.remove("slider--moving")}function o(e,t,s){let n;"+"===e&&(n=1),"-"===e&&(n=-1);const l=Math.abs(s-t),a=this.getSliderData(r),o=a.moved;let d;d=o+l*n;const h=this.isOverLimit(r);h&&("right"===h&&n<0||"left"===h&&n>0)&&(d=o+n),i.style.transform=`translate(${d}px, 0)`,a.moved=d}this.grabCursor&&r.classList.add("slider--moving"),e.preventDefault(),e.target.ondragstart=()=>!1,document.addEventListener("pointermove",l),document.addEventListener("pointerup",a)}slideNext(e){setTimeout((()=>{const t=this.getSliderData(e).currentIndex;this.slideTo(e,t+1)}),0)}slidePrev(e){setTimeout((()=>{const t=this.getSliderData(e).currentIndex;this.slideTo(e,t-1)}),0)}slideTo(e,t,s={}){const i=this.getSliderData(e),r=i.slidesList,n=i.slides;if(n){const l=getCoords(e),a=getCoords(r);if("nearest"===t){const t=n.map((e=>Math.abs(l.left-Math.abs(getCoords(e).left)))),i=Math.min(...t),r=t.findIndex((e=>e===i));return void this.slideTo(e,r,s.ignoreSpeed)}if((t>=n.length-1||"last"===t)&&(t=n.length-1),t>=0){r.style.transition=`all ${this.speed/1e3}s`;let o=-1*(n[t].offsetWidth*t+this.spaceBetween*t);const d=this.getSliderData(e).controls||{},h=d.prevButton,c=d.nextButton,m=o+l.left+r.offsetWidth;if(l.right>a.right||l.right>m){const e=l.right-a.right;o=a.left-l.left+e,c&&c.setAttribute("disabled","")}else c&&c.removeAttribute("disabled");o>0&&(o=0),o>=0?h&&h.setAttribute("disabled",""):h&&h.removeAttribute("disabled"),s.ignoreSpeed&&(r.style.transition="all 0s",setTimeout((()=>r.style.removeProperty("transition")),50)),r.style.transform=`translate(${o}px, 0)`,i.moved=o,i.currentIndex=parseInt(t),this.setPagination(e,t);const u=n.find(((e,s)=>s==t)),p=n.find((e=>e.classList.contains("slider__slide--active")));if(u===p)return;if(n.forEach((e=>e.classList.remove("slider__slide--active"))),u&&u.classList.add("slider__slide--active"),s.noEvent)return;e.dispatchEvent(new CustomEvent("slidechange",{detail:{activeSlide:u,prevSlide:p}}))}}}sliderOnResize(){this.sliders.forEach((e=>{this.slideTo(e,"nearest")}))}}const sliders=[new Slider(".article-cards",{slidesAmount:1,slideWidth:300,speed:300,spaceBetween:10,pagination:{on:!0},media:{720:{slideWidth:400,pagination:{on:!1}},1248:{disabled:!0}}}),new Slider(".companies-logos__slider",{slideWidth:125,speed:300,spaceBetween:0,media:{720:{disabled:!0}}}),new Slider(".similar-companies__wrap",{slideWidth:330,spaceBetween:10,media:{1248:{disabled:!0}}}),new Slider(".cv-templates-list__slider",{slidesAmount:1,grabCursor:!0,controls:{on:!0},media:{720:{slidesAmount:2},1010:{disabled:!0}}}),new Slider(".tips-slider",{slidesAmount:1,grabCursor:!0,controls:{on:!0},media:{510:{slidesAmount:2},800:{slidesAmount:3},1248:{slideWidth:300,slidesAmount:null}}}),new Slider(".template-block__slider",{slidesAmount:1,controls:{on:!0,iconName:"icon-chevron-down",rotateButton:0},media:{720:{speed:0,draggable:!1,controls:{on:!1}}}})];setScriptElementsObserver(sliders);