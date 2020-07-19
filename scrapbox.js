// 選択した文字列にマーカー
scrapbox.PopupMenu.addButton({
  title: "マーカー",
  onClick: (text) => `[[${text}]]`,
});

const numberListStyle = "color: #619FE0;";
const firstNumberListStyle = "margin-left: 0.4em; " + numberListStyle;

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
  listDecimalAry,
  text,
  isDecimal,
  isDot,
  shouldBeUpper
) => {
  // ドットが来るまでspanAryに処理を追加
  spanAry.push(targetSpan);
  if (isDecimal) listDecimalAry.push(text);
  if (!isDot) return { shouldReturn: true };
  // ドットだった時、整数をローマ数字に変換する
  const listNumDec = Number(listDecimalAry.join(""));
  const listNumRoman = convertToRoman(listNumDec, shouldBeUpper) + ".";
  listDecimalAry.push(".");
  return { listNumRoman, shouldReturn: false };
};

const createColorSpan = (targetSpan, textContent, defaultNum, index) => {
  const span = document.createElement("span");
  const style = index === 0 ? firstNumberListStyle : numberListStyle;
  span.textContent = textContent;
  span.setAttribute("style", style);
  if (!!defaultNum) {
    span.setAttribute("default", defaultNum);
  }
  targetSpan.textContent = null;
  targetSpan.appendChild(span);
};

const cramSurplusRomanIntoLast = (
  listDecimalAry,
  listNumRoman,
  spanAry,
  index
) => {
  // 223をローマ数字にするとccⅹⅹⅲになり、文字数が増える。この時に最後の要素に文字を詰め込む処理
  // [2, 2, 3, .] → [c, c, ⅹ, ⅹⅲ.]
  const isLast = listDecimalAry.length - 1 === index;
  const textContent = isLast
    ? listNumRoman.substr(index)
    : listNumRoman.substr(index, 1);
  createColorSpan(spanAry[index], textContent, listDecimalAry[index], index);
};

const alignRomanOnRightInSpan = (
  listDecimalAry,
  listNumRoman,
  spanAry,
  index
) => {
  // 1000をローマ数字にするとMになり、文字数が減る。この時に文字を右詰めにする処理
  // [1, 0, 0, 0, .] → [undefined, undefined, undefined, M, .]
  const start = listDecimalAry.length - listNumRoman.length;
  if (index < start) {
    createColorSpan(spanAry[index], null, listDecimalAry[index], index);
  } else {
    // index >= start
    const textContent = listNumRoman.substr(index - start, 1);
    createColorSpan(spanAry[index], textContent, listDecimalAry[index], index);
  }
};

const replaceDecimalToRoman = (spanAry, listNumRoman, listDecimalAry) => {
  // ドット以前の数字たちが格納されたspanの配列をforEachで回す
  spanAry.forEach((value, index) => {
    if (listNumRoman.length > listDecimalAry.length) {
      // [2, 2, 3, .] → [c, c, ⅹ, ⅹⅲ.]
      cramSurplusRomanIntoLast(listDecimalAry, listNumRoman, spanAry, index);
    } else if (listNumRoman.length < listDecimalAry.length) {
      // [1, 0, 0, 0, .] → [undefined, undefined, undefined, M, .]
      alignRomanOnRightInSpan(listDecimalAry, listNumRoman, spanAry, index);
    } else {
      // listNumRoman.length === listDecimalAry.length
      const textContent = listNumRoman.substr(index, 1);
      createColorSpan(
        spanAry[index],
        textContent,
        listDecimalAry[index],
        index
      );
    }
  });
};

const changeNumberListStyle = (targetSpansParent) => {
  let isFirst = true;
  let orderListType = "decimal";
  const listDecimalAry = [];
  const spanAry = [];

  // scrapboxでは一文字ずつspanタグに入れられている
  // spanごとに(一文字ごとに)処理を実行していく
  $(targetSpansParent)
    .children()
    .each((index, targetSpan) => {
      const text = $(targetSpan).text();
      const isBlank = /^\s$/.test(text);
      if (isBlank) return false; // ≒ break;
      if (isFirst) {
        // インデントの数に応じて変換する数字のタイプを判断する
        orderListType = getOrderListType(targetSpan);
        isFirst = false;
      }
      const isDecimal = /^\d+$/.test(text);
      const isDot = /^\.+$/.test(text);

      switch (orderListType) {
        case "decimal":
          // typeが整数の時は変換の必要がないので、そのまま色を付ける
          if (isDecimal || isDot)
            createColorSpan(targetSpan, text, text, index);
          break;
        case "upper-roman":
        case "lower-roman":
          // typeがローマ数字の時は、数字をローマ数字に変換して置き換える
          const shouldBeUpper = orderListType === "upper-roman" ? true : false;
          const { listNumRoman, shouldReturn } = convertToRomanTillDot(
            spanAry,
            targetSpan,
            listDecimalAry,
            text,
            isDecimal,
            isDot,
            shouldBeUpper
          );
          if (shouldReturn) return true; // ≒ continue;
          replaceDecimalToRoman(spanAry, listNumRoman, listDecimalAry);
          return false; // ≒ break;
      }
    });
};

