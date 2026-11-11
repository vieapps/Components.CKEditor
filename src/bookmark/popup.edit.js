import { View } from 'ckeditor5';
import { InputTextView } from 'ckeditor5';
import { ButtonView } from 'ckeditor5';
import { KeystrokeHandler } from 'ckeditor5';
import { submitHandler } from 'ckeditor5';
import { FocusTracker } from 'ckeditor5';
import { FocusCycler } from 'ckeditor5';
import { ViewCollection } from 'ckeditor5';

import { IconCheck as checkIcon } from 'ckeditor5';
import { IconCancel as cancelIcon } from 'ckeditor5';

export default class EditPopup extends View {

	constructor(locale) {
		super(locale);

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();

		this._focusables = new ViewCollection();
		this._focusCycler = new FocusCycler({
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
		});

		this.nameInputView = new InputTextView(locale);
		this.nameInputView.placeholder = locale.t('Bookmark name');

		this.saveButtonView = this._createButton(locale.t('Save'), checkIcon, 'ck-button-save');
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton(locale.t('Cancel'), cancelIcon, 'ck-button-cancel', 'cancel');

		this.setTemplate({
			tag: 'form',
			attributes: {
				class: ['ck ck-form ck-bookmark'],
				tabindex: '-1'
			},
			children: [
				{
					tag: 'div',
					attributes: {
						class: ['ck ck-form__row']
					},
					children: [
						this.nameInputView,
						this.saveButtonView,
						this.cancelButtonView
					]
				}
			]
		});
	}

	render() {
		super.render();
		submitHandler({ view: this });
		[
			this.nameInputView,
			this.saveButtonView,
			this.cancelButtonView
		].forEach(view => {
			this._focusables.add(view);
			this.focusTracker.add(view.element);
		});
		this.keystrokes.listenTo(this.element);
	}

	focus() {
		this._focusCycler.focusFirst();
	}

	_createButton(label, icon, css, event) {
		const button = new ButtonView(this.locale);
		button.set({
			label: label,
			icon: icon,
			class: css,
			withText: false,
			tooltip: true
		});
		if (event) {
			button.delegate('execute').to(this, event);
		}
		return button;
	}

}