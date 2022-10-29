const rootPath="/job1/";function getBrowser(){const t=navigator.userAgent.toLowerCase();let e=[t.match(/chrome/),t.match(/opera/),t.match(/safari/),t.match(/firefox/)].find((t=>t));return e&&(e=e[0]),e}const browser=getBrowser();function loadData(t,e="json"){return new Promise(((s,o)=>{fetch(t).then((t=>t[e]())).then((t=>s(t))).catch((t=>o(t)))}))}function getPageName(){const t=document.querySelector("[data-page-name]");if(!t)return;const e=t.dataset.pageName;return Array.from(document.querySelectorAll(`.${e}`)).forEach((t=>{t.classList.add("__page-active")})),t.removeAttribute("data-page-name"),e}const pageName=getPageName();function upperFirstLetter(t){return(t=t.split(""))[0]=t[0].toUpperCase(),t.join("")}String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")});const _localStorage={setItem:function(t,e){const s=JSON.stringify(e);localStorage.setItem(t,s)},getItem:function(t){const e=window.localStorage.getItem(t);return JSON.parse(e)}};function findClosestElem(t,e){const s=document.querySelectorAll(e);if(1===s.length)return s[0];const o=t.parentNode;if(o){const t=o.querySelector(e);return t||findClosestElem(o,e)}return null}const bodyDisabledObserver=new MutationObserver((t=>{t.forEach((t=>{const e=document.body;if(t.target===e)if(e.classList.contains("__disabled")){const t=getScrollWidth();e.style.paddingRight=`${t}px`}else e.style.removeProperty("padding-right")}))}));function objectsHaveCoincidence(t,e){const s=Object.values(t),o=Object.values(e);let i=!1;for(let t of s)if(o.includes(t)){i=!0;break}return i}function createElement(t,e=!1,s=!1){const o=document.createElement(t);return e&&(o.className=e),s&&(o.innerHTML=s),o}function calcSize(t){const e=t/1024,s=e/1024;return s<1?`${parseInt(e)} кб`:s>=1?parseInt(100*s)/100+" мб":void 0}function getCoords(t){const e=t.getBoundingClientRect();return{top:e.top+window.pageYOffset,bottom:e.bottom+window.pageYOffset,left:e.left+window.pageXOffset,right:e.right+window.pageXOffset}}function getScrollWidth(){const t=createElement("div");t.style.cssText="width: 50px; height: 50px; overflow: scroll; position: absolute; z-index: -999;",document.body.append(t);const e=t.offsetWidth-t.clientWidth;return t.remove(),e}function arrayToString(t,e=!1){if(!e||!e.match("[[]]"))return t.join(", ");let s="";return t.forEach((t=>{const o=e.replace("[[]]",t);s+=o})),s}bodyDisabledObserver.observe(document.body,{classList:!0,attributes:!0,attributeOldValue:!0});class Snackbar{constructor(t=document.querySelector(".content")){this.remove=this.remove.bind(this),this.parentToInsert=t}create(t){this.snackbar&&this.remove(!0),this.params={iconName:"icon-checkbox",className:"snackbar",contentClassName:"snackbar__content",text:"",appearDuration:250,fadeOutDuration:500,showDuration:5e3};for(let e in t)this.params[e]=t[e];this.renderTemplate()}renderTemplate(){const t=createElement("div",this.params.className),e=`\n        <div class="${this.params.contentClassName}">\n            <div class="snackbar__check ${this.params.iconName}"></div>\n            <span class="snackbar__info-text">${this.params.text}</span>\n        </div>\n        `;t.insertAdjacentHTML("afterbegin",e),t.style.transition=`all ${this.params.appearDuration/1e3}s`,this.parentToInsert.append(t),this.snackbar=t,setTimeout((()=>{t.classList.add("snackbar--shown"),setTimeout((()=>t.style.removeProperty("transition")),this.params.appearDuration)}),100),setTimeout(this.remove,this.params.showDuration)}remove(t=!1){this.snackbar.style.transition=`all ${this.params.fadeOutDuration/1e3}s`,t?(this.snackbar.classList.remove("snackbar--shown"),this.snackbar.remove()):setTimeout((()=>{this.snackbar.classList.remove("snackbar--shown"),setTimeout((()=>this.snackbar.remove()),this.params.fadeOutDuration)}),100)}}const snackbar=new Snackbar;class Modal{constructor(t="modal",e=!1){this.removeModal=this.removeModal.bind(this),this.onModalClick=this.onModalClick.bind(this),this.appearTransitionDur=400,this.calcCloseBtnPosition=this.calcCloseBtnPosition.bind(this),this.modal=createElement("div",t),this.modal.addEventListener("click",this.onModalClick),e||this.drawBasicTemplate()}drawBasicTemplate(){this.basicTemplate='\n            <div class="modal__body">\n                <div class="modal__close">\n                    <button class="icon-close"></button>\n                </div>\n                <div class="modal__content">\n                    <h3 class="modal__title"> ==title== </h3>\n                    <div class="modal__block">\n                        ==content==\n                    </div>\n                    <div class="modal__buttons">\n                        <button class="modal__apply button"> ==apply-action== </button>\n                        <button class="modal__cancel"> ==cancel-action== </button>\n                    </div>\n                </div>\n            </div>\n        '}onModalClick(t){t.target===this.modal&&this.removeModal()}createBasicModal(t,e,s=null,o=null){let i=this.basicTemplate;t&&(i=i.replace("==title==",t)),e&&(i=i.replace("==content==",e)),s&&(i=i.replace("==apply-action==",s.text)),o&&(i=i.replace("==cancel-action==",o)),this.setModalHandlers(i,s,o),this.modal.addEventListener("click",this.onModalClick)}createImageModal(t,e="0px"){const s=createElement("img","modal__image");s.src=t,s.style.borderRadius=e,this.createImageCloseBtn(),this.modal.innerHTML="",this.modal.append(this.closeBtn),this.modal.append(s),this.img=s,this.appendModal()}createImageCloseBtn(){const t=createElement("div","modal__close modal__close--image");t.addEventListener("click",(t=>{t.preventDefault(),this.removeModal()})),t.style.opacity=0,t.style.transition="opacity .4s",this.closeBtn=t,setTimeout((()=>this.calcCloseBtnPosition(!0)),this.appearTransitionDur),window.addEventListener("resize",this.calcCloseBtnPosition)}calcCloseBtnPosition(t=!1){this.closeBtn.style.opacity="1",t&&setTimeout((()=>this.closeBtn.style.removeProperty("transition")),this.appearTransitionDur);const e=this.closeBtn.offsetWidth;this.closeBtnRelative||(this.closeBtnRelative=this.img);const s=this.closeBtnRelative.getBoundingClientRect();let o=s.top,i=s.left-this.closeBtn.offsetWidth-20;i<e&&(i=16),this.closeBtn.style.cssText+=`top: ${o}px; right: ${i}px`}setModalHandlers(t,e,s){const o=this.removeModal.bind(this);this.modal.innerHTML="",this.modal.insertAdjacentHTML("afterbegin",t);const i=this.modal.querySelector(".modal__apply"),n=this.modal.querySelector(".modal__cancel"),a=this.modal.querySelector(".modal__close");this.appendModal(),e||s?e?s||n.remove():i.remove():this.modal.querySelector(".modal__buttons").remove(),a.addEventListener("click",o),n&&n.addEventListener("click",o),i&&i.addEventListener("click",(()=>{o(),e.confirmCallback()}))}appendModal(){const t=this.getModalBody();this.modal.style.transition="opacity .2s",this.modal.style.opacity="0",t.style.transition=`transform ${this.appearTransitionDur/1e3}s`,t.style.transform="scale(0.7)",document.body.append(this.modal),document.body.classList.add("__disabled"),setTimeout((()=>{this.modal.style.opacity="1",t.style.transform="scale(1)"}),50)}removeModal(){const t=this.getModalBody();this.modal.style.opacity="0",t.style.transform="scale(0.7)",setTimeout((()=>{this.closeBtn=null,this.img=null,this.modal.remove(),document.body.classList.remove("__disabled"),window.removeEventListener("resize",this.calcCloseBtnPosition)}),this.appearTransitionDur)}getTitle(){return this.modal.querySelector(".modal__title")}getModalBody(){return this.modal.querySelector(".modal__body")||this.modal.querySelector(".modal__image")}}const modal=new Modal;class LoginModal extends Modal{constructor(){super("modal login-modal"),this.calcIframeHeight=this.calcIframeHeight.bind(this)}drawBasicTemplate(t){let e;switch(t){case"signup":e="/job1/user/signup-frame.html";break;case"login":e="/job1/user/login-frame.html"}this.basicTemplate=`\n            <div class="modal__body login-modal__body">\n                <div class="modal__content login-modal__content">\n                    <div class="login-modal__scene">\n                        <div class="login-modal__scene-image-container">\n                            <div class="login-modal__scene-background-image"></div>\n                            <ul class="login-modal__list list">\n                                <li class="login-modal__list-item list__item icon-checkbox">\n                                    <b class="login-modal__bold">Получайте выгодные предложения о работе</b>\n                                    по Email\n                                </li>\n                                <li class="login-modal__list-item list__item icon-checkbox">\n                                    Создавайте резюме,\n                                    <b class="login-modal__bold">чтобы повысить шансы заинтересовать рекрутеров</b>\n                                </li>\n                                <li class="login-modal__list-item list__item icon-checkbox">\n                                    <b class="login-modal__bold">Откликайтесь</b>\n                                    на понравившуюся\n                                    <b class="login-modal__bold">вакансию</b>\n                                </li>\n                            </ul>\n                        </div>\n                    </div>\n                    <div class="login-modal__inner">\n                        <div class="login-modal__frame-container">\n                            <button class="modal__close login-modal__close icon-close"></button>\n                            <iframe class="login-modal__frame" src="${e}" frameborder="0"></iframe>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        `}createBasicModal(t){this.drawBasicTemplate(t),this.setModalHandlers(),this.appendModal(),this.iframe=this.modal.querySelector("iframe"),this.iframe.onload=()=>{this.calcIframeHeight(),this.iframe.contentWindow.addEventListener("resize",this.calcIframeHeight);new MutationObserver(this.calcIframeHeight).observe(this.iframe.contentWindow.document,{subtree:!0,attributes:!0})}}calcIframeHeight(){const t=this.iframe.contentWindow.document.querySelector(".default-layout").offsetHeight;this.iframe.height=t+30}setModalHandlers(){this.modal.innerHTML="",this.modal.insertAdjacentHTML("afterbegin",this.basicTemplate);this.modal.querySelector(".modal__close").addEventListener("click",this.removeModal)}}const loginModal=new LoginModal;class FormModal extends Modal{constructor(t,e){super("modal form-modal",!0),this.content={titleText:"",applyButtonText:"",removeButtonText:"",bodyContent:""},this.handlers={applyBtnHandler:null,removeBtnHandler:null};for(let e in t)this.content[e]=t[e];for(let t in e)this.handlers[t]=e[t];this.drawBasicTemplate()}drawBasicTemplate(){this.basicTemplate=`\n        <form class="modal__body form-modal__body">\n            <div class="form-modal__header ">\n                <h3 class="form-modal__title">${this.content.titleText}</h3>\n                <button class="form-modal__close icon-close" type="button"></button>\n            </div>\n            <div class="form-modal__content">\n                ${this.content.bodyContent}\n            </div>\n            <div class="form-modal__button-container">\n                <button class="form-modal__apply-button button button--full" aria-label="${this.content.applyButtonText}" type="button">\n                    ${this.content.applyButtonText}\n                </button>\n            </div>\n            <button class="form-modal__remove-button link" type="button" aria-label="${this.content.removeButtonText}">${this.content.removeButtonText}</button>\n        </form>\n        `,this.modal.innerHTML=this.basicTemplate,this.appendModal(),this.addHandlers()}appendModal(){super.appendModal(),this.closeBtn=this.modal.querySelector(".form-modal__close"),this.applyBtn=this.modal.querySelector(".form-modal__apply-button"),this.removeBtn=this.modal.querySelector(".form-modal__remove-button"),this.content=this.modal.querySelector(".form-modal__content")}addHandlers(){this.closeBtn.addEventListener("click",this.removeModal),this.handlers.applyBtnHandler&&this.applyBtn.addEventListener("click",this.handlers.applyBtnHandler),this.handlers.removeBtnHandler&&this.removeBtn.addEventListener("click",this.handlers.removeBtnHandler)}}class JobLogoModal extends Modal{constructor(t){super("modal",!0),this.employerTitle=t}createBasicModal(){loadData("/job1/json/employers.json").then((t=>{this.employerData=t.find((t=>t.title===this.employerTitle)),loadData(`/job1/${this.employerData.iconURL}`,"text").then((t=>{this.icon=t;const e=createElement("div","modal__logo");e.insertAdjacentHTML("afterbegin",this.icon),e.style.cssText="position: absolute; z-index: -999",document.body.append(e),this.iconData={height:e.offsetHeight,width:e.offsetWidth,direction:e.offsetHeight>e.offsetWidth+50?"vertical":"horizontal"},e.remove(),this.img=e,this.img.style.cssText="",this.drawBasicTemplate()}))}))}drawBasicTemplate(){switch(this.iconData.direction){case"vertical":this.img.classList.add("modal__logo--vertical");break;case"horizontal":this.img.classList.add("modal__logo--horizontal")}this.modal.insertAdjacentHTML("afterbegin",'<div class="modal__logo-body"></div>');const t=this.getModalBody();t.append(this.img),this.appendModal(),this.closeBtnRelative=t,super.createImageCloseBtn(),this.modal.append(this.closeBtn),this.createMeta()}createMeta(){const t=createElement("h3","modal__logo-title"),e=createElement("div","modal__logo-ads"),s=this.employerData;let o;s.activeAds>0?(o=`Активных объявлений: ${s.activeAds}`,e.classList.add("link")):o="Нет активных объявлений",t.insertAdjacentText("afterbegin",s.title),e.insertAdjacentText("afterbegin",o);const i=this.getModalBody();i.prepend(t),i.append(e)}getModalBody(){return this.modal.querySelector(".modal__logo-body")}}class User{constructor(){this.init()}init(){this.checkUserLogin(),this.renderUserInterface().then((()=>{setTimeout((()=>this.initLoggingButtons()),100)}))}checkUserLogin(){const t=_localStorage.getItem("job1_user");t&&"object"==typeof t?t.logged?this.logged=!0:this.logged=!1:_localStorage.setItem("job1_user",{})}logUser(t){const e=_localStorage.getItem("job1_user")||{};e.logged=t,_localStorage.setItem("job1_user",e),this.checkUserLogin(),setTimeout((()=>window.location.reload()),0)}initLoggingButtons(){this.logged?(this.logoutButtons=Array.from(document.querySelectorAll(".logout-button")),this.logoutButtons.forEach((t=>{t.addEventListener("click",(()=>this.logUser(!1)))}))):(this.signUpButtons=Array.from(document.querySelectorAll(".signup-button")),this.loginButtons=Array.from(document.querySelectorAll(".login-button")),this.loginButtons.forEach((t=>{t.addEventListener("click",(()=>this.logUser(!0)))})),this.signUpButtons.forEach((t=>{t.addEventListener("click",(()=>this.signup()))})))}renderUserInterface(){return new Promise((t=>{setTimeout((()=>{this.logged&&(document.body.dataset.isLoggedin="true"),this.logged||setTimeout((()=>{document.querySelectorAll("[data-require-user]").forEach((t=>{const e=t.dataset.requireUser.split(", ");if("button"===e[0]&&t.setAttribute("disabled",""),"button-close-icon"===e[0]){t.setAttribute("disabled","");const e='\n                            <svg class="disabled-elem__lock-icon" xmlns="http://www.w3.org/2000/svg" viewBox="1 1.99 11.31 13.79">\n                                <path d="M11.09 7.74H9.98V5.31a3.32 3.32 0 0 0-6.64 0v2.43H2.22C1.55 7.74 1 8.28 1 8.96v5.6c0 .67.55 1.22 1.22 1.22h8.87c.67 0 1.22-.55 1.22-1.22v-5.6a1.2 1.2 0 0 0-1.22-1.22zM4.34 5.31a2.32 2.32 0 0 1 4.64 0v2.43H4.34V5.31z" fill="currentColor"/>\n                            </svg>\n                            ';t.insertAdjacentHTML("beforeend",e)}if("render"===e[0]&&t.remove(),"login"===e[1]||"signup"===e[1]){t.removeAttribute("disabled"),t.setAttribute("data-disabled","");const s=t.cloneNode(!0);t.replaceWith(s),s.addEventListener("click",this[e[1]])}}))}),100),header&&header.renderUserInterface(),t()}),0)}))}signup(){loginModal.createBasicModal("signup")}login(){loginModal.createBasicModal("login")}}const user=new User;class Header{constructor(){this.showSideNav=this.showSideNav.bind(this),this.closeSideNav=this.closeSideNav.bind(this),this.headerContainer=document.querySelector(".header-container"),this.headerContainer&&(this.header=this.headerContainer.querySelector(".header"),this.headerMenu=this.header.querySelector(".header-menu"),this.showSideNavButton=this.headerContainer.querySelector("[data-header-show]"),this.closeSideNavButton=this.headerContainer.querySelector("[data-header-close]"),this.sideNav=this.headerContainer.querySelector(".side-navigation"),this.headerNavList=this.headerContainer.querySelector(".header__navigation-list"),this.initSideNav(),this.firefoxFix())}firefoxFix(){browser&&"firefox"===browser&&this.headerNavList&&(this.headerNavList.style.transform="translate(0, -1px)")}initSideNav(){this.sideNav&&(this.showSideNavButton.addEventListener("click",this.showSideNav),this.closeSideNavButton.addEventListener("click",this.closeSideNav),this.sideNav.addEventListener("click",(t=>{t.target!==this.sideNav&&t.target.closest(".side-navigation")===this.sideNav||this.closeSideNav()})))}renderUserInterface(){if(this.headerBox=this.header.querySelector(".header__box"),this.loginButtonDesktop=this.header.querySelector(".header__box-trigger-title"),user.logged){this.loginButtonDesktop.innerHTML="Исмукова Светлана";document.querySelectorAll(".header-menu__svg-path-lock").forEach((t=>t.remove())),this.userContainer||(this.userContainer=createElement("a","header-menu__user"),this.userContainer.href="#",this.userContainer.dataset.dynamicAdaptive="#side-nav__user, 719",this.userContainer.innerHTML='\n                <div class="header-menu__user-logo">\n                    <img class="header-menu__user-portrait __removed" src="#" alt="">\n                    <div class="header-menu__user-icon">\n                        <svg fill="currentColor" viewBox="0 0 16 18" role="img"\n                            aria-label="Platzhalter für Profilbild">\n                            <path\n                                d="M8,1.25C3.73,1.25,0.25,4.73,0.25,9S3.73,16.75,8,16.75s7.75-3.48,7.75-7.75S12.27,1.25,8,1.25z M8,1.75 c4,0,7.25,3.25,7.25,7.25c0,1.76-0.63,3.38-1.68,4.64c-0.15-0.07-0.31-0.14-0.48-0.19c-0.2-0.06-0.73-0.21-1.24-0.36 c-0.51-0.15-1.01-0.29-1.12-0.33l-0.09-0.03c-0.22-0.07-0.49-0.16-0.68-0.35c-0.03-0.06-0.07-0.35-0.09-0.53 c1.08-0.9,1.98-2.41,1.98-3.95c0-2.33-1.58-3.96-3.85-3.96S4.15,5.58,4.15,7.91c0,1.54,0.9,3.06,1.98,3.95c0,0,0,0.01-0.01,0.01 c-0.01,0.19-0.06,0.46-0.05,0.47c-0.22,0.24-0.5,0.33-0.71,0.4l-0.09,0.03c-0.11,0.04-0.61,0.18-1.12,0.33 c-0.51,0.14-1.03,0.29-1.23,0.36c-0.18,0.05-0.33,0.12-0.49,0.19C1.38,12.38,0.75,10.76,0.75,9C0.75,5,4,1.75,8,1.75z M4.65,7.91 c0-2.04,1.38-3.46,3.35-3.46s3.35,1.42,3.35,3.46c0,2.12-1.95,4.27-3.35,4.27S4.65,10.03,4.65,7.91z M8,16.25 c-2.04,0-3.89-0.85-5.2-2.21c0.09-0.03,0.17-0.08,0.27-0.1c0.2-0.06,0.72-0.21,1.23-0.36c0.52-0.15,1.02-0.29,1.14-0.33l0.08-0.03 c0.25-0.08,0.62-0.2,0.95-0.56c0.06-0.09,0.11-0.29,0.13-0.46c0.47,0.3,0.96,0.49,1.4,0.49c0.45,0,0.93-0.19,1.41-0.49 c0.03,0.18,0.07,0.39,0.15,0.49c0.31,0.34,0.69,0.46,0.93,0.54l0.08,0.03c0.12,0.04,0.62,0.18,1.14,0.33 c0.5,0.14,1.02,0.29,1.23,0.36c0.1,0.03,0.18,0.07,0.27,0.1C11.89,15.4,10.04,16.25,8,16.25z">\n                            </path>\n                        </svg>\n                    </div>\n                </div>\n                <div class="header-menu__user-content">\n                    <div class="header-menu__user-title">\n                        Исмукова Светлана\n                    </div>\n                    <span class="header-menu__user-link link">Посмотреть обзор</span>\n                </div>\n            '),this.controlsDivider||(this.controlsDivider=createElement("div","header-menu__divider divider divider--full divider--fine")),this.userControls||(this.userControls=createElement("nav","header-menu__control"),this.userControls.innerHTML='\n                <ul class="header-menu__control-list">\n                    <li class="header-menu__control-item">\n                        <a class="header-menu__control-link" href="#">\n                            Настройки\n                        </a>\n                    </li>\n                    <li class="header-menu__control-item">\n                        <a class="header-menu__control-link logout-button" href="#">\n                            Выход\n                        </a>\n                    </li>\n                </ul>\n            ',this.userControls.dataset.dynamicAdaptive="#side-nav__user-controls, 719"),this.userContainer.closest("body")||this.headerMenu.prepend(this.userContainer),this.controlsDivider.closest("body")||this.headerMenu.append(this.controlsDivider),this.userControls.closest("body")||this.headerMenu.append(this.userControls)}else this.signupButtonMobile=createElement("button","header__box-signup-button button button--small button--outline-white signup-button"),this.signupButtonMobile.innerHTML="Регистрация",this.headerBox.append(this.signupButtonMobile),this.guestContainer||(this.guestContainer=createElement("div","header-menu__guest"),this.guestContainer.dataset.dynamicAdaptive="#side-nav__user, 719",this.guestContainer.innerHTML='\n                    <div class="header-menu__guest-content">\n                        <button class="login-button button button--full">Войти</button>\n                        <div class="guest-link-container">\n                            Вы еще не зарегистрированы на job1.ru?\n                            <a class="guest-link signup-button link" href="#">Зарегистрируйтесь\n                                бесплатно</a>\n                        </div>\n                    </div>\n                '),this.userContainer?this.userContainer.replaceWith(this.guestContainer):this.guestContainer.closest("body")||this.headerMenu.prepend(this.guestContainer),this.controlsDivider&&this.controlsDivider.remove(),this.userControls&&this.userControls.remove()}showSideNav(){this.sideNav.classList.add("__show"),document.body.classList.add("__disabled")}closeSideNav(){this.sideNav.classList.remove("__show"),document.body.classList.remove("__disabled")}}const header=document.querySelector(".header-container")?new Header:null;function observeNodeBeforeInit(t){let e=t;const s=new MutationObserver((t=>{t.forEach((t=>{const e=Array.from(t.removedNodes);inittedInputs=inittedInputs.filter((t=>{let o=!0;return e.includes(t.rootElem)&&(o=!1),0==o&&(s.disconnect(),t.onDestroy&&t.onDestroy()),o}))})),setTimeout((()=>doInit(inputSelectors)),0)}));return s.observe(e,{childList:!0}),e}let inittedInputs=[];function initInput(t,e,s){t.find((t=>!!t&&Object.values(t).includes(e)))||inittedInputs.push(new s(e))}function doInit(t){inittedInputs=inittedInputs.filter((t=>{if(!t)return!1;if(Object.values(t).length<1)return!1;let e=!0;return t.rootElem.closest("body")||(e=!1),e}));for(let e of t){Array.from(document.querySelectorAll(e.selector)).forEach((t=>initInput(inittedInputs,t,e.classInstance)))}}function initDataClickClosable(t,e){t=t.split(", "),this.mediaQueries=t.map((t=>{const e=t.split(" ");return{mediaValue:e[0],boolean:e[1]}})),this.mediaQueries.forEach((t=>{o=o.bind(this);const s=window.matchMedia(`(min-width: ${t.mediaValue}px)`);function o(){const o="true"==t.boolean&&!s.matches||"false"==t.boolean&&s.matches,i="true"==t.boolean&&s.matches;o&&document.removeEventListener("click",e),i&&document.addEventListener("click",e)}o(),s.addEventListener("change",o)}))}class ButtonShowMore{constructor(t){this.toggleElem=this.toggleElem.bind(this),this.onDocumentClick=this.onDocumentClick.bind(this),this.rootElem=observeNodeBeforeInit(t),this.rootElem.addEventListener("click",this.toggleElem),this.inputText=this.rootElem.querySelector(".show-more__text"),this.selector=this.rootElem.dataset.showMore;const e=Array.from(document.querySelectorAll(this.selector));e.length>0&&(1===e.length&&(this.elem=e[0]),e.length>1&&(this.elem=findClosestElem(t,this.selector)));let s=this.rootElem.dataset.showMoreText;s=s?s.split(", "):s,s&&(this.textOnHidden=s[0],this.textOnShown=s[1]||s[0]),this.rootElem.hasAttribute("data-click-closable")&&initDataClickClosable.call(this,this.rootElem.dataset.clickClosable,this.onDocumentClick)}onDocumentClick(t){const e=this.rootElem.className.split(" ")[0];t.target!==this.elem&&t.target!==this.rootElem&&t.target.closest(e)!==this.rootElem&&this.hideElem()}toggleElem(){this.elem&&(this.elem.classList.contains("__show-more")?this.hideElem():this.showElem())}hideElem(){this.rootElem.classList.remove("__show-more-active"),this.elem.classList.remove("__show-more"),this.textOnHidden&&(this.inputText?this.inputText.innerHTML=this.textOnHidden:btn.innerHTML=this.textOnHidden)}showElem(){this.rootElem.classList.add("__show-more-active"),this.elem.classList.add("__show-more"),this.textOnShown&&(this.inputText?this.inputText.innerHTML=this.textOnShown:btn.innerHTML=this.textOnShown)}}class DataTitle{constructor(t){this.showTitle=this.showTitle.bind(this),this.hideTitle=this.hideTitle.bind(this),this.rootElem=observeNodeBeforeInit(t),this.showingDur=300,this.rootElem.addEventListener("pointerover",this.showTitle)}showTitle(t){const e=t.target;let s=e.dataset.title;s||(s=e.textContent||e.innerText);const o=createElement("div","hover-title",s),i=getComputedStyle(this.rootElem).fontSize;o.style.cssText=`\n            transition: all ${this.showingDur/1e3}s; \n            opacity: 0; \n            font-size: ${i}\n        `;e.querySelector(".hover-title")||e.append(o),setTimeout((()=>o.style.opacity="1"),0),e.addEventListener("pointerout",this.hideTitle)}hideTitle(t){const e=t.target,s=e.querySelector(".hover-title");s&&(s.style.opacity="0",e.removeEventListener("pointerout",this.hideTitle),setTimeout((()=>{s.remove(),this.hideTitle(t)}),this.showingDur))}}class ShowButton{constructor(t){this.onDocumentClick=this.onDocumentClick.bind(this),this.toggle=this.toggle.bind(this),this.rootElem=observeNodeBeforeInit(t),this.target=findClosestElem(this.rootElem,this.rootElem.dataset.show),this.targetClass=this.target.className.split(" ")[0],this.rootElem.addEventListener("click",this.toggle),document.addEventListener("click",this.onDocumentClick)}onDocumentClick(t){t.target!==this.rootElem&&t.target.closest("[data-show]")!==this.rootElem&&t.target!==this.target&&t.target.closest(`.${this.targetClass}`)!==this.target&&this.hide()}toggle(){this[this.target.classList.contains("__show")?"hide":"show"]()}show(){this.target.classList.add("__show")}hide(){this.target.classList.remove("__show")}onDestroy(){this.rootElem.removeEventListener("click",this.toggle),document.removeEventListener("click",this.onDocumentClick)}}class DynamicAdaptive{constructor(t){this.moveElem=this.moveElem.bind(this),this.rootElem=observeNodeBeforeInit(t),this.data=this.rootElem.dataset.dynamicAdaptive.split(", "),this.selector=this.data[0],this.mediaValue=this.data[1],this.mediaQuery=window.matchMedia(`(max-width: ${this.mediaValue}px)`),this.target=findClosestElem(this.rootElem,this.selector),this.replacement=createElement("div","dynamic-adaptive-replacement"),this.moveElem(),this.mediaQuery.addEventListener("change",this.moveElem)}moveElem(){this.rootElem.closest("body")&&(this.mediaQuery.matches&&this.target.closest("body")?(this.rootElem.after(this.replacement),setTimeout((()=>this.target.append(this.rootElem)),0)):this.replacement.replaceWith(this.rootElem))}}class BackToTopButton{constructor(t){this.onScroll=this.onScroll.bind(this),this.onClick=this.onClick.bind(this),this.rootElem=observeNodeBeforeInit(t),this.parent=this.rootElem.parentNode,this.onScroll(),window.addEventListener("scroll",this.onScroll),window.addEventListener("resize",this.onScroll),this.rootElem.addEventListener("click",this.onClick)}onScroll(){const t=document.documentElement.clientHeight||window.innerHeight;window.pageYOffset+t<=t?this.hideBtn():this.showBtn()}onClick(){window.scrollTo({top:0,behavior:"smooth"})}hideBtn(){this.rootElem.classList.add("__hidden")}showBtn(){this.rootElem.classList.remove("__hidden")}}class Spoiler{constructor(t){this.onDocumentClick=this.onDocumentClick.bind(this),this.rootElem=observeNodeBeforeInit(t),this.hideable=this.rootElem.querySelector(".spoiler__hideable"),this.button=this.rootElem.querySelector(".spoiler__button"),this.buttonChangingText=this.button.hasAttribute("data-spoiler-changing-text")?this.button.dataset.spoilerChangingText.split(", "):null,this.isHidden=!0,this.button.addEventListener("click",this.toggle.bind(this)),this.hide(),this.rootElem.hasAttribute("data-click-closable")&&initDataClickClosable.call(this,this.rootElem.dataset.clickClosable,this.onDocumentClick)}onDocumentClick(t){t.target.closest(".spoiler")!==this.rootElem&&t.target!==this.rootElem&&this.hide()}toggle(){this.isHidden?this.show():this.hide()}calcHeight(t){const e=t.cloneNode(!0);e.classList.remove("spoiler__hideable"),e.style.cssText="opacity: 0; position: absolute; z-index: -1",e.style.width=t.offsetWidth+"px",document.body.append(e);const s=e.offsetHeight;return e.remove(),s}show(){this.isHidden=!1,this.buttonChangingText&&(this.button.textContent=this.buttonChangingText[1]),this.button.classList.add("spoiler__button--shown");const t=this.calcHeight(this.hideable);this.hideable.classList.add("spoiler__hideable--shown"),this.hideable.style.cssText=`\n            max-height: ${t}px;\n            opacity: 1;\n            visibility: visible;\n        `}hide(){this.isHidden=!0,this.buttonChangingText&&(this.button.textContent=this.buttonChangingText[0]),this.button.classList.remove("spoiler__button--shown"),this.hideable.classList.remove("spoiler__hideable--shown"),this.hideable.style.removeProperty("max-height"),this.hideable.style.removeProperty("opacity"),this.hideable.style.removeProperty("visibility")}}class ScrollShadow{constructor(t){this.onScroll=this.onScroll.bind(this),this.rootElem=observeNodeBeforeInit(t),this.selector=this.rootElem.dataset.scrollShadow,this.scrollable=this.rootElem.querySelector(this.selector),this.items=Array.from(this.scrollable.childNodes).filter((t=>3!=t.nodeType)),this.shadowStart=this.rootElem.querySelector(".scroll-shadow-start")||this.createShadow("start"),this.shadowEnd=this.rootElem.querySelector(".scroll-shadow-end")||this.createShadow("end"),this.visibleClass="scroll-shadow--visible",this.onScroll(),window.addEventListener("resize",this.onScroll),this.scrollable.addEventListener("scroll",this.onScroll)}createShadow(t){const e=createElement("div",`scroll-shadow scroll-shadow-${t}`);return this.rootElem.append(e),e}onScroll(){if(this.scrollable.scrollWidth==this.scrollable.offsetWidth)return this.toggleShadow("start","remove"),void this.toggleShadow("end","remove");const t=this.scrollable.scrollLeft,e=this.scrollable.offsetWidth;let s=0;this.items.forEach((t=>s+=t.offsetWidth));const o=s-e;t>0?this.toggleShadow("start","add"):this.toggleShadow("start","remove"),t<o?this.toggleShadow("end","add"):this.toggleShadow("end","remove")}toggleShadow(t,e){"start"!==t&&"end"!==t||"add"!==e&&"remove"!==e||this["shadow"+(t=upperFirstLetter(t))].classList[e](this.visibleClass)}}class ChangingButton{constructor(t){this.changeState=this.changeState.bind(this),this.rootElem=observeNodeBeforeInit(t),this.data=this.rootElem.dataset.changingButton;const e=this.data.match(/classList='.*?'/),s=this.data.match(/contentContainer='.*?'/),o=this.data.match(/content='.*?'/),i={classList:e?e[0].replace("classList=","").replace(/'/g,""):null,contentContainer:s?s[0].replace("contentContainer=","").replace(/'/g,""):null,content:o?o[0].replace("content=","").replace(/'/g,""):null};this.contentContainer=this.rootElem.querySelector(i.contentContainer)||this.rootElem,this.originalState={classList:i.classList.match(/.*:-/)[0].replace(":-","").split(" "),content:i.content.match(/.*:-/)[0].replace(":-","")},this.changedState={classList:i.classList.match(/:-.*/)[0].replace(":-","").split(" "),content:i.content.match(/:-.*/)[0].replace(":-","")},this.rootElem.removeAttribute("data-changing-button"),this.rootElem.dataset.isChangedButton||(this.rootElem.dataset.isChangedButton="false"),this.rootElem.addEventListener("click",this.changeState)}initState(){"false"==this.rootElem.dataset.isChangedButton?this.setOriginalState():this.setChangedState()}changeState(){"false"==this.rootElem.dataset.isChangedButton?this.setChangedState():this.setOriginalState()}setChangedState(){this.contentContainer.innerHTML=this.changedState.content,this.originalState.classList.forEach((t=>{this.rootElem.className=this.rootElem.className.replace(t,"")})),this.changedState.classList.forEach((t=>{this.rootElem.className+=" "+t,this.rootElem.className=this.rootElem.className.replace(/\s\s/g," ")})),this.rootElem.dataset.isChangedButton="true"}setOriginalState(){this.contentContainer.innerHTML=this.originalState.content,this.changedState.classList.forEach((t=>{this.rootElem.className=this.rootElem.className.replace(t,"")})),this.originalState.classList.forEach((t=>{this.rootElem.className+=" "+t,this.rootElem.className=this.rootElem.className.replace(/\s\s/g," ")})),this.rootElem.dataset.isChangedButton="false"}}let inittingSelectors=[{selector:"[data-show-more]",classInstance:ButtonShowMore},{selector:"[data-title]",classInstance:DataTitle},{selector:"[data-show]",classInstance:ShowButton},{selector:"[data-dynamic-adaptive]",classInstance:DynamicAdaptive},{selector:".back-to-top",classInstance:BackToTopButton},{selector:".spoiler",classInstance:Spoiler},{selector:"[data-scroll-shadow]",classInstance:ScrollShadow},{selector:"[data-changing-button]",classInstance:ChangingButton}];function findCoincidenceInMutation(t){const e=Array.from(t.addedNodes),s=Array.from(t.removedNodes);return Boolean(e.find((t=>Boolean(s.find((e=>e.className==t.className))))))}function observeDocumentBody(){new MutationObserver((t=>{t.forEach((t=>{findCoincidenceInMutation(t)||setTimeout((()=>{doInit(inittingSelectors)}),100)}))})).observe(document.body,{childList:!0,subtree:!0})}document.addEventListener("DOMContentLoaded",(()=>{doInit(inittingSelectors),observeDocumentBody()}));