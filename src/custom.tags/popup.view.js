import View from '@ckeditor/ckeditor5-ui/src/view';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import icon from '../assets/icons/tools.svg';

export default class ViewPopup extends View {

	constructor(locale) {
		super(locale);
		this.keystrokes = new KeystrokeHandler();

		this.tagLabelView = new LabelView(locale);
		this.editButtonView = new ButtonView(this.locale);
		this.editButtonView.set({
			label: 'Update tag attributes',
			icon: icon,
			withText: true,
			tooltip: false
		});
		this.editButtonView.delegate('execute').to(this, 'edit');

		this.setTemplate({
			tag: 'div',
			attributes: {
				class: ['ck ck-form ck-custom-tags']
			},
			children: [
				{
					tag: 'section',
					attributes: {
						class: ['ck ck-form__header']
					},
					children: [
						this.tagLabelView
					]
				},
				{
					tag: 'div',
					attributes: {
						class: ['ck ck-form__row']
					},
					children: [
						this.editButtonView
					]
				}
			]
		});
	}

	render() {
		super.render();
		this.keystrokes.listenTo(this.element);
	}

}