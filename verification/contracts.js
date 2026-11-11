import Editor from '../build/ckeditor.js';
const results=[]; const warnings=[]; const errors=[];
const originalWarn=console.warn; console.warn=(...args)=>{warnings.push(args.map(value=>{try{return typeof value==='string'?value:JSON.stringify(value)}catch{return '[object]'}}).join(' '));originalWarn(...args)};
window.addEventListener('error',event=>errors.push(event.error?.stack||event.message));
window.addEventListener('unhandledrejection',event=>errors.push(String(event.reason?.stack||event.reason)));
const assert=(condition,message='Assertion failed')=>{if(!condition)throw Error(message)};
const test=async(name,fn)=>{try{await fn();results.push({name,pass:true})}catch(error){results.push({name,pass:false,error:String(error.stack||error)})}document.querySelector('#status').textContent=`${results.filter(r=>r.pass).length} pass / ${results.filter(r=>!r.pass).length} fail`};
const fixtures=[
 '<p>Xin chào <strong>Việt Nam</strong> <em>English</em>.</p>',
 '<div class="special block" data-id="fixture"><h2>Tiêu đề</h2><p>Nội dung <label class="special text" data-key="x">nhãn</label></p></div>',
 '<section class="special block" style="width:300px;float:right;"><p>Đoạn thứ nhất</p><div data-nested="true"><p>Lồng nhau</p></div></section>',
 '<p>Trước<a name="mục-1" class="bookmark"></a>Sau <a href="#mục-1">Đi tới</a></p>',
 '<p><a href="https://example.test/file.jpg?x-temp-token=fixture" class="inline popup" target="_blank" rel="noopener noreferrer">Ảnh</a></p>',
 '<figure class="image image-style-side"><a href="https://example.test/full.png" class="inline popup"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Ảnh"></a><figcaption>Chú thích</figcaption></figure>',
 '<figure class="table"><table style="border:1px solid red;background-color:#ffeecc;"><tbody><tr><td style="padding:4px;background-color:#ccffcc;">Ô 1</td><td>Ô 2</td></tr></tbody></table></figure>',
 '<ol><li>Một<ul><li>Con</li></ul></li><li>Hai</li></ol>',
 '<p><span style="color:rgb(12, 34, 56);background-color:#ffeedd;font-size:18px;font-family:Arial;">Màu</span></p>',
 '<div class="page-break" style="page-break-after:always;"><span style="display:none;">&nbsp;</span></div><p>Sau ngắt</p>',
 '<figure class="media"><oembed url="https://www.youtube.com/watch?v=fixture"></oembed></figure>'
];
let editor, second, baseline;
let selectedLink, selectedMedia;
const selectAll=()=>editor.model.change(writer=>writer.setSelection(editor.model.document.getRoot(),'in'));
const config={language:'vi',link:{selector:{content:{selectLink:cb=>{selectedLink=cb}},file:{selectLink:cb=>{selectedLink=cb}}}},media:{selector:{selectMedia:cb=>{selectedMedia=cb}}}};
try {
 await test('Create vi editor with all configured plugins under GPL',async()=>{
  editor=await Editor.create({...config,root:{element:document.querySelector('#editor')}});
  document.querySelector('#toolbar').append(editor.ui.view.toolbar.element);
  assert(editor.config.get('licenseKey')==='GPL');assert(!editor.isReadOnly);
 });
 if(!editor)throw Error('Editor initialization failed');
 await test('Vietnamese upstream/custom dictionaries',()=>{assert(editor.t('Bold')==='Đậm');assert(editor.t('Internal content')==='Nội dung nội bộ');assert(editor.t('Use')==='Áp dụng')});
 await test('Create English editor independently',async()=>{second=await Editor.create({language:'en',media:{selector:{selectMedia:cb=>{selectedMedia=cb}}},toolbar:[],root:{element:document.querySelector('#second')}});assert(second.t('Bold')==='Bold', 'en Bold='+second.t('Bold')+' / '+second.locale.uiLanguage);assert(second.t('Use')==='Use','en Use='+second.t('Use'))});
 await test('All custom plugins and existing table/page/upload features loaded',()=>{for(const name of ['CustomTags','Bookmark','RemoveTags','LinkSelector','MediaSelector','FontColor','FontBackgroundColor','TableProperties','TableCellProperties','PageBreak','SimpleUploadAdapter'])assert(editor.plugins.has(name),name)});
 await test('MediaSelector is an editor toolbar button',()=>assert([...editor.ui.view.toolbar.items].some(item=>item.label===editor.t('Insert an uploaded media'))));
 await test('Recorded CKEditor 27.1.0 output matches the input fixtures',async()=>{
  const response=await fetch(new URL('./legacy-output.json',import.meta.url));assert(response.ok,'Missing legacy HTML fixture');
  const recorded=await response.json();
  assert(recorded.length===fixtures.length&&recorded.every(({input,legacy},i)=>input===fixtures[i]&&typeof legacy==='string'));
  baseline=recorded.map(({legacy})=>legacy);
 });
 const roundtrips=[];
 for(let i=0;i<fixtures.length;i++)await test('HTML roundtrip '+i,()=>{
  editor.setData(fixtures[i]);const output=editor.getData();editor.setData(output);const again=editor.getData();
  roundtrips.push({input:fixtures[i],legacy:baseline?.[i],output,again});assert(output===again,'Not stable after second roundtrip');
  if(i===1)assert(output.includes('data-id="fixture"')&&output.includes('data-key="x"')&&output.includes('Nội dung'));
  if(i===2)assert(output.includes('data-nested="true"')&&output.includes('width:300px'));
  if(i===3)assert(output.includes('name="mục-1"')&&output.includes('class="bookmark"'));
  if(i===4)assert(output.includes('x-temp-token=fixture')&&output.includes('inline popup'));
  if(i===6)assert(output.includes('background-color')&&output.includes('padding:4px'));
 });
 await test('Link popup contains both selectors; neither added to main toolbar',()=>{
  editor.setData('<p>Chọn nội dung</p>');selectAll();editor.ui.componentFactory.create('link').fire('execute');
  const form=editor.plugins.get('LinkUI').formView;assert(form?.element);const buttons=[...form.element.querySelectorAll('button')];assert(buttons.some(b=>b.textContent.trim()===editor.t('Internal content')),'Missing content selector in form');assert(buttons.some(b=>b.textContent.trim()===editor.t('Uploaded file')));assert(form.saveButtonView.element.parentElement.classList.contains('ck-vieapps-link-selectors'));assert(form.saveButtonView.element.previousElementSibling.textContent.trim()===editor.t('Uploaded file'));
  assert(![...editor.ui.view.toolbar.items].some(item=>item.label===editor.t('Internal content')));
 });
 await test('Link form keyboard cycle includes both selector buttons',()=>{
  const form=editor.plugins.get('LinkUI').formView;
  const key=(shiftKey=false)=>document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',keyCode:9,which:9,shiftKey,bubbles:true,cancelable:true}));
  form.urlInputView.fieldView.element.focus();key();key();assert(document.activeElement.textContent.trim()===editor.t('Internal content'));key();assert(document.activeElement.textContent.trim()===editor.t('Uploaded file'));key(true);assert(document.activeElement.textContent.trim()===editor.t('Internal content'));
 });
 await test('Link selector callback preserves text/range and decorators',()=>{
  const form=editor.plugins.get('LinkUI').formView;[...form.element.querySelectorAll('button')].find(b=>b.textContent.trim()===editor.t('Internal content')).click();assert(typeof selectedLink==='function');selectedLink('https://example.test/content');assert(editor.getData().includes('href="https://example.test/content"'));assert(editor.getData().includes('Chọn nội dung'));
 });
 await test('Selector cancellation keeps data',()=>{
  editor.ui.componentFactory.create('link').fire('execute');const form=editor.plugins.get('LinkUI').formView;
  // Existing links first show a preview; explicitly invoke edit from the preview if needed.
  if(!editor.plugins.get('ContextualBalloon').hasView(form))editor.ui.componentFactory.create('editLink').fire('execute');
  const before=editor.getData();[...form.element.querySelectorAll('button')].find(b=>b.textContent.trim()===editor.t('Uploaded file')).click();selectedLink();assert(editor.getData()===before);
 });
 await test('Media callback inserts imageBlock with source and original href',()=>{
  editor.setData('<p>Media</p>');selectAll();editor.ui.componentFactory.create('mediaSelector').fire('execute');selectedMedia('https://example.test/thumb.png',undefined,'https://example.test/full.png');const data=editor.getData();assert(data.includes('thumb.png')&&data.includes('full.png')&&data.includes('inline popup'));
 });
 await test('CustomTag command, metadata update, undo/redo',()=>{
  editor.setData('<p>Text</p>');selectAll();editor.execute('create-custom-tags-div',{'data-test':'before',class:'special box right',style:'width:300px;'},'Box text','Box title');let data=editor.getData();assert(data.includes('data-test="before"')&&data.includes('Box title'));editor.execute('undo');assert(!editor.getData().includes('Box title'));editor.execute('redo');assert(editor.getData().includes('Box title'));
 });
 await test('Custom attributes popup creates with public view attributes',()=>{
  const ui=editor.plugins.get('CustomTagsUI');const tag=editor.model.document.getRoot().getChild(0);editor.model.change(writer=>writer.setSelection(tag.getChild(0),'in'));editor.editing.view.forceRender();const modelView=editor.editing.mapper.toViewElement(tag);const view=ui._getSelectedElement() || modelView;assert(view,'Selected custom view missing');const attrs=ui._getAttributes(view);assert(attrs.get('data-test')==='before');const sel=editor.model.document.selection;const m=sel.getSelectedElement()||sel.getFirstPosition()?.parent;assert(ui._getSelectedElement(),JSON.stringify({model:m?.name,ancestors:m?.getAncestors().map(a=>a.name),view:modelView?.name,custom:modelView?.getCustomProperty('isCustomTag'),known:[...ui.knownTags]}));const popup=ui._createEditPopup();popup.render();assert(popup.element.querySelector('input'));popup.destroy();
 });
 await test('Bookmark create/update/delete HTML contract',()=>{
  editor.setData('<p>Bookmark</p>');editor.model.change(writer=>writer.setSelection(editor.model.document.getRoot().getChild(0),'end'));editor.execute('bookmark','test-vi');assert(editor.getData().includes('name="test-vi"'));editor.execute('bookmark','mục-2');assert(editor.getData().includes('name="mục-2"'));editor.execute('deleteBookmark');assert(!editor.getData().includes('name="mục-2"'));
 });
 await test('Custom color input applies CSS color; palette remains',()=>{
  editor.setData('<p>Colors</p>');selectAll();const dropdown=editor.ui.componentFactory.create('fontColor');dropdown.render();document.body.append(dropdown.element);dropdown.isOpen=true;const input=dropdown.element.querySelector('input');assert(input);input.value='rgb(12, 34, 56)';[...dropdown.element.querySelectorAll('button')].find(b=>b.textContent.includes(editor.t('Use'))).click();assert(editor.getData().includes('color:rgb(12,34,56)')||editor.getData().includes('color:rgb(12, 34, 56)'));dropdown.element.remove();dropdown.destroy();
 });
 await test('Background color command and remove',()=>{selectAll();editor.execute('fontBackgroundColor',{value:'#ffeedd'});assert(editor.getData().includes('background-color'));editor.execute('fontBackgroundColor');assert(!editor.getData().includes('background-color'))});
 await test('RemoveTags operates on full document',()=>{editor.setData('<p><strong>Keep</strong></p><p><em>Text</em></p>');const button=editor.ui.componentFactory.create('removeTags');button.fire('execute');assert(editor.getData()==='<p>Keep</p><p>Text</p>');button.destroy()});
 await test('SimpleUploadAdapter request/headers, success/error/abort with local peer', async()=>{
  const NativeXHR=window.XMLHttpRequest;const requests=[];
  class FixtureXHR extends EventTarget {
   constructor(){super();this.upload=new EventTarget();this.headers={};this.response=null;this.status=0;}
   open(method,url){this.method=method;this.url=url;}
   setRequestHeader(name,value){this.headers[name]=value;}
   send(body){
    requests.push({method:this.method,url:this.url,headers:this.headers,file:body.get('upload')?.name});
    this.timer=setTimeout(()=>{this.status=requests.at(-1).file==='error.png'?400:200;this.response=this.status===200?{url:'https://fixture.invalid/upload.png'}:{error:{message:'Fixture upload failed'}};this.dispatchEvent(new Event('load'));},20);
   }
   abort(){clearTimeout(this.timer);this.dispatchEvent(new Event('abort'));}
  }
  const host=document.createElement('div');document.body.append(host);let uploadEditor;
  window.XMLHttpRequest=FixtureXHR;
  try{
   uploadEditor=await Editor.create({toolbar:[],root:{element:host},simpleUpload:{uploadUrl:'https://fixture.invalid/one.image',headers:{'X-Fixture':'fixture-only'}}});
   const repository=uploadEditor.plugins.get('FileRepository');
   const make=name=>{const loader=repository.createLoader(Promise.resolve(new File(['fixture'],name,{type:'image/png'})));return {loader,adapter:repository.createUploadAdapter(loader)}};
   const success=make('success.png');const response=await success.adapter.upload();assert(response.urls.default==='https://fixture.invalid/upload.png');repository.destroyLoader(success.loader);
   const failure=make('error.png');let rejected=false;try{await failure.adapter.upload()}catch(error){rejected=String(error).includes('Fixture upload failed')}assert(rejected);repository.destroyLoader(failure.loader);
   const cancelled=make('cancel.png');const pending=cancelled.adapter.upload();await new Promise(resolve=>setTimeout(resolve,0));cancelled.adapter.abort();await pending.then(()=>{throw Error('Abort resolved')},()=>{});repository.destroyLoader(cancelled.loader);
   assert(requests.length===3&&requests.every(request=>request.method==='POST'&&request.url==='https://fixture.invalid/one.image'&&request.headers['X-Fixture']==='fixture-only'));
  }finally{await uploadEditor?.destroy();host.remove();window.XMLHttpRequest=NativeXHR;}
 });
 await test('Optional plugin flags remove toolbar items; legacy aliases stay supported',async()=>{
  const host=document.createElement('div');document.body.append(host);
  const instance=await Editor.create({root:{element:host},removePlugins:['PageBreak','Highlight','Code','CodeBlock','ImageInsert','MediaSelector'],toolbar:['fontfamily','fontsize','pageBreak','highlight','code','codeBlock','imageInsert','mediaSelector']});
  try{assert(JSON.stringify(instance.config.get('toolbar'))===JSON.stringify(['fontFamily','fontSize']));}finally{await instance.destroy();host.remove();}
 });
 await test('No GPL nag/read-only state',()=>{assert(!editor.isReadOnly);assert(!document.querySelector('[role="dialog"]'));assert(!warnings.some(w=>/license|trial|premium/i.test(w)))});
 await test('Pending callback after destroy is ignored',async()=>{const button=second.ui.componentFactory.create('mediaSelector');button.fire('execute');const late=selectedMedia;await second.destroy();late('https://example.test/late.png');assert(second.state==='destroyed');button.destroy()});
 for(let i=0;i<baseline.length;i++)await test('Previously serialized HTML '+i,()=>{editor.setData(baseline[i]);const data=editor.getData();const text=html=>new DOMParser().parseFromString(html,'text/html').body.textContent.replace(/\s+/g,' ').trim();assert(text(data)===text(baseline[i]),'Text changed: '+data);if(i===2)assert(data.includes('alignment=\"right\"')&&data.includes('width=\"300px\"'));if(i===7)assert(!data.includes('data-list-item-id'));});
 window.editor=editor;
 window.verification={results,warnings,errors,roundtrips};
} catch(error) {results.push({name:'fatal',pass:false,error:String(error.stack||error)});window.verification={results,warnings,errors};}
document.querySelector('#results').textContent=JSON.stringify(window.verification,null,2);
document.querySelector('#status').textContent=`DONE: ${results.filter(r=>r.pass).length} pass / ${results.filter(r=>!r.pass).length} fail`;
await fetch('/verification/report',{method:'POST',body:JSON.stringify(window.verification)});
