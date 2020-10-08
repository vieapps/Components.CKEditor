import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { defineSchemasAndConversions } from './utils';

/** Allow a DIV tag have all attributes */
export default class DivTagAttributes extends Plugin {

	constructor(editor) {
		super(editor);
		this.tag = 'div';
	}

	static get pluginName() {
		return 'DivTagAttributes';
	}

	init() {
		defineSchemasAndConversions(this.editor, this.tag);
	}

}