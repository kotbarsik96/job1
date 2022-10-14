function preventButtonsDefault(){const t=["submit-button"];document.querySelectorAll("button").forEach((e=>{t.forEach((t=>{e.classList.contains(t)||e.addEventListener("click",(t=>t.preventDefault()))}))}))}preventButtonsDefault();class TextInput{constructor(t){this.toggleClearButton=this.toggleClearButton.bind(this),this.clearInput=this.clearInput.bind(this),this.inpContainer=observeNodeBeforeInit(t),this.input=this.inpContainer.querySelector("input.text-input__input"),this.wrapper=this.inpContainer.querySelector(".text-input__wrapper"),this.autocompleteList=this.inpContainer.querySelector(".text-input__autocomplete"),this.clearButton=this.inpContainer.querySelector(".text-input__close-icon"),this.toggleClearButton(),this.input.addEventListener("input",this.toggleClearButton),this.clearButton.addEventListener("click",this.clearInput),this.autocompleteList&&this.initAutocomplete()}initAutocomplete(){this.autocompleteList.classList.add("__removed"),this.input.addEventListener("input",(()=>{this.input.value.length>0?this.toggleAutocompleteList(!0):this.toggleAutocompleteList(!1)})),this.input.addEventListener("blur",(()=>this.toggleAutocompleteList(!1)))}toggleAutocompleteList(t=!1){t&&(this.inpContainer.ariaExpanded=!0,this.autocompleteList.classList.remove("__removed")),t||(this.inpContainer.ariaExpanded=!1,this.autocompleteList.classList.add("__removed"))}toggleClearButton(){this.input.value.length<1?this.clearButton.classList.add("__removed"):this.clearButton.classList.remove("__removed")}clearInput(){this.input.value="",this.input.dispatchEvent(new Event("input"))}}class Dropdown{constructor(t){this.toggleList=this.toggleList.bind(this),this.onDocumentClick=this.onDocumentClick.bind(this),this.input=observeNodeBeforeInit(t),this.button=this.input.querySelector(".dropdown__button"),this.list=this.input.querySelector(".dropdown__list"),this.toggleList(!1),this.button.addEventListener("click",this.toggleList),document.addEventListener("click",this.onDocumentClick)}toggleList(t="define"){if(!this.button.disabled){if("boolean"!=typeof t){const t=this.input.classList.contains("__shown");this.toggleList(!t)}"boolean"==typeof t&&(t&&this.input.classList.add("__shown"),t||this.input.classList.remove("__shown"))}}onDocumentClick(t){t.target!==this.button&&!t.target.closest(".dropdown__button")&&this.toggleList(!1)}destroy(){this.button.removeEventListener("click",this.toggleList),document.removeEventListener("click",this.onDocumentClick)}}class JobsSearch{constructor(t){this.form=observeNodeBeforeInit(t,!0),this.keywordsContainer=this.form.querySelector(".jobs-search-form__search-input"),this.proximityContainer=this.form.querySelector(".jobs-search-form__proximity-container"),this.submitContainer=this.form.querySelector(".jobs-search-form__submit-group"),this.keywordsInput=this.keywordsContainer.querySelector(".text-input__input"),this.initMobileHiding()}initMobileHiding(){this.proximityContainer.classList.add("__mobile-hidden"),this.submitContainer.classList.add("__mobile-hidden"),this.keywordsInput.addEventListener("focus",(()=>{this.proximityContainer.classList.remove("__mobile-hidden"),this.submitContainer.classList.remove("__mobile-hidden")}))}}class ValidationForm{constructor(t){this.submit=this.submit.bind(this),this.formElementsKeys=["input"],this.form=observeNodeBeforeInit(t),this.boxError=this.form.querySelector(".info-box--error"),this.submitButton=this.form.querySelector(".submit-button"),this.boxError.classList.add("__removed"),this.submitButton.addEventListener("click",this.submit)}submit(t){const e=inittedInputs.filter((t=>{let e=!1;return this.formElementsKeys.forEach((i=>{t[i]&&t[i].closest(".validation-form")===this.form&&t[i]!==this.submitButton&&(e=!0)})),e})),i=[];e.forEach((t=>{t.validate(),0==t.isValid&&i.push(t)})),i.length>0&&t.preventDefault()}}class TextFormElement{constructor(t){this.validate=this.validate.bind(this),this.formElement=observeNodeBeforeInit(t),this.label=this.formElement.querySelector(".label"),this.input=this.formElement.querySelector(".form-element__input"),this.validationMessage=this.formElement.querySelector(".form-element__validation-message"),this.validationMessage.classList.add("__removed"),this.getValidationConditions()}getValidationConditions(){const t=this.input.dataset.validationMask;this.validationMask=!!t&&new RegExp(t);const e=this.input.dataset.validationLength;this.validationLength=!!e&&e.split(", ")}validate(){let t=!1;const e=this.input.value;if(this.validationMask&&(t=!!this.validationMask.test(e)),this.validationLength){const i=parseInt(this.validationLength[0]),s=parseInt(this.validationLength[1])||i;t=e>=i&&e<=s}this.setValidationState(t),this.input.addEventListener("input",this.validate)}setValidationState(t){this.isValid=t,t?this.validationMessage.classList.add("__removed"):this.validationMessage.classList.remove("__removed")}}class PasswordFormElement extends TextFormElement{constructor(t){super(t),this.onInput=this.onInput.bind(this),this.info=document.querySelector(".password-input__info"),this.info&&this.info.classList.add("__removed"),this.input.addEventListener("focus",(()=>this.info.classList.remove("__removed"))),this.input.addEventListener("input",this.onInput)}onInput(){const t=this.input.value;this.input.value=t.replace(/[\sа-яА-ЯёЁ]/,"")}validate(){let t=!1;const e=this.input.value,i=e.match(/\d/g)||[],s=e.match(/[a-z]/g)||[],n=e.match(/[A-Z]/g)||[],o=e.length>=8,a=i.length>0,r=s.length>0&&n.length>0;t=!!(o&&a&&r),this.input.addEventListener("input",this.validate),super.setValidationState(t)}}const inputSelectors=[{selector:".text-input",classInstance:TextInput},{selector:".dropdown",classInstance:Dropdown},{selector:".jobs-search-form",classInstance:JobsSearch},{selector:".validation-form",classInstance:ValidationForm},{selector:".form-element--text",classInstance:TextFormElement},{selector:".password-input",classInstance:PasswordFormElement}];function observeDocumentBodyOnInputs(){new MutationObserver((t=>{findCoincidenceInMutationlist(t)||(doInit(inputSelectors),preventButtonsDefault())})).observe(document.body,{childList:!0,subtree:!0})}doInit(inputSelectors),observeDocumentBodyOnInputs();