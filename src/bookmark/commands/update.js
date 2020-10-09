import Command from '@ckeditor/ckeditor5-core/src/command';

export default class UpdateBookmarkCommand extends Command {
	
	constructor(editor) {
		super(editor);
		this.set("isBookmark", false);
	}

	execute(bookmarkName) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change(writer => {
			if (selection.isCollapsed) {
				bookmarkName = bookmarkName || '';
				const bookmark = writer.createElement('bookmark', { name: bookmarkName });
				model.insertContent(bookmark);
				writer.setSelection(bookmark, 'on');
			}
			else {
				const element = selection.getSelectedElement();
				if (element && element.is('element')) {
					if (element.hasAttribute('name')) {
						writer.setAttribute('name', bookmarkName, element);
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