// 選択した文字列にマーカー
scrapbox.PopupMenu.addButton({
  title: "マーカー",
  onClick: (text) => `[[${text}]]`,
});

const convertToRoman = (num, isUpper) => {
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

  const romanNumeral = isUpper ? upperRomanNumeral : lowerRomanNumeral;

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
  // などを取得したい
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

const addColor = (target) => {
  let isFirst = true;
  let listStyleTypeIndex = 0;
  let listNumStr = "";
  const spanArray = [];

  $(target)
    .children()
    .each((i, targetSpan) => {
      const text = $(targetSpan).text();
      const isBlank = /^\s$/.test(text);
      if (isBlank) return false;

      if (isFirst) {
        const className = targetSpan.className;
        const indentAmount = className.substr(2, 1);
        listStyleTypeIndex = indentAmount % 3;
        isFirst = false;
      }

      switch (listStyleTypeIndex) {
        case 0: {
          const isNumber = /^\d+$/.test(text);
          const isDot = /^\.+$/.test(text);
          if (isNumber || isDot) {
            const span = document.createElement("span");
            span.textContent = text;
            span.setAttribute("style", "color: #619FE0");
            targetSpan.textContent = null;
            targetSpan.appendChild(span);
          }
          break;
        }
        case 1:
        case 2: {
          spanArray.push(targetSpan);
          const isNumber = /^\d+$/.test(text);
          if (isNumber) listNumStr += text;
          const isDot = /^\.+$/.test(text);
          if (isDot) {
            const listNumDec = Number(listNumStr);
            const listNumUpperRoman = convertToRoman(listNumDec, true) + ".";
            listNumStr += ".";

            spanArray.forEach((value, index) => {
              if (listNumUpperRoman.length > listNumStr.length) {
                // ローマ数字の桁数が元の数字の桁数よりも大きい時
                const isLast = listNumStr.length - 1 === index;
                const span = document.createElement("span");
                span.textContent = isLast
                  ? listNumUpperRoman.substr(index)
                  : listNumUpperRoman.substr(index, 1);
                span.setAttribute("style", "color: #619FE0");
                spanArray[index].textContent = null;
                spanArray[index].appendChild(span);
              } else if (listNumUpperRoman.length < listNumStr.length) {
                // ローマ数字の桁数が元の数字の桁数よりも小さい時
                const start = listNumStr.length - listNumUpperRoman.length;
                if (index < start) {
                  spanArray[index].textContent = null;
                } else {
                  // index >= start
                  const span = document.createElement("span");
                  span.textContent = listNumUpperRoman.substr(index - start, 1);
                  span.setAttribute("style", "color: #619FE0");
                  spanArray[index].textContent = null;
                  spanArray[index].appendChild(span);
                }
              } else {
                // listNumUpperRoman.length === listNumStr.length
                const span = document.createElement("span");
                span.textContent = listNumUpperRoman.substr(index, 1);
                span.setAttribute("style", "color: #619FE0");
                spanArray[index].textContent = null;
                spanArray[index].appendChild(span);
              }
            });

            return false;
          }
        }
      }
    });
};

const customizeNumberList = () => {
  $('span[class="text"]').each((i, textVal) => {
    const isNumberList = findNumberList(textVal);

    if (isNumberList) {
      const target = getTarget(textVal);
      console.log(target);
      addColor(target);
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
