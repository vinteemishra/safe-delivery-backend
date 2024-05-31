export const validateEmail = (email) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase()
  );

export function splitArray(input, maxLength) {
  if (!Array.isArray(input)) {
    throw new TypeError("Expected an array to split");
  }

  if (typeof maxLength !== "number") {
    throw new TypeError("Expected a number of groups to split the array in");
  }

  var result = [];
  var part = [];

  for (var i = 0; i < input.length; i++) {
    part.push(input[i]);

    // check if we reached the maximum amount of items in a partial
    // or just if we reached the last item
    if (part.length === maxLength || i === input.length - 1) {
      result.push(part);
      part = [];
    }
  }

  return result;
}
