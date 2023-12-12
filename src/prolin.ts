/*!
 * Prolin
 *
 * @author Takuto Yanagida
 * @version 2023-12-12
 */

export function parseUrl(url: string) {
	let uo = null;
	try {
		uo  = new URL(url);
	} catch (e) {
	}
	if (null === uo) {
		return null;
	}
	const [label0, url0, id0] = getOrcidId(uo);
	if (url0) {
		return { type: 'orcid', label: label0, url: url0, id: id0 };
	}
	const [label1, url1, id1] = getGoogleScholarId(uo);
	if (url1) {
		return { type: 'google-scholar', label: label1, url: url1, id: id1 };
	}
	const [label2, url2, id2] = getKakenId(uo);
	if (url2) {
		return { type: 'kaken', label: label2, url: url2, id: id2 };
	}
	const [label3, url3, id3] = getResearchmapId(uo);
	if (url3) {
		return { type: 'researchmap', label: label3, url: url3, id: id3 };
	}
	return null;
}

function getOrcidId(uo: URL) {
	if ('orcid.org' === uo.hostname) {
		let id = uo.pathname.replace(/\//g, '');
		if (/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(id)) {
			const url = `https://orcid.org/${id}`;
			return ['ORCID', url, id];
		}
		return ['ORCID', uo.href, null];
	}
	return [null, null, null];
}

function getGoogleScholarId(uo: URL) {
	if (uo.hostname.startsWith('scholar.google.')) {
		const usp = new URLSearchParams(uo.search);
		if (usp.has('user')) {
			const id = usp.get('user');
			const url = `https://scholar.google.com/citations?user=${id}&hl=%lang%`;
			return ['Google Scholar', url, id];
		}
		return ['Google Scholar', uo.href, null];
	}
	return [null, null, null];
}

function getKakenId(uo: URL) {
	if ('nrid.nii.ac.jp' === uo.hostname) {
		let f = false;
		for (const p of uo.pathname.split('/')) {
			if (f && /^\d{13}$/.test(p)) {
				const id = p;
				const url = `https://nrid.nii.ac.jp/%lang%/nrid/${id}`;
				return ['KAKEN', url, id];
			}
			f = ('nrid' === p);
		}
		return ['KAKEN', uo.href, null];
	}
	return [null, null, null];
}

function getResearchmapId(uo: URL) {
	if ('researchmap.jp' === uo.hostname) {
		const ps = uo.pathname.split('/').filter(e => e.length);
		const fp = ps?.[0];
		if (fp) {
			if (!['researchers', 'achievements', 'communities', 'community-inf', 'public'].includes(fp)) {
				const id = fp;
				const url = `https://researchmap.jp/${id}?lang=%lang%`;
				return ['researchmap', url, id];
			}
		}
		return ['researchmap', uo.href, null];
	}
	return [null, null, null];
}
