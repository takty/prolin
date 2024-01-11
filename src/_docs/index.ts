import { parseProfileUrl } from '../prolin.ts';

document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('apply');
	const links = document.getElementById('links');
	const ul = document.getElementById('banners');

	if (btn && links && ul) {
		btn.addEventListener('click', async () => {
			ul.innerHTML = '';

			const str = (links as HTMLTextAreaElement).value;
			for (const link of str.split('\n')) {
				const pl = await parseProfileUrl(link);
				if (pl) {
					const { type, label, url, id, opts } = pl;
					addLink(type, label, url.replace('%lang%', 'en'), opts);
				}
			}
		});
	}

	function addLink(type: string, label: string, url: string, opts: object|null|undefined) {
		const ul = document.getElementById('banners');
		const li = document.createElement('li');
		li.classList.add(type);
		const a = document.createElement('a');
		a.href = url;
		a.innerText = label;
		if (opts?.['default']) {
			a.setAttribute('style', `background-image:url(${opts?.['default']});`);
		}
		if (opts?.['og_image']) {
			a.setAttribute('style', `background-image:url(${opts?.['og_image']});`);
		}
		if (opts?.['title']) {
			a.innerText = opts?.['title'];
		}
		li.appendChild(a);
		ul?.appendChild(li);
	}
});
