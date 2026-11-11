import { Plugin } from 'ckeditor5';
import { Widget } from 'ckeditor5';
import { Command } from 'ckeditor5';
import { ButtonView } from 'ckeditor5';
import { ClickObserver } from 'ckeditor5';
import { ContextualBalloon } from 'ckeditor5';
import { clickOutsideHandler } from 'ckeditor5';
import { toWidgetEditable } from 'ckeditor5';

import ViewPopup from './popup.view.js';
import EditPopup from './popup.edit.js';
import '../cke/custom.tags.css';
import tagsIcon from '../cke/icons/tag.svg?raw';
import boxIcon from '../cke/icons/box.svg?raw';

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

	static get requires() {
		return [Widget];
	}

	init() {
		const editor = this.editor;
		const config = editor.config.get('customTags') || {};
		const customTags = config.tags || [];
		customTags.forEach(customTag => {
			this._defineSchema(customTag.tag);
			this._defineConversions(customTag.tag);
			editor.commands.add('create-custom-tags-' + customTag.tag, new CreateCustomTagsCommand(editor, customTag.tag, this._get(customTag.placeholder, customTag.tag), this._get(customTag.attributes, {})));
		});

		(config.included || []).forEach(tag => {
			try {
				this._defineSchema(tag);
				this._defineConversions(tag);
			}
			catch (error) {
				console.error('Cannot define schema and conversions of a tag', tag, error);
			}
		});

		editor.commands.add('update-custom-tags', new UpdateCustomTagsCommand(editor));
		editor.commands.add('select-custom-tags', new SelectCustomTagsCommand(editor));
	}

	_get(input, defaultValue) {
		return typeof input !== 'undefined' && (input || input === false || input === 0)
			? input
			: defaultValue;
	}

	_defineSchema(tag) {
		const editor = this.editor;
		const isDivOrSection = tag === 'div' || tag === 'section';

		// allow elements with tag name in the model
		editor.model.schema.register(
			tag,
			{
				isObject: true,
				isBlock: isDivOrSection,
				isLimit: !isDivOrSection,
				allowContentOf: isDivOrSection ? '$root' : '$block',
				allowWhere: isDivOrSection ? '$block' : '$text'
			}
		);
		editor.model.schema.extend(isDivOrSection ? '$block' : '$text', { allowIn: tag });
	
		// allow elements in the model to have all attributes
		editor.model.schema.addAttributeCheck(context => {
			if (context.endsWith(tag)) {
				return true;
			}
		});
	}

	_defineConversions(tag) {
		const editor = this.editor;

		// the view-to-model converter converting a view with all its attributes to the model
		editor.conversion.for('upcast').elementToElement({
			view: tag,
			model: (viewElement, { writer: modelWriter }) => {
				return modelWriter.createElement(tag, viewElement.getAttributes());
			}
		});
	
		// the model-to-view converter for the element (attributes are converted separately)
		editor.conversion.for('dataDowncast').elementToElement({
			model: tag,
			view: tag
		});
	
		editor.conversion.for('editingDowncast').elementToElement({
			model: tag,
			view: (modelItem, { writer: viewWriter }) => {
				const element = viewWriter.createContainerElement(tag);
				viewWriter.setCustomProperty('isCustomTag', true, element);
				return toWidgetEditable(element, viewWriter);
			}
		});
	
		// the model-to-view converter for the element attributes (note that a lower-level, event-based API is used here)
		editor.conversion.for('downcast').add(dispatcher => dispatcher.on('attribute', (event, data, conversionApi) => {
			if (data.item.name == tag) {
				// in the model-to-view conversion we convert changes, an attribute can be added or removed or changed
				const writer = conversionApi.writer;
				const view = conversionApi.mapper.toViewElement(data.item);
				if (data.attributeNewValue) {
					writer.setAttribute(data.attributeKey, data.attributeNewValue, view);
				}
				else {
					writer.removeAttribute(data.attributeKey, view);
				}
			}
		}));
	}

}

class CustomTagsUI extends Plugin {
	
