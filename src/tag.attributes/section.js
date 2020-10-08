import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { defineSchemasAndConversions } from './utils';

/** Allow a SECTION tag have all attributes */
export default class SectionTagAttributes extends Plugin {

	constructor(editor) {
		super(editor);
		this.tag = 'section';
	}

	static get pluginName() {
		return 'SectionTagAttributes';
	}

	init() {
		defineSchemasAndConversions(this.editor, this.tag);
	}

}