function calculateBookReward(pages, format = '') {
  const normalizedFormat = format.trim().toLowerCase();

  const visualFormats = [
    'manga',
    'graphic novel',
    'comic',
    'manhwa',
    'manhua',
    'webtoon',
    'gn',
  ];

  const isVisualFormat = visualFormats.some((visualFormat) =>
    normalizedFormat.includes(visualFormat)
  );

  if (isVisualFormat || pages <= 200) {
    return 250;
  }

  if (pages <= 299) {
    return 350;
  }

  if (pages <= 499) {
    return 500;
  }

  if (pages <= 699) {
    return 650;
  }

  return 800;
}

module.exports = calculateBookReward;