import { Plugin, LinkUI, ButtonView, FormRowView, ContextualBalloon, ModelLiveRange, IconCancel } from 'ckeditor5';
import contentIcon from '../cke/icons/content.svg?raw';
import fileIcon from '../cke/icons/file.svg?raw';

/** CMS selectors belong to the link form, not the editor toolbar. */
export default class LinkSelector extends Plugin {
	static get pluginName() { return 'LinkSelector'; }
	static get requires() { return [LinkUI, ContextualBalloon]; }

	init() {
		this.linkUI = this.editor.plugins.get(LinkUI);
		this.balloon = this.editor.plugins.get(ContextualBalloon);
		this.pending = new Set();
		// LinkUI creates its public formView lazily. Observe its first presentation.
		this.listenTo(this.balloon, 'change:visibleView', () => {
			const form = this.linkUI.formView;
			if (form && this.balloon.visibleView === form && !this.formInstalled) this.installForm(form);
		});
	}

	installForm(form) {
		const config = this.editor.config.get('link.selector') || {};
		const buttons = [this.createButton(config.content, 'Internal content', contentIcon), this.createButton(config.file, 'Uploaded file', fileIcon)].filter(Boolean);
		this.formInstalled = true;
		if (!buttons.length) return;
		const submitRow = [...form.children].find(row => row.children?.has(form.saveButtonView));
		if (submitRow) submitRow.children.remove(form.saveButtonView);
		const cancel = new ButtonView(this.editor.locale);
		cancel.set({ label: this.editor.t('Cancel'), icon: IconCancel, tooltip: true });
		this.listenTo(cancel, 'execute', () => form.fire('cancel'));
		form.children.add(new FormRowView(this.editor.locale, { children: [...buttons, form.saveButtonView, cancel], class: ['ck-vieapps-link-selectors'] }));
		for (const button of [...buttons, cancel]) form.focusTracker.add(button.element);
		// Public keystrokes API includes the newly added controls in form Tab navigation.
		for (const key of ['Tab', 'Shift+Tab']) form.keystrokes.set(key, (data, cancel) => {
			const controls = [...form.element.querySelectorAll('input:not([disabled]),button:not([disabled])')].filter(node => node.getClientRects().length);
			const current = controls.indexOf(form.element.ownerDocument.activeElement);
			if (controls.length) controls[(current + (key === 'Tab' ? 1 : -1) + controls.length) % controls.length].focus();
			cancel();
		}, { priority: 'high' });
	}

	createButton(config, fallbackLabel, icon) {
		if (typeof config?.selectLink !== 'function') return null;
		const editor = this.editor;
		const button = new ButtonView(editor.locale);
		button.set({ label: config.label || editor.t(fallbackLabel), icon, tooltip: true });
		button.bind('isEnabled').to(editor.commands.get('link'), 'isEnabled');
		this.listenTo(button, 'execute', () => {
			const range = ModelLiveRange.fromRange(editor.model.document.selection.getFirstRange());
			this.pending.add(range);
			// Use public view lifecycle events to dismiss the form, preserving LinkUI cleanup.
			this.linkUI.formView.fire('cancel');
			let completed = false;
			const selected = link => {
				if (completed) return;
				completed = true;
				try {
					if (editor.state === 'destroyed' || editor.state === 'destroying') return;
					if (link) {
						editor.model.change(writer => writer.setSelection(range.toRange()));
						const options = ['.png', '.jpg', '.jpeg', '.webp'].some(suffix => link.endsWith(suffix))
							? { linkAddInlinePopupCssClass: true } : { linkOpenInNewTab: true };
						editor.execute('link', link, options);
					}
					editor.editing.view.focus();
				}
				finally { range.detach(); this.pending.delete(range); }
			};
			try {
				Promise.resolve(config.selectLink(selected)).catch(error => { selected(); console.error('Link selector failed', error); });
			}
			catch (error) { selected(); console.error('Link selector failed', error); }
		});
		return button;
	}

	destroy() {
		for (const range of this.pending) range.detach();
		this.pending.clear();
		super.destroy();
	}
}
