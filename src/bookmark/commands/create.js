import Command from '@ckeditor/ckeditor5-core/src/command';

export default class BookmarkCommand extends Command {
	
	constructor(editor) {
		super(editor);
		this.set("isBookmark", false);
	}

	execute(bookmarkName) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change(modelWriter => {
			if (selection.isCollapsed) {
				bookmarkName = bookmarkName || '';
				const bookmark = modelWriter.createElement('bookmark', { name: bookmarkName });
				model.insertContent(bookmark);
				modelWriter.setSelection(bookmark, 'on');
			}
			else {
				const element = selection.getSelectedElement();
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
		const selection = model.document.selection;
		const element = selection.getSelectedElement();

		if (element) {
			this.value = element.getAttribute('name');
			this.isBookmark = element.hasAttribute('name');
		}
		else {
			this.value = null;
			this.isBookmark = false;
		}

		const isAllowed = model.schema.checkChild(selection.focus.parent, 'bookmark');
		this.isEnabled = isAllowed;
	}
	
}