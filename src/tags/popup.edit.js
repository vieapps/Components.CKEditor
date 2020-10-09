import View from '@ckeditor/ckeditor5-ui/src/view';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

export default class EditPopup extends View {

	constructor(locale, attributes) {
		super(locale);
		this._attributes = attributes || new Map();

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

		this.tagLabelView = new LabelView(locale);

		this.attributesDropdownView = createDropdown(locale);
		addListToDropdown(this.attributesDropdownView, this._getAttributesAsDropdownItems());
		this.attributesDropdownView.buttonView.set({
			label: 'Update or create new',
			tooltip: true,
			withText: true
		});
		this.listenTo(this.attributesDropdownView, 'execute', event => this._switch(event.source.commandParam));

		this.nameInputView = new InputTextView(locale);
		this.nameInputView.placeholder = 'name';

		this.valueInputView = new InputTextView(locale);
		this.valueInputView.placeholder = 'value';

		this.updateButtonView = this._createButton(locale.t('Update'), checkIcon, undefined, false);
		this.listenTo(this.updateButtonView, 'execute', () => this._update());

		this.saveButtonView = this._createButton(locale.t('Save'), checkIcon);
		this.saveButtonView.type = 'submit';
		this.cancelButtonView = this._createButton(locale.t('Cancel'), cancelIcon, 'cancel');

		this.setTemplate({
			tag: 'form',
			attributes: {
				class: ['ck-custom-tags-edit'],
				tabindex: '-1'
			},
			children: [
				{
					tag: 'section',
					children: [
						this.tagLabelView
					]
				},
				{
					tag: 'div',
					children: [
						this.attributesDropdownView,
						this.nameInputView,
						this.valueInputView,
						this.updateButtonView
					]
				},
				{
					tag: 'div',
					children: [
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
			this.attributesDropdownView,
			this.nameInputView,
			this.valueInputView,
			this.updateButtonView,
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

	get attributes() {
		return this._attributes;
	}

	_switch(name) {
		this._isCreateNew = name === undefined || name === '';
		this.nameInputView.element.value = this._isCreateNew ? '' : name;
		this.valueInputView.element.value = this._isCreateNew ? '' : this._attributes.get(name) || '';
		if (this._isCreateNew) {
			this.nameInputView.focus();
		}
		else {
			this.valueInputView.focus();
		}
	}

	_update() {
		const name = (this.nameInputView.element.value || '').trim();
		if (name !== '') {
			const value = (this.valueInputView.element.value || '').trim();
			this._attributes.set(name, value);
			if (this._isCreateNew) {
				const items = new Collection();
				items.add({
					type: 'button',
					model: new Model({
						commandParam: name,
						label: name,
						withText: true
					})
				});
				addListToDropdown(this.attributesDropdownView, items);
				this._isCreateNew = false;
			}
			this.nameInputView.element.value = '';
			this.valueInputView.element.value = '';
			this.attributesDropdownView.focus();
		}
		else {
			this.nameInputView.focus();
		}
	}

	_getAttributesAsDropdownItems() {
		const items = new Collection();
		items.add({
			type: 'button',
			model: new Model({
				commandParam: '',
				label: '- create new -',
				withText: true
			})
		});
		items.add({ type: 'separator' });
		Array.from(this._attributes.keys()).forEach(key => items.add({
			type: 'button',
			model: new Model({
				commandParam: key,
				label: key,
				withText: true
			})
		}));
		return items;
	}

	_createButton(label, icon, event, withText) {
		const button = new ButtonView(this.locale);
		button.set({
			label: label,
			icon: icon,
			withText: withText !== undefined ? !!withText : true,
			tooltip: false
		});
		if (event) {
			button.delegate('execute').to(this, event);
		}
		return button;
	}

}