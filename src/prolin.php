<?php
/**
 * Prolin
 *
 * @package Prolin
 * @author Takuto Yanagida
 * @version 2024-01-11
 */

/**
 * Parses a profile URL and returns an array of type, label, URL, and ID.
 *
 * @param string $url The profile URL to parse.
 * @return array|null An array of type, label, URL, and ID, or null if the URL is invalid or not supported.
 */
function parse_profile_url( $url ) {
	$uo = wp_parse_url( $url );
	if ( ! $uo || ! isset( $uo['host'] ) ) {
		return null;
	}
	$ret = get_orcid_id( $uo, $url );
	if ( $ret ) {
		list( $label, $url, $id ) = $ret;
		return array(
			'type'  => 'orcid',
			'label' => $label,
			'url'   => $url,
			'id'    => $id,
		);
	}
	$ret = get_google_scholar_id( $uo, $url );
	if ( $ret ) {
		list( $label, $url, $id ) = $ret;
		return array(
			'type'  => 'google-scholar',
			'label' => $label,
			'url'   => $url,
			'id'    => $id,
		);
	}
	$ret = get_kaken_id( $uo, $url );  // cspell:disable-line.
	if ( $ret ) {
		list( $label, $url, $id ) = $ret;
		return array(
			'type'  => 'kaken',  // cspell:disable-line.
			'label' => $label,
			'url'   => $url,
			'id'    => $id,
		);
	}
	$ret = get_researchmap_id( $uo, $url );
	if ( $ret ) {
		list( $label, $url, $id ) = $ret;
		return array(
			'type'  => 'researchmap',
			'label' => $label,
			'url'   => $url,
			'id'    => $id,
		);
	}
	$ret = get_jglobal_id( $uo, $url );  // cspell:disable-line.
	if ( $ret ) {
		list( $label, $url, $id ) = $ret;
		return array(
			'type'  => 'j-global',
			'label' => $label,
			'url'   => $url,
			'id'    => $id,
		);
	}
	$ret = get_youtube_video_id( $uo, $url );
	if ( $ret ) {
		list( $label, $url, $id, $opts ) = $ret;
		return array(
			'type'  => 'j-global',
			'label' => $label,
			'url'   => $url,
			'id'    => $id,
			'opts'  => $opts,
		);
	}
	$ret = get_website_info( $uo, $url );
	if ( $ret ) {
		list( $label, $url, $id, $opts ) = $ret;
		return array(
			'type'  => 'website',
			'label' => $label,
			'url'   => $url,
			'id'    => $id,
			'opts'  => $opts,
		);
	}
	return null;
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * Gets the ORCID ID from a URL object and the original URL.
 *
 * @param array  $uo   The parsed URL object.
 * @param string $href The original URL.
 * @return array|null An array of label, URL, and ID, or null if the URL is not an ORCID URL.
 */
function get_orcid_id( $uo, $href ) {
	if ( 'orcid.org' === $uo['host'] ) {
		$id = str_replace( '/', '', $uo['path'] );
		if ( preg_match( '/^\d{4}-\d{4}-\d{4}-\d{4}$/', $id ) ) {
			$url = "https://orcid.org/$id";
			return array( 'ORCID', $url, $id );
		}
		return array( 'ORCID', $href, null );
	}
	return null;
}

/**
 * Gets the Google Scholar ID from a URL object and the original URL.
 *
 * @param array  $uo   The parsed URL object.
 * @param string $href The original URL.
 * @return array|null An array of label, URL, and ID, or null if the URL is not a Google Scholar URL.
 */
function get_google_scholar_id( $uo, $href ) {
	if ( strpos( $uo['host'], 'scholar.google.' ) === 0 ) {
		$usp = array();
		parse_str( $uo['query'], $usp );
		if ( isset( $usp['user'] ) ) {
			$id  = $usp['user'];
			$url = "https://scholar.google.com/citations?user=$id&hl=%lang%";
			return array( 'Google Scholar', $url, $id );
		}
		return array( 'Google Scholar', $href, null );
	}
	return null;
}

/** Cspell:disable-next-line.
 * Gets the KAKEN ID from a URL object and the original URL.
 *
 * @param array  $uo   The parsed URL object.
 * @param string $href The original URL.
 * @return array|null An array of label, URL, and ID, or null if the URL is not a KAKEN URL.  // cspell:disable-line.
 */
function get_kaken_id( $uo, $href ) /* cspell:disable-line */ {
	if ( 'nrid.nii.ac.jp' === $uo['host'] ) {  // cspell:disable-line.
		$f = false;
		foreach ( explode( '/', $uo['path'] ) as $p ) {
			if ( $f && preg_match( '/^\d{13}$/', $p ) ) {
				$id  = $p;
				$url = "https://nrid.nii.ac.jp/%lang%/nrid/$id";
				return array( 'KAKEN', $url, $id );  // cspell:disable-line.
			}
			$f = ( 'nrid' === $p );  // cspell:disable-line.
		}
		return array( 'KAKEN', $href, null );  // cspell:disable-line.
	}
	return null;
}

/**
 * Gets the researchmap ID from a URL object and the original URL.
 *
 * @param array  $uo   The parsed URL object.
 * @param string $href The original URL.
 * @return array|null An array of label, URL, and ID, or null if the URL is not a researchmap URL.
 */
function get_researchmap_id( $uo, $href ) {
	if ( 'researchmap.jp' === $uo['host'] ) {
		$ps = array_filter(
			explode( '/', $uo['path'] ),
			function ( $e ) {
				return strlen( $e ) > 0;
			}
		);
		$fp = $ps[0] ?? null;
		if ( $fp ) {
			if ( ! in_array( $fp, array( 'researchers', 'achievements', 'communities', 'community-inf', 'public' ), true ) ) {
				$id  = $fp;
				$url = "https://researchmap.jp/$id?lang=%lang%";
				return array( 'researchmap', $url, $id );
			}
		}
		return array( 'researchmap', $href, null );
	}
	return null;
}

/**
 * Gets the J-GLOBAL ID from a URL object and the original URL.
 *
 * @param array  $uo   The parsed URL object.
 * @param string $href The original URL.
 * @return array|null An array of label, URL, and ID, or null if the URL is not a J-GLOBAL URL.
 */
function get_jglobal_id( $uo, $href ) /* cspell:disable-line */ {
	if ( 'jglobal.jst.go.jp' === $uo['host'] ) {  // cspell:disable-line.
		$usp = array();
		parse_str( $uo['query'], $usp );
		if ( isset( $usp['JGLOBAL_ID'] ) ) {  // cspell:disable-line.
			$id = $usp['JGLOBAL_ID'];  // cspell:disable-line.
			return array( 'J-GLOBAL', $href, $id );
		}
		return array( 'J-GLOBAL', $href, null );
	}
	return null;
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * Gets the YouTube video ID from a URL object.
 *
 * @param array  $uo   The parsed URL object.
 * @param string $href The original URL.
 * @return array|null An array of label, URL, and ID, or null if the URL is not a YouTube video URL.
 */
function get_youtube_video_id( $uo, $href ) {
	$type = array_search( $uo['host'], array( 'youtu.be', 'www.youtube.com' ), true );
	if ( false === $type ) {
		return null;
	}
	$id = null;
	if ( 0 === $type ) {
		$ps = array_filter( explode( '/', $uo['path'] ) );
		$fp = $ps[0] ?? null;
		if ( $fp ) {
			$id = $fp;
		}
	} elseif ( 1 === $type ) {
		$usp = array();
		parse_str( $uo['query'], $usp );
		if ( isset( $usp['v'] ) ) {
			$id = $usp['v'];
		}
	}
	if ( $id ) {
		$fns  = array( 'default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault' );  // cspell:disable-line.
		$opts = array(
			'title' => get_page_title( $href ),
		);
		foreach ( $fns as $fn ) {
			$opts[ $fn ] = "https://img.youtube.com/vi/$id/$fn.jpg";
		}
		return array( 'Youtube Video', $uo->href, null, $opts );
	} else {
		return array( 'Youtube Video', $uo->href, null, null );
	}
}

/**
 * Gets the information of the website from a URL object.
 *
 * @param array  $uo   The parsed URL object.
 * @param string $href The original URL.
 * @returns An array of label, URL, and information.
 */
function get_website_info( $uo, $href ) {
	$opts = array(
		'title'    => get_page_title( $href ),
		'og_image' => get_og_image( $href ),
	);
	return array( 'Website', $href, null, $opts );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * Gets the page title of a given URL by fetching and parsing the HTML content.
 *
 * @param string $url The URL to get the page title from.
 * @return string The page title as a string, or an empty string if the title element is not found.
 */
function get_page_title( string $url ): string {
	$html = file_get_contents( $url );  // phpcs:ignore

	$doc = new DOMDocument();
	$doc->loadHTML( mb_convert_encoding( $html, 'HTML-ENTITIES', 'UTF-8' ) );

	$te = $doc->getElementsByTagName( 'title' )->item( 0 );
	return $te->nodeValue;  // phpcs:ignore
}

/**
 * Gets the OGP image of a given URL by fetching and parsing the HTML content.
 *
 * @param string $url The URL to get the OGP image from.
 * @return string The OGP image as a string, or an empty string if the meta element is not found.
 */
function get_og_image( string $url ): string {
	$html = file_get_contents( $url );  // phpcs:ignore

	$doc = new DOMDocument();
	$doc->loadHTML( mb_convert_encoding( $html, 'HTML-ENTITIES', 'UTF-8' ) );

	$ms  = $doc->getElementsByTagName( 'meta' );
	$ret = '';

	foreach ( $ms as $m ) {  // phpcs:ignore
		if ( 'og:image' === $m->getAttribute( 'property' ) || 'og:image' === $m->getAttribute( 'name' ) ) {
			$ret = $m->getAttribute( 'content' );
			break;
		}
	}
	return $ret;  // phpcs:ignore
}
