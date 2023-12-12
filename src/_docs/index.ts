import { parseUrl } from '../prolin.ts';

document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('apply');
	const links = document.getElementById('links');
	if (btn && links) {
		btn.addEventListener('click', () => {
			const str = (links as HTMLTextAreaElement).value;
			for (const link of str.split('\n')) {
				const pl = parseUrl(link);
				if (pl) {
					const { type, label, url, id } = pl;
					addLink(type, label, url.replace('%lang%', 'en'));
				}
			}
		});
	}

	function addLink(type: string, label: string, url: string) {
		const ul = document.getElementById('banners');
		const li = document.createElement('li');
		li.classList.add(type);
		const a = document.createElement('a');
		a.href = url;
		a.innerText = label;
		li.appendChild(a);
		ul?.appendChild(li);
	}
});
