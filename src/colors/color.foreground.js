import { Plugin } from 'ckeditor5';
import { FontColorEditing } from 'ckeditor5';
const FONT_COLOR = 'fontColor';
import { IconFontColor as fontColorIcon } from 'ckeditor5';
import ColorUI from './color.ui.js';

export default class FontColor extends Plugin {
	static get requires() {
		return [ FontColorEditing, FontColorUI ];
	}
	static get pluginName() {
		return 'FontColor';
	}
}

class FontColorUI extends ColorUI {
	constructor(editor) {
		const t = editor.locale.t;
		super(editor, {
			commandName: FONT_COLOR,
			componentName: FONT_COLOR,
			icon: fontColorIcon,
			dropdownLabel: t('Font Color')
		});
	}
	static get pluginName() {
		return 'FontColorUI';
	}
}
