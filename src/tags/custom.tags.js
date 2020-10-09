import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import { defineTagSchema, defineTagConversions, getTagAttributes } from './utils';
import ViewPopup from './popup.view';
import EditPopup from './popup.edit';
import tagsCss from '../assets/tags.css';
import tagsIcon from '../assets/icons/tag.svg';

export default class CustomTags extends Plugin {

	constructor(editor) {
		super(editor);
		editor.config.define('customTags');
	}

	static get requires() {
		return [CustomTagsEditing, CustomTagsUI];
	}

	static get pluginName() {
		return 'CustomTags';
	}
	
}

class CustomTagsEditing extends Plugin {

	init() {
		const editor = this.editor;
		(editor.config.get('customTags') || []).forEach(customTag => this._init(
			editor,
			customTag.tag,
			this._get(customTag.placeholder, customTag.tag),
			this._get(customTag.attributes, {})
		));
		editor.commands.add('update-custom-tags', new UpdateCustomTagsCommand(editor));
	}

	_init(editor, tag, placeholder, attributes) {
		defineTagSchema(editor, tag);
		defineTagConversions(editor, tag);
		editor.commands.add('create-custom-tags-' + tag, new CreateCustomTagsCommand(editor, tag, placeholder, attributes));
	}

	_get(input, defaultValue) {
		return typeof input !== 'undefined' && (input || input === false || input === 0)
			? input
			: defaultValue;
	}

}

class CustomTagsUI extends Plugin {
	
	constructor(editor) {
		super(editor);
		this._customTags = editor.config.get('customTags') || [];
	}

	static get requires() {
		return [ContextualBalloon];
	}

	static get pluginName() {
		return 'CustomTagsUI';
	}

	init() {
		const editor = this.editor;
		editor.editing.view.addObserver(ClickObserver);
		this._balloon = editor.plugins.get(ContextualBalloon);

		this._createViewPopup();
		this._createEditPopup();

		this._customTags.forEach(customTag => editor.ui.componentFactory.add('custom-tags-' + customTag.tag, locale => {
			const command = editor.commands.get('create-custom-tags-' + customTag.tag);
			const button = new ButtonView(locale);
			button.set({
				label: customTag.tag.toUpperCase(),
				withText: false,
				tooltip: true,
				icon: customTag.icon || tagsIcon,
				class: 'ck-custom-tags-' + customTag.tag
			});
			button.bind('isEnabled', 'isOn').to(command, 'isEnabled', 'value');
			this.listenTo(button, 'execute', () => editor.execute('create-custom-tags-' + customTag.tag));
			return button;
		}));

		this._enableUserBalloonInteractions();
	}

	_createViewPopup() {
		if (this._viewPopup === undefined) {
			this._viewPopup = new ViewPopup(this.editor.locale)
			this._viewPopup.keystrokes.set('Esc', (data, cancel) => this._cancelPopupOnEscKey(cancel));
			this.listenTo(this._viewPopup, 'edit', () => {
				this._balloon.remove(this._viewPopup);
				const element = this._getSelectedElement();
				this._createEditPopup(getTagAttributes(element), true);
				this._balloon.add({
					view: this._editPopup,
					position: this._getBalloonPositionData()
				});
				this._editPopup.tagLabelView.set('text', element.name);
			});
		}
		return this._viewPopup;
	}

	_createEditPopup(attributes, force) {
		if (!!force) {
			this._editPopup = undefined;
		}
		if (this._editPopup === undefined) {
			this._editPopup = new EditPopup(this.editor.locale, attributes);
			this._editPopup.keystrokes.set('Esc', (data, cancel) => this._cancelPopupOnEscKey(cancel));
			this.listenTo(this._editPopup, 'submit', () => {
				this.editor.execute('update-custom-tags', this._getSelectedElement(), this._editPopup.attributes);
				this._hideUI();
			});
			this.listenTo(this._editPopup, 'cancel', () => this._hideUI());
		}
		return this._editPopup;
	}

