import Command from '@ckeditor/ckeditor5-core/src/command';

export default class BookmarkCommand extends Command {
	constructor(editor) {
		super(editor);
		this.set("isBookmark", false);
	}

	execute(bookmarkName) {
		const editor = this.editor;
		const modelSelection = this.editor.model.document.selection;

		editor.model.change(modelWriter => {
			if (modelSelection.isCollapsed) {
				bookmarkName = bookmarkName || '';
				const bookmark = modelWriter.createElement('bookmark', { name: bookmarkName });
				editor.model.insertContent(bookmark);
				modelWriter.setSelection(bookmark, 'on');
			}
			else {
				const element = modelSelection.getSelectedElement();
				if (element && element.is('element')) {
					if (element.hasAttribute('name')) {
						modelWriter.setAttribute('name', bookmarkName, element);
					}
				}
			}
		});
	}

	refresh() {
		this.isBookmark = false;

		const model = this.editor.model;
		const modelDocument = model.document;
		const selectedElement = modelDocument.selection.getSelectedElement();

		if (selectedElement) {
			this.value = selectedElement.getAttribute('name');
			this.isBookmark = selectedElement.hasAttribute('name');
		}
		else {
			this.value = null;
			this.isBookmark = false;
		}

		const isAllowed = model.schema.checkChild(modelDocument.selection.focus.parent, 'bookmark');
		this.isEnabled = isAllowed;
	}
}