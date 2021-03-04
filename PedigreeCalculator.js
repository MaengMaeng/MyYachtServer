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

const calculate = (title, dice) => {
  let result = 0;
  const counts = makeCountArray(dice);
  switch (title) {
    case "Aces":
      result = calSingle(counts, 1);
      break;
    case "Duces":
      result = calSingle(counts, 2);
      break;
    case "Threes":
      result = calSingle(counts, 3);
      break;
    case "Fours":
      result = calSingle(counts, 4);
      break;
    case "Fives":
      result = calSingle(counts, 5);
      break;
    case "Sixes":
      result = calSingle(counts, 6);
      break;
    case "Choice":
      result = calSum(counts);
      break;
    case "4 Of a Kind":
      result = cal4OfAKind(counts);
      break;
    case "Full House":
      result = calFullHouse(counts);
      break;
    case "Small Straight":
      result = calSmallStraight(counts);
      break;
    case "Large Straight":
      result = calLargeStraight(counts);
      break;
    case "Yacht":
      result = calYatch(counts);
      break;
    default:
      break;
  }
  return result;
};
module.exports = {
  calculate,
};
