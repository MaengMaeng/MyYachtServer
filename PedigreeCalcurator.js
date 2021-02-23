const makeCountArray = (dices) => {
  const counts = [0, 0, 0, 0, 0, 0];
  dices.map((v) => {
    counts[v - 1]++;
  });
  return counts;
};

const calSum = (counts) => {
  let sum = 0;
  counts.map((v, i) => (sum += v * (i + 1)));
  return sum;
};

const calSingle = (counts, num) => {
  return counts[num - 1] * num;
};

const cal4OfAKind = (counts) => {
  const flag = counts.some((v) => v >= 4);
  return flag ? calSum(counts) : 0;
};

const calFullHouse = (counts) => {
  const flag = counts.some((v) => v == 3) && counts.some((v) => v == 2);

  return flag ? calSum(counts) : 0;
};

const calSmallStraight = (counts) => {
  const flag =
    (counts[0] > 0 && counts[1] > 0 && counts[2] > 0 && counts[3] > 0) ||
    (counts[1] > 0 && counts[2] > 0 && counts[3] > 0 && counts[4] > 0) ||
    (counts[2] > 0 && counts[3] > 0 && counts[4] > 0 && counts[5] > 0);
  return flag ? 15 : 0;
};

const calLargeStraight = (counts) => {
  const flag =
    (counts[0] > 0 &&
      counts[1] > 0 &&
      counts[2] > 0 &&
      counts[3] > 0 &&
      counts[4] > 0) ||
    (counts[1] > 0 &&
      counts[2] > 0 &&
      counts[3] > 0 &&
      counts[4] > 0 &&
      counts[5] > 0);
  return flag ? 30 : 0;
};

const calYatch = (counts) => {
  const flag = counts.some((v) => v == 5);
  return flag ? 50 : 0;
};

module.exports = {
  makeCountArray,
  calSum,
  calSingle,
  cal4OfAKind,
  calFullHouse,
  calSmallStraight,
  calLargeStraight,
  calYatch,
};
