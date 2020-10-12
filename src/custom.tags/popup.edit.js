import View from '@ckeditor/ckeditor5-ui/src/view';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
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
import objectLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import objectCenterIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import objectRightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

export default class EditPopup extends View {

	constructor(locale, tag, attributes) {
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

		this._attributes = attributes || new Map();
		this._parseStyle(this._attributes.get('style'));
		this._width = this._styles.get('width') || '';
		this._height = this._styles.get('height') || '';
		this._alignment = this._styles.get('float') || 'center';

		const tagLabelView = new LabelView(locale);
		tagLabelView.set('text', tag);

		const dimensionsLabelView = new LabelView(locale);
		dimensionsLabelView.text = locale.t('Dimensions');
		
		const widthInputView = new InputTextView(locale);
		widthInputView.set('isReadOnly', tag != 'div' && tag != 'section');
		widthInputView.bind('value').to(this, '_width');
		widthInputView.on('input', () => {
			this._width = widthInputView.element.value || '';
			this._updateStyle('width', this._width);
		});

		const widthLabelView = new LabelView(locale);
		widthLabelView.text = locale.t('Width');
		
		const operatorLabel = new View(locale);
		operatorLabel.setTemplate( {
			tag: 'span',
			children: [
				{ text: '×' }
			]
		});

		const heightInputView = new InputTextView(locale);
		heightInputView.set('isReadOnly', tag != 'div' && tag != 'section');
		heightInputView.bind('value').to(this, '_height');
		heightInputView.on('input', () => {
			this._height = heightInputView.element.value || '';
			this._updateStyle('height', this._height);
		});

		const heightLabelView = new LabelView(locale);
		heightLabelView.text = locale.t('Height');

		const alignmentLabelView = new LabelView(locale);
		alignmentLabelView.text = locale.t('Alignment');

		const alignmentToolbarView = new ToolbarView(locale);
		alignmentToolbarView.set({
			isCompact: true,
			ariaLabel: locale.t('Alignment toolbar')
		});

		this.leftAlignButtonView = new ButtonView(locale);
		this.leftAlignButtonView.set({
			label: locale.t('Left alignment'),
			tooltip: locale.t('Left alignment'),
			icon: objectLeftIcon,
			isEnabled: tag == 'div' || tag == 'section',
			isOn: this._alignment == 'left'
		});
		this.leftAlignButtonView.on('execute', () => {
			this._alignment = 'left';
			this._setToolbarButtonIsOnStates();
			this._updateStyle('float', this._alignment);
		});
		alignmentToolbarView.items.add(this.leftAlignButtonView);

		this.centerAlignButtonView = new ButtonView(locale);
		this.centerAlignButtonView.set({
			label: locale.t('Center alignment'),
			tooltip: locale.t('Center alignment'),
			icon: objectCenterIcon,
			isEnabled: tag == 'div' || tag == 'section',
			isOn: this._alignment == 'center'
		});
		this.centerAlignButtonView.on('execute', () => {
			this._alignment = 'center';
			this._setToolbarButtonIsOnStates();
			this._updateStyle('float');
		});
		alignmentToolbarView.items.add(this.centerAlignButtonView);

		this.rightAlignButtonView = new ButtonView(locale);
		this.rightAlignButtonView.set({
			label: locale.t('Right alignment'),
			tooltip: locale.t('Right alignment'),
			icon: objectRightIcon,
			isEnabled: tag == 'div' || tag == 'section',
			isOn: this._alignment == 'right'
		});
		this.rightAlignButtonView.on('execute', () => {
			this._alignment = 'right';
			this._setToolbarButtonIsOnStates();
			this._updateStyle('float', this._alignment);
		});
		alignmentToolbarView.items.add(this.rightAlignButtonView);

		this.attributesDropdownView = createDropdown(locale);
		addListToDropdown(this.attributesDropdownView, this._getAttributesAsDropdownItems());
		this.attributesDropdownView.buttonView.set({
			label: 'Select to create new or update an attribute',
			tooltip: true,
			withText: true
		});
		this.listenTo(this.attributesDropdownView, 'execute', event => this._switch(event.source.name));

		this.nameInputView = new InputTextView(locale);
		this.nameInputView.set({
			placeholder: 'name'
		});

		this.valueInputView = new InputTextView(locale);
		this.valueInputView.set({
			placeholder: 'value'
		});

		this.updateButtonView = new ButtonView(locale);
		this.updateButtonView.set({
			label: locale.t('Update'),
			icon: checkIcon,
			class: 'update',
			withText: false,
			tooltip: true
		});
		this.listenTo(this.updateButtonView, 'execute', () => this._update());

		this.saveButtonView = this._createButton(locale.t('Save'), checkIcon, 'ck-button-save');
		this.saveButtonView.type = 'submit';
		this.listenTo(this.saveButtonView, 'execute', () => this._update(true));

		this.cancelButtonView = this._createButton(locale.t('Cancel'), cancelIcon, 'ck-button-cancel', 'cancel');

		this.setTemplate({
			tag: 'form',
			attributes: {
				class: ['ck ck-form ck-custom-tags'],
				tabindex: '-1'
			},
			children: [
				{
					tag: 'section',
					attributes: {
						class: ['ck ck-form__header']
					},
					children: [
						tagLabelView
					]
				},
				{
					tag: 'div',
					attributes: {
						class: ['ck ck-form__row']
					},
					children: [
						{
							tag: 'div',
							attributes: {
								class: ['ck-dimensions']
							},
							children: [
								dimensionsLabelView,
								{
									tag: 'div',
									children: [
										{
											tag: 'div',
											children: [
												widthInputView,
												widthLabelView
											]
										},
										operatorLabel,
										{
											tag: 'div',
											children: [
												heightInputView,
												heightLabelView
											]
										}
									]
								}
							]
						},
						{
							tag: 'div',
							attributes: {
								class: ['ck-alignments']
							},
							children: [
								alignmentLabelView,
								alignmentToolbarView
							]
						}
					]
				},
				{
					tag: 'div',
					attributes: {
						class: ['ck ck-form__row']
					},
					children: [
						this.attributesDropdownView
					]
				},
				{
					tag: 'div',
					attributes: {
						class: ['ck ck-form__row inputs']
					},
					children: [
						this.nameInputView,
						this.valueInputView,
						this.updateButtonView
					]
				},
				{
					tag: 'div',
					attributes: {
						class: ['ck ck-form__row buttons']
					},
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

	_switch(name) {
		const isCreateNew = name === undefined || name === '' || !this._attributes.has(name);
		this.nameInputView.element.value = isCreateNew ? '' : name;
		this.valueInputView.element.value = isCreateNew ? '' : this._attributes.get(name) || '';
		if (isCreateNew) {
			this.nameInputView.focus();
		}
		else {
			this.valueInputView.focus();
		}
	}

	_update(dontSetFocus) {
		const name = (this.nameInputView.element.value || '').trim();
		if (name !== '') {
			const isCreateNew = !this._attributes.has(name);

			let value = (this.valueInputView.element.value || '').trim();
			if (name == 'style') {
				this._parseStyle(value);
				value = this._getStyle();
				if (!dontSetFocus) {
					this._width = this._styles.get('width') || '';
					this._height = this._styles.get('height') || '';
					this._alignment = this._styles.get('float') || 'center';
					this._setToolbarButtonIsOnStates();
				}
			}
			else if (name == 'class') {
				value = value.trim().split(' ').map(data => data.trim()).filter(data => data != '').join(' ');
			}
			this._attributes.set(name, value);

			if (!dontSetFocus) {
				if (isCreateNew) {
					const items = new Collection();
					items.add({
						type: 'button',
						model: new Model({
							name: name,
							label: name,
							withText: true
						})
					});
					addListToDropdown(this.attributesDropdownView, items);
				}
				this.nameInputView.element.value = '';
				this.valueInputView.element.value = '';
				this.attributesDropdownView.focus();
			}
		}
		else if (!dontSetFocus) {
			this.nameInputView.focus();
		}
	}

	_getAttributesAsDropdownItems() {
		const items = new Collection();
		items.add({
			type: 'button',
			model: new Model({
				name: '',
				label: '- create new -',
				withText: true
			})
		});
		items.add({ type: 'separator' });
		Array.from(this._attributes.keys()).forEach(name => items.add({
			type: 'button',
			model: new Model({
				name: name,
				label: name,
				withText: true
			})
		}));
		return items;
	}
	
	_parseStyle(style) {
		this._styles = new Map();
		(style || '').trim().split(';').map(data => data.trim()).filter(data => data != '').forEach(data => {
			const kvp = data.split(':');
			if (kvp.length > 1) {
				this._styles.set(kvp[0], kvp.slice(1).join(':'));
			}
		});
		return this._styles;
	}

	_getStyle() {
		let style = '';
		(this._styles || new Map()).forEach((value, key) => style += `${key}:${value};`);
		return style;
	}

	_updateStyle(name, value) {
		if (value && value != '' && value != ';') {
			this._styles.set(name, value);
		}
		else {
			this._styles.delete(name);
		}
		this._attributes.set('style', this._getStyle());
	}

	_setToolbarButtonIsOnStates() {
		this.leftAlignButtonView.set({ isOn: this._alignment == 'left' });
		this.centerAlignButtonView.set({ isOn: this._alignment == 'center' });
		this.rightAlignButtonView.set({ isOn: this._alignment == 'right' });
	}

	_createButton(label, icon, css, event) {
		const button = new ButtonView(this.locale);
		button.set({
			label: label,
			icon: icon,
			class: css,
			withText: true,
			tooltip: false
		});
		if (event) {
			button.delegate('execute').to(this, event);
		}
		return button;
	}

	get attributes() {
		return this._attributes;
	}

}