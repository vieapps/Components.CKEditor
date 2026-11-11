import { View } from 'ckeditor5';
import { LabelView } from 'ckeditor5';
import { ButtonView } from 'ckeditor5';
import { KeystrokeHandler } from 'ckeditor5';

import updateIcon from '../cke/icons/tools.svg?raw';
import paragraphIcon from '../cke/icons/paragraph.svg?raw';
import { IconSelectAll as selectIcon } from 'ckeditor5';
import { IconCancel as cancelIcon } from 'ckeditor5';

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
		
		const createParagraphBeforeButtonView = new ButtonView(locale);
		createParagraphBeforeButtonView.set({
			label: locale.t('Create paragraph before'),
			icon: paragraphIcon,
			class: 'ck-button-save',
			withText: false,
			tooltip: true
		});
		createParagraphBeforeButtonView.delegate('execute').to(this, 'createParagraphBefore');
		
		const createParagraphAfterButtonView = new ButtonView(locale);
		createParagraphAfterButtonView.set({
			label: locale.t('Create paragraph after'),
			icon: paragraphIcon,
			withText: false,
			tooltip: true
		});
		createParagraphAfterButtonView.delegate('execute').to(this, 'createParagraphAfter');
		
		const selectButtonView = new ButtonView(locale);
		selectButtonView.set({
			label: locale.t('Select'),
			icon: selectIcon,
			withText: false,
			tooltip: true
		});
		selectButtonView.delegate('execute').to(this, 'select');
		
		const cancelButtonView = new ButtonView(locale);
		cancelButtonView.set({
			label: locale.t('Cancel'),
			icon: cancelIcon,
			class: 'ck-button-cancel',
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
						createParagraphBeforeButtonView,
						createParagraphAfterButtonView,
						selectButtonView,
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