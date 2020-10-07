import View from '@ckeditor/ckeditor5-ui/src/view';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import unlinkIcon from '@ckeditor/ckeditor5-link/theme/icons/unlink.svg';

export default class ViewPopup extends View {

	constructor(locale) {
		super(locale);
		this.keystrokes = new KeystrokeHandler();

		this.nameLabel = new LabelView(locale);
		this.editButtonView = this._createButton(locale.t('Edit link').split(' ')[0], pencilIcon, 'edit');
		this.deleteButtonView = this._createButton(locale.t('Unlink').split(' ')[0], unlinkIcon, 'delete');

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck-bookmark-view']
			},
			children: [
				this.nameLabel,
				this.editButtonView,
				this.deleteButtonView
			]
		});
	}

	render() {
		super.render();
		this.keystrokes.listenTo(this.element);
	}

	_createButton(label, icon, event) {
		const button = new ButtonView(this.locale);
		button.set({
			label,
			icon,
			tooltip: true
		});
		button.delegate('execute').to(this, event);
		return button;
	}

}