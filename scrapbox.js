// 選択した文字列にマーカー
scrapbox.PopupMenu.addButton({
  title: "マーカー",
  onClick: (text) => `[[${text}]]`,
});

const $appRoot = $("#app-container");

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
  $(target)
    .children()
    .each((i, targetSpan) => {
      const text = $(targetSpan).text();
      const isBlank = /^\s$/.test(text);

      if (isBlank) return false;

      const isNumberOrDot = /^(\d|\.)+$/.test(text);
      if (isNumberOrDot) {
        const span = document.createElement("span");
        span.textContent = text;
        span.setAttribute("style", "color: #619FE0");
        targetSpan.textContent = null;
        targetSpan.appendChild(span);
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

$appRoot.on("keyup", (e) => {
  customizeNumberList();
});

$(function () {
  console.log("ロードしたよ！");
});
