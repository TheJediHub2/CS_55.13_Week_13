import got from 'got';

const dataURL =
  'https://dev-cs-55-13-week-11.pantheonsite.io/wp-json/wp/v2/projects';

function renderedTitle(item) {
  if (item?.title && typeof item.title === 'object') {
    return item.title.rendered || '';
  }
  return item.title || item.post_title || '';
}

function contentHtmlFromItem(item) {
  const text =
    item?.acf?.projects || item.contentHtml || item.post_content || '';
  if (!text) {
    return '';
  }
  if (text.trim().startsWith('<')) {
    return text;
  }
  return `<p>${text}</p>`;
}

async function fetchJsonData() {
  let jsonString;
  try {
    jsonString = await got(dataURL, {
      headers: {
        'Deterrence-Bypass': '1',
      },
    });
    console.log(jsonString.body);
  } catch (error) {
    jsonString = { body: '[]' };
    console.log(error);
  }

  try {
    const parsed = JSON.parse(jsonString.body);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getSortedList() {
  const jsonObj = await fetchJsonData();
  jsonObj.sort(function (a, b) {
    return renderedTitle(a).localeCompare(renderedTitle(b));
  });
  return jsonObj.map((item) => {
    return {
      id: item.id.toString(),
      title: renderedTitle(item),
      date: item.date,
    };
  });
}

export async function getAllIds() {
  const jsonObj = await fetchJsonData();
  return jsonObj.map((item) => {
    return {
      params: {
        id: item.id.toString(),
      },
    };
  });
}

export async function getData(idRequested) {
  const jsonObj = await fetchJsonData();
  const objReturned = jsonObj.filter((obj) => {
    return obj.id.toString() === idRequested.toString();
  });

  if (objReturned.length === 0) {
    return {
      id: idRequested,
      title: 'Not found',
      date: '',
      contentHtml: 'Not found',
    };
  }

  const obj = objReturned[0];
  return {
    id: obj.id.toString(),
    title: renderedTitle(obj),
    date: obj.date,
    contentHtml: contentHtmlFromItem(obj),
  };
}
