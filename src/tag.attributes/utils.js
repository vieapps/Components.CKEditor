export function defineSchemasAndConversions(editor, tag) {
	// allow elements with tag name in the model
	editor.model.schema.register(
		tag,
		{
			allowWhere: '$block',
			allowContentOf: '$root'
		}
	);

	// allow elements in the model to have all attributes
	editor.model.schema.addAttributeCheck(context => {
		if (context.endsWith(tag)) {
			return true;
		}
	});

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

	// the model-to-view converter for the element attributes
	// note that a lower-level, event-based API is used here
	editor.conversion.for('downcast').add(dispatcher => {
		dispatcher.on('attribute', (event, data, conversionApi) => {
			// convert attributes of the tag only
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
		});
	});
}