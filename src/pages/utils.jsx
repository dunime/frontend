export const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

export const buildTfIdf = (documents) => {
  const termFreqs = documents.map((doc) => {
    const tf = {};
    doc.forEach((term) => {
      tf[term] = (tf[term] || 0) + 1;
    });
    return tf;
  });

  const df = {};
  termFreqs.forEach((tf) => {
    Object.keys(tf).forEach((term) => {
      df[term] = (df[term] || 0) + 1;
    });
  });

  const N = documents.length;
  const tfidf = termFreqs.map((tf) => {
    const tfidfVec = {};
    Object.keys(tf).forEach((term) => {
      const tfVal = tf[term];
      const idfVal = Math.log(N / (df[term] || 1));
      tfidfVec[term] = tfVal * idfVal;
    });
    return tfidfVec;
  });

  return tfidf;
};

export const cosineSimilarity = (vecA, vecB) => {
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  allTerms.forEach((term) => {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
};
