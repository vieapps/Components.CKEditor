// ckeditor5-bookmark
// Author: RasmusRummel
// Repo: https://github.com/RasmusRummel/ckeditor5-bookmark

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import ViewPopup from './popup.view';
import EditPopup from './popup.edit';
import bookmarkCss from '../assets/bookmark.css';
import bookmarkIcon from '../assets/icons/bookmark.svg';

/** Allow to update a bookmark */
export default class Bookmark extends Plugin {

	constructor(editor) {
		super(editor);
		editor.config.define('bookmark');
	}

	static get requires() {
		return [BookmarkEditing, BookmarkUI];
	}

	static get pluginName() {
		return 'Bookmark';
	}
	
}

class BookmarkEditing extends Plugin {

	constructor(editor) {
		super(editor);
		this._css = (editor.config.get('bookmark') || {}).css;
	}

	init() {
		const editor = this.editor;

		// schema
		editor.model.schema.register(
			'bookmark',
			{
				allowWhere: '$text',
				isLimit: true,
				isInline: true,
				isObject: true,
				allowAttributes: ['name', 'class']
			}
		);

		// conversions
		const conversion = editor.conversion;
		conversion.attributeToAttribute({
			model: {
				name: 'bookmark',
				key: 'name'
			},
			view: {
				key: 'name'
			}
		});

		conversion.for('upcast').elementToElement({
			view: {
				name: 'a',
				attributes: {
					name: true
				}
			},
			model: (viewElement, { writer: modelWriter }) => {
				const name = viewElement.getAttribute('name');
				var bookmark = modelWriter.createElement('bookmark', { name });
				return bookmark;
			}
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'bookmark',
			view: (modelItem, { writer: viewWriter }) => {
				const name = modelItem.getAttribute('name');
				const bookmark = viewWriter.createContainerElement('span', { name, class: 'ck-bookmark' });
				viewWriter.setCustomProperty('isBookmark', true, bookmark);
				return toWidget(bookmark, viewWriter);
			}
		});

		conversion.for('dataDowncast').elementToElement({
			model: 'bookmark',
			view: (modelItem, { writer: viewWriter }) => {
				const name = modelItem.getAttribute('name');
				const bookmark = viewWriter.createAttributeElement('a', { name, class: 'bookmark' + (this._css && this._css !== '' ? ' ' + this._css : '') });
				return bookmark;
			}
		});

		// commands
		editor.commands.add('bookmark', new UpdateBookmarkCommand(editor));
		editor.commands.add('deleteBookmark', new DeleteBookmarkCommand(editor));
	}

}

class BookmarkUI extends Plugin {

	static get requires() {
		return [ContextualBalloon];
	}

	static get pluginName() {
		return 'BookmarkUI';
	}

	init() {
		const editor = this.editor;

		editor.editing.view.addObserver(ClickObserver);
		this._balloon = editor.plugins.get(ContextualBalloon);

		this._viewPopup = this._createViewPopup();
		this._editPopup = this._createEditPopup();

		editor.ui.componentFactory.add('bookmark', locale => {
			const command = editor.commands.get('bookmark');
			const button = new ButtonView(locale);
			button.set({
				label: 'Bookmark',
				tooltip: true,
				icon: bookmarkIcon
			});
			button.bind('isEnabled', 'isOn').to(command, 'isEnabled', 'isBookmark');

			this.listenTo(button, 'execute', () => {
				this.editor.execute('bookmark');
				this._showUI(this._getSelectedElement());
			});

			return button;
		});

		this._enableUserBalloonInteractions();
	}

	_createViewPopup() {
		const editor = this.editor;

		const popup = new ViewPopup(editor.locale)
		popup.nameLabelView.bind('text').to(editor.commands.get('bookmark'), 'value');
		popup.keystrokes.set('Esc', (data, cancel) => {
			this._hideUI();
			cancel();
		});

		this.listenTo(popup, 'edit', () => {
			this._balloon.remove(this._viewPopup);
			this._balloon.add({
				view: this._editPopup,
				position: this._getBalloonPositionData()
			});
			this._editPopup.nameInputView.select();
		});

		this.listenTo(popup, 'delete', () => {
			this.editor.execute('deleteBookmark');
			this._hideUI();
		});

		return popup;
	}

	_createEditPopup() {
		const editor = this.editor;

		const popup = new EditPopup(editor.locale);
		popup.nameInputView.bind('value').to(editor.commands.get('bookmark'), 'value');
		popup.keystrokes.set('Esc', (data, cancel) => {
			this._hideUI();
			cancel();
		});

		this.listenTo(popup, 'submit', () => {
			this.editor.execute('bookmark', popup.nameInputView.element.value);
			this._hideUI();
		});

		this.listenTo(popup, 'cancel', () => this._hideUI());

		return popup;
	}

	_getSelectedElement() {
		const element = this.editor.editing.view.document.selection.getSelectedElement();
		return element && element.is('containerElement') && !!element.getCustomProperty('isBookmark')
			? element
			: undefined;
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
		editor.keystrokes.set('Esc', (data, cancel) => {
			if (this._balloon.hasView(this._viewPopup) || this._balloon.hasView(this._editPopup)) {
				this._hideUI();
				cancel();
			}
		});

		clickOutsideHandler({
			emitter: this._editPopup,
			activator: () => this._balloon.visibleView === this._editPopup || this._balloon.visibleView == this._viewPopup,
			contextElements: [this._balloon.view.element],
			callback: () => this._hideUI()
		});
	}

	_showUI(element) {
		if (element) {
			if (element.getAttribute('name')) {
				if (!this._balloon.hasView(this._viewPopup)) {
					this._balloon.add({
						view: this._viewPopup,
						position: this._getBalloonPositionData()
					});
				}
			}
			else if (!this._balloon.hasView(this._editPopup)) {
				this._balloon.add({
					view: this._editPopup,
					position: this._getBalloonPositionData()
				});
				this._editPopup.nameInputView.select();
			}
		}
	}

	_hideUI() {
		if (this._balloon.hasView(this._viewPopup)) {
			this._balloon.remove(this._viewPopup);
		}
		if (this._balloon.hasView(this._editPopup)) {
			this._balloon.remove(this._editPopup);
		}
		this.editor.editing.view.focus();
	}

}

class UpdateBookmarkCommand extends Command {
	
	constructor(editor) {
		super(editor);
		this.isBookmark = false;
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
		this.isEnabled = model.schema.checkChild(selection.focus.parent, 'bookmark');
	}
	
}

class DeleteBookmarkCommand extends Command {
	
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;
		model.change(writer => {
			if (!selection.isCollapsed) {
				const element = selection.getSelectedElement();
				if (element && element.is('element') && element.hasAttribute('name')) {
					// on the Model => bookmark is an Element
					// on the View => bookmark is an attributeElement
					writer.remove(element);
				}
			}
		});
	}

	refresh() {
		// MUST always be true, otherwise the command cannot execute;
		this.isEnabled = true;
	}

}