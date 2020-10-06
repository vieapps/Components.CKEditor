import Command from '@ckeditor/ckeditor5-core/src/command';

export default class BookmarkDeleteCommand extends Command {
	execute() {
		const editor = this.editor;
		const modelSelection = this.editor.model.document.selection;

		editor.model.change(modelWriter => {
			if (modelSelection.isCollapsed) {
				return;
			}
			// called from bookmarkui._createViewPopup then the viewPopup fires 'delete'
			else {
				var elmement = modelSelection.getSelectedElement();
				// on the Model, bookmark is an Element (while on the View, bookmark is an attributeElement)
				if (elmement && elmement.is('element')) {
					if (elmement.hasAttribute('name')) {
						modelWriter.remove(elmement);
					}
				}
			}
		});
	}

	refresh() {
			this.isEnabled = true;	// MUST always be true, otherwise the command cannot execute;
	}

}
