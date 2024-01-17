import mongoose from "mongoose";

export function getAverageRating(r) {
  let items = Object.entries(r);
  let sum = 0;
  let total = 0;
  for (let [key, value] of items) {
    total += value as number;
    sum += ((value as number) * parseInt(key)) as number;
  }
  return Math.round(sum / total);
}

export function setRating(r) {
  if (!(this instanceof mongoose.Document)) {
    if (r instanceof Object) return r;
    else {
      throw new Error("");
    }
  } else {
    if (r instanceof Object) {
      return r;
    }
    this.get("rating", null, { getters: false })[r] =
      1 + parseInt(this.get("rating", null, { getters: false })[r]);
    return this.get("rating", null, { getters: false });
  }
}
