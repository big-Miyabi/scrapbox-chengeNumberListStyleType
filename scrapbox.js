// 選択した文字列にマーカー
scrapbox.PopupMenu.addButton({
  title: "マーカー",
  onClick: (text) => `[[${text}]]`,
});

const color = "color: #619FE0";

const convertToRoman = (num, shouldBeUpper) => {
  const decimal = [
    1000,
    900,
    500,
    400,
    100,
    90,
    50,
    40,
    10,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
    1,
  ];
  const upperRomanNumeral = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "ⅩC",
    "L",
    "ⅩL",
    "Ⅹ",
    "Ⅸ",
    "Ⅷ",
    "Ⅶ",
    "Ⅵ",
    "Ⅴ",
    "Ⅳ",
    "Ⅲ",
    "Ⅱ",
    "Ⅰ",
  ];
  const lowerRomanNumeral = [
    "m",
    "cm",
    "d",
    "cd",
    "c",
    "ⅹc",
    "l",
    "ⅹl",
    "ⅹ",
    "ⅸ",
    "ⅷ",
    "ⅶ",
    "ⅵ",
    "ⅴ",
    "ⅳ",
    "ⅲ",
    "ⅱ",
    "ⅰ",
  ];

  const romanNumeral = shouldBeUpper ? upperRomanNumeral : lowerRomanNumeral;
  let romanized = "";

  for (let i = 0; i < decimal.length; i++) {
    while (decimal[i] <= num) {
      romanized += romanNumeral[i];
      num -= decimal[i];
    }
  }
  return romanized;
};

const findDecimalList = (val) => {
  const text = $(val).text();
  // "1. hoge"  =>true
  // "10. foo"  =>true
  // "  1. bar" =>true
  // などを取得する
  const regexp = /^\s*\d+\.\s.*/g;
  const isDecimalList = regexp.test(text);
  return isDecimalList;
};

const findNumberList = (val) => {
  const text = $(val).text();
  // "1. hoge"
  // "Ⅷ. foo"
  // "  CD. bar"
  // などを取得する
  const regexp = /^\s*([M(CM)D(CD)C(ⅩC)L(ⅩL)Ⅹ(Ⅸ)ⅧⅦⅥⅤⅣⅢⅡⅠ]+|[m(cm)d(cd)c(ⅹc)l(ⅹl)ⅹⅸⅷⅶⅵⅴⅳⅲⅱⅰ]+|\d+)\.\s.*/g;
  const isNumberList = regexp.test(text);
  return isNumberList;
};

const getTarget = (textVal) => {
  const $indentObj = $(textVal).find('span[class="indent"]');
  const hasIndent = !!$indentObj.length;
  let targetVal = undefined;

  if (hasIndent) {
    $indentObj.each((i, v) => {
      targetVal = v;
    });
    return targetVal;
  } else {
    const $target = $(textVal).children("span");
    $target.each((i, v) => {
      targetVal = v;
    });
    return targetVal;
  }
};

const getOrderListType = (targetSpan) => {
  const orderListTypeAry = ["decimal", "upper-roman", "lower-roman"];
  const className = targetSpan.className;
  const indentAmount = className.substr(2, 1);
  const index = indentAmount % 3;
  return orderListTypeAry[index];
};

const convertToRomanTillDot = (
  spanAry,
  targetSpan,
  listNumAry,
  text,
  isNumber,
  isDot,
  shouldBeUpper
) => {
  // ドットが来るまでspanAryに処理を追加
  spanAry.push(targetSpan);
  if (isNumber) listNumAry.push(text);
  if (!isDot) return { shouldReturn: true };
  // ドットだった時、整数をローマ数字に変換する
  const listNumDec = Number(listNumAry.join(""));
  const listNumRoman = convertToRoman(listNumDec, shouldBeUpper) + ".";
  listNumAry.push(".");
  return { listNumRoman, shouldReturn: false };
};

const createColorSpan = (targetSpan, textContent) => {
  const span = document.createElement("span");
  span.textContent = textContent;
  span.setAttribute("style", color);
  targetSpan.textContent = null;
  targetSpan.appendChild(span);
};

