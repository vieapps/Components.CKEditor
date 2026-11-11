import { Plugin } from 'ckeditor5';
import { ButtonView } from 'ckeditor5';
import { IconRemoveFormat as removeIcon } from 'ckeditor5';
import '../cke/remove.tags.css';

/** Remove all tags (except P tags) */
export default class RemoveTags extends Plugin {

	static get pluginName() {
		return 'RemoveTags';
	}

	init() {
		// setup `removeTags` button
		const config = this.editor.config.get('remove.tags');
		this.editor.ui.componentFactory.add('removeTags', locale => {
			// create button
			const button = new ButtonView(locale);
			button.set({
				label: (config || {}).label || locale.t('Remove all tags (except P tags)'),
				icon: removeIcon,
				tooltip: true,
				class: 'ck-remove-tags'
			});

			// get data of editor, remove all tags (except P tags) and re-set data of the editor
			button.on('execute', () => {
				let html = this.editor.getData() || '';
				html = html.replace(/\<p\>/gi, '[p]').replace(/\<\/p\>/gi, '[/p]');
				html = html.replace(/(<([^>]+)>)/gi, '');
				html = html.replace(/\[p\]/gi, '<p>').replace(/\[\/p\]/gi, '</p>');
				html = html.replace(/\<p\>\<\/p\>/gi, '').replace(/\<p\>\&nbsp;\<\/p\>/gi, '');
				html = html.replace(/\<\/p\>\&nbsp;\<p\>/gi, '</p><p>').replace(/\&nbsp;\<\/p\>/gi, '</p>');
				this.editor.setData(html);
			});

			return button;
		});
	}
}