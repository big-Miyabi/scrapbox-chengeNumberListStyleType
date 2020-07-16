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

const customizeNumberList = () => {
  $('span[class="text"]').each((i, val) => {
    const isNumber = findNumberList(val);

    if (isNumber) {
      console.log(isNumber);
      const indentObj = $(val).find('span[class="indent"]');
      const hasIndent = indentObj.length;

      if (hasIndent) {
        indentObj.each((index, object) => {
          console.log(object);
        });
      } else {
        const target = $(val).children("span");
        target.each((index, object) => {
          console.log(object);
        });
      }
    }
  });
};

$appRoot.on("keyup", (e) => {
  customizeNumberList();
});
