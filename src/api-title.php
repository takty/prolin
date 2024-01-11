<?php
/**
 * API - Title Fetcher
 *
 * @package Prolin
 * @author Takuto Yanagida
 * @version 2024-01-10
 */

$url = $_GET['url'] ?? null;  // phpcs:ignore

if ( $url && filter_var( $url, FILTER_VALIDATE_URL ) ) {
	$html = file_get_contents( $url );  // phpcs:ignore

	$doc = new DOMDocument();
	$doc->loadHTML( mb_convert_encoding( $html, 'HTML-ENTITIES', 'UTF-8' ) );

	$te = $doc->getElementsByTagName( 'title' )->item( 0 );
	echo $te->nodeValue;  // phpcs:ignore
} else {
	echo 'error';
}
