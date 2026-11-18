import got from 'got';

// Replace this placeholder with your live custom WordPress REST API endpoint.
const dataURL =
  'https://YOUR-WORDPRESS-SITE/wp-json/twentytwentyone-child/v1/latest-posts/1';

function normalizeDate(value) {
  if (!value) {
    return '';
  }
  const asString = value.toString();
  return asString.includes(' ') ? asString.split(' ')[0] : asString;
}

function normalizeItem(item) {
  const id = item.id ?? item.ID;
  return {
    ...item,
    id: id !== undefined && id !== null ? id.toString() : '',
    title: item.title || item.post_title || '',
    date: normalizeDate(item.date || item.post_date),
    contentHtml: item.contentHtml || item.post_content || '',
  };
}

async function fetchJsonData() {
  let jsonString;
  try {
    jsonString = await got(dataURL);
    console.log(jsonString.body);
  } catch (error) {
    jsonString = { body: '[]' };
    console.log(error);
  }

  const parsed = JSON.parse(jsonString.body);
  return Array.isArray(parsed) ? parsed : [];
}

export async function getSortedList() {
  const jsonObj = await fetchJsonData();
  jsonObj.sort(function (a, b) {
    const titleA = a.title || a.post_title || '';
    const titleB = b.title || b.post_title || '';
    return titleA.localeCompare(titleB);
  });
  return jsonObj.map((item) => {
    const normalized = normalizeItem(item);
    return {
      id: normalized.id,
      title: normalized.title,
      date: normalized.date,
    };
  });
}

export async function getAllIds() {
  const jsonObj = await fetchJsonData();
  return jsonObj.map((item) => {
    const normalized = normalizeItem(item);
    return {
      params: {
        id: normalized.id,
      },
    };
  });
}

export async function getData(idRequested) {
  const jsonObj = await fetchJsonData();
  const objReturned = jsonObj.filter((obj) => {
    const normalized = normalizeItem(obj);
    return normalized.id === idRequested.toString();
  });

  if (objReturned.length === 0) {
    return {
      id: idRequested,
      title: 'Not found',
      date: '',
      contentHtml: 'Not found',
    };
  }

  return normalizeItem(objReturned[0]);
}
