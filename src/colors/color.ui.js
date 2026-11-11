import { Plugin, InputTextView, ButtonView, FormRowView, ColorSelectorView, createDropdown, normalizeColorOptions, getLocalizedColorOptions } from 'ckeditor5';

/** Keep the existing arbitrary CSS color input alongside palette/document colors. */
export default class ColorUI extends Plugin {
	constructor(editor, options) { super(editor); Object.assign(this, options); }
	init() {
		const editor = this.editor;
		const command = editor.commands.get(this.commandName);
		const config = editor.config.get(this.componentName);
		const columns = config.columns || 5;
		const colors = getLocalizedColorOptions(editor.locale, normalizeColorOptions(config.colors));
		editor.ui.componentFactory.add(this.componentName, locale => {
			const dropdown = createDropdown(locale);
			const selector = new ColorSelectorView(locale, {
				colors: colors.map(option => ({ label: option.label, color: option.model, options: { hasBorder: option.hasBorder } })),
				columns, removeButtonLabel: locale.t('Remove color'), documentColorsLabel: locale.t('Document colors'),
				documentColorsCount: config.documentColors ?? columns, colorPickerViewConfig: false
			});
			selector.bind('selectedColor').to(command, 'value');
			const input = new InputTextView(locale);
			input.placeholder = locale.t('Color code, e.g. #aabbcc');
			input.extendTemplate({ attributes: { class: 'ck-custom-color', 'aria-label': locale.t('Color code') } });
			const apply = new ButtonView(locale);
			apply.set({ label: locale.t('Use'), withText: true, tooltip: true });
			const row = new FormRowView(locale, { children: [input, apply] });
			dropdown.panelView.children.add(selector);
			dropdown.panelView.children.add(row);
			dropdown.buttonView.set({ label: this.dropdownLabel, icon: this.icon, tooltip: true });
			dropdown.bind('isEnabled').to(command, 'isEnabled');
			const execute = value => { editor.execute(this.commandName, { value }); editor.editing.view.focus(); dropdown.isOpen = false; };
			this.listenTo(selector, 'execute', (event, data) => execute(data.value));
			this.listenTo(apply, 'execute', () => execute(input.element.value));
			let rendered = false;
			this.listenTo(dropdown, 'change:isOpen', (event, name, open) => {
				if (!rendered) { selector.appendUI(); rendered = true; }
				if (open) {
					if (config.documentColors !== 0) selector.updateDocumentColors(editor.model, this.componentName);
					selector.updateSelectedColors();
				}
			});
			return dropdown;
		});
	}
}
