import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import BookmarkEditing from './editing';
import BookmarkUI from './ui';

// ckeditor5-bookmark of RasmusRummel => https://github.com/RasmusRummel/ckeditor5-bookmark

export default class Bookmark extends Plugin {
	/**
	 * @inheritDoc
	 */
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
