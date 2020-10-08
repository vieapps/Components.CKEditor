import View from '@ckeditor/ckeditor5-ui/src/view';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

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

		this.nameInput = new InputTextView(locale);
		this.nameInput.placeholder = 'bookmark name';
		this.saveButtonView = this._createButton(locale.t('Save'), checkIcon);
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton(locale.t('Cancel'), cancelIcon, 'cancel');

		this.setTemplate({
			tag: 'form',
			attributes: {
				class: ['ck-bookmark-edit'],
				tabindex: '-1'
			},
			children: [
				this.nameInput,
				this.saveButtonView,
				this.cancelButtonView
			]
		});
	}

	render() {
		super.render();
		submitHandler({
			view: this
		});

		const childViews = [
			this.nameInput,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach(v => {
			this._focusables.add(v);
			this.focusTracker.add(v.element);
		});
		this.keystrokes.listenTo(this.element);
	}

	focus() {
		this._focusCycler.focusFirst();
	}

	_createButton(label, icon, event) {
		const button = new ButtonView(this.locale);
		button.set({
			label: label,
			icon: icon,
			withText: false,
			tooltip: true
		});
		if (event) {
			button.delegate('execute').to(this, event);
		}
		return button;
	}

}