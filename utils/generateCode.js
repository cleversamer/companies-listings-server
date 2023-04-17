exports.genrateRandomCode = () => {
  const timestamp = Date.now().toString();
  const random = Math.random(timestamp).toString().slice(2, 10); // Slice to get 8 digits
  const code = random;
  return code;
};
