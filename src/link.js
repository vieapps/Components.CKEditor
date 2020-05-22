import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LinkUI from '@ckeditor/ckeditor5-link/src/linkui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import contentIcon from './theme/icons/content.svg';
import fileIcon from './theme/icons/file.svg';

/**
 * @extends module:core/plugin~Plugin
 */
export default class LinkSelector extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor(editor) {
		super(editor);
		editor.config.define('link.selector', ['content', 'file']);
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LinkSelector';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// get the configuration and create buttons
		const config = this.editor.config.get('link.selector');
		this.contentButton = this.createLinkButton(config !== undefined ? config.content : undefined, 'Internal content', contentIcon);
		this.fileButton = this.createLinkButton(config !== undefined ? config.file : undefined, 'Uploaded file', fileIcon);

		// render the buttons
		this.linkUI = this.editor.plugins.get(LinkUI);
		this.linkFormView = this.linkUI.formView;

		this.linkFormView.once('render', () => {
			// add the button to select link of internal content
			if (this.contentButton !== undefined) {
				// render the button's template
				this.contentButton.render();

				// register the button under the link form view, it will handle its destruction
				this.linkFormView.registerChild(this.contentButton);

				// inject the element into DOM.
				this.linkFormView.element.insertBefore(this.contentButton.element, this.linkFormView.saveButtonView.element);
			}

			// add the button to select link of uploaded file
			if (this.fileButton !== undefined) {
				this.fileButton.render();
				this.linkFormView.registerChild(this.fileButton);
				this.linkFormView.element.insertBefore(this.fileButton.element, this.linkFormView.saveButtonView.element);
			}

			// update buttons' width when got decorators
			this.buttonsWidth = this.editor.config.get('link.decorators') === undefined
				? undefined
				: this.contentButton !== undefined && this.fileButton !== undefined
					? '25%'
					: this.contentButton !== undefined || this.fileButton !== undefined
						? '33.3%'
						: undefined;

			if (this.buttonsWidth !== undefined) {
				if (this.contentButton !== undefined) {
					this.contentButton.element.style.width = this.buttonsWidth;
				}
				if (this.fileButton !== undefined) {
					this.fileButton.element.style.width = this.buttonsWidth;
				}
				this.linkFormView.cancelButtonView.element.style.width = this.linkFormView.saveButtonView.element.style.width = this.buttonsWidth;
			}
		});
	}

	createLinkButton(config, label, icon) {
		// check the configuration
		if (config === undefined || config === null || typeof config.selectLink !== 'function') {
			console.warn('The configuration of a link button is undefined or invalid (no "selectLink" function)', config);
			return undefined;
		}

		// create the button
		const linkButton = new ButtonView(this.locale);
		linkButton.set({
			label: config.label || label,
			icon: icon,
			withText: false,
			tooltip: true
		});

		// probably this button should be also disabled when the link command is disabled, so try setting editor.isReadOnly = true to see it in action
		const linkCommand = this.editor.commands.get('link');
		linkButton.bind('isEnabled').to(linkCommand);

		// call the outside handler to select link and update editor's data
		linkButton.on('execute', () => {
			this.linkUI._hideUI();
			config.selectLink(link => {
				if (link !== undefined && link !== null && link !== '') {
					linkCommand.execute(link);
				}
			});
		});

		return linkButton;
	}
}