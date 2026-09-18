"use strict";

/** @param {string} birthDate "YYYY-MM-DD" @param {Date} asOf */
function calcAge(birthDate, asOf) {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  let age = asOf.getFullYear() - by;
  const beforeBirthday = asOf.getMonth() + 1 < bm || (asOf.getMonth() + 1 === bm && asOf.getDate() < bd);
  if (beforeBirthday) age -= 1;
  return age;
}

module.exports = { calcAge };
