import { View } from 'ckeditor5';
import { LabelView } from 'ckeditor5';
import { ButtonView } from 'ckeditor5';
import { KeystrokeHandler } from 'ckeditor5';

import { IconPencil as pencilIcon } from 'ckeditor5';
import { IconUnlink as unlinkIcon } from 'ckeditor5';

export default class ViewPopup extends View {

	constructor(locale) {
		super(locale);
		this.keystrokes = new KeystrokeHandler();

		this.nameLabelView = new LabelView(locale);
		this.editButtonView = this._createButton(locale.t('Edit bookmark'), pencilIcon, 'edit');
		this.deleteButtonView = this._createButton(locale.t('Remove bookmark'), unlinkIcon, 'delete');

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck ck-form ck-bookmark']
			},
			children: [
				{
					tag: 'div',
					attributes: {
						class: ['ck ck-form__row']
					},
					children: [
						this.nameLabelView,
						this.editButtonView,
						this.deleteButtonView
					]
				}
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
			label: label,
			icon: icon,
			withText: false,
			tooltip: true
		});
		button.delegate('execute').to(this, event);
		return button;
	}

}