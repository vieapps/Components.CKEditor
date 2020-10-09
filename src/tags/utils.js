import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

/** Defines the schema for a custom tag */
export function defineTagSchema(editor, tag, schema) {
	// allow elements with tag name in the model
	const isDivOrSection = tag === 'div' || tag === 'section';
	editor.model.schema.register(
		tag,
		schema || {
			isObject: true,
			isBlock:  true,
			allowIn: isDivOrSection ? '$root' : '$block',
			allowContentOf: isDivOrSection ? '$root' : '$block'
		}
	);
	if (isDivOrSection || (schema && !!schema.isBlock)) {
		editor.model.schema.extend('$block', { allowIn: tag });
	}
	else {
		editor.model.schema.extend('$text', { allowIn: tag });
	}

	// allow elements in the model to have all attributes
	editor.model.schema.addAttributeCheck(context => {
		if (context.endsWith(tag)) {
			return true;
		}
	});
}

/** Defines the schema for a custom tag */
export function defineTagConversions(editor, tag, upcast, editingDowncast, dataDowncast) {
	// the view-to-model converter converting a view with all its attributes to the model
	editor.conversion.for('upcast').elementToElement(upcast || {
		view: tag,
		model: (viewElement, { writer: modelWriter }) => {
			return modelWriter.createElement(tag, viewElement.getAttributes());
		}
	});

	// the model-to-view converter for the element (attributes are converted separately)
	editor.conversion.for('editingDowncast').elementToElement(editingDowncast || {
		model: tag,
		view: (modelItem, { writer: viewWriter }) => {
			const element = viewWriter.createContainerElement(tag);
			viewWriter.setCustomProperty('isCustomTag', true, element);
			return toWidgetEditable(element, viewWriter);
		}
	});

	editor.conversion.for('dataDowncast').elementToElement(dataDowncast || {
		model: tag,
		view: tag
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

/** Gets the attributes of an element (that belong to a custom tag) */
export function getTagAttributes(element) {
	const tagAttributes = new Map();
	const classes = Array.from((element._classes || new Set()).values());
	if (classes.length > 0) {
		tagAttributes.set('class', classes.join(' '));
	}
	const styles = (element._styles || {})._styles || {};
	let style = '';
	Object.keys(styles).forEach(name => style += name + ':' + styles[name] + ';');
	if (style !== '') {
		tagAttributes.set('style', style);
	}
	const attributes = element._attrs || new Map();
	attributes.forEach((value, name) => {
		if (!styles[name]) {
			tagAttributes.set(name, value);
		}
	});
	tagAttributes.delete('contenteditable');
	return tagAttributes;
}