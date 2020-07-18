// 選択した文字列にマーカー
scrapbox.PopupMenu.addButton({
  title: "マーカー",
  onClick: (text) => `[[${text}]]`,
});

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

  for (var i = 0; i < decimal.length; i++) {
    while (decimal[i] <= num) {
      romanized += romanNumeral[i];
      num -= decimal[i];
    }
  }
  return romanized;
};

const findNumberList = (val) => {
  const text = $(val).text();
  // "1. hoge"
  // "10. foo"
  // "  1. bar"
  // などを取得する
  const regexp = /^\s*\d+\.\s.*/g;
  const isNumber = regexp.test(text);
  return isNumber;
};

const getTarget = (textVal) => {
  const $indentObj = $(textVal).find('span[class="indent"]');
  const hasIndent = $indentObj.length;
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

const getOrderListTypeIndex = (targetSpan) => {
  const className = targetSpan.className;
  const indentAmount = className.substr(2, 1);
  return indentAmount % 3;
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
  // ドットだった時の処理
  const listNumDec = Number(listNumAry.join(""));
  const listNumRoman = convertToRoman(listNumDec, shouldBeUpper) + ".";
  listNumAry.push(".");
  return { listNumRoman, shouldReturn: false };
};

const cramSurplusRomanIntoLast = (listNumAry, listNumRoman, spanAry, index) => {
  // 223をローマ数字にするとccⅹⅹⅲになり、文字数が増える。この時に最後の要素に文字を詰め込む処理
  // [2, 2, 3, .] → [c, c, ⅹ, ⅹⅲ.]
  const isLast = listNumAry.length - 1 === index;
  const textContent = isLast
    ? listNumRoman.substr(index)
    : listNumRoman.substr(index, 1);
  createSpan(spanAry[index], textContent);
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
    createSpan(spanAry[index], textContent);
  }
};

const createSpan = (targetSpan, textContent) => {
  const span = document.createElement("span");
  span.textContent = textContent;
  span.setAttribute("style", "color: #619FE0");
  targetSpan.textContent = null;
  targetSpan.appendChild(span);
};

const replaceDecimalToRoman = (spanAry, listNumRoman, listNumAry) => {
  // ドット以前の数字たちが格納されたspanの配列をforEachで回す
  spanAry.forEach((value, index) => {
    if (listNumRoman.length > listNumAry.length) {
      cramSurplusRomanIntoLast(listNumAry, listNumRoman, spanAry, index);
    } else if (listNumRoman.length < listNumAry.length) {
      alignRomanOnRightInSpan(listNumAry, listNumRoman, spanAry, index);
    } else {
      // listNumRoman.length === listNumAry.length
      const textContent = listNumRoman.substr(index, 1);
      createSpan(spanAry[index], textContent);
    }
  });
};

const changeNumberListStyle = (targets) => {
  let isFirst = true;
  let orderListTypeIndex = 0;
  const listNumAry = [];
  const spanAry = [];

  $(targets)
    .children()
    .each((i, targetSpan) => {
      const text = $(targetSpan).text();
      const isBlank = /^\s$/.test(text);
      if (isBlank) return false;

      if (isFirst) {
        orderListTypeIndex = getOrderListTypeIndex(targetSpan);
        isFirst = false;
      }

      const isNumber = /^\d+$/.test(text);
      const isDot = /^\.+$/.test(text);

      // 判断したタイプをもとに処理を振り分け
      switch (orderListTypeIndex) {
        case 0:
          if (isNumber || isDot) createSpan(targetSpan, text);
          break;
        case 1:
        case 2:
          const shouldBeUpper = orderListTypeIndex === 1 ? true : false;
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

const customizeNumberList = () => {
  $('span[class="text"]').each((i, textVal) => {
    const isNumberList = findNumberList(textVal);

    if (isNumberList) {
      const target = getTarget(textVal);
      console.log(target);
      changeNumberListStyle(target);
    }
  });
};

const $appRoot = $("#app-container");
$appRoot.on("keyup", (e) => {
  customizeNumberList();
});

$(function () {
  console.log("ロードしたよ！");
});
