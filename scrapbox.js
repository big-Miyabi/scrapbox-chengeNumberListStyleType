const $appRoot = $("#app-container");

const findNumberList = (val) => {
  const text = $(val).text();
  console.log(text);
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

const customizeNumberList = () => {
  $('span[class="text"]').each((i, textVal) => {
    const isNumber = findNumberList(textVal);

    if (isNumber) {
      console.log(isNumber);

      const target = getTarget(textVal);
      console.log(target);
    }
  });
};

$appRoot.on("keyup", (e) => {
  customizeNumberList();
});