const customizeNumberList = (textVal) => {
  const isDecimalList = findDecimalList(textVal);
  if (isDecimalList) {
    const targetSpansParent = getTarget(textVal);
    changeNumberListStyle(targetSpansParent);
  }
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

const searchForLastMatchIndex = (str, regexp, length) => {
  let text = $(str).text().replace(/^\s*/, ""); // 最初のインデントを削除
  let indexOfDotBlank = -1;
  while (true) {
    const followingIndex = text.search(regexp);
    if (followingIndex === -1) break; // 一致する位置がなければreturn
    indexOfDotBlank = followingIndex;
    // 一致した箇所までを削除
    const deletedText = text.slice(followingIndex + length);
    // 削除した部分に"s"を挿入
    text = "s".repeat(followingIndex + length) + deletedText;
  }
  return indexOfDotBlank;
};

const getColorAry = (targetSpansParent, lastDotIndex, isNumberList) => {
  // 文字列が'1. 'や'ⅷ. 'などの型に当てはまらなければ色を元に戻すべきと判断
  let shouldRevert = !isNumberList;
  let StringIndex = -1;
  const colorAry = [];
  $(targetSpansParent)
    .children()
    .each((index, targetSpan) => {
      // 最後にマッチしているドットが来るまで色付きSpanがあればcolorAryに追加
      const text = $(targetSpan).text();
      StringIndex += text.length;
      const $colorSpan = $(targetSpan).find(`span[style="${numberListStyle}"]`);
      const hasColor = !!$colorSpan.length;
      // ドットが来る前に色のないspanタグが来た場合、色を元に戻すべきと判断
      hasColor ? colorAry.push(targetSpan) : (shouldRevert = true);
      if (StringIndex === lastDotIndex) return false; // ≒ break
    });
  return { shouldRevert, colorAry };
};

const judgeShouldRevert = (textVal) => {
  const targetSpansParent = getTarget(textVal);
  const isNumberList = findNumberList(textVal);
  const regexp = /(?<=([M(CM)D(CD)C(ⅩC)L(ⅩL)Ⅹ(Ⅸ)ⅧⅦⅥⅤⅣⅢⅡⅠ]+|[m(cm)d(cd)c(ⅹc)l(ⅹl)ⅹⅸⅷⅶⅵⅴⅳⅲⅱⅰ]+|\d+))\.\s/g;
  const lastDotIndex = searchForLastMatchIndex(textVal, regexp, 2);
  const { shouldRevert, colorAry } = getColorAry(
    targetSpansParent,
    lastDotIndex,
    isNumberList
  );
  return { shouldRevert, colorAry };
};

const revertToNormalColorAndNumber = (colorAry) => {
  colorAry.some((span) => {
    const $colorSpan = $(span).find(`span[style="${numberListStyle}"]`);
    let defaultNum = "";
    // エラー処理
    if (!$colorSpan.length) {
      console.error(
        'colorAry配列に"span[style="${numberListStyle}"]"を持たないspanが存在しています。'
      );
      return true;
    }
    // 色と数字を元に戻す
    $colorSpan.each((i, colorSpan) => {
      defaultNum = colorSpan.getAttribute("default");
    });
    span.textContent = defaultNum;
  });
};

const modifyNumberList = (textVal) => {
  // 色付きspanタグを持っているかどうか取得
  const $colorSpan = $(textVal).find(`span[style="${numberListStyle}"]`);
  const hasColor = !!$colorSpan.length;
  if (!hasColor) return;
  // 色付きspanタグが存在する場合の処理
  const { shouldRevert, colorAry } = judgeShouldRevert(textVal);
  if (shouldRevert) revertToNormalColorAndNumber(colorAry);
};

const $appRoot = $("#app-container");
$appRoot.on("keyup", (e) => {
  $('span[class="text"]').each((i, textVal) => {
    modifyNumberList(textVal);
    customizeNumberList(textVal);
  });
});

$(function () {
  $('span[class="text"]').each((i, textVal) => {
    customizeNumberList(textVal);
  });
});
