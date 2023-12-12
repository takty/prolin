function convertISBN13to10(isbnNumber) {
	//ISBN13桁のうち上から3桁と下一桁を取り除いた9桁を取得する
	var isbn10 = isbnNumber.slice(3, 12);
	//9桁の数字を1文字ずつ分割して配列に格納する
	var data = isbn10.split("");
	//計算データの初期化
	var calcData = 0;
	//9桁の各位の数字を数式のように計算して合計する
	for (i = 0; i < data.length; i++) {
		calcData += (10 - i) * Number(data[i]);
	}
	//11-(算出した数値を11で割ったときの余り)求める
	calcData = 11 - calcData % 11;
	//計算した数値が11だった場合、0に置き換える
	if (calcData == 11) {
		calcData = 0;
	}
	//それ以外で10だった場合はxで置き換える
	else if (calcData == 10) {
		calcData = "x";
	}
	//9桁の数字に計算したcalcDataを末尾に付与した値を返却する
	return isbn10 + calcData;
}