const cramSurplusRomanIntoLast = (listNumAry, listNumRoman, spanAry, index) => {
  // 223をローマ数字にするとccⅹⅹⅲになり、文字数が増える。この時に最後の要素に文字を詰め込む処理
  // [2, 2, 3, .] → [c, c, ⅹ, ⅹⅲ.]
  const isLast = listNumAry.length - 1 === index;
  const textContent = isLast
    ? listNumRoman.substr(index)
    : listNumRoman.substr(index, 1);
  createColorSpan(spanAry[index], textContent);
};

const alignRomanOnRightInSpan = (listNumAry, listNumRoman, spanAry, index) => {
  // 1000をローマ数字にするとMになり、文字数が減る。この時に文字を右詰めにする処理
  // [1, 0, 0, 0, .] → [undefined, undefined, undefined, M, .]
  const start = listNumAry.length - listNumRoman.length;
  if (index < start) {
    spanAry[index].textContent = null;
  } else {
    // index >= start
    const textContent = listNumRoman.substr(index - start, 1);
    createColorSpan(spanAry[index], textContent);
  }
};

const replaceDecimalToRoman = (spanAry, listNumRoman, listNumAry) => {
  // ドット以前の数字たちが格納されたspanの配列をforEachで回す
  spanAry.forEach((value, index) => {
    if (listNumRoman.length > listNumAry.length) {
      // [2, 2, 3, .] → [c, c, ⅹ, ⅹⅲ.]
      cramSurplusRomanIntoLast(listNumAry, listNumRoman, spanAry, index);
    } else if (listNumRoman.length < listNumAry.length) {
      // [1, 0, 0, 0, .] → [undefined, undefined, undefined, M, .]
      alignRomanOnRightInSpan(listNumAry, listNumRoman, spanAry, index);
    } else {
      // listNumRoman.length === listNumAry.length
      const textContent = listNumRoman.substr(index, 1);
      createColorSpan(spanAry[index], textContent);
    }
  });
};

const changeNumberListStyle = (targetSpans) => {
  let isFirst = true;
  let orderListType = "decimal";
  const listNumAry = [];
  const spanAry = [];

  // scrapboxでは一文字ずつspanタグに入れられている
  // spanごとに(一文字ごとに)処理を実行していく
  $(targetSpans)
    .children()
    .each((i, targetSpan) => {
      const text = $(targetSpan).text();
      const isBlank = /^\s$/.test(text);
      if (isBlank) return false;
      if (isFirst) {
        // インデントの数に応じて変換する数字のタイプを判断する
        orderListType = getOrderListType(targetSpan);
        isFirst = false;
      }
      const isNumber = /^\d+$/.test(text);
      const isDot = /^\.+$/.test(text);

      switch (orderListType) {
        case "decimal":
          // typeが整数の時は変換の必要がないので、そのまま色を付ける
          if (isNumber || isDot) createColorSpan(targetSpan, text);
          break;
        case "upper-roman":
        case "lower-roman":
          // typeがローマ数字の時は、数字をローマ数字に変換して置き換える
          const shouldBeUpper = orderListType === "upper-roman" ? true : false;
          const { listNumRoman, shouldReturn } = convertToRomanTillDot(
            spanAry,
            targetSpan,
            listNumAry,
            text,
            isNumber,
            isDot,
            shouldBeUpper
          );
          if (shouldReturn) return true;
          replaceDecimalToRoman(spanAry, listNumRoman, listNumAry);
          return false;
      }
    });
};

const customizeNumberList = (textVal) => {
  const isDecimalList = findDecimalList(textVal);
  if (isDecimalList) {
    const target = getTarget(textVal);
    changeNumberListStyle(target);
  }
};

const revertToNormalColor = (textVal) => {
  // 色付き数字を持っているかどうか取得
  const $colorSpan = $(textVal).find(`span[style="${color}"]`);
  const hasColor = !!$colorSpan.length;

  if (hasColor) {
    const target = getTarget(textVal);
    const isNumberList = findNumberList(textVal);
    //if  文字列を取得して'1. 'や'ⅷ. 'などの型に当てはまらなければ
    // 数字がローマ数字ならば整数に変換
    // 変換した整数を一文字ずつspanタグに当てはめていく
  }
};

const $appRoot = $("#app-container");
$appRoot.on("keyup", (e) => {
  $('span[class="text"]').each((i, textVal) => {
    customizeNumberList(textVal);
    revertToNormalColor(textVal);
  });
});

$(function () {
  console.log("ロードしたよ！");
});
