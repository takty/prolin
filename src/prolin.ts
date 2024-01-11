/*!
 * Prolin
 *
 * @author Takuto Yanagida
 * @version 2024-01-11
 */

/**
 * Parses a profile URL and returns an object with the type, label, URL, and ID.
 *
 * @param url - The profile URL to parse.
 * @returns An object with the type, label, URL, and ID, or null if the URL is invalid or not supported.
 */
export async function parseProfileUrl(url: string) {
	let uo = null;
	try {
		uo = new URL(url);
	} catch (e) {
	}
	if (!uo) {
		return null;
	}
	let ret = getOrcidId(uo);
	if (ret) {
		const [label, url, id] = ret;
		return { type: 'orcid', label, url, id };
	}
	ret = getGoogleScholarId(uo);
	if (ret) {
		const [label, url, id] = ret;
		return { type: 'google-scholar', label, url, id };
	}
	ret = getKakenId(uo);  // cspell:disable-line
	if (ret) {
		const [label, url, id] = ret;
		return { type: 'kaken', label, url, id };  // cspell:disable-line
	}
	ret = getResearchmapId(uo);
	if (ret) {
		const [label, url, id] = ret;
		return { type: 'researchmap', label, url, id };
	}
	ret = getJGlobalId(uo);
	if (ret) {
		const [label, url, id] = ret;
		return { type: 'j-global', label, url, id };
	}
	ret = await getYoutubeVideoId(uo);
	if (ret) {
		const [label, url, id, opts] = ret;
		return { type: 'youtube-video', label, url, id, opts };
	}
	ret = await getWebsiteInfo(uo);
	if (ret) {
		const [label, url, id, opts] = ret;
		return { type: 'website', label, url, id, opts };
	}
	return null;
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * Gets the ORCID ID from a URL object.
 *
 * @param uo - The URL object to get the ID from.
 * @returns An array of label, URL, and ID, or null if the URL is not an ORCID URL.
 */
function getOrcidId(uo: URL): [string, string, string | null, object | null] | null {
	if ('orcid.org' === uo.hostname) {
		const id = uo.pathname.replace(/\//g, '');
		if (/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(id)) {
			const url = `https://orcid.org/${id}`;
			return ['ORCID', url, id, null];
		}
		return ['ORCID', uo.href, null, null];
	}
	return null;
}

/**
 * Gets the Google Scholar ID from a URL object.
 *
 * @param uo - The URL object to get the ID from.
 * @returns An array of label, URL, and ID, or null if the URL is not a Google Scholar URL.
 */
function getGoogleScholarId(uo: URL): [string, string, string | null, object | null] | null {
	if (uo.hostname.startsWith('scholar.google.')) {
		const usp = new URLSearchParams(uo.search);
		if (usp.has('user')) {
			const id = usp.get('user');
			const url = `https://scholar.google.com/citations?user=${id}&hl=%lang%`;
			return ['Google Scholar', url, id, null];
		}
		return ['Google Scholar', uo.href, null, null];
	}
	return null;
}

/** Cspell:disable-next-line.
 * Gets the KAKEN ID from a URL object.
 *
 * @param uo - The URL object to get the ID from.
 * @returns An array of label, URL, and ID, or null if the URL is not a KAKEN URL.  // cspell:disable-line.
 */
function getKakenId(uo: URL): [string, string, string | null, object | null] | null {  // cspell:disable-line
	if ('nrid.nii.ac.jp' === uo.hostname) {  // cspell:disable-line
		let f = false;
		for (const p of uo.pathname.split('/')) {
			if (f && /^\d{13}$/.test(p)) {
				const id = p;
				const url = `https://nrid.nii.ac.jp/%lang%/nrid/${id}`;
				return ['KAKEN', url, id, null];  // cspell:disable-line
			}
			f = ('nrid' === p);  // cspell:disable-line
		}
		return ['KAKEN', uo.href, null, null];  // cspell:disable-line
	}
	return null;
}

/**
 * Gets the researchmap ID from a URL object.
 *
 * @param uo - The URL object to get the ID from.
 * @returns An array of label, URL, and ID, or null if the URL is not a researchmap URL.
 */
function getResearchmapId(uo: URL): [string, string, string | null, object | null] | null {
	if ('researchmap.jp' === uo.hostname) {
		const ps = uo.pathname.split('/').filter(e => e.length);
		const fp = ps?.[0];
		if (fp) {
			if (!['researchers', 'achievements', 'communities', 'community-inf', 'public'].includes(fp)) {
				const id = fp;
				const url = `https://researchmap.jp/${id}?lang=%lang%`;
				return ['researchmap', url, id, null];
			}
		}
		return ['researchmap', uo.href, null, null];
	}
	return null;
}

/**
 * Gets the J-GLOBAL ID from a URL object.
 *
 * @param uo - The URL object to get the ID from.
 * @returns An array of label, URL, and ID, or null if the URL is not a J-GLOBAL URL.
 */
function getJGlobalId(uo: URL): [string, string, string | null, object | null] | null {
	if ('jglobal.jst.go.jp' === uo.hostname) {  // cspell:disable-line
		const usp = new URLSearchParams(uo.search);
		if (usp.has('JGLOBAL_ID')) {  // cspell:disable-line
			const id = usp.get('JGLOBAL_ID');  // cspell:disable-line
			return ['J-GLOBAL', uo.href, id, null];
		}
		return ['J-GLOBAL', uo.href, null, null];
	}
	return null;
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * Gets the YouTube video ID from a URL object.
 *
 * @param uo - The URL object to get the ID from.
 * @returns An array of label, URL, and ID, or null if the URL is not a YouTube video URL.
 */
async function getYoutubeVideoId(uo: URL): Promise<[string, string, string | null, object | null] | null> {
	const type = ['youtu.be', 'www.youtube.com'].indexOf(uo.hostname);
	if (-1 === type) {
		return null;
	}
	let id = null;
	if (0 === type) {
		const ps = uo.pathname.split('/').filter(e => e.length);
		const fp = ps?.[0];
		if (fp) {
			id = fp;
		}
	} else if (1 === type) {
		const usp = new URLSearchParams(uo.search);
		if (usp.has('v')) {
			id = usp.get('v');
		}
	}
	if (id) {
		const fns = ['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'];  // cspell:disable-line
		const opts : { [key: string]: unknown } = {
			title: await getPageTitle(uo.href),
		};
		for (const fn of fns) {
			opts[fn] = `https://img.youtube.com/vi/${id}/${fn}.jpg`;
		}
		return ['Youtube Video', uo.href, null, opts];
	} else {
		return ['Youtube Video', uo.href, null, null];
	}
}

/**
 * Gets the information of the website from a URL object.
 *
 * @param uo - The URL object to get the ID from.
 * @returns An array of label, URL, and information.
 */
async function getWebsiteInfo(uo: URL): Promise<[string, string, string | null, object | null] | null> {
	const opts : { [key: string]: unknown } = {
		title   : await getPageTitle(uo.href),
		og_image: await getOgImage(uo.href),
	};
	return ['Website', uo.href, null, opts];
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * Gets the page title of a given URL by calling an API endpoint.
 *
 * @param url - The URL to get the page title from.
 * @returns A promise that resolves to the page title as a string, or null if the API call fails.
 */
async function getPageTitle(url: string): Promise<string | null> {
	try {
		const res = await fetch(`api-title.php?url=${encodeURIComponent(url)}`);
		return await res.text();
	} catch (error) {
		console.error(error);
		return null;
	}
}

/**
 * Gets the OGP image of a given URL by calling an API endpoint.
 *
 * @param url - The URL to get the OGP image from
 * @returns A promise that resolves to the OGP image as a string, or null if the API call fails
 */
async function getOgImage(url: string): Promise<string | null> {
	try {
		const res = await fetch(`api-og-image.php?url=${encodeURIComponent(url)}`);
		return await res.text();
	} catch (error) {
		console.error(error);
		return null;
	}
}
