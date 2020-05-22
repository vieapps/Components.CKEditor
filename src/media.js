import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import mediaIcon from '@ckeditor/ckeditor5-media-embed/theme/icons/media-placeholder.svg';

/**
 * @extends module:core/plugin~Plugin
 */
export default class MediaSelector extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MediaSelector';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// get editor
		const editor = this.editor;

		// setup `mediaSelector` button
		const config = editor.config.get('media.selector');
		editor.ui.componentFactory.add('mediaSelector', locale => {
			// create button
			const mediaButton = new ButtonView(locale);
			mediaButton.set({
				label: (config || {}).label || 'Insert an uploaded media',
				icon: mediaIcon,
				tooltip: true
			});

			// probably this button should be also disabled when the link command is disabled, so try setting editor.isReadOnly = true to see it in action
			const mediaCommand = this.editor.commands.get('mediaEmbed');
			mediaButton.bind('isEnabled').to(mediaCommand);

			// call the outside handler to select a media (image, video or audio)
			mediaButton.on('execute', () => {
				if (config === undefined || config === null || typeof config.selectMedia !== 'function') {
					console.warn('The configuration of the media selector button is undefined or invalid (no "selectMedia" function)', config);
				}
				else {
					config.selectMedia((link, type) => {
						if (link !== undefined && link !== null && link !== '') {
							editor.model.change(writer => {
								if (type === undefined || type === null || type === 'image') {
									editor.model.insertContent(writer.createElement('image', { src: link }));
								}
								else {
									try {
										mediaCommand.execute(link);
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

			return mediaButton;
		});
	}
}