import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import mediaIcon from '../assets/icons/media.svg';

/** Allow to select a uploaded media file */
export default class MediaSelector extends Plugin {

	static get pluginName() {
		return 'MediaSelector';
	}

	init() {
		// setup `mediaSelector` button
		const config = this.editor.config.get('media.selector');
		this.editor.ui.componentFactory.add('mediaSelector', locale => {
			// create button
			const button = new ButtonView(locale);
			button.set({
				label: (config || {}).label || 'Insert an uploaded media',
				icon: mediaIcon,
				tooltip: true
			});

			// probably this button should be also disabled when the link command is disabled, so try setting editor.isReadOnly = true to see it in action
			const command = this.editor.commands.get('mediaEmbed');
			button.bind('isEnabled').to(command);

			// call the outside handler to select a media (image, video or audio)
			button.on('execute', () => {
				if (config === undefined || config === null || typeof config.selectMedia !== 'function') {
					console.warn('The configuration of the media selector button is undefined or invalid (no "selectMedia" function)', config);
				}
				else {
					config.selectMedia((link, type, href) => {
						if (link && link !== '') {
							this.editor.model.change(writer => {
								if (type === undefined || type === null || type === 'image') {
									this.editor.model.insertContent(writer.createElement('image', { src: link, linkHref: href || link, linkAddInlinePopupCssClass: true }));
								}
								else {
									try {
										command.execute(link);
									}
									catch (error) {
										console.error('Error occurred while inserting an embed media', error);
									}
								}
							});
						}
					});
				}
			});

			return button;
		});
	}
}