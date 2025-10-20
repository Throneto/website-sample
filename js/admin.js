/**
 * 管理端脚本：文章增删改查、搜索筛选与本地文件预览上传（DataURL）
 */

(function(){
	const service = window.apiService;

	const el = {
		search: document.getElementById('search'),
		categoryFilter: document.getElementById('categoryFilter'),
		tbody: document.getElementById('tableBody'),
		createBtn: document.getElementById('createBtn'),
		modal: document.getElementById('editModal'),
		closeModal: document.getElementById('closeModal'),
		modalTitle: document.getElementById('modalTitle'),
		f_title: document.getElementById('f_title'),
		f_excerpt: document.getElementById('f_excerpt'),
		f_content: document.getElementById('f_content'),
		f_category: document.getElementById('f_category'),
		f_tags: document.getElementById('f_tags'),
		f_cover: document.getElementById('f_cover'),
		saveBtn: document.getElementById('saveBtn')
	};

	let state = {
		search: '',
		category: 'all',
		editingId: null,
		coverDataUrl: ''
	};

	init();

	async function init(){
		await service.ensureInitialized();
		await loadCategories();
		await reloadTable();
		bindEvents();
	}

	function bindEvents(){
		el.search.addEventListener('input', debounce(async (e)=>{
			state.search = e.target.value.trim();
			await reloadTable();
		}, 250));

		el.categoryFilter.addEventListener('change', async (e)=>{
			state.category = e.target.value;
			await reloadTable();
		});

		el.createBtn.addEventListener('click', ()=> openModal());
		el.closeModal.addEventListener('click', closeModal);
		el.modal.addEventListener('click', (e)=>{ if(e.target === el.modal) closeModal(); });

		el.f_cover.addEventListener('change', async (e)=>{
			const file = e.target.files && e.target.files[0];
			if(!file) return;
			state.coverDataUrl = await readFileAsDataURL(file);
		});

		el.saveBtn.addEventListener('click', onSave);
	}

	async function loadCategories(){
		const categories = await service.getLocalCategories();
		const blogCats = categories.filter(c => c.type === 'blog');
		el.categoryFilter.innerHTML = `<option value="all">全部分类</option>` +
			blogCats.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
		el.f_category.innerHTML = blogCats.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
	}

	async function reloadTable(){
		const { items } = await service.getArticles({ search: state.search, category: state.category });
		renderTable(items);
	}

	function renderTable(items){
		el.tbody.innerHTML = items.map(a => `
			<tr class="row">
				<td>${a.id}</td>
				<td>${escapeHTML(a.title)}</td>
				<td><span class="badge">${a.category}</span></td>
				<td>${a.publishDate || ''}</td>
				<td>${(a.tags||[]).map(t=>`<span class="badge">${escapeHTML(t)}</span>`).join(' ')}</td>
				<td class="actions">
					<button data-edit="${a.id}">编辑</button>
					<button data-del="${a.id}">删除</button>
				</td>
			</tr>
		`).join('');

		// 绑定行内事件
		el.tbody.querySelectorAll('[data-edit]').forEach(btn=>{
			btn.addEventListener('click', async ()=>{
				const id = Number(btn.getAttribute('data-edit'));
				const { items } = await service.getArticles();
				const found = items.find(x => Number(x.id) === id);
				if(found) openModal(found);
			});
		});
		el.tbody.querySelectorAll('[data-del]').forEach(btn=>{
			btn.addEventListener('click', async ()=>{
				const id = Number(btn.getAttribute('data-del'));
				if(confirm('确定删除该文章？')){
					await service.deleteArticle(id);
					await reloadTable();
				}
			});
		});
	}

	function openModal(data){
		state.editingId = data ? data.id : null;
		el.modalTitle.textContent = data ? '编辑文章' : '新建文章';
		el.f_title.value = data ? (data.title||'') : '';
		el.f_excerpt.value = data ? (data.excerpt||'') : '';
		el.f_content.value = data ? (data.content||'') : '';
		el.f_category.value = data ? (data.category||'') : (el.f_category.options[0]?.value||'');
		el.f_tags.value = data ? (Array.isArray(data.tags)?data.tags.join(', '):'') : '';
		state.coverDataUrl = data && data.cover ? data.cover : '';
		el.modal.classList.add('open');
	}

	function closeModal(){
		el.modal.classList.remove('open');
		state.editingId = null;
		state.coverDataUrl = '';
		el.f_cover.value = '';
	}

	async function onSave(){
		const payload = {
			title: el.f_title.value.trim(),
			excerpt: el.f_excerpt.value.trim(),
			content: el.f_content.value.trim(),
			category: el.f_category.value,
			tags: splitTags(el.f_tags.value),
			cover: state.coverDataUrl
		};
		if(!payload.title){ alert('标题不能为空'); return; }
		if(!payload.category){ alert('请选择分类'); return; }

		if(state.editingId){
			await service.updateArticle(state.editingId, payload);
		}else{
			await service.createArticle(payload);
		}
		closeModal();
		await reloadTable();
	}

	// ========== 工具函数 ==========
	function debounce(fn, wait){
		let t;return function(){clearTimeout(t);const ctx=this,args=arguments;t=setTimeout(()=>fn.apply(ctx,args),wait)}
	}
	function escapeHTML(str){
		return (str||'').replace(/[&<>"]+/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[s]));
	}
	function splitTags(str){
		return (str||'').split(',').map(s=>s.trim()).filter(Boolean);
	}
	function readFileAsDataURL(file){
		return new Promise((resolve,reject)=>{
			const reader = new FileReader();
			reader.onload = ()=> resolve(String(reader.result||''));
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}
})();


