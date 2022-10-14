function upperFirstLetter(e){return(e=e.split(""))[0]=e[0].toUpperCase(),e.join("")}String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")});const _localStorage={setItem:function(e,t){const s=JSON.stringify(t);localStorage.setItem(e,s)},getItem:function(e){const t=window.localStorage.getItem(e);return JSON.parse(t)}};function findClosestElem(e,t){const s=document.querySelectorAll(t);if(1===s.length)return s[0];const i=e.parentNode;if(i){const e=i.querySelector(t);return e||findClosestElem(i,t)}return null}const bodyDisabledObserver=new MutationObserver((e=>{e.forEach((e=>{const t=document.body;if(e.target===t)if(t.classList.contains("__disabled")){const e=getScrollWidth();t.style.paddingRight=`${e}px`}else t.style.removeProperty("padding-right")}))}));function objectsHaveCoincidence(e,t){const s=Object.values(e),i=Object.values(t);let o=!1;for(let e of s)if(i.includes(e)){o=!0;break}return o}function createElement(e,t=!1,s=!1){const i=document.createElement(e);return t&&(i.className=t),s&&(i.innerHTML=s),i}function calcSize(e){const t=e/1024,s=t/1024;return s<1?`${parseInt(t)} кб`:s>=1?parseInt(100*s)/100+" мб":void 0}function getCoords(e){const t=e.getBoundingClientRect();return{top:t.top+window.pageYOffset,bottom:t.bottom+window.pageYOffset,left:t.left+window.pageXOffset,right:t.right+window.pageXOffset}}function getScrollWidth(){const e=createElement("div");e.style.cssText="width: 50px; height: 50px; overflow: scroll; position: absolute; z-index: -999;",document.body.append(e);const t=e.offsetWidth-e.clientWidth;return e.remove(),t}bodyDisabledObserver.observe(document.body,{classList:!0,attributes:!0,attributeOldValue:!0});class Modal{constructor(e="modal"){this.removeModal=this.removeModal.bind(this),this.onModalClick=this.onModalClick.bind(this),this.appearTransitionDur=400,this.calcCloseBtnPosition=this.calcCloseBtnPosition.bind(this),this.modal=createElement("div",e),this.modal.addEventListener("click",this.onModalClick),this.drawBasicTemplate()}drawBasicTemplate(){this.basicTemplate='\n            <div class="modal__body">\n                <div class="modal__close">\n                    <button class="icon-close"></button>\n                </div>\n                <div class="modal__content">\n                    <h3 class="modal__title"> ==title== </h3>\n                    <div class="modal__block">\n                        ==content==\n                    </div>\n                    <div class="modal__buttons">\n                        <button class="modal__apply button"> ==apply-action== </button>\n                        <button class="modal__cancel"> ==cancel-action== </button>\n                    </div>\n                </div>\n            </div>\n        '}onModalClick(e){e.target===this.modal&&this.removeModal()}createBasicModal(e,t,s=null,i=null){let o=this.basicTemplate;e&&(o=o.replace("==title==",e)),t&&(o=o.replace("==content==",t)),s&&(o=o.replace("==apply-action==",s.text)),i&&(o=o.replace("==cancel-action==",i)),this.setModalHandlers(o,s,i),this.modal.addEventListener("click",this.onModalClick)}createImageModal(e,t="0px"){const s=createElement("img","modal__image");s.src=e,s.style.borderRadius=t;const i=createElement("div","modal__close modal__close--image");i.addEventListener("click",(e=>{e.preventDefault(),this.removeModal()})),this.modal.innerHTML="",this.modal.append(i),this.modal.append(s),this.img=s,this.closeBtn=i,this.closeBtn.style.opacity=0,this.closeBtn.style.transition="opacity .4s",this.appendModal(),setTimeout((()=>this.modal.addEventListener("click",this.onModalClick)),0),setTimeout((()=>this.calcCloseBtnPosition(!0)),this.appearTransitionDur),window.addEventListener("resize",this.calcCloseBtnPosition)}calcCloseBtnPosition(e=!1){this.closeBtn.style.opacity="1",e&&setTimeout((()=>this.closeBtn.style.removeProperty("transition")),400);const t=document.documentElement.clientWidth||window.innerWidth,s=this.closeBtn.offsetWidth,i=this.img.getBoundingClientRect();let o=i.top,n=i.left-this.closeBtn.offsetWidth-10;n<s&&(n=t/2-s/2),this.closeBtn.style.cssText+=`top: ${o}px; right: ${n}px`}setModalHandlers(e,t,s){const i=this.removeModal.bind(this);this.modal.innerHTML="",this.modal.insertAdjacentHTML("afterbegin",e);const o=this.modal.querySelector(".modal__apply"),n=this.modal.querySelector(".modal__cancel"),l=this.modal.querySelector(".modal__close");this.appendModal(),t||s?t?s||n.remove():o.remove():this.modal.querySelector(".modal__buttons").remove(),l.addEventListener("click",i),n&&n.addEventListener("click",i),o&&o.addEventListener("click",(()=>{i(),t.confirmCallback()}))}appendModal(){const e=this.getModalBody();this.modal.style.transition="opacity .2s",this.modal.style.opacity="0",e.style.transition=`transform ${this.appearTransitionDur/1e3}s`,e.style.transform="scale(0.7)",document.body.append(this.modal),document.body.classList.add("__disabled"),setTimeout((()=>{this.modal.style.opacity="1",e.style.transform="scale(1)"}),50)}removeModal(){const e=this.getModalBody();this.modal.style.opacity="0",e.style.transform="scale(0.7)",setTimeout((()=>{this.closeBtn=null,this.img=null,this.modal.remove(),document.body.classList.remove("__disabled"),window.removeEventListener("resize",this.calcCloseBtnPosition)}),this.appearTransitionDur)}getTitle(){return this.modal.querySelector(".modal__title")}getModalBody(){return this.modal.querySelector(".modal__body")||this.modal.querySelector(".modal__image")}}const modal=new Modal;class LoginModal extends Modal{constructor(){super("modal login-modal"),this.calcIframeHeight=this.calcIframeHeight.bind(this)}drawBasicTemplate(e){let t;switch(e){case"signup":t="user/signup-frame.html";break;case"login":t="user/login-frame.html"}this.basicTemplate=`\n            <div class="modal__body login-modal__body">\n                <div class="modal__content login-modal__content">\n                    <div class="login-modal__scene">\n                        <div class="login-modal__scene-image-container">\n                            <ul class="login-modal__list list">\n                                <li class="login-modal__list-item list__item icon-checkbox">\n                                    <b class="login-modal__bold">Получайте выгодные предложения о работе</b>\n                                    по Email\n                                </li>\n                                <li class="login-modal__list-item list__item icon-checkbox">\n                                    Создавайте резюме,\n                                    <b class="login-modal__bold">чтобы повысить шансы заинтересовать рекрутеров</b>\n                                </li>\n                                <li class="login-modal__list-item list__item icon-checkbox">\n                                    <b class="login-modal__bold">Откликайтесь</b>\n                                    на понравившуюся\n                                    <b class="login-modal__bold">вакансию</b>\n                                </li>\n                            </ul>\n                        </div>\n                    </div>\n                    <div class="login-modal__inner">\n                        <div class="login-modal__frame-container">\n                            <button class="modal__close login-modal__close icon-close"></button>\n                            <iframe class="login-modal__frame" src="${t}" frameborder="0"></iframe>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        `}createBasicModal(e){this.drawBasicTemplate(e),this.setModalHandlers(),this.appendModal(),this.iframe=this.modal.querySelector("iframe"),this.iframe.onload=()=>{this.calcIframeHeight(),this.iframe.contentWindow.addEventListener("resize",this.calcIframeHeight);new MutationObserver(this.calcIframeHeight).observe(this.iframe.contentWindow.document,{subtree:!0,attributes:!0})}}calcIframeHeight(){const e=this.iframe.contentWindow.document.querySelector(".default-layout").offsetHeight;this.iframe.height=e+30}setModalHandlers(){this.modal.innerHTML="",this.modal.insertAdjacentHTML("afterbegin",this.basicTemplate);this.modal.querySelector(".modal__close").addEventListener("click",this.removeModal)}}const loginModal=new LoginModal;class User{constructor(){this.init()}init(){this.checkUserLogin(),this.renderUserInterface().then((()=>{setTimeout((()=>this.initLoggingButtons()),100)}))}checkUserLogin(){const e=_localStorage.getItem("job1_user");e&&"object"==typeof e?e.logged?this.logged=!0:this.logged=!1:_localStorage.setItem("job1_user",{})}logUser(e){const t=_localStorage.getItem("job1_user")||{};t.logged=e,_localStorage.setItem("job1_user",t),this.checkUserLogin(),setTimeout((()=>window.location.reload()),0)}initLoggingButtons(){this.logged?(this.logoutButtons=Array.from(document.querySelectorAll(".logout-button")),this.logoutButtons.forEach((e=>{e.addEventListener("click",(()=>this.logUser(!1)))}))):(this.signUpButtons=Array.from(document.querySelectorAll(".signup-button")),this.loginButtons=Array.from(document.querySelectorAll(".login-button")),this.loginButtons.forEach((e=>{e.addEventListener("click",(()=>this.logUser(!0)))})),this.signUpButtons.forEach((e=>{e.addEventListener("click",(()=>this.signUp()))})))}renderUserInterface(){return new Promise((e=>{setTimeout((()=>{if(!this.logged){document.querySelectorAll("[data-require-user]").forEach((e=>{"button"===e.dataset.requireUser&&e.setAttribute("disabled","")}))}header&&header.renderUserInterface(),e()}),0)}))}signUp(){loginModal.createBasicModal("signup")}}const user=new User;class Header{constructor(){this.showSideNav=this.showSideNav.bind(this),this.closeSideNav=this.closeSideNav.bind(this),this.headerContainer=document.querySelector(".header-container"),this.headerContainer&&(this.header=this.headerContainer.querySelector(".header"),this.headerMenu=this.header.querySelector(".header-menu"),this.showSideNavButton=this.headerContainer.querySelector("[data-header-show]"),this.closeSideNavButton=this.headerContainer.querySelector("[data-header-close]"),this.sideNav=this.headerContainer.querySelector(".side-navigation"),this.initSideNav())}initSideNav(){this.sideNav&&(this.showSideNavButton.addEventListener("click",this.showSideNav),this.closeSideNavButton.addEventListener("click",this.closeSideNav),this.sideNav.addEventListener("click",(e=>{e.target!==this.sideNav&&e.target.closest(".side-navigation")===this.sideNav||this.closeSideNav()})))}renderUserInterface(){if(this.headerBox=this.header.querySelector(".header__box"),this.loginButtonDesktop=this.header.querySelector(".header__box-trigger-title"),user.logged){this.loginButtonDesktop.innerHTML="Исмукова Светлана";document.querySelectorAll(".header-menu__svg-path-lock").forEach((e=>e.remove())),this.userContainer||(this.userContainer=createElement("a","header-menu__user"),this.userContainer.href="#",this.userContainer.dataset.dynamicAdaptive="#side-nav__user, 719",this.userContainer.innerHTML='\n                <div class="header-menu__user-logo">\n                    <img class="header-menu__user-portrait __removed" src="#" alt="">\n                    <div class="header-menu__user-icon">\n                        <svg fill="currentColor" viewBox="0 0 16 18" role="img"\n                            aria-label="Platzhalter für Profilbild">\n                            <path\n                                d="M8,1.25C3.73,1.25,0.25,4.73,0.25,9S3.73,16.75,8,16.75s7.75-3.48,7.75-7.75S12.27,1.25,8,1.25z M8,1.75 c4,0,7.25,3.25,7.25,7.25c0,1.76-0.63,3.38-1.68,4.64c-0.15-0.07-0.31-0.14-0.48-0.19c-0.2-0.06-0.73-0.21-1.24-0.36 c-0.51-0.15-1.01-0.29-1.12-0.33l-0.09-0.03c-0.22-0.07-0.49-0.16-0.68-0.35c-0.03-0.06-0.07-0.35-0.09-0.53 c1.08-0.9,1.98-2.41,1.98-3.95c0-2.33-1.58-3.96-3.85-3.96S4.15,5.58,4.15,7.91c0,1.54,0.9,3.06,1.98,3.95c0,0,0,0.01-0.01,0.01 c-0.01,0.19-0.06,0.46-0.05,0.47c-0.22,0.24-0.5,0.33-0.71,0.4l-0.09,0.03c-0.11,0.04-0.61,0.18-1.12,0.33 c-0.51,0.14-1.03,0.29-1.23,0.36c-0.18,0.05-0.33,0.12-0.49,0.19C1.38,12.38,0.75,10.76,0.75,9C0.75,5,4,1.75,8,1.75z M4.65,7.91 c0-2.04,1.38-3.46,3.35-3.46s3.35,1.42,3.35,3.46c0,2.12-1.95,4.27-3.35,4.27S4.65,10.03,4.65,7.91z M8,16.25 c-2.04,0-3.89-0.85-5.2-2.21c0.09-0.03,0.17-0.08,0.27-0.1c0.2-0.06,0.72-0.21,1.23-0.36c0.52-0.15,1.02-0.29,1.14-0.33l0.08-0.03 c0.25-0.08,0.62-0.2,0.95-0.56c0.06-0.09,0.11-0.29,0.13-0.46c0.47,0.3,0.96,0.49,1.4,0.49c0.45,0,0.93-0.19,1.41-0.49 c0.03,0.18,0.07,0.39,0.15,0.49c0.31,0.34,0.69,0.46,0.93,0.54l0.08,0.03c0.12,0.04,0.62,0.18,1.14,0.33 c0.5,0.14,1.02,0.29,1.23,0.36c0.1,0.03,0.18,0.07,0.27,0.1C11.89,15.4,10.04,16.25,8,16.25z">\n                            </path>\n                        </svg>\n                    </div>\n                </div>\n                <div class="header-menu__user-content">\n                    <div class="header-menu__user-title">\n                        Исмукова Светлана\n                    </div>\n                    <span class="header-menu__user-link link">Посмотреть обзор</span>\n                </div>\n            '),this.controlsDivider||(this.controlsDivider=createElement("div","header-menu__divider divider divider--full divider--fine")),this.userControls||(this.userControls=createElement("nav","header-menu__control"),this.userControls.innerHTML='\n                <ul class="header-menu__control-list">\n                    <li class="header-menu__control-item">\n                        <a class="header-menu__control-link" href="#">\n                            Настройки\n                        </a>\n                    </li>\n                    <li class="header-menu__control-item">\n                        <a class="header-menu__control-link logout-button" href="#">\n                            Выход\n                        </a>\n                    </li>\n                </ul>\n            ',this.userControls.dataset.dynamicAdaptive="#side-nav__user-controls, 719"),this.userContainer.closest("body")||this.headerMenu.prepend(this.userContainer),this.controlsDivider.closest("body")||this.headerMenu.append(this.controlsDivider),this.userControls.closest("body")||this.headerMenu.append(this.userControls)}else this.signupButtonMobile=createElement("button","header__box-signup-button button button--small button--outline-white signup-button"),this.signupButtonMobile.innerHTML="Регистрация",this.headerBox.append(this.signupButtonMobile),this.guestContainer||(this.guestContainer=createElement("div","header-menu__guest"),this.guestContainer.dataset.dynamicAdaptive="#side-nav__user, 719",this.guestContainer.innerHTML='\n                    <div class="header-menu__guest-content">\n                        <button class="login-button button button--full">Войти</button>\n                        <div class="guest-link-container">\n                            Вы еще не зарегистрированы на job1.ru?\n                            <a class="guest-link signup-button link" href="#">Зарегистрируйтесь\n                                бесплатно</a>\n                        </div>\n                    </div>\n                '),this.userContainer?this.userContainer.replaceWith(this.guestContainer):this.guestContainer.closest("body")||this.headerMenu.prepend(this.guestContainer),this.controlsDivider&&this.controlsDivider.remove(),this.userControls&&this.userControls.remove()}showSideNav(){this.sideNav.classList.add("__show"),document.body.classList.add("__disabled")}closeSideNav(){this.sideNav.classList.remove("__show"),document.body.classList.remove("__disabled")}}const header=document.querySelector(".header-container")?new Header:null,observingNodesKeys=["input","form","formElement","elem"];function observeNodeBeforeInit(e,t=!1){let s=e;0==t&&(s=e.cloneNode(!0),e.replaceWith(s));const i=new MutationObserver((e=>{e.forEach((e=>{const t=Array.from(e.removedNodes);inittedInputs=inittedInputs.filter((e=>{let s=!0;return observingNodesKeys.forEach((i=>{e[i]&&t.includes(e[i])&&(s=!1)})),0==s&&(i.disconnect(),e.onDestroy&&e.onDestroy()),s}))})),setTimeout((()=>doInit(inputSelectors)),0)}));return i.observe(s,{childList:!0}),s}let inittedInputs=[];function initInput(e,t,s){e.find((e=>!!e&&Object.values(e).includes(t)))||inittedInputs.push(new s(t))}function doInit(e){for(let t of e){Array.from(document.querySelectorAll(t.selector)).forEach((e=>initInput(inittedInputs,e,t.classInstance)))}}class ButtonShowMore{constructor(e){this.toggleElem=this.toggleElem.bind(this),this.input=observeNodeBeforeInit(e),this.input.addEventListener("click",this.toggleElem)}toggleElem(){const e=this.input,t=e.dataset.showMore,s=Array.from(document.querySelectorAll(t));let i;if(s.length>0&&(1===s.length&&(i=s[0]),s.length>1&&(i=findClosestElem(e,t))),i){const t=i.classList.contains("__show-more")?"remove":"add";i.classList[t]("__show-more"),"add"===t&&(e.innerHTML=e.innerHTML.replace("больше","меньше")),"remove"===t&&(e.innerHTML=e.innerHTML.replace("меньше","больше"))}}}class DataTitle{constructor(e){this.showTitle=this.showTitle.bind(this),this.hideTitle=this.hideTitle.bind(this),this.elem=observeNodeBeforeInit(e,!0),this.showingDur=300,this.elem.addEventListener("pointerover",this.showTitle)}showTitle(e){const t=e.target;let s=t.dataset.title;s||(s=t.textContent||t.innerText);const i=createElement("div","hover-title",s),o=getComputedStyle(this.elem).fontSize;i.style.cssText=`\n            transition: all ${this.showingDur/1e3}s; \n            opacity: 0; \n            font-size: ${o}\n        `;const n=t.parentNode;n.style.position="relative",n.append(i),setTimeout((()=>i.style.opacity="1"),0),t.addEventListener("pointerout",this.hideTitle)}hideTitle(e){const t=e.target,s=t.parentNode.querySelector(".hover-title");s&&(s.style.opacity="0",t.removeEventListener("pointerout",this.hideTitle),setTimeout((()=>{s.remove(),this.hideTitle(e)}),this.showingDur))}}class ShowButton{constructor(e){this.onDocumentClick=this.onDocumentClick.bind(this),this.toggle=this.toggle.bind(this),this.input=observeNodeBeforeInit(e),this.target=findClosestElem(this.input,this.input.dataset.show),this.targetClass=this.target.className.split(" ")[0],this.input.addEventListener("click",this.toggle),document.addEventListener("click",this.onDocumentClick)}onDocumentClick(e){e.target!==this.input&&e.target.closest("[data-show]")!==this.input&&e.target!==this.target&&e.target.closest(`.${this.targetClass}`)!==this.target&&this.hide()}toggle(){this[this.target.classList.contains("__show")?"hide":"show"]()}show(){this.target.classList.add("__show")}hide(){this.target.classList.remove("__show")}onDestroy(){this.input.removeEventListener("click",this.toggle),document.removeEventListener("click",this.onDocumentClick)}}class DynamicAdaptive{constructor(e){this.moveElem=this.moveElem.bind(this),this.movableElem=observeNodeBeforeInit(e),this.data=this.movableElem.dataset.dynamicAdaptive.split(", "),this.selector=this.data[0],this.mediaValue=this.data[1],this.mediaQuery=window.matchMedia(`(max-width: ${this.mediaValue}px)`),this.target=findClosestElem(this.movableElem,this.selector),this.replacement=createElement("div","dynamic-adaptive-replacement"),this.moveElem(),this.mediaQuery.addEventListener("change",this.moveElem)}moveElem(){this.movableElem.closest("body")&&(this.mediaQuery.matches&&this.target.closest("body")?(this.movableElem.after(this.replacement),setTimeout((()=>this.target.append(this.movableElem)),0)):this.replacement.replaceWith(this.movableElem))}}class BackToTopButton{constructor(e){this.onScroll=this.onScroll.bind(this),this.onClick=this.onClick.bind(this),this.input=observeNodeBeforeInit(e),this.parent=this.input.parentNode,this.onScroll(),window.addEventListener("scroll",this.onScroll),window.addEventListener("resize",this.onScroll),this.input.addEventListener("click",this.onClick)}onScroll(){const e=document.documentElement.clientHeight||window.innerHeight,t=getCoords(this.parent).bottom;window.pageYOffset+e<=e?this.hideBtn():this.showBtn(),window.pageYOffset+e>=t?this.input.style.position="absolute":this.input.style.position="fixed"}onClick(){window.scrollTo({top:0,behavior:"smooth"})}hideBtn(){this.input.classList.add("__hidden")}showBtn(){this.input.classList.remove("__hidden")}}class Spoiler{constructor(e){this.spoiler=observeNodeBeforeInit(e),this.hideable=Array.from(this.spoiler.querySelectorAll(".spoiler__hideable")),this.button=this.spoiler.querySelector(".spoiler__button"),this.buttonChangingText=this.button.hasAttribute("data-spoiler-changing-text")?this.button.dataset.spoilerChangingText.split(", "):null,this.isHidden=!0,this.button.addEventListener("click",this.toggle.bind(this)),this.hide()}toggle(){this.isHidden?this.show():this.hide()}calcHeight(e){const t=e.cloneNode(!0);t.classList.remove("spoiler__hideable"),t.style.cssText="opacity: 0; position: absolute; z-index: -1",t.style.width=e.offsetWidth+"px",document.body.append(t);const s=t.offsetHeight;return t.remove(),s}show(){this.isHidden=!1,this.buttonChangingText&&(this.button.textContent=this.buttonChangingText[1]),this.button.classList.add("spoiler__button--shown"),this.hideable.forEach((e=>{const t=this.calcHeight(e);e.style.cssText=`\n                max-height: ${t}px;\n                opacity: 1;\n                visibility: visible;\n            `}))}hide(){this.isHidden=!0,this.buttonChangingText&&(this.button.textContent=this.buttonChangingText[0]),this.button.classList.remove("spoiler__button--shown"),this.hideable.forEach((e=>{e.style.removeProperty("max-height"),e.style.removeProperty("opacity"),e.style.removeProperty("visibility"),e.style.margin="0"}))}}class ScrollShadow{constructor(e){this.onScroll=this.onScroll.bind(this),this.elem=observeNodeBeforeInit(e),this.selector=this.elem.dataset.scrollShadow,this.scrollable=this.elem.querySelector(this.selector),this.items=Array.from(this.scrollable.childNodes).filter((e=>"text"!==e.type)),this.shadowStart=this.elem.querySelector(".shadow-start"),this.shadowEnd=this.elem.querySelector(".shadow-en"),this.visibleClass="sub-navigation__shadow--visible",this.onScroll(),window.addEventListener("resize",this.onScroll),this.scrollable.addEventListener("scroll",this.onScroll)}onScroll(){const e=this.scrollable.scrollLeft,t=this.scrollable.offsetWidth;let s=0;this.items.forEach((e=>s+=e.offsetWidth));const i=s-t;e>0?this.toggleShadow("start","add"):this.toggleShadow("start","remove"),e<i?this.toggleShadow("end","add"):this.toggleShadow("end","remove")}toggleShadow(e,t){"start"!==e&&"end"!==e||"add"!==t&&"remove"!==t||this["shadow"+(e=upperFirstLetter(e))].classList[t](this.visibleClass)}}const inittingSelectors=[{selector:"[data-show-more]",classInstance:ButtonShowMore},{selector:"[data-title]",classInstance:DataTitle},{selector:"[data-show]",classInstance:ShowButton},{selector:"[data-dynamic-adaptive]",classInstance:DynamicAdaptive},{selector:".back-to-top",classInstance:BackToTopButton},{selector:".spoiler",classInstance:Spoiler},{selector:"[data-scroll-shadow]",classInstance:ScrollShadow}];function observeDocumentBodyOnInputs(){new MutationObserver((e=>{console.log(e);e.find((e=>{const t=Array.from(e.addedNodes),s=Array.from(e.removedNodes);return Boolean(t.find((e=>Boolean(s.find((t=>t.className==e.className))))))}))||setTimeout((()=>{doInit(inittingSelectors)}),100)})).observe(document.body,{childList:!0,subtree:!0})}observeDocumentBodyOnInputs();