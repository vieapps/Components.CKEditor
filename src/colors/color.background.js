import { Plugin } from 'ckeditor5';
import { FontBackgroundColorEditing } from 'ckeditor5';
const FONT_BACKGROUND_COLOR = 'fontBackgroundColor';
import { IconFontBackground as fontBackgroundColorIcon } from 'ckeditor5';
import ColorUI from './color.ui.js';

export default class FontColor extends Plugin {
	static get requires() {
		return [ FontBackgroundColorEditing, FontBackgroundColorUI ];
	}
	static get pluginName() {
		return 'FontBackgroundColor';
	}
}

class FontBackgroundColorUI extends ColorUI {
	constructor(editor) {
		const t = editor.locale.t;
		super(editor, {
			commandName: FONT_BACKGROUND_COLOR,
			componentName: FONT_BACKGROUND_COLOR,
			icon: fontBackgroundColorIcon,
			dropdownLabel: t('Font Background Color')
		});
	}
	static get pluginName() {
		return 'FontBackgroundColorUI';
	}
}
