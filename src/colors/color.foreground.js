import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontColorEditing from '@ckeditor/ckeditor5-font/src/fontcolor/fontcolorediting';
import { FONT_COLOR } from '@ckeditor/ckeditor5-font/src/utils';
import fontColorIcon from '@ckeditor/ckeditor5-font/theme/icons/font-color.svg';
import ColorUI from './color.ui';

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
