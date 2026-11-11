import { Plugin, ButtonView, ModelLiveRange } from 'ckeditor5';
import mediaIcon from '../cke/icons/media.svg?raw';

export default class MediaSelector extends Plugin {
	static get pluginName() { return 'MediaSelector'; }
	init() {
		this.pending = new Set();
		this.editor.ui.componentFactory.add('mediaSelector', locale => {
			const editor = this.editor;
			const config = editor.config.get('media.selector');
			const button = new ButtonView(locale);
			button.set({ label: config?.label || locale.t('Insert an uploaded media'), icon: mediaIcon, tooltip: true });
			button.bind('isEnabled').to(editor.commands.get('mediaEmbed'), 'isEnabled');
			this.listenTo(button, 'execute', () => {
				if (typeof config?.selectMedia !== 'function') return;
				const range = ModelLiveRange.fromRange(editor.model.document.selection.getFirstRange());
				this.pending.add(range);
				let completed = false;
				const selected = (link, type, href) => {
					if (completed) return;
					completed = true;
					try {
						if (editor.state === 'destroyed' || editor.state === 'destroying') return;
						if (link) editor.model.change(writer => {
							writer.setSelection(range.toRange());
							if (type == null || type === 'image') {
								const image = writer.createElement('imageBlock', { src: link, linkHref: href || link, linkAddInlinePopupCssClass: true });
								editor.model.insertContent(image);
							}
							else editor.execute('mediaEmbed', link);
						});
						editor.editing.view.focus();
					}
					finally { range.detach(); this.pending.delete(range); }
				};
				try { Promise.resolve(config.selectMedia(selected)).catch(error => { selected(); console.error('Media selector failed', error); }); }
				catch (error) { selected(); console.error('Media selector failed', error); }
			});
			return button;
		});
	}
	destroy() {
		for (const range of this.pending) range.detach();
		this.pending.clear();
		super.destroy();
	}
}
