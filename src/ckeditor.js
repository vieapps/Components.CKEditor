import { DecoupledEditor as DecoupledDocumentEditor } from 'ckeditor5';
import { Alignment } from 'ckeditor5';
import { Autoformat } from 'ckeditor5';
import { Autosave } from 'ckeditor5';
import { BlockQuote } from 'ckeditor5';
import { Bold } from 'ckeditor5';
import { Code } from 'ckeditor5';
import { CodeBlock } from 'ckeditor5';
import { Essentials } from 'ckeditor5';
// import { FontBackgroundColor } from 'ckeditor5';
// import { FontColor } from 'ckeditor5';
import { FontFamily } from 'ckeditor5';
import { FontSize } from 'ckeditor5';
import { Heading } from 'ckeditor5';
import { Highlight } from 'ckeditor5';
import { HorizontalLine } from 'ckeditor5';
import { Image } from 'ckeditor5';
import { ImageCaption } from 'ckeditor5';
import { ImageResize } from 'ckeditor5';
import { ImageStyle } from 'ckeditor5';
import { ImageToolbar } from 'ckeditor5';
import { ImageUpload } from 'ckeditor5';
import { ImageInsert } from 'ckeditor5';
import { Indent } from 'ckeditor5';
import { IndentBlock } from 'ckeditor5';
import { Italic } from 'ckeditor5';
import { Link } from 'ckeditor5';
import { AutoLink } from 'ckeditor5';
import { LinkImage } from 'ckeditor5';
import { List } from 'ckeditor5';
import { MediaEmbed } from 'ckeditor5';
import { MediaEmbedToolbar } from 'ckeditor5';
import { PageBreak } from 'ckeditor5';
import { Paragraph } from 'ckeditor5';
import { PasteFromOffice } from 'ckeditor5';
import { RemoveFormat } from 'ckeditor5';
import { SimpleUploadAdapter } from 'ckeditor5';
import { Strikethrough } from 'ckeditor5';
import { Subscript } from 'ckeditor5';
import { Superscript } from 'ckeditor5';
import { Table } from 'ckeditor5';
import { TableCellProperties } from 'ckeditor5';
import { TableProperties } from 'ckeditor5';
import { TableToolbar } from 'ckeditor5';
import { TextTransformation } from 'ckeditor5';
import { Underline } from 'ckeditor5';

import RemoveTags from './remove.tags/remove.tags.js';
import CustomTags from './custom.tags/custom.tags.js';
import Bookmark from './bookmark/bookmark.js';
import FontBackgroundColor from './colors/color.background.js';
import FontColor from './colors/color.foreground.js';
import LinkSelector from './selectors/link.js';
import MediaSelector from './selectors/media.js';

import { IconObjectFullWidth } from 'ckeditor5';
import viTranslations from 'ckeditor5/translations/vi.js';
import customTranslations from './translations/vi.js';
import enTranslations from './translations/en.js';
import 'ckeditor5/ckeditor5.css';

function mergeConfig(base, extra) {
	const result = { ...base };
	for (const [key, value] of Object.entries(extra || {})) {
		result[key] = value && Object.getPrototypeOf(value) === Object.prototype && base?.[key] && Object.getPrototypeOf(base[key]) === Object.prototype
			? mergeConfig(base[key], value) : value;
	}
	return result;
}

export default class Editor {
	static async create(config) {
		const options = mergeConfig(Editor.defaultConfig, config);
		options.plugins = Editor.builtinPlugins;
		options.licenseKey = 'GPL';
		// Preserve the app's optional-plugin flags without leaving unavailable toolbar entries.
		const toolbarItemsByPlugin = { PageBreak: ['pageBreak'], Highlight: ['highlight'], Code: ['code'], CodeBlock: ['codeBlock'], ImageInsert: ['imageInsert', 'insertImage'], MediaSelector: ['mediaSelector'] };
		const hiddenItems = new Set((options.removePlugins || []).flatMap(name => toolbarItemsByPlugin[name] || []));
		const normalizeItems = items => items.map(item => ({ fontfamily: 'fontFamily', fontsize: 'fontSize' })[item] || item).filter(item => !hiddenItems.has(item));
		if (Array.isArray(options.toolbar)) options.toolbar = normalizeItems(options.toolbar);
		else if (options.toolbar?.items) options.toolbar = { ...options.toolbar, items: normalizeItems(options.toolbar.items) };

		options.translations = [enTranslations, viTranslations, customTranslations, ...(config.translations || [])];
		options.language = typeof options.language === 'string' ? (options.language.startsWith('vi') ? 'vi' : 'en') : options.language;
		const instance = await DecoupledDocumentEditor.create(options);
		// Keep legacy CMS HTML free of engine-generated list IDs. Explicit caller options still win.
		const getData = instance.getData.bind(instance);
		instance.getData = (dataOptions = {}) => getData({ skipListItemIds: true, ...dataOptions });
		return instance;
	}
}

