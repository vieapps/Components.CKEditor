import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { normalizeColorOptions, getLocalizedColorOptions } from '@ckeditor/ckeditor5-ui/src/colorgrid/utils';
import { addColorTableToDropdown } from '@ckeditor/ckeditor5-font/src/utils';

export default class ColorUI extends Plugin {

	constructor(editor, { commandName, icon, componentName, dropdownLabel }) {
		super(editor);
		this.commandName = commandName;
		this.componentName = componentName;
		this.icon = icon;
		this.dropdownLabel = dropdownLabel;
		this.columns = editor.config.get(`${ this.componentName }.columns`);
		this.colorTableView = undefined;
	}

	init() {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;
		const command = editor.commands.get(this.commandName);
		const colorsConfig = normalizeColorOptions(editor.config.get(this.componentName).colors);
		const localizedColors = getLocalizedColorOptions(locale, colorsConfig);
		const documentColorsCount = editor.config.get(`${this.componentName}.documentColors`);

		editor.ui.componentFactory.add(this.componentName, locale => {
			const dropdownView = createDropdown(locale);

			this.colorTableView = addColorTableToDropdown({
				dropdownView,
				colors: localizedColors.map(option => ({
					label: option.label,
					color: option.model,
					options: {
						hasBorder: option.hasBorder
					}
				})),
				columns: this.columns,
				removeButtonLabel: t('Remove color'),
				documentColorsLabel: documentColorsCount !== 0 ? t('Document colors') : undefined,
				documentColorsCount: documentColorsCount === undefined ? this.columns : documentColorsCount
			});
			this.colorTableView.bind('selectedColor').to(command, 'value');

			// -------------------------------------------
			// custom color
			this.colorTableView.customColor = null;
			const colorInputView = new InputTextView(locale);
			colorInputView.placeholder = 'code - ex: #aabbcc';
			colorInputView.extendTemplate({
				attributes: {
					class: 'ck-custom-color'
				}
			});
			colorInputView.bind('value').to(this.colorTableView, 'customColor');
			colorInputView.on('input', () => this.colorTableView.customColor = colorInputView.element.value);
			this.colorTableView.items.add(colorInputView);
	
			const colorButtonView = new ButtonView(locale);
			colorButtonView.set({
				withText: true,
				tooltip: true,
				label: 'Use'
			});
			colorButtonView.class = 'ck-custom-color';
			colorButtonView.on('execute', () => this.colorTableView.fire('execute', { value: this.colorTableView.customColor }));
			this.colorTableView.items.add(colorButtonView);
			// -------------------------------------------

			dropdownView.buttonView.set({
				label: this.dropdownLabel,
				icon: this.icon,
				tooltip: true
			});

			dropdownView.extendTemplate({
				attributes: {
					class: 'ck-color-ui-dropdown'
				}
			});

			dropdownView.bind('isEnabled').to(command);

			dropdownView.on('execute', (evt, data) => {
				editor.execute(this.commandName, data);
				editor.editing.view.focus();
			});

			dropdownView.on('change:isOpen', (evt, name, isVisible) => {
				dropdownView.colorTableView.appendGrids();
				if (isVisible) {
					if (documentColorsCount !== 0) {
						this.colorTableView.updateDocumentColors(editor.model, this.componentName);
					}
					this.colorTableView.updateSelectedColors();
				}
			});

			return dropdownView;
		});
	}
}
