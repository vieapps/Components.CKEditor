/**
 * @license Copyright (c) 2014-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import DecoupledDocumentEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
// import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
// import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import MediaEmbedToolbar from '@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

import Bookmark from './bookmark/bookmark';
import CustomTags from './custom.tags/custom.tags';
import FontBackgroundColor from './colors/color.background';
import FontColor from './colors/color.foreground';
import LinkSelector from './selectors/link';
import MediaSelector from './selectors/media';

export default class Editor extends DecoupledDocumentEditor {}

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
	CustomTags
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
			'fontfamily',
			'fontsize',
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
			'selectAll',
			'bookmark',
			'custom-tags-div',
			'custom-tags-section',
			'custom-tags-span',
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
		styles: [
			'full',
			'side',
			'alignLeft',
			'alignRight'
		],
		resizeOptions: [
			{
				name: 'imageResize:original',
				label: 'Original',
				value: null
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
			'|',
			'linkImage',
			'|',
			'imageResize'
		]
	},
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
				attributes: {
					class: 'inline popup'
				}
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
				tag: 'span',
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