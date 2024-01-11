<?php
/**
 * API - OG Image Fetcher
 *
 * @package Prolin
 * @author Takuto Yanagida
 * @version 2024-01-11
 */

$url = $_GET['url'] ?? null;  // phpcs:ignore

if ( $url && filter_var( $url, FILTER_VALIDATE_URL ) ) {
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
	echo $ret;  // phpcs:ignore
} else {
	echo 'error';
}
