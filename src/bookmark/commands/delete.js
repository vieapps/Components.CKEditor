import Command from '@ckeditor/ckeditor5-core/src/command';

export default class BookmarkDeleteCommand extends Command {
	
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change(modelWriter => {
			if (!selection.isCollapsed) {
				const element = selection.getSelectedElement();
				if (element && element.is('element') && element.hasAttribute('name')) {
					// on the Model, bookmark is an Element (while on the View, bookmark is an attributeElement)
					modelWriter.remove(element);
				}
			}
		});
	}

	refresh() {
		// MUST always be true, otherwise the command cannot execute;
		this.isEnabled = true;
	}

}
