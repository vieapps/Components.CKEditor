import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FontBackgroundColorEditing from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor/fontbackgroundcolorediting';
import { FONT_BACKGROUND_COLOR } from '@ckeditor/ckeditor5-font/src/utils';
import fontBackgroundColorIcon from '@ckeditor/ckeditor5-font/theme/icons/font-background.svg';
import ColorUI from './color.ui';

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
