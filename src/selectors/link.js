import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LinkUI from '@ckeditor/ckeditor5-link/src/linkui';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import contentIcon from '../assets/icons/content.svg';
import fileIcon from '../assets/icons/file.svg';

/** Allow to select a link from existing content or uploaded file */
export default class LinkSelector extends Plugin {

	constructor(editor) {
		super(editor);
		editor.config.define('link.selector', ['content', 'file']);
	}

	static get pluginName() {
		return 'LinkSelector';
	}

	init() {
		// get the configuration
		const editor = this.editor;
		const config = editor.config.get('link.selector');

		// get the LinkUI plugin
		this.linkUI = editor.plugins.get(LinkUI);

		// create buttons
		const contentButton = this._createButton(config !== undefined ? config.content : undefined, 'Internal content', contentIcon);
		const fileButton = this._createButton(config !== undefined ? config.file : undefined, 'Uploaded file', fileIcon);

		// render the buttons
		const linkFormView = this.linkUI.formView;
		linkFormView.once('render', () => {
			const saveButtonViewElement = linkFormView.saveButtonView.element;

			// add the button to select link of internal content
			if (contentButton !== undefined) {
				// render the button's template
				contentButton.render();

				// register the button under the link form view, it will handle its destruction
				linkFormView.registerChild(contentButton);

				// inject the element into DOM.
				linkFormView.element.insertBefore(contentButton.element, saveButtonViewElement);
			}

			// add the button to select link of uploaded file
			if (fileButton !== undefined) {
				fileButton.render();
				linkFormView.registerChild(fileButton);
				linkFormView.element.insertBefore(fileButton.element, saveButtonViewElement);
			}

			// update buttons' width when got decorators
			const buttonsWidth = editor.config.get('link.decorators') === undefined
				? undefined
				: contentButton !== undefined && fileButton !== undefined
					? '25%'
					: contentButton !== undefined || fileButton !== undefined
						? '33.3%'
						: undefined;

			if (buttonsWidth !== undefined) {
				if (contentButton !== undefined) {
					contentButton.element.style.width = buttonsWidth;
				}
				if (fileButton !== undefined) {
					fileButton.element.style.width = buttonsWidth;
				}
				saveButtonViewElement.style.width = linkFormView.cancelButtonView.element.style.width = buttonsWidth;
			}
		});
	}

	_createButton(config, label, icon) {
		// check the configuration
		if (config === undefined || config === null || typeof config.selectLink !== 'function') {
			console.warn('The configuration of a link button is undefined or invalid (no "selectLink" function)', config);
			return undefined;
		}

		// create the button
		const button = new ButtonView(this.locale);
		button.set({
			label: config.label || label,
			icon: icon,
			withText: false,
			tooltip: true
		});

		// probably this button should be also disabled when the link command is disabled, so try setting editor.isReadOnly = true to see it in action
		const command = this.editor.commands.get('link');
		button.bind('isEnabled').to(command);

		// call the outside handler to select link and update editor's data
		button.on('execute', () => {
			this.linkUI._hideUI();
			config.selectLink(link => {
				if (link && link !== '') {
					command.execute(link, { linkIsExternal: true });
				}
			});
		});

		return button;
	}

}