	_cancelPopupOnEscKey(cancel) {
		this._hideUI();
		cancel();
	}

	_getSelectedElement() {
		const selection = this.editor.editing.view.document.selection;
		let element = selection.getSelectedElement();
		if (!element) {
			element = selection.getFirstPosition().parent;
		}
		else if (element.is('containerElement') && !!element.getCustomProperty('isBookmark')) {
			element =  undefined;
		}
		if (element) {
			while (element && (!element.name || this._customTags.findIndex(customTag => customTag.tag == element.name) < 0)) {
				element = element.parent;
				if (element && (element.name == 'figure' || element.name == 'figcaption')) {
					element =  undefined;
				}
			}
		}
		return element && element.is('containerElement') && !!element.getCustomProperty('isCustomTag')
			? element
			: undefined;
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const element = this._getSelectedElement();
		const target = element
			? view.domConverter.mapViewToDom(element)
			: view.domConverter.viewRangeToDom(view.document.selection.getFirstRange());
		return { target };
	}

	_enableUserBalloonInteractions() {
		const editor = this.editor;
		this.listenTo(editor.editing.view.document, 'click', () => this._showUI(this._getSelectedElement()));
		editor.keystrokes.set('Esc', (data, cancel) => {
			if (this._balloon.hasView(this._viewPopup) || (this._editPopup !== undefined && this._balloon.hasView(this._editPopup))) {
				this._cancelPopupOnEscKey(cancel);
			}
		});

		clickOutsideHandler({
			emitter: this._viewPopup,
			activator: () => this._balloon.visibleView === this._viewPopup || (this._editPopup !== undefined && this._balloon.visibleView == this._editPopup),
			contextElements: [this._balloon.view.element],
			callback: () => this._hideUI()
		});
	}

	_showUI(element) {
		if (element && !this._balloon.hasView(this._viewPopup)) {
			this._viewPopup.tagLabelView.set('text', element.name);
			this._balloon.add({
				view: this._viewPopup,
				position: this._getBalloonPositionData()
			});
		}
	}

	_hideUI() {
		if (this._balloon.hasView(this._viewPopup)) {
			this._balloon.remove(this._viewPopup);
		}
		if (this._editPopup !== undefined && this._balloon.hasView(this._editPopup)) {
			this._balloon.remove(this._editPopup);
			this._editPopup = undefined;
		}
		this.editor.editing.view.focus();
	}

}

class CreateCustomTagsCommand extends Command {

	constructor(editor, tag, placeholder, attributes) {
		super(editor);
		this.tag = tag;
		this.placeholder = placeholder;
		this.attributes = attributes;
	};

	execute() {
		const model = this.editor.model;
		model.change(writer => {
			const element = writer.createElement(this.tag, this.attributes);
			model.insertContent(element, model.document.selection.getFirstPosition());
			if (this.tag === 'div' || this.tag === 'section') {
				const placeholder = writer.createElement('paragraph');
				writer.appendText(this.placeholder, placeholder);
				writer.append(placeholder, element);
				writer.setSelection(placeholder, 'on');
			}
			else {
				writer.appendText(this.placeholder, element);
				writer.setSelection(element, 'on');
			}
		});
	};
	
}

class UpdateCustomTagsCommand extends Command {
	
	execute(viewElement, updatedAttributes) {
		const editor = this.editor;
		const model = editor.model;
		const modelElement = editor.editing.mapper.toModelElement(viewElement);
		if (viewElement && modelElement) {
			const currentAttributes = getTagAttributes(viewElement);
			model.change(writer => {
				Array.from(currentAttributes.keys()).forEach(name => {
					if ((updatedAttributes.get(name) || '').trim() == '') {
						writer.removeAttribute(name, modelElement);
					}
				});
				updatedAttributes.forEach((value, name) => writer.setAttribute(name, value, modelElement));
			});
		}
	};

	refresh() {
		this.isEnabled = true;
	}
	
}