	constructor(editor) {
		super(editor);
		const config = editor.config.get('customTags') || {};
		const customTags = config.tags || [];
		this.knownTags = new Set(customTags.map(customTag => customTag.tag).concat(config.included || []));
		this.bypassTags = new Set(config.excluded || []);
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

		const config = editor.config.get('customTags') || {};
		const customTags = config.tags || [];
		customTags.forEach(customTag => editor.ui.componentFactory.add('custom-tags-' + customTag.tag, locale => {
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

		if (customTags.findIndex(customTag => customTag.tag == 'div') > -1) {
			editor.ui.componentFactory.add('box', locale => {
				const command = editor.commands.get('create-custom-tags-div');
				const button = new ButtonView(locale);
				button.set({
					label: locale.t('Box'),
					withText: false,
					tooltip: true,
					icon: boxIcon
				});
				button.bind('isEnabled', 'isOn').to(command, 'isEnabled', 'value');
				this.listenTo(button, 'execute', () => editor.execute('create-custom-tags-div', { class: 'special box right', style: 'width:300px;' }, 'Box Content', 'Box Title'));
				return button;
			});
		}

		this._createViewPopup();
		this._enableUserBalloonInteractions();
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
		editor.keystrokes.set('Esc', (data, cancel) => this._cancelPopupOnEscKey(cancel));

		clickOutsideHandler({
			emitter: this._viewPopup,
			activator: () => this._balloon.visibleView === this._viewPopup || (this._editPopup !== undefined && this._balloon.visibleView == this._editPopup),
			contextElements: [this._balloon.view.element],
			callback: () => this._hideUI()
		});
	}

	_cancelPopupOnEscKey(cancel) {
		this._hideUI();
		cancel();
	}

	_createViewPopup() {
		const editor = this.editor;
		this._viewPopup = new ViewPopup(editor.locale)
		this._viewPopup.keystrokes.set('Esc', (data, cancel) => this._cancelPopupOnEscKey(cancel));
		this.listenTo(this._viewPopup, 'edit', () => {
			this._balloon.remove(this._viewPopup);
			this._balloon.add({
				view: this._createEditPopup(),
				position: this._getBalloonPositionData()
			});
		});
		this.listenTo(this._viewPopup, 'createParagraphBefore', () => {
			const viewElement = this._getSelectedElement();
			const modelElement = viewElement ? editor.editing.mapper.toModelElement(viewElement) : undefined;
			if (modelElement) {
				editor.execute('insertParagraph', { position: editor.model.createPositionBefore(modelElement) });
				this._hideUI();
			}
		});
		this.listenTo(this._viewPopup, 'createParagraphAfter', () => {
			const viewElement = this._getSelectedElement();
			const modelElement = viewElement ? editor.editing.mapper.toModelElement(viewElement) : undefined;
			if (modelElement) {
				editor.execute('insertParagraph', { position: editor.model.createPositionAfter(modelElement) });
				this._hideUI();
			}
		});
		this.listenTo(this._viewPopup, 'select', () => {
			this.editor.execute('select-custom-tags', this._getSelectedElement());
			this._hideUI();
		});
		this.listenTo(this._viewPopup, 'cancel', () => this._hideUI());
	}

	_createEditPopup() {
		const element = this._getSelectedElement();
		this._editPopup = new EditPopup(this.editor.locale, element.name, this._getAttributes(element));
		this._editPopup.keystrokes.set('Esc', (data, cancel) => this._cancelPopupOnEscKey(cancel));
		this.listenTo(this._editPopup, 'submit', () => {
			this.editor.execute('update-custom-tags', element, this._getAttributes(element, true), this._editPopup.attributes);
			this._hideUI();
		});
		this.listenTo(this._editPopup, 'cancel', () => this._hideUI());
		return this._editPopup;
	}

	_getAttributes(element, getAll) {
		const attributes = new Map(element ? element.getAttributes() : []);
		attributes.delete('contenteditable');
		return attributes;
	}

	_getSelectedElement() {
		const selection = this.editor.model.document.selection;
		let element = selection.getSelectedElement() || selection.getFirstPosition()?.parent;
		while (element) {
			if (this.knownTags.has(element.name)) {
				const view = this.editor.editing.mapper.toViewElement(element);
				return view?.getCustomProperty('isCustomTag') ? view : undefined;
			}
			if (this.bypassTags.has(element.name)) return undefined;
			element = element.parent;
		}
		return undefined;
	}

	_showUI(element) {
		if (element && !this._balloon.hasView(this._viewPopup)) {
			if (this._editPopup !== undefined && this._balloon.hasView(this._editPopup)) {
				this._balloon.remove(this._editPopup);
				this._editPopup = undefined;
			}
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

	execute(attributes, content, title) {
		const model = this.editor.model;
		model.change(writer => {
			const element = writer.createElement(this.tag, attributes || this.attributes);
			model.insertContent(element, model.document.selection.getFirstPosition());
			if (this.tag === 'div' || this.tag === 'section') {
				if (title && title != '') {
					const heading = writer.createElement('heading1');
					writer.appendText(title, heading);
					writer.append(heading, element);
					writer.setSelection(heading, 'on');
				}
				const paragraph = writer.createElement('paragraph');
				writer.appendText(content || this.placeholder, paragraph);
				writer.append(paragraph, element);
				if (!title) {
					writer.setSelection(paragraph, 'on');
				}
			}
			else {
				writer.appendText(content || this.placeholder, element);
				writer.setSelection(element, 'on');
			}
		});
	};
	
}

class UpdateCustomTagsCommand extends Command {
	
	execute(viewElement, currentAttributes, updatedAttributes) {
		const editor = this.editor;
		const modelElement = viewElement ? editor.editing.mapper.toModelElement(viewElement) : undefined;
		if (viewElement && modelElement) {
			editor.model.change(writer => {
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

class SelectCustomTagsCommand extends Command {
	
	execute(viewElement) {
		const editor = this.editor;
		const modelElement = viewElement ? editor.editing.mapper.toModelElement(viewElement) : undefined;
		if (viewElement && modelElement) {
			editor.model.change(writer => writer.setSelection(modelElement, 'on'));
		}
	};

	refresh() {
		this.isEnabled = true;
	}
	
}
