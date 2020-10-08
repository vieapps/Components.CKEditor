import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

import tagsCss from '../assets/tags.css';
import tagsIcon from '../assets/icons/tag.svg';

export default class CustomTags extends Plugin {

	constructor(editor) {
		super(editor);
		editor.config.define('customTags');
	}

	static get requires() {
		return [CustomTagsUI];
	}

	static get pluginName() {
		return 'CustomTags';
	}
	
}

class CustomTagsUI extends Plugin {

	init() {
		(this.editor.config.get('customTags') || []).forEach(customTag => {
			this._define(
				customTag.tag,
				this._get(customTag.placeholder, customTag.tag),
				this._get(customTag.attributes, {}),
				this._get(customTag.icon, tagsIcon),
				this._get(customTag.inline, false),
				this._get(customTag.editable, true)
			);
		});
	}

	_get(input, defaultValue) {
		return typeof input !== 'undefined' && (input || input === false || input === 0)
			? input
			: defaultValue;
	}

	_define(tag, placeholder, attributes, icon, inline, editable) {
		// schema
		this._defineSchema(tag, inline);
		
		// conversions
		this._defineConversions(tag, editable);

		// command
		this.editor.commands.add('custom-tags-' + tag, new CustomTagsCommand(this.editor, tag, placeholder, attributes));

		// toolbar button
		this._createToolbarButton(tag, icon);
	}

	_defineSchema(tag, inline) {
		const editor = this.editor;

		// allow elements with tag name in the model
		const schema = {
			isObject: true,
			isBlock:  true,
			allowContentOf: '$root'
		};
		if (inline) {
			schema.allowWhere = '$block';
		}
		else {
			schema.allowIn = '$root';
		}
		editor.model.schema.register(tag, schema);
		editor.model.schema.extend('$block', { allowIn: tag });

		// allow elements in the model to have all attributes
		editor.model.schema.addAttributeCheck(context => {
			if (context.endsWith(tag)) {
				return true;
			}
		});
	}

	_defineConversions(tag, editable) {
		const editor = this.editor;

		// the view-to-model converter converting a view with all its attributes to the model
		editor.conversion.for('upcast').elementToElement({
			view: tag,
			model: (viewElement, { writer: modelWriter }) => {
				return modelWriter.createElement(tag, viewElement.getAttributes());
			}
		});

		// the model-to-view converter for the element (attributes are converted separately)
		editor.conversion.for('downcast').elementToElement({
			model: tag,
			view: tag
		});

		editor.conversion.for('editingDowncast').elementToElement(editable
		? {
				model: tag,
				view: (modelItem, { writer: viewWriter }) => {
					const widgetElement = viewWriter.createContainerElement(tag);
					return toWidgetEditable(widgetElement, viewWriter);
				}
			}
		: {
				model: tag,
				view: (modelItem, { writer: viewWriter }) => {
					const widgetElement = viewWriter.createContainerElement(tag);
					return toWidget(widgetElement, viewWriter);
				}
			}
		);

		// the model-to-view converter for the element attributes
		// note that a lower-level, event-based API is used here
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

	_createToolbarButton(tag, icon) {
		const editor = this.editor;
		const name = 'custom-tags-' + tag;
		editor.ui.componentFactory.add(name, locale => {
			const command = editor.commands.get(name);
			const button = new ButtonView(locale);
			button.set({
				label: tag.toUpperCase(),
				withText: false,
				tooltip: true,
				icon: icon,
				class: 'ck-' + name
			});
			button.bind('isOn', 'isEnabled' ).to(command, 'value', 'isEnabled');
			this.listenTo(button, 'execute', () => editor.execute(name));
			return button;
		});
	}

}

class CustomTagsCommand extends Command {

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
			const placeholder = writer.createElement('paragraph');
			writer.appendText(this.placeholder, placeholder);
			writer.append(placeholder, element);
			writer.setSelection(placeholder, 'on');
		});
	};
	
}
