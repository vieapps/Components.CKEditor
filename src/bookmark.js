import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BookmarkEditing from './bookmark.editing';
import BookmarkUI from './bookmark.ui';

// ckeditor5-bookmark of RasmusRummel => https://github.com/RasmusRummel/ckeditor5-bookmark

export default class Bookmark extends Plugin {

	static get requires() {
		return [BookmarkEditing, BookmarkUI];
	}

	static get pluginName() {
		return 'Bookmark';
	}
}
