import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import BookmarkCommand from './commands/create';
import BookmarkDeleteCommand from './commands/delete';
import BookmarkCss from '../assets/bookmark.css';

export default class BookmarkEditing extends Plugin {

	static get requires() {
		return [Widget];
	}

	init() {
		const editor = this.editor;
		const config = editor.config.get('bookmark') || {};
		this._defineSchema();
		this._defineConverters();
		this._css = config.css;
		editor.commands.add('bookmark', new BookmarkCommand(editor));
		editor.commands.add('deleteBookmark', new BookmarkDeleteCommand(editor));
	}

	_defineSchema() {
		this.editor.model.schema.register(
			'bookmark',
			{
				allowWhere: '$text',
				isLimit: true,
				isInline: true,
				isObject: true,
				allowAttributes: ['name', 'class', 'target']
			}
		);
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

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
				viewWriter.setCustomProperty('bookmarkName', true, bookmark);
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
	}

}