// plugins (be included in the build)
Editor.builtinPlugins = [
	Alignment,
	Autoformat,
	Autosave,
	BlockQuote,
	Bold,
	Code,
	CodeBlock,
	Essentials,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	Heading,
	Highlight,
	HorizontalLine,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	ImageInsert,
	Indent,
	IndentBlock,
	Italic,
	Link,
	AutoLink,
	LinkImage,
	List,
	MediaEmbed,
	MediaEmbedToolbar,
	PageBreak,
	Paragraph,
	PasteFromOffice,
	RemoveFormat,
	SimpleUploadAdapter,
	Strikethrough,
	Subscript,
	Superscript,
	Table,
	TableCellProperties,
	TableProperties,
	TableToolbar,
	TextTransformation,
	Underline,
	LinkSelector,
	MediaSelector,
	Bookmark,
	CustomTags,
	RemoveTags
];

// default configuration
Editor.defaultConfig = {
	language: {
		ui: 'en',
		content: 'en'
	},
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'subscript',
			'superscript',
			'alignment',
			'fontFamily',
			'fontSize',
			'fontColor',
			'fontBackgroundColor',
			'|',
			'numberedList',
			'bulletedList',
			'indent',
			'outdent',
			'blockQuote',
			'insertTable',
			'|',
			'link',
			'imageInsert',
			'mediaEmbed',
			'mediaSelector',
			'|',
			'removeFormat',
			'removeTags',
			'selectAll',
			'bookmark',
			'custom-tags-div',
			'custom-tags-section',
			'custom-tags-label',
			'box',
			'highlight',
			'horizontalLine',
			'pageBreak',
			'code',
			'codeBlock',
			'undo',
			'redo'
		]
	},
	image: {
		styles: { options: [{ name: 'full', title: 'Full size image', icon: IconObjectFullWidth, modelElements: ['imageBlock'], isDefault: true }, 'side', 'alignLeft', 'alignRight'] },
		insert: { type: 'block' },
		resizeOptions: [
			{
				name: 'imageResize:original',
				label: 'Original',
				value: null
			},
			{
				name: 'imageResize:90',
				label: '90%',
				value: '90'
			},
			{
				name: 'imageResize:75',
				label: '75%',
				value: '75'
			},
			{
				name: 'imageResize:50',
				label: '50%',
				value: '50'
			},
			{
				name: 'imageResize:25',
				label: '25%',
				value: '25'
			}
		],
		toolbar: [
			'imageStyle:alignLeft',
			'imageStyle:full',
			'imageStyle:alignRight',
			'imageStyle:side',
			'|',
			'imageTextAlternative',
			'toggleImageCaption',
			'|',
			'linkImage',
			'|',
			'imageResize'
		]
	},
	mediaEmbed: { toolbar: ['mediaEmbed'] },
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties'
		]
	},
	link: {
		decorators: {
			openInNewTab: {
				mode: 'manual',
				label: 'Open in a new tab',
				defaultValue: true,
				attributes: {
					target: '_blank'
				}
			},
			addRelNoOpenerNoReferrer: {
				mode: 'manual',
				label: 'noopener/noreferrer',
				defaultValue: false,
				attributes: {
					rel: 'noopener noreferrer'
				}
			},
			addInlinePopupCssClass: {
				mode: 'manual',
				label: 'inline popup',
				defaultValue: false,
				classes: ['inline', 'popup']
			}
		}
	},
	customTags: {
		tags: [
			{
				tag: 'div',
				placeholder: 'DIV content goes here',
				attributes: {
					class: 'special block'
				}
			},
			{
				tag: 'section',
				placeholder: 'SECTION content goes here',
				attributes: {
					class: 'special block'
				}
			},
			{
				tag: 'label',
				placeholder: 'Text content goes here',
				attributes: {
					class: 'special text'
				}
			}
		],
		included: [],
		excluded: ['figure', 'figcaption', 'bookmark']
	}
};
