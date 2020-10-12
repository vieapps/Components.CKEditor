import View from '@ckeditor/ckeditor5-ui/src/view';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import updateIcon from '../assets/icons/tools.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

export default class ViewPopup extends View {

	constructor(locale) {
		super(locale);
		this.keystrokes = new KeystrokeHandler();

		this.tagLabelView = new LabelView(locale);
		
		const editButtonView = new ButtonView(locale);
		editButtonView.set({
			label: locale.t('Update tag attributes'),
			icon: updateIcon,
			withText: true,
			tooltip: false
		});
		editButtonView.delegate('execute').to(this, 'edit');
		
		const cancelButtonView = new ButtonView(locale);
		cancelButtonView.set({
			label: locale.t('Cancel'),
			icon: cancelIcon,
			withText: false,
			tooltip: true
		});
		cancelButtonView.delegate('execute').to(this, 'cancel');

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
						editButtonView,
						cancelButtonView
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