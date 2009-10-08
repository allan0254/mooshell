/*
Script: Fupdate.Prompt.js
	Prompts the user with the contents of a form (retrieved via ajax) and updates a DOM element with the result of the submission.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
(function(){
	
	var prompter = function(ext){
		return {
			Extends: ext,
			options: {
				//onUpdate: $empty,
				stickyWinToUse: StickyWin.Modal,
				stickyWinOptions: {},
				caption: 'Update Info',
				useUi: true,
				stickyWinUiOptions: {
					width: 500
				},
				useWaiter: true
			},
			initialize: function(form, update, options){
				this.setOptions(options);
				this.update = document.id(update);
				this.makeStickyWin(form);
				this.swin.addEvent('close', function(){
					if (this.request && this.request.waiter) this.request.waiter.stop();
				});
				this.addEvent('success', this.hide.bind(this));
			},
			makeStickyWin: function(form){
				if (document.id(form)) form = document.id(form);
				this.swin = new this.options.stickyWinToUse({
					content: this.options.useUi?StickyWin.ui(this.options.caption, form, this.options.stickyWinUiOptions):form,
					showNow: false
				});
				this.element = this.swin.win.getElement('form');
				this.initAfterUpdate();
			},
			hide: function(){
				this.swin.hide();
				return this;
			},
			prompt: function(){
				this.swin.show();
				return this;
			},
			initAfterUpdate: function(){
				this.setOptions({
					requestOptions: {
						useWaiter: this.options.useWaiter,
						waiterTarget: document.id(this),
						waiterOptions: {
							layer: {
								styles: {
									zIndex: 10001
								}
							}
						}
					}
				});
				this.makeRequest();
				this.addFormEvent();
				document.id(this).store('fupdate', this);
			}
		};
	};
	
	Fupdate.Prompt = new Class(prompter(Fupdate));
	if (Fupdate.Append) Fupdate.Append.Prompt = new Class(prompter(Fupdate.Append));
	
	
	var ajaxPrompter = function(ext) {
		return {
			Extends: ext,
			options: {
				stickyWinToUse: StickyWin.Modal.Ajax
			},
			makeStickyWin: function(formUrl){
				if (this.swin) return this.swin;
				this.swin = new this.options.stickyWinToUse($merge({
					showNow: false,
					requestOptions: this.options.requestOptions,
					onHide: function(){
						this.win.empty();
					},
					url: formUrl,
					handleResponse: function(response) {
						var responseScript = "";
						this.swin.Request.response.text.stripScripts(function(script){	responseScript += script; });
						var content = this.options.useUi?StickyWin.ui('Update Info', response, this.options.stickyWinUiOptions):response;
						this.swin.setContent(content);
						if (this.options.requestOptions.evalScripts) $exec(responseScript);
						this.element = this.swin.win.getElement('form');
						this.initAfterUpdate();
						this.swin.show();
					}.bind(this)
				}, this.options.stickyWinOptions));
				return this.swin;
			},
			prompt: function(){
				this.makeStickyWin().update();
				return this;
			}
		};
	};

	Fupdate.AjaxPrompt = new Class(ajaxPrompter(Fupdate.Prompt));
	if (Fupdate.Append) Fupdate.Append.AjaxPrompt = new Class(ajaxPrompter(Fupdate.Append.Prompt));
})();