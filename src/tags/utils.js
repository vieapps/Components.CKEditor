import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

/** Defines the schema for a tag */
export function defineSchema(editor, tag, schema, dontAddAttributeCheck) {
	// allow elements with tag name in the model
	const isDivOrSection = tag === 'div' || tag === 'section';
	editor.model.schema.register(
		tag,
		schema || {
			isObject: true,
			isBlock: isDivOrSection,
			isLimit: !isDivOrSection,
			allowContentOf: isDivOrSection ? '$root' : '$block',
			allowWhere: isDivOrSection ? '$block' : '$text'
		}
	);
	if (isDivOrSection || (schema && !!schema.isBlock)) {
		editor.model.schema.extend('$block', { allowIn: tag });
	}
	else {
		editor.model.schema.extend('$text', { allowIn: tag });
	}

	// allow elements in the model to have all attributes
	if (!dontAddAttributeCheck) {
		editor.model.schema.addAttributeCheck(context => {
			if (context.endsWith(tag)) {
				return true;
			}
		});
	}
}

/** Defines the conversions for a tag */
export function defineConversions(editor, tag, upcast, dataDowncast, editingDowncast, dontAddAttributeConversions) {
	// the view-to-model converter converting a view with all its attributes to the model
	editor.conversion.for('upcast').elementToElement(upcast || {
		view: tag,
		model: (viewElement, { writer: modelWriter }) => {
			return modelWriter.createElement(tag, viewElement.getAttributes());
		}
	});

	// the model-to-view converter for the element (attributes are converted separately)
	editor.conversion.for('dataDowncast').elementToElement(dataDowncast || {
		model: tag,
		view: tag
	});

	editor.conversion.for('editingDowncast').elementToElement(editingDowncast || {
		model: tag,
		view: (modelItem, { writer: viewWriter }) => {
			const element = viewWriter.createContainerElement(tag);
			viewWriter.setCustomProperty('isCustomTag', true, element);
			return toWidgetEditable(element, viewWriter);
		}
	});

	// the model-to-view converter for the element attributes (note that a lower-level, event-based API is used here)
	if (!dontAddAttributeConversions) {
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

/** Gets all available attributes of a tag */
export function getAttributes(element, getAll) {
	const tagAttributes = new Map();
	const classes = Array.from((element._classes || new Set()).values());
	if (classes.length > 0) {
		tagAttributes.set('class', classes.join(' '));
	}
	const styles = (element._styles || {})._styles || {};
	let style = '';
	Object.keys(styles).forEach(name => {
		const value = styles[name];
		style += value && typeof value == 'string' ? `${name}:${value};` : '';
	});
	const background = styles.background;
	if (background) {
		Object.keys(background).forEach(name => style += `background-${name}:${background[name]};`);
	}
	const margin = styles.margin;
	if (margin) {
		Object.keys(margin).forEach(name => style += `margin-${name}:${margin[name]};`);
	}
	const padding = styles.padding;
	if (padding) {
		Object.keys(padding).forEach(name => style += `padding-${name}:${padding[name]};`);
	}
	const border = styles.border;
	if (border && border.color && border.style && border.width) {
		Object.keys(border.width).forEach(name => style += `border-${name}:${border.width[name]} ${border.style[name]} ${border.color[name]};`);
	}
	if (style !== '') {
		tagAttributes.set('style', style);
	}
	const attributes = element._attrs || new Map();
	attributes.forEach((value, name) => {
		if (getAll) {
			tagAttributes.set(name, value);
		}
		else if (!styles[name] && !name.startsWith('background') && !name.startsWith('block') && name != 'alignment' && name != 'padding') {
			tagAttributes.set(name, value);
		}
	});
	tagAttributes.delete('contenteditable');
	return tagAttributes;